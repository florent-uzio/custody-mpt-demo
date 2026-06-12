"use client";

import { useConfig } from "../../hooks/useConfig";
import { useWorkbench } from "./WorkbenchContext";

export function AutofillBar() {
  const { session, buildInput, actions, applyAutofill } = useWorkbench();
  const { data: config } = useConfig();
  const wssUrl = config?.XRPL_WSS_URL?.value || "(not set)";

  const onAutofill = async () => {
    if (!buildInput) return;
    const result = await actions.autofill.mutateAsync(buildInput);
    applyAutofill(result);
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
      <h2 className="text-sm font-semibold text-gray-800">3 · Autofill sequences</h2>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          onClick={onAutofill}
          disabled={!buildInput || actions.autofill.isPending}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {actions.autofill.isPending ? "Autofilling…" : "Autofill from node"}
        </button>
        <div className="text-xs text-gray-500 space-y-0.5">
          <p>
            <span className="text-gray-400">Node:</span>{" "}
            <span className="font-mono">{wssUrl}</span>
          </p>
          <p>
            <span className="text-gray-400">Ledger:</span>{" "}
            <span className="font-mono">{session.ledgerId ?? "(pick a submitter)"}</span>
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Confirm the node and ledger match — neither can validate the other. Fills
        each inner Sequence; the outer Sequence/fee stay
        {" "}
        {session.outerSequencing === "PlatformManaged" ? "platform-managed" : "explicit"}.
      </p>

      {actions.autofill.data?.outerFee && (
        <p className="text-xs text-gray-500">
          Outer fee: <span className="font-mono">{actions.autofill.data.outerFee}</span> drops
        </p>
      )}
      {actions.autofill.error && (
        <p className="text-xs text-red-600">
          {(actions.autofill.error as Error).message}
        </p>
      )}
    </section>
  );
}
