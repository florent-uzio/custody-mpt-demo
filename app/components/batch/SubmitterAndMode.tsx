"use client";

import type { Core_BatchExecutionMode } from "@florent-uzio/custody";
import { useWorkbench } from "./WorkbenchContext";
import { AccountSelect } from "./AccountSelect";

const MODES: { value: Core_BatchExecutionMode; label: string }[] = [
  { value: "AllOrNothing", label: "All or nothing (atomic)" },
  { value: "OnlyOne", label: "Only one" },
  { value: "UntilFailure", label: "Until failure" },
  { value: "Independent", label: "Independent" },
];

export function SubmitterAndMode() {
  const {
    session,
    domainId,
    actions,
    setSubmitter,
    setExecutionMode,
    setOuterSequencing,
    setOuterSequence,
  } = useWorkbench();

  const onSubmitterChange = async (accountId: string) => {
    if (!accountId) return;
    const { address, ledgerId } = await actions.resolveAddress.mutateAsync({
      domainId,
      accountId,
    });
    setSubmitter(accountId, address, ledgerId);
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
      <h2 className="text-sm font-semibold text-gray-800">
        1 · Submitter &amp; mode
      </h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Submitter account (pays the outer fee, pins the ledger)
          </label>
          <AccountSelect
            value={session.submitterAccountId ?? ""}
            onChange={onSubmitterChange}
            placeholder="Select submitter"
            disabled={actions.resolveAddress.isPending}
          />
          {session.submitterAddress && (
            <p className="mt-1 text-xs text-gray-400 font-mono break-all">
              {session.submitterAddress} · ledger {session.ledgerId}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Execution mode
          </label>
          <select
            value={session.executionMode}
            onChange={(e) =>
              setExecutionMode(e.target.value as Core_BatchExecutionMode)
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            {MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Outer Batch sequencing
        </label>
        <div className="flex flex-wrap items-center gap-4">
          {(["PlatformManaged", "Explicit"] as const).map((mode) => (
            <label
              key={mode}
              className="flex items-center gap-1.5 text-sm text-gray-700"
            >
              <input
                type="radio"
                name="outerSequencing"
                checked={session.outerSequencing === mode}
                onChange={() => setOuterSequencing(mode)}
              />
              {mode === "PlatformManaged"
                ? "PlatformManaged (submitter-only, single account)"
                : "Explicit (required for multi-account)"}
            </label>
          ))}
          {session.outerSequencing === "Explicit" && (
            <input
              type="number"
              value={session.outerSequence ?? ""}
              onChange={(e) =>
                setOuterSequence(
                  e.target.value === "" ? undefined : Number(e.target.value),
                )
              }
              placeholder="Outer Sequence"
              className="w-40 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          )}
        </div>
        <p className="mt-1.5 text-xs text-gray-400">
          Sequencing is all-or-nothing: <strong>Explicit</strong> sets the outer
          + every inner Sequence (autofill fills them) — required whenever there
          are participants.
          <strong> Platform-managed</strong> works only for a submitter-only
          batch.
        </p>
      </div>

      {actions.resolveAddress.error && (
        <p className="text-xs text-red-600">
          {(actions.resolveAddress.error as Error).message}
        </p>
      )}
    </section>
  );
}
