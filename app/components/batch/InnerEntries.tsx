"use client";

import { useWorkbench } from "./WorkbenchContext";
import { EntryEditor } from "./EntryEditor";

export function InnerEntries() {
  const { session, addEntry } = useWorkbench();

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">2 · Inner transactions</h2>
        <button
          onClick={addEntry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg"
        >
          + Add entry
        </button>
      </div>

      {session.entries.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">
          No inner transactions yet. Add one to start building the batch.
        </p>
      ) : (
        <div className="space-y-3">
          {session.entries.map((entry, i) => (
            <EntryEditor key={entry.id} entry={entry} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
