// Server-side builders that turn the plain workbench draft (`BatchBuildInput`)
// into xrpl.js objects and, via the SDK adapter, into a custody `BatchPayloadInput`.
// Kept out of "use server" so the actions can import the functions; never imported
// by client code (it pulls in xrpl.js + SDK values).

import { BatchFlags, GlobalFlags } from "xrpl";
import type { Batch, Payment, SubmittableTransaction } from "xrpl";
import { batchToCustodyBatchPayload } from "@florent-uzio/custody";
import type {
  BatchPayloadInput,
  Core_BatchEntry,
  Core_BatchExecutionMode,
} from "@florent-uzio/custody";
import type {
  BatchOperationDraft,
  BatchPaymentDraft,
} from "../utils/batchSessionStorage";

/** xrpl.js outer-Batch flag for each custody execution mode. */
const EXECUTION_MODE_FLAG: Record<Core_BatchExecutionMode, number> = {
  AllOrNothing: BatchFlags.tfAllOrNothing,
  OnlyOne: BatchFlags.tfOnlyOne,
  UntilFailure: BatchFlags.tfUntilFailure,
  Independent: BatchFlags.tfIndependent,
};

export type BatchBuildEntry = {
  /** Resolved XRPL source address. */
  address: string;
  /** Inner Sequence — set for payload building; omitted for autofill. */
  sequence?: number;
  operation: BatchOperationDraft;
};

/** Plain, serializable input the client sends; built from the `BatchSession` draft. */
export type BatchBuildInput = {
  submitterAddress: string;
  executionMode: Core_BatchExecutionMode;
  outerSequencing: "PlatformManaged" | "Explicit";
  outerSequence?: number;
  lastLedgerSequence?: number;
  entries: BatchBuildEntry[];
};

/**
 * Number of participant signers — distinct inner addresses that are not the
 * submitter. Feeds `Client.autofill`'s `signersCount` (outer Batch fee).
 */
export function countParticipants(input: BatchBuildInput): number {
  const participants = new Set<string>();
  for (const entry of input.entries) {
    if (entry.address !== input.submitterAddress) participants.add(entry.address);
  }
  return participants.size;
}

function paymentAmount(p: BatchPaymentDraft): Payment["Amount"] {
  if (p.paymentType === "IOU") {
    return { value: p.amount, currency: p.currency ?? "", issuer: p.issuer ?? "" };
  }
  if (p.paymentType === "MPT") {
    return { value: p.amount, mpt_issuance_id: p.issuanceId ?? "" };
  }
  return p.amount; // XRP drops
}

function operationToXrpl(
  address: string,
  op: BatchOperationDraft,
): SubmittableTransaction {
  if (op.kind === "payment") {
    const p = op.payment;
    const payment: Payment = {
      TransactionType: "Payment",
      Account: address,
      Destination: p.destinationAddress ?? "",
      Amount: paymentAmount(p),
      ...(p.destinationTag != null && { DestinationTag: p.destinationTag }),
    };
    return payment;
  }
  // Raw: an xrpl.js transaction as JSON; force the source Account.
  const parsed = JSON.parse(op.json) as Record<string, unknown>;
  return { ...parsed, Account: address } as SubmittableTransaction;
}

/** Adds the `tfInnerBatchTxn` flag. Numeric flags only. */
function withInnerBatchFlag(tx: SubmittableTransaction): SubmittableTransaction {
  const existing = tx.Flags;
  if (existing != null && typeof existing !== "number") {
    throw new Error(
      `Inner batch transactions must use numeric Flags; got object-form Flags on a ${tx.TransactionType}.`,
    );
  }
  return {
    ...tx,
    Flags: (existing ?? 0) | GlobalFlags.tfInnerBatchTxn,
  } as SubmittableTransaction;
}

/**
 * Builds the xrpl.js `Batch`. With `withSequences`, inner `Sequence`s (and the
 * outer `Sequence` when `Explicit`) are taken from the draft; without, they are
 * left for `Client.autofill` to fill.
 */
export function buildXrplBatch(
  input: BatchBuildInput,
  opts: { withSequences: boolean },
): Batch {
  return {
    TransactionType: "Batch",
    Account: input.submitterAddress,
    Flags: EXECUTION_MODE_FLAG[input.executionMode],
    RawTransactions: input.entries.map((entry) => {
      const tx = withInnerBatchFlag(operationToXrpl(entry.address, entry.operation));
      if (opts.withSequences && entry.sequence != null) tx.Sequence = entry.sequence;
      return { RawTransaction: tx };
    }),
    ...(opts.withSequences &&
      input.outerSequencing === "Explicit" &&
      input.outerSequence != null && { Sequence: input.outerSequence }),
    ...(input.lastLedgerSequence != null && {
      LastLedgerSequence: input.lastLedgerSequence,
    }),
  };
}

/**
 * Builds the custody `BatchPayloadInput`. The API requires sequencing to be
 * all-or-nothing — *either* every slot explicit (outer + every entry =
 * AccountSequence/Ticket), *or* a submitter-only batch fully PlatformManaged.
 * Mixed configurations are rejected, so each mode builds a self-consistent payload.
 */
export function buildBatchPayload(input: BatchBuildInput): BatchPayloadInput {
  if (input.outerSequencing === "Explicit") {
    if (input.outerSequence == null) {
      throw new Error(
        "Explicit sequencing requires an outer Batch Sequence — autofill, or enter it under Submitter & mode.",
      );
    }
    if (input.entries.some((e) => e.sequence == null)) {
      throw new Error(
        "Explicit sequencing requires a Sequence on every inner transaction — autofill, or enter them.",
      );
    }
    // Outer Sequence + every entry Sequence are present → the adapter maps them
    // all to AccountSequence: fully explicit.
    return batchToCustodyBatchPayload(buildXrplBatch(input, { withSequences: true }));
  }

  // Platform-managed is valid only for a submitter-only batch — participant
  // entries have no PlatformManaged variant in the API.
  if (input.entries.some((e) => e.address !== input.submitterAddress)) {
    throw new Error(
      "Platform-managed sequencing is only valid for a submitter-only batch (no participants). Switch to Explicit for a multi-account batch.",
    );
  }
  const payload = batchToCustodyBatchPayload(
    buildXrplBatch(input, { withSequences: false }),
  );
  delete payload.sequencing; // outer → PlatformManaged
  payload.entries = payload.entries.map(
    (entry) => ({ ...entry, sequencing: { type: "PlatformManaged" } }) as Core_BatchEntry,
  );
  return payload;
}
