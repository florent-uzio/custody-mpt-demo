// Diagnostic spike for tasks/todo.md Phase 1 — run in isolation, no Next/custody.
// Verifies the load-bearing assumption: xrpl.js `Client.autofill` fills inner
// Batch sequences (and outer Fee/Sequence) against a real node.
//
// Usage:
//   node scripts/batch-autofill-smoke.mjs <wssUrl> <account1> <account2>
// Example (XRPL devnet):
//   node scripts/batch-autofill-smoke.mjs wss://s.devnet.rippletest.net:51233 rACCT1... rACCT2...
//
// account1 and account2 are funded addresses on the network <wssUrl> points at.
// account1 is the submitter (pays the outer fee) AND a participant; account2 is
// a participant. Mirrors examples/xrpl/batch/multi-accounts.

import { BatchFlags, Client, GlobalFlags, xrpToDrops } from "xrpl";

const [, , wssUrl, account1, account2] = process.argv;

if (!wssUrl || !account1 || !account2) {
  console.error(
    "Usage: node scripts/batch-autofill-smoke.mjs <wssUrl> <account1> <account2>",
  );
  process.exit(1);
}

const inner = (Account, Destination, xrp) => ({
  TransactionType: "Payment",
  Account,
  Destination,
  Amount: xrpToDrops(xrp),
  Flags: GlobalFlags.tfInnerBatchTxn,
});

const batch = {
  TransactionType: "Batch",
  Account: account1, // submitter
  Flags: BatchFlags.tfAllOrNothing,
  RawTransactions: [
    { RawTransaction: inner(account1, account2, "0.016") },
    { RawTransaction: inner(account2, account1, "0.025") },
  ],
};

const client = new Client(wssUrl);
try {
  await client.connect();
  console.log(`Connected to ${wssUrl} (networkID: ${client.networkID})`);

  // signersCount = 1 → only account2 is a participant signer (account1 is the
  // submitter, authorized by the outer Batch signature).
  const autofilled = await client.autofill(batch, 1);

  console.log("\n── Autofilled outer Batch ──");
  console.log({
    Fee: autofilled.Fee,
    Sequence: autofilled.Sequence,
    LastLedgerSequence: autofilled.LastLedgerSequence,
  });

  console.log("\n── Inner transaction sequences (the assumption under test) ──");
  autofilled.RawTransactions.forEach(({ RawTransaction: tx }, i) => {
    const isSubmitter = tx.Account === autofilled.Account;
    console.log(
      `  [${i}] ${tx.Account} ${isSubmitter ? "(submitter)" : "(participant)"} ` +
        `→ Sequence=${tx.Sequence} Fee=${tx.Fee} SigningPubKey="${tx.SigningPubKey}"`,
    );
  });

  const allFilled = autofilled.RawTransactions.every(
    ({ RawTransaction: tx }) => typeof tx.Sequence === "number",
  );
  console.log(
    `\n${allFilled ? "✅ PASS" : "❌ FAIL"} — inner sequences ${allFilled ? "were" : "were NOT"} autofilled.`,
  );
} catch (err) {
  console.error("\n❌ Error:", err);
  process.exitCode = 1;
} finally {
  await client.disconnect();
}
