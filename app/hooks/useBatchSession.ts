import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  BatchPayloadInput,
  Core_ApiBatchSigningData,
  Core_BatchExecutionMode,
} from "@florent-uzio/custody";
import {
  type BatchEntryDraft,
  type BatchSession,
  type BatchSignatureState,
  clearBatchSession,
  createBatchSession,
  isBatchStale,
  loadBatchSession,
  saveBatchSession,
} from "../utils/batchSessionStorage";
import type { BatchBuildInput } from "../lib/batch-builder";
import type { AutofillBatchResult } from "../_actions/batch";

export type BatchParticipant = {
  accountId: string;
  address: string;
  ledgerId: string;
};

function newEntry(): BatchEntryDraft {
  return {
    id: crypto.randomUUID(),
    accountId: "",
    operation: {
      kind: "payment",
      payment: { paymentType: "XRP", destinationType: "Address", amount: "" },
    },
  };
}

function upsertSignatureState(
  list: BatchSignatureState[],
  sig: BatchSignatureState,
): BatchSignatureState[] {
  const i = list.findIndex((s) => s.accountId === sig.accountId);
  if (i === -1) return [...list, sig];
  const next = [...list];
  next[i] = sig;
  return next;
}

/**
 * Owns the workbench `BatchSession`: loads it from localStorage on mount, saves
 * on every change, and exposes draft mutators (which bump `revision`, driving the
 * staleness signal) and non-draft mutators (dry-run / signatures / propose).
 */
export function useBatchSession() {
  const [session, setSession] = useState<BatchSession>(createBatchSession);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = loadBatchSession();
    if (stored) setSession(stored);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveBatchSession(session);
  }, [session, ready]);

  const mutate = useCallback(
    (updater: (s: BatchSession) => BatchSession, draft: boolean) => {
      setSession((prev) => {
        const base = updater(prev);
        return draft ? { ...base, revision: prev.revision + 1 } : base;
      });
    },
    [],
  );

  // ── Draft mutators (bump revision) ──
  const setSubmitter = useCallback(
    (accountId: string, address: string, ledgerId: string) =>
      mutate(
        (s) => ({ ...s, submitterAccountId: accountId, submitterAddress: address, ledgerId }),
        true,
      ),
    [mutate],
  );
  const setExecutionMode = useCallback(
    (mode: Core_BatchExecutionMode) =>
      mutate((s) => ({ ...s, executionMode: mode }), true),
    [mutate],
  );
  const setOuterSequencing = useCallback(
    (mode: "PlatformManaged" | "Explicit") =>
      mutate((s) => ({ ...s, outerSequencing: mode }), true),
    [mutate],
  );
  const setOuterSequence = useCallback(
    (seq?: number) => mutate((s) => ({ ...s, outerSequence: seq }), true),
    [mutate],
  );
  const addEntry = useCallback(
    () => mutate((s) => ({ ...s, entries: [...s.entries, newEntry()] }), true),
    [mutate],
  );
  const updateEntry = useCallback(
    (id: string, patch: Partial<BatchEntryDraft>) =>
      mutate(
        (s) => ({
          ...s,
          entries: s.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        }),
        true,
      ),
    [mutate],
  );
  const removeEntry = useCallback(
    (id: string) =>
      mutate((s) => ({ ...s, entries: s.entries.filter((e) => e.id !== id) }), true),
    [mutate],
  );
  const applyAutofill = useCallback(
    (result: AutofillBatchResult) =>
      mutate(
        (s) => ({
          ...s,
          entries: s.entries.map((e, i) => ({
            ...e,
            // Ticket entries are sequenced by the user's chosen ticket — autofill
            // never fills them (the node round-trip returns no Sequence for them).
            sequence:
              e.sequencingType === "Ticket"
                ? e.sequence
                : (result.entrySequences[i] ?? e.sequence),
          })),
          outerSequence:
            s.outerSequencing === "Explicit"
              ? (result.outerSequence ?? s.outerSequence)
              : s.outerSequence,
        }),
        true,
      ),
    [mutate],
  );

  // ── Non-draft mutators ──
  const setDryRun = useCallback(
    (payload: BatchPayloadInput, signingData: Core_ApiBatchSigningData) =>
      mutate(
        (s) => ({
          ...s,
          dryRun: { payload, signingData, revision: s.revision, at: new Date().toISOString() },
          signatures: [], // a new signing payload invalidates prior signatures
        }),
        false,
      ),
    [mutate],
  );
  const upsertSignature = useCallback(
    (sig: BatchSignatureState) =>
      mutate((s) => ({ ...s, signatures: upsertSignatureState(s.signatures, sig) }), false),
    [mutate],
  );
  const setProposed = useCallback(
    (requestId: string) => mutate((s) => ({ ...s, proposedRequestId: requestId }), false),
    [mutate],
  );
  const reset = useCallback(() => {
    clearBatchSession();
    setSession(createBatchSession());
  }, []);

  // ── Derived ──
  const participants = useMemo<BatchParticipant[]>(() => {
    const seen = new Map<string, BatchParticipant>();
    for (const e of session.entries) {
      if (!e.address || !e.accountId || !session.ledgerId) continue;
      if (e.accountId === session.submitterAccountId) continue;
      if (!seen.has(e.accountId)) {
        seen.set(e.accountId, {
          accountId: e.accountId,
          address: e.address,
          ledgerId: session.ledgerId,
        });
      }
    }
    return [...seen.values()];
  }, [session.entries, session.submitterAccountId, session.ledgerId]);

  const buildInput = useMemo<BatchBuildInput | null>(() => {
    if (!session.submitterAddress || session.entries.length === 0) return null;
    const entries = [];
    for (const e of session.entries) {
      if (!e.address) return null;
      entries.push({
        address: e.address,
        sequence: e.sequence,
        ticketSequence:
          e.sequencingType === "Ticket" ? e.ticketSequence : undefined,
        operation: e.operation,
      });
    }
    return {
      submitterAddress: session.submitterAddress,
      executionMode: session.executionMode,
      outerSequencing: session.outerSequencing,
      outerSequence: session.outerSequence,
      entries,
    };
  }, [session]);

  return {
    session,
    ready,
    stale: isBatchStale(session),
    participants,
    buildInput,
    setSubmitter,
    setExecutionMode,
    setOuterSequencing,
    setOuterSequence,
    addEntry,
    updateEntry,
    removeEntry,
    applyAutofill,
    setDryRun,
    upsertSignature,
    setProposed,
    reset,
  };
}
