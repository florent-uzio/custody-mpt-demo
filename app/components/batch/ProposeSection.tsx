"use client";

import type { Core_BatchSigner } from "@florent-uzio/custody";
import { saveSubmittedIntent } from "../../utils/intentStorage";
import { JsonViewer } from "../JsonViewer";
import { useWorkbench } from "./WorkbenchContext";

export function ProposeSection() {
  const { session, participants, domainId, stale, actions, setProposed } = useWorkbench();

  const collected = session.signatures.filter(
    (s): s is typeof s & { signer: Core_BatchSigner } =>
      s.status === "collected" && !!s.signer,
  );
  const missing = participants.filter(
    (p) => !collected.some((c) => c.accountId === p.accountId),
  );
  const canPropose = !!session.dryRun && missing.length === 0;

  const onPropose = async () => {
    if (!session.dryRun) return;
    const signers = collected.map((c) => c.signer);
    const { requestId } = await actions.propose.mutateAsync({
      payload: session.dryRun.payload,
      signers,
      domainId,
    });
    saveSubmittedIntent({ type: "Batch", requestId });
    setProposed(requestId);
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
      <h2 className="text-sm font-semibold text-gray-800">6 · Propose</h2>

      {stale && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Draft changed since dry-run — proposing will submit the previously signed
          payload, which no longer matches the current draft.
        </p>
      )}

      <button
        onClick={onPropose}
        disabled={!canPropose || actions.propose.isPending}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {actions.propose.isPending ? "Proposing…" : "Propose batch"}
      </button>

      {!session.dryRun && (
        <p className="text-xs text-gray-400">Dry-run first.</p>
      )}
      {session.dryRun && missing.length > 0 && (
        <p className="text-xs text-gray-400">
          Waiting on {missing.length} signature{missing.length === 1 ? "" : "s"}.
        </p>
      )}

      {actions.propose.error && (
        <p className="text-xs text-red-600">
          {(actions.propose.error as Error).message}
        </p>
      )}

      {session.proposedRequestId && (
        <div className="space-y-2">
          <p className="text-sm text-emerald-700">
            Batch proposed · requestId{" "}
            <span className="font-mono">{session.proposedRequestId}</span> (recorded
            in Submitted Intents).
          </p>
          {actions.propose.data && (
            <JsonViewer data={actions.propose.data} title="Propose response" />
          )}
        </div>
      )}
    </section>
  );
}
