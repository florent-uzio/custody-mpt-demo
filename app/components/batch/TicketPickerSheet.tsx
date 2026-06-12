"use client";

import { useEffect, useMemo, useState } from "react";
import { useWorkbench } from "./WorkbenchContext";

type Props = {
  open: boolean;
  /** XRPL address whose on-ledger tickets are listed. */
  address: string;
  /** Currently selected ticket for this entry, if any. */
  selected?: number;
  /** Tickets already assigned to *other* entries on this address (not selectable). */
  usedTickets: Set<number>;
  onSelect: (ticket: number) => void;
  onClose: () => void;
};

/**
 * Right-side drawer for picking a pre-reserved Ticket sequence for an inner
 * batch entry. Fetches the account's tickets via `account_objects` on open and
 * handles up to 250 tickets with a number filter. Tickets already used by other
 * entries on the same account are shown but not selectable (a ticket can back
 * only one transaction).
 */
export function TicketPickerSheet({
  open,
  address,
  selected,
  usedTickets,
  onSelect,
  onClose,
}: Props) {
  const { actions } = useWorkbench();
  const [tickets, setTickets] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open || !address) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setTickets(null);
    setQuery("");
    actions.fetchTickets
      .mutateAsync(address)
      .then((t) => !cancelled && setTickets(t))
      .catch(
        (e) => !cancelled && setError(e instanceof Error ? e.message : String(e)),
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // actions.fetchTickets is a stable react-query mutation; refetch keys on open+address.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, address]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    if (!tickets) return [];
    const q = query.trim();
    return q ? tickets.filter((t) => String(t).includes(q)) : tickets;
  }, [tickets, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-start justify-between gap-3 flex-shrink-0">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-800">Select ticket</h3>
            <p className="mt-0.5 text-xs text-gray-400 font-mono break-all">
              {address}
              {tickets && (
                <span className="text-gray-500">
                  {" "}
                  · {tickets.length} ticket{tickets.length === 1 ? "" : "s"}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 flex-shrink-0"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        {tickets && tickets.length > 0 && (
          <div className="px-5 py-3 border-b border-gray-100 flex-shrink-0">
            <input
              type="text"
              inputMode="numeric"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by number…"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              autoFocus
            />
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <p className="text-sm text-gray-400 text-center py-10">Loading tickets…</p>
          )}
          {error && (
            <p className="text-sm text-red-600 px-5 py-10 text-center">{error}</p>
          )}
          {tickets && tickets.length === 0 && !loading && (
            <p className="text-sm text-gray-400 text-center py-10 px-5">
              This account has no tickets. Reserve some on the Tickets page first.
            </p>
          )}
          {filtered.length === 0 && tickets && tickets.length > 0 && !loading && (
            <p className="text-sm text-gray-400 text-center py-10">
              No tickets match “{query}”.
            </p>
          )}
          <ul className="divide-y divide-gray-100">
            {filtered.map((t) => {
              const isSelected = t === selected;
              const isUsed = usedTickets.has(t) && !isSelected;
              return (
                <li key={t}>
                  <button
                    disabled={isUsed}
                    onClick={() => {
                      onSelect(t);
                      onClose();
                    }}
                    className={`w-full px-5 py-2.5 flex items-center justify-between text-left text-sm transition-colors ${
                      isUsed
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-700 hover:bg-blue-50"
                    } ${isSelected ? "bg-blue-50" : ""}`}
                  >
                    <span className="font-mono">{t}</span>
                    {isSelected ? (
                      <span className="text-xs text-blue-600 font-medium">✓ selected</span>
                    ) : isUsed ? (
                      <span className="text-[11px] uppercase tracking-wide text-gray-400">
                        used by another entry
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
