"use client";

import { useMemo, useState } from "react";
import type { BatchEntryDraft } from "../../utils/batchSessionStorage";
import { useWorkbench } from "./WorkbenchContext";
import { AccountSelect } from "./AccountSelect";
import { PaymentForm } from "./PaymentForm";
import { RawOpEditor } from "./RawOpEditor";
import { TicketPickerSheet } from "./TicketPickerSheet";

export function EntryEditor({ entry, index }: { entry: BatchEntryDraft; index: number }) {
  const { session, domainId, actions, updateEntry, removeEntry } = useWorkbench();
  const isSubmitter =
    !!entry.accountId && entry.accountId === session.submitterAccountId;
  const usesTicket = entry.sequencingType === "Ticket";
  const [ticketSheetOpen, setTicketSheetOpen] = useState(false);

  // Tickets already assigned to other entries on the same address — a ticket can
  // back only one inner transaction, so the picker shows these as unavailable.
  const usedTickets = useMemo(() => {
    const used = new Set<number>();
    for (const e of session.entries) {
      if (
        e.id !== entry.id &&
        e.address === entry.address &&
        e.sequencingType === "Ticket" &&
        e.ticketSequence != null
      ) {
        used.add(e.ticketSequence);
      }
    }
    return used;
  }, [session.entries, entry.id, entry.address]);

  const onAccountChange = async (accountId: string) => {
    updateEntry(entry.id, { accountId, address: undefined });
    if (!accountId) return;
    const { address } = await actions.resolveAddress.mutateAsync({
      domainId,
      accountId,
      ledgerId: session.ledgerId,
    });
    updateEntry(entry.id, { address });
  };

  return (
    <div className="rounded-lg border border-gray-200 p-4 space-y-3 bg-gray-50/50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600">
          Entry {index + 1}
          {entry.accountId && (
            <span
              className={`ml-2 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide ${
                isSubmitter
                  ? "bg-amber-100 text-amber-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {isSubmitter ? "Submitter op" : "Participant"}
            </span>
          )}
        </span>
        <button
          onClick={() => removeEntry(entry.id)}
          className="text-xs text-red-600 hover:text-red-700"
        >
          Remove
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Source account
          </label>
          <AccountSelect value={entry.accountId} onChange={onAccountChange} />
          {entry.address && (
            <p className="mt-1 text-xs text-gray-400 font-mono break-all">
              {entry.address}
            </p>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-gray-500">
              Inner sequencing
            </label>
            <div className="inline-flex rounded-md border border-gray-300 overflow-hidden text-xs">
              {(["AccountSequence", "Ticket"] as const).map((type) => {
                const active =
                  (entry.sequencingType ?? "AccountSequence") === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateEntry(entry.id, { sequencingType: type })}
                    className={`px-2.5 py-1 font-medium transition-colors ${
                      active
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {type === "AccountSequence" ? "Sequence" : "Ticket"}
                  </button>
                );
              })}
            </div>
          </div>

          {usesTicket ? (
            <button
              type="button"
              onClick={() => setTicketSheetOpen(true)}
              disabled={!entry.address}
              className="w-full px-3 py-2 text-sm text-left border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400 flex items-center justify-between"
            >
              <span className={entry.ticketSequence != null ? "font-mono" : "text-gray-400"}>
                {entry.ticketSequence ?? "Select a ticket…"}
              </span>
              <span className="text-xs text-blue-600">
                {entry.address ? "Choose" : "Set source first"}
              </span>
            </button>
          ) : (
            <input
              type="number"
              value={entry.sequence ?? ""}
              onChange={(e) =>
                updateEntry(entry.id, {
                  sequence: e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
              placeholder="Autofilled or manual"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          )}
        </div>
      </div>

      {entry.address && (
        <TicketPickerSheet
          open={ticketSheetOpen}
          address={entry.address}
          selected={entry.ticketSequence}
          usedTickets={usedTickets}
          onSelect={(ticketSequence) => updateEntry(entry.id, { ticketSequence })}
          onClose={() => setTicketSheetOpen(false)}
        />
      )}

      <div className="flex items-center gap-4">
        {(["payment", "raw"] as const).map((kind) => (
          <label key={kind} className="flex items-center gap-1.5 text-sm text-gray-700">
            <input
              type="radio"
              checked={entry.operation.kind === kind}
              onChange={() =>
                updateEntry(entry.id, {
                  operation:
                    kind === "payment"
                      ? {
                          kind: "payment",
                          payment: {
                            paymentType: "XRP",
                            destinationType: "Address",
                            amount: "",
                          },
                        }
                      : { kind: "raw", json: "" },
                })
              }
            />
            {kind === "payment" ? "Payment" : "Raw operation"}
          </label>
        ))}
      </div>

      {entry.operation.kind === "payment" ? (
        <PaymentForm
          value={entry.operation.payment}
          onChange={(payment) =>
            updateEntry(entry.id, { operation: { kind: "payment", payment } })
          }
        />
      ) : (
        <RawOpEditor
          value={entry.operation.json}
          onChange={(json) =>
            updateEntry(entry.id, { operation: { kind: "raw", json } })
          }
        />
      )}
    </div>
  );
}
