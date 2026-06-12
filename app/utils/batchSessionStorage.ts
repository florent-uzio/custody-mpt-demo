import type {
  BatchPayloadInput,
  Core_ApiBatchSigningData,
  Core_BatchExecutionMode,
  Core_BatchSigner,
} from "@florent-uzio/custody";
import type { BatchSignatureHandle } from "../_actions/batch";

// The workbench is a multi-step, async, multi-actor flow (dry-run → collect
// signatures → propose) where signatures wait on out-of-band operator approval.
// Persisting the session lets a reload resume exactly where it left off and lets
// a signature approved an hour ago still be fetched. One active session at a
// time. Mirrors the localStorage approach in `intentStorage.ts`.

/** Inner payment being constructed (typed Payment path — see Q4). */
export type BatchPaymentDraft = {
  paymentType: "XRP" | "IOU" | "MPT";
  destinationType: "Address" | "Account" | "Endpoint";
  destinationAddress?: string;
  destinationAccountId?: string;
  destinationEndpointId?: string;
  /** Drops for XRP; decimal string for IOU/MPT. */
  amount: string;
  /** IOU */
  currency?: string;
  issuer?: string;
  /** MPT */
  issuanceId?: string;
  destinationTag?: number;
};

/**
 * Inner operation: a typed Payment, or a raw-JSON xrpl transaction for the other
 * 11 `Core_BatchInnerOperation` types (Q4 — option B). The raw JSON is an xrpl.js
 * transaction; the server sets its `Account` + inner-batch flag and runs it
 * through the same autofill + SDK-adapter pipeline as the typed Payment.
 */
export type BatchOperationDraft =
  | { kind: "payment"; payment: BatchPaymentDraft }
  | { kind: "raw"; json: string };

/** One inner transaction in the batch. */
export type BatchEntryDraft = {
  /** Stable client-side id for list keys + editing. */
  id: string;
  /** Source custody account (signs this inner txn; the submitter when equal). */
  accountId: string;
  /** XRPL address, filled once resolved from `accountId`. */
  address?: string;
  operation: BatchOperationDraft;
  /**
   * How this inner transaction is sequenced. `undefined` ≡ `"AccountSequence"`
   * (back-compat with sessions saved before tickets). `"Ticket"` references a
   * pre-reserved TicketSequence (picked from the account's on-ledger tickets).
   */
  sequencingType?: "AccountSequence" | "Ticket";
  /** Inner Sequence — autofilled from the node or typed. Frozen once signed. */
  sequence?: number;
  /** Chosen ticket — used when `sequencingType === "Ticket"`. */
  ticketSequence?: number;
};

/** Async state for one participant's signature. */
export type BatchSignatureState = {
  accountId: string;
  address: string;
  ledgerId: string;
  status: "idle" | "pending" | "collected";
  /** requestId of the raw-sign intent — click-through to approve it. */
  requestId?: string;
  /** Serializable handle to poll later via `fetchBatchSignature`. */
  handle?: BatchSignatureHandle;
  /** Collected signer, ready for `proposeBatch`. */
  signer?: Core_BatchSigner;
};

export type BatchSession = {
  id: string;
  createdAt: string;
  updatedAt: string;
  /** Bumped on every draft edit. Staleness = `revision !== dryRun.revision`. */
  revision: number;

  // ── Draft / inputs ──
  /** Submitter custody account — pins the ledger and pays the outer fee. */
  submitterAccountId?: string;
  submitterAddress?: string;
  /** Ledger derived from the submitter; all participants must share it. */
  ledgerId?: string;
  executionMode: Core_BatchExecutionMode;
  /** Outer sequencing: PlatformManaged (filled at propose) or Explicit (Q8). */
  outerSequencing: "PlatformManaged" | "Explicit";
  outerSequence?: number;
  entries: BatchEntryDraft[];

  // ── Dry-run output ──
  dryRun?: {
    /** The exact payload dry-run — reused verbatim by `proposeBatch`. */
    payload: BatchPayloadInput;
    signingData: Core_ApiBatchSigningData;
    /** Session `revision` when this dry-run ran — for the staleness check. */
    revision: number;
    at: string;
  };

  // ── Signatures (one per participant) ──
  signatures: BatchSignatureState[];

  // ── Propose output ──
  proposedRequestId?: string;
};

const STORAGE_KEY = "batch_session";

export function createBatchSession(): BatchSession {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    revision: 0,
    executionMode: "AllOrNothing",
    outerSequencing: "Explicit",
    entries: [],
    signatures: [],
  };
}

export function loadBatchSession(): BatchSession | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? (JSON.parse(stored) as BatchSession) : null;
}

export function saveBatchSession(session: BatchSession): BatchSession {
  const next = { ...session, updatedAt: new Date().toISOString() };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function clearBatchSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * True when the draft has been edited since the dry-run that was signed over —
 * the collected signatures no longer match and a re-dry-run + re-sign is required
 * (Q3: the UI *warns*, never blocks). `false` before the first dry-run: nothing
 * has been signed, so nothing is stale yet. Every draft mutation bumps
 * `session.revision`; the dry-run records the revision it ran against.
 */
export function isBatchStale(session: BatchSession): boolean {
  if (!session.dryRun) return false;
  return session.revision !== session.dryRun.revision;
}
