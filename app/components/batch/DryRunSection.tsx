"use client";

import { useWorkbench } from "./WorkbenchContext";

export function DryRunSection() {
  const { session, buildInput, domainId, stale, actions, setDryRun } = useWorkbench();

  const onDryRun = async () => {
    if (!buildInput || !domainId) return;
    const { payload, signingData } = await actions.dryRun.mutateAsync({
      input: buildInput,
      domainId,
    });
    setDryRun(payload, signingData);
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
      <h2 className="text-sm font-semibold text-gray-800">4 · Dry-run</h2>

      <button
        onClick={onDryRun}
        disabled={!buildInput || !domainId || actions.dryRun.isPending}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {actions.dryRun.isPending ? "Dry-running…" : "Dry-run batch"}
      </button>

      {stale && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          The draft changed since the last dry-run. Collected signatures are stale —
          re-run the dry-run and re-collect signatures, or expect rejection.
        </p>
      )}

      {actions.dryRun.error && (
        <p className="text-xs text-red-600">
          {(actions.dryRun.error as Error).message}
        </p>
      )}

      {session.dryRun && (
        <div className="space-y-1">
          <p className="text-xs text-gray-500">
            Signing payload (each participant signs this):
          </p>
          <pre className="p-3 bg-gray-900 text-gray-100 rounded-lg text-[11px] font-mono overflow-x-auto break-all whitespace-pre-wrap">
            {session.dryRun.signingData.signingPayload}
          </pre>
        </div>
      )}
    </section>
  );
}
