"use client";

import type { BatchPaymentDraft } from "../../utils/batchSessionStorage";
import { useWorkbench } from "./WorkbenchContext";
import { AccountSelect } from "./AccountSelect";

type Props = {
  value: BatchPaymentDraft;
  onChange: (next: BatchPaymentDraft) => void;
};

const INPUT =
  "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none";

/** Typed XRP/IOU/MPT payment fields for one inner entry (Q4). The destination is
 *  either a custody account (resolved to its address, like the source) or a raw
 *  XRPL address; both end up as an address in the inner transaction. */
export function PaymentForm({ value, onChange }: Props) {
  const { session, domainId, actions } = useWorkbench();
  const set = (patch: Partial<BatchPaymentDraft>) => onChange({ ...value, ...patch });

  const useAccountDest = value.destinationType === "Account";

  const onDestAccountChange = async (accountId: string) => {
    if (!accountId) {
      set({ destinationAccountId: "", destinationAddress: undefined });
      return;
    }
    set({ destinationAccountId: accountId, destinationAddress: undefined });
    const { address } = await actions.resolveAddress.mutateAsync({
      domainId,
      accountId,
      ledgerId: session.ledgerId,
    });
    onChange({
      ...value,
      destinationType: "Account",
      destinationAccountId: accountId,
      destinationAddress: address,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        {(["XRP", "IOU", "MPT"] as const).map((t) => (
          <label key={t} className="flex items-center gap-1.5 text-sm text-gray-700">
            <input
              type="radio"
              checked={value.paymentType === t}
              onChange={() => set({ paymentType: t })}
            />
            {t}
          </label>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs font-medium text-gray-500">Destination:</span>
        <label className="flex items-center gap-1.5 text-sm text-gray-700">
          <input
            type="radio"
            checked={useAccountDest}
            onChange={() =>
              set({ destinationType: "Account", destinationAddress: undefined })
            }
          />
          Custody account
        </label>
        <label className="flex items-center gap-1.5 text-sm text-gray-700">
          <input
            type="radio"
            checked={!useAccountDest}
            onChange={() =>
              set({ destinationType: "Address", destinationAccountId: undefined })
            }
          />
          Address
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {useAccountDest ? (
          <div>
            <AccountSelect
              value={value.destinationAccountId ?? ""}
              onChange={onDestAccountChange}
              placeholder="Select destination account"
            />
            {value.destinationAddress && (
              <p className="mt-1 text-xs text-gray-400 font-mono break-all">
                {value.destinationAddress}
              </p>
            )}
          </div>
        ) : (
          <input
            value={value.destinationAddress ?? ""}
            onChange={(e) => set({ destinationAddress: e.target.value })}
            placeholder="Destination address (r…)"
            className={INPUT}
          />
        )}
        <input
          value={value.amount}
          onChange={(e) => set({ amount: e.target.value })}
          placeholder={value.paymentType === "XRP" ? "Amount (drops)" : "Amount (value)"}
          className={INPUT}
        />
      </div>

      {value.paymentType === "IOU" && (
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            value={value.currency ?? ""}
            onChange={(e) => set({ currency: e.target.value })}
            placeholder="Currency code (e.g. USD)"
            className={INPUT}
          />
          <input
            value={value.issuer ?? ""}
            onChange={(e) => set({ issuer: e.target.value })}
            placeholder="Issuer address (r…)"
            className={INPUT}
          />
        </div>
      )}

      {value.paymentType === "MPT" && (
        <input
          value={value.issuanceId ?? ""}
          onChange={(e) => set({ issuanceId: e.target.value })}
          placeholder="MPT issuance ID (hex)"
          className={INPUT}
        />
      )}
    </div>
  );
}
