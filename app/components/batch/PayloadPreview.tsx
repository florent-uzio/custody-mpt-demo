"use client";

import { useState } from "react";
import { JsonViewer } from "../JsonViewer";
import { useWorkbench } from "./WorkbenchContext";

/** Expandable preview of the custody payload that `dryRunBatch` will send —
 *  handy for debugging sequencing/shape before the backend round-trip. */
export function PayloadPreview() {
  const { buildInput, actions } = useWorkbench();
  const [open, setOpen] = useState(false);
  const { previewPayload } = actions;

  const build = () => {
    if (buildInput) previewPayload.mutate(buildInput);
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) build();
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-gray-800"
      >
        <span>Payload preview (sent to dry-run)</span>
        <span className="text-gray-400">{open ? "▼" : "▶"}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-2">
          {!buildInput && (
            <p className="text-sm text-gray-400">
              Pick a submitter and add at least one inner transaction first.
            </p>
          )}
          {buildInput && (
            <button
              onClick={build}
              disabled={previewPayload.isPending}
              className="text-xs px-2.5 py-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-40"
            >
              {previewPayload.isPending ? "Building…" : "Rebuild"}
            </button>
          )}
          {previewPayload.error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {(previewPayload.error as Error).message}
            </p>
          )}
          {previewPayload.data && !previewPayload.error && (
            <JsonViewer data={previewPayload.data} title="BatchPayloadInput" />
          )}
        </div>
      )}
    </section>
  );
}
