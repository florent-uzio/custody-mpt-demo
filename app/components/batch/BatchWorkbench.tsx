"use client";

import { useDefaultDomain } from "../../contexts/DomainContext";
import { useBatchActions } from "../../hooks/useBatchActions";
import { useBatchSession } from "../../hooks/useBatchSession";
import { WorkbenchProvider } from "./WorkbenchContext";
import { SubmitterAndMode } from "./SubmitterAndMode";
import { InnerEntries } from "./InnerEntries";
import { AutofillBar } from "./AutofillBar";
import { PayloadPreview } from "./PayloadPreview";
import { DryRunSection } from "./DryRunSection";
import { SignaturesSection } from "./SignaturesSection";
import { ProposeSection } from "./ProposeSection";

export function BatchWorkbench() {
  const { defaultDomainId } = useDefaultDomain();
  const sessionApi = useBatchSession();
  const actions = useBatchActions();

  if (!sessionApi.ready) {
    return <p className="text-sm text-gray-400">Loading workbench…</p>;
  }

  const onReset = () => {
    if (
      window.confirm(
        "Reset the workbench? This clears the draft, dry-run, and any collected signatures.",
      )
    ) {
      sessionApi.reset();
    }
  };

  const value = { ...sessionApi, actions, domainId: defaultDomainId };

  return (
    <WorkbenchProvider value={value}>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            Session{" "}
            <span className="font-mono">
              {sessionApi.session.id.slice(0, 8)}…
            </span>
          </p>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Reset Batch
          </button>
        </div>

        {!defaultDomainId && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
            Set a <strong>Default Domain ID</strong> in the sidebar to load
            accounts and submit the batch.
          </div>
        )}

        <SubmitterAndMode />
        <InnerEntries />
        <AutofillBar />
        <PayloadPreview />
        <DryRunSection />
        <SignaturesSection />
        <ProposeSection />
      </div>
    </WorkbenchProvider>
  );
}
