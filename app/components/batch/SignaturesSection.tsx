"use client";

import { useEffect, useState } from "react";
import { useWorkbench } from "./WorkbenchContext";

const STATUS_STYLE: Record<string, string> = {
  idle: "bg-gray-100 text-gray-500",
  pending: "bg-amber-100 text-amber-700",
  collected: "bg-emerald-100 text-emerald-700",
};

export function SignaturesSection() {
  const { session, participants, domainId, actions, upsertSignature } = useWorkbench();
  const [autoPoll, setAutoPoll] = useState(false);
  const signingPayload = session.dryRun?.signingData.signingPayload;

  const sigFor = (accountId: string) =>
    session.signatures.find((s) => s.accountId === accountId);

  const request = async (p: (typeof participants)[number]) => {
    if (!signingPayload) return;
    const handle = await actions.requestSignature.mutateAsync({
      signingPayload,
      signer: {
        signerAddress: p.address,
        accountId: p.accountId,
        ledgerId: p.ledgerId,
        domainId,
      },
    });
    upsertSignature({
      accountId: p.accountId,
      address: p.address,
      ledgerId: p.ledgerId,
      status: "pending",
      handle,
      requestId: handle.intentResponse.requestId,
    });
  };

  const fetch = async (accountId: string) => {
    const s = sigFor(accountId);
    if (!s?.handle) return;
    const result = await actions.fetchSignature.mutateAsync(s.handle);
    if (result) {
      upsertSignature({ ...s, status: "collected", signer: result.custodyBatchSigner });
    }
  };

  // Optional auto-poll: re-fetch every pending signature on an interval.
  useEffect(() => {
    if (!autoPoll) return;
    const id = setInterval(() => {
      for (const s of session.signatures) {
        if (s.status === "pending" && s.handle) {
          actions.fetchSignature
            .mutateAsync(s.handle)
            .then((r) => {
              if (r) upsertSignature({ ...s, status: "collected", signer: r.custodyBatchSigner });
            })
            .catch(() => {});
        }
      }
    }, 4000);
    return () => clearInterval(id);
  }, [autoPoll, session.signatures, actions, upsertSignature]);

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">5 · Signatures</h2>
        <label className="flex items-center gap-1.5 text-xs text-gray-600">
          <input type="checkbox" checked={autoPoll} onChange={(e) => setAutoPoll(e.target.checked)} />
          Auto-poll
        </label>
      </div>

      {!signingPayload && (
        <p className="text-sm text-gray-400">Dry-run the batch to enable signing.</p>
      )}

      {signingPayload && participants.length === 0 && (
        <p className="text-sm text-gray-400">
          No participants to sign (every inner account is the submitter).
        </p>
      )}

      <div className="space-y-2">
        {participants.map((p) => {
          const s = sigFor(p.accountId);
          const status = s?.status ?? "idle";
          return (
            <div
              key={p.accountId}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 px-3 py-2"
            >
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${STATUS_STYLE[status]}`}>
                {status}
              </span>
              <span className="font-mono text-xs text-gray-600 break-all flex-1 min-w-[12rem]">
                {p.address}
              </span>
              {s?.requestId && (
                <span className="text-[11px] text-gray-400 font-mono">
                  req {s.requestId.slice(0, 8)}…
                </span>
              )}
              <button
                onClick={() => request(p)}
                disabled={!signingPayload || actions.requestSignature.isPending}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40"
              >
                {status === "idle" ? "Request" : "Re-request"}
              </button>
              <button
                onClick={() => fetch(p.accountId)}
                disabled={status !== "pending" || actions.fetchSignature.isPending}
                className="px-2.5 py-1 text-xs font-medium rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-40"
              >
                Fetch
              </button>
            </div>
          );
        })}
      </div>

      {(actions.requestSignature.error || actions.fetchSignature.error) && (
        <p className="text-xs text-red-600">
          {((actions.requestSignature.error || actions.fetchSignature.error) as Error).message}
        </p>
      )}
    </section>
  );
}
