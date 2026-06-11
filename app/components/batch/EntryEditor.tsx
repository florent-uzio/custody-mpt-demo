"use client";

import type { BatchEntryDraft } from "../../utils/batchSessionStorage";
import { useWorkbench } from "./WorkbenchContext";
import { AccountSelect } from "./AccountSelect";
import { PaymentForm } from "./PaymentForm";
import { RawOpEditor } from "./RawOpEditor";

export function EntryEditor({ entry, index }: { entry: BatchEntryDraft; index: number }) {
  const { session, domainId, actions, updateEntry, removeEntry } = useWorkbench();
  const isSubmitter =
    !!entry.accountId && entry.accountId === session.submitterAccountId;

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
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Inner Sequence (autofilled or manual)
          </label>
          <input
            type="number"
            value={entry.sequence ?? ""}
            onChange={(e) =>
              updateEntry(entry.id, {
                sequence: e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
            placeholder="—"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

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
