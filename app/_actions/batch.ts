"use server";

import { Client } from "xrpl";
import type {
  BatchPayloadInput,
  Core_ApiBatchSigningData,
  Core_BatchSigner,
  Core_IntentResponse,
  SignBatchPayloadResult,
} from "@florent-uzio/custody";
import { getConfigValue } from "../lib/config";
import { getCustodySDK } from "../lib/custody";
import {
  buildBatchPayload,
  buildXrplBatch,
  countParticipants,
  type BatchBuildInput,
} from "../lib/batch-builder";
import { getAccountAddresses } from "./accounts";

// ── Address resolution ───────────────────────────────────────────────────────

/**
 * Resolves a custody account's XRPL address + ledger. The workbench works in
 * custody account IDs, but the node (autofill) and the SDK signing methods need
 * the address. Pass `ledgerId` to pick a specific ledger (participants, on the
 * submitter's ledger); omit it for the submitter, where it derives the ledger
 * from the account's first address.
 */
export async function resolveAccountAddress(
  domainId: string,
  accountId: string,
  ledgerId?: string,
): Promise<{ address: string; ledgerId: string }> {
  if (!domainId) throw new Error("domainId is required");
  if (!accountId) throw new Error("accountId is required");

  const { items } = await getAccountAddresses(domainId, accountId);
  const match =
    (ledgerId
      ? items.find((item) => item.data.ledgerId === ledgerId)
      : undefined) ?? items[0];

  if (!match) {
    throw new Error(
      `No XRPL address found for account ${accountId}${ledgerId ? ` on ledger ${ledgerId}` : ""}.`,
    );
  }
  return { address: match.data.address, ledgerId: match.data.ledgerId };
}

// ── Autofill (the only XRPL-node call — see docs/adr/0001) ────────────────────

export type AutofillBatchResult = {
  /** Filled inner Sequence per entry, in entry order (undefined if unfilled). */
  entrySequences: (number | undefined)[];
  /** Outer Batch fee in drops. */
  outerFee?: string;
  /** Outer Batch sequence (used only when outer sequencing is Explicit). */
  outerSequence?: number;
  lastLedgerSequence?: number;
};

/**
 * Builds the xrpl.js Batch from the draft and autofills it against
 * `XRPL_WSS_URL`, returning the resolved inner sequences + outer fee/sequence.
 * `dryRunBatch` does not fill inner sequences and SDK 2.3.0 has no participant
 * `PlatformManaged`, so this node round-trip is required before signing.
 */
export async function autofillBatch(
  input: BatchBuildInput,
): Promise<AutofillBatchResult> {
  const wssUrl = getConfigValue("XRPL_WSS_URL");
  if (!wssUrl) {
    throw new Error(
      "XRPL_WSS_URL is not configured. Set it in .env or on the Configuration page.",
    );
  }

  const batch = buildXrplBatch(input, { withSequences: false });
  const client = new Client(wssUrl);
  try {
    await client.connect();
    const filled = await client.autofill(batch, countParticipants(input));
    return {
      entrySequences: filled.RawTransactions.map(
        ({ RawTransaction }) => RawTransaction.Sequence,
      ),
      outerFee: filled.Fee,
      outerSequence: filled.Sequence,
      lastLedgerSequence: filled.LastLedgerSequence,
    };
  } finally {
    await client.disconnect();
  }
}

// ── Tickets (account_objects) ────────────────────────────────────────────────

/**
 * Fetches an account's on-ledger Ticket sequences from `XRPL_WSS_URL` via
 * `account_objects` (type `ticket`), so an inner entry can be sequenced by a
 * pre-reserved Ticket instead of an AccountSequence. Paginates on `marker`
 * (an account holds ≤250 tickets, so this is normally one page). Sorted ascending.
 */
export async function fetchAccountTickets(address: string): Promise<number[]> {
  if (!address) throw new Error("address is required");
  const wssUrl = getConfigValue("XRPL_WSS_URL");
  if (!wssUrl) {
    throw new Error(
      "XRPL_WSS_URL is not configured. Set it in .env or on the Configuration page.",
    );
  }

  const client = new Client(wssUrl);
  try {
    await client.connect();
    const tickets: number[] = [];
    let marker: unknown;
    do {
      const resp = await client.request({
        command: "account_objects",
        account: address,
        type: "ticket",
        limit: 400,
        marker,
      });
      for (const obj of resp.result.account_objects) {
        if (obj.LedgerEntryType === "Ticket") tickets.push(obj.TicketSequence);
      }
      marker = resp.result.marker;
    } while (marker);
    return tickets.sort((a, b) => a - b);
  } finally {
    await client.disconnect();
  }
}

// ── Step 1: dry-run (XLS-56) ─────────────────────────────────────────────────

/**
 * Builds the custody payload from the draft without dry-running — for the UI's
 * "what gets sent" preview. Surfaces builder validation (e.g. mixed sequencing)
 * before a round-trip to the backend.
 */
export async function previewBatchPayload(
  input: BatchBuildInput,
): Promise<BatchPayloadInput> {
  return buildBatchPayload(input);
}

export type DryRunBatchResult = {
  /** The exact payload dry-run — reuse verbatim for `proposeBatch`. */
  payload: BatchPayloadInput;
  signingData: Core_ApiBatchSigningData;
};

/**
 * Builds the custody payload from the draft, dry-runs it, and returns both the
 * payload and the canonical signing data. Editing the draft after this
 * invalidates any signatures collected over `signingData.signingPayload`.
 */
export async function dryRunBatch(
  input: BatchBuildInput,
  domainId: string,
): Promise<DryRunBatchResult> {
  if (!domainId) throw new Error("domainId is required");
  const payload = buildBatchPayload(input);
  const sdk = getCustodySDK();
  const signingData = await sdk.xrpl.dryRunBatch(payload, { domainId });
  return { payload, signingData };
}

// ── Step 2: collect signatures (async) ───────────────────────────────────────

export type BatchSignerRef = {
  /** XRPL address of the inner account to sign for. */
  signerAddress: string;
  /** Custody account ID — lets the SDK skip the address→account lookup. */
  accountId: string;
  /** Ledger ID of the signer account. */
  ledgerId: string;
  /** Domain of the signer account. */
  domainId: string;
};

/**
 * Serializable handle returned by `requestBatchSignature`. Persist it (Q6) and
 * pass it to `fetchBatchSignature` once your operator approves the raw-sign
 * intent. Derived from the SDK — the type is not exported from the package root.
 */
export type BatchSignatureHandle = Awaited<
  ReturnType<ReturnType<typeof getCustodySDK>["xrpl"]["signBatchPayload"]>
>;

/**
 * Step 2a — proposes the raw-sign intent for one participant over the
 * `signingPayload` and returns immediately (non-blocking). Your operator
 * approves out-of-band; poll later with `fetchBatchSignature`.
 */
export async function requestBatchSignature(
  signingPayload: string,
  signer: BatchSignerRef,
): Promise<BatchSignatureHandle> {
  if (!signingPayload) throw new Error("signingPayload is required");
  const sdk = getCustodySDK();
  return sdk.xrpl.signBatchPayload(signingPayload, signer.signerAddress, {
    domainId: signer.domainId,
    accountId: signer.accountId,
    ledgerId: signer.ledgerId,
    description: "Raw Signing Batch",
  });
}

/**
 * Step 2b — fetches the signature for a handle from `requestBatchSignature`.
 * Returns `undefined` if the operator has not approved it yet (single fetch).
 */
export async function fetchBatchSignature(
  handle: BatchSignatureHandle,
): Promise<SignBatchPayloadResult | undefined> {
  const sdk = getCustodySDK();
  return sdk.xrpl.getBatchSignature(handle);
}

// ── Step 3: propose the Batch ────────────────────────────────────────────────

/**
 * Result of `proposeBatch`. Unlike the shared `ProposeIntentResult` contract,
 * `custody.xrpl.proposeBatch` builds and submits the intent envelope internally
 * and only returns `Core_IntentResponse`, so there is no `request` body to echo.
 */
export type ProposeBatchResult = {
  requestId: string;
  response: Core_IntentResponse;
};

/**
 * Step 3 — submits the Batch with the collected `batchSigners`. `payload` must
 * be the one returned by `dryRunBatch` (byte-identical), or the signatures will
 * not match.
 */
export async function proposeBatch(
  payload: BatchPayloadInput,
  batchSigners: Core_BatchSigner[],
  domainId: string,
): Promise<ProposeBatchResult> {
  if (!domainId) throw new Error("domainId is required");
  const sdk = getCustodySDK();
  const response = await sdk.xrpl.proposeBatch(payload, batchSigners, {
    domainId,
    description: "Batch",
  });
  return { requestId: response.requestId, response };
}
