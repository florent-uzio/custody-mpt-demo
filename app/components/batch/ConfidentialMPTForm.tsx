"use client";

import type {
  BatchCmptDraft,
  BatchCmptKind,
} from "../../utils/batchSessionStorage";
import {
  ProofFieldsEditor,
  missingProofFields,
} from "../confidential-mpt/ProofFields";
import { useWorkbench } from "./WorkbenchContext";
import { AccountSelect } from "./AccountSelect";

type Props = {
  kind: BatchCmptKind;
  value: BatchCmptDraft;
  onChange: (next: BatchCmptDraft) => void;
};

const INPUT =
  "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none";

/**
 * Typed ConfidentialMPT fields for one inner entry. Convert / ConvertBack take an
 * amount; MergeInbox takes nothing beyond the issuance; Send needs the full proof
 * bundle, because `batchToCustodyBatchPayload` drops a plaintext amount on a Send
 * (the value only exists as ciphertext) — there is no service-side derivation on
 * the batch path the way there is for a standalone ConfidentialMPTSend intent.
 */
export function ConfidentialMPTForm({ kind, value, onChange }: Props) {
  const { session, domainId, actions } = useWorkbench();
  const set = (patch: Partial<BatchCmptDraft>) => onChange({ ...value, ...patch });

  const isSend = kind === "cmptSend";
  const hasAmount = kind === "cmptConvert" || kind === "cmptConvertBack";
  const useAccountDest = value.destinationType === "Account";
  const missing = isSend ? missingProofFields(value.proofs ?? {}) : [];

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
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          value={value.issuanceId}
          onChange={(e) => set({ issuanceId: e.target.value })}
          placeholder="MPT issuance ID (hex)"
          className={`${INPUT} font-mono`}
        />
        {hasAmount && (
          <input
            value={value.amount ?? ""}
            onChange={(e) => set({ amount: e.target.value })}
            placeholder="Amount"
            className={INPUT}
          />
        )}
      </div>

      {isSend && (
        <>
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
              className={`${INPUT} font-mono`}
            />
          )}

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            A batched ConfidentialMPTSend must carry a full proof bundle — the
            batch adapter drops a plaintext amount. Generate one on the{" "}
            <a
              href="/mpt/confidential/compute"
              className="underline font-medium"
              target="_blank"
              rel="noreferrer"
            >
              cMPT Compute
            </a>{" "}
            page and paste the hex values below.
          </div>

          <ProofFieldsEditor
            value={value.proofs ?? {}}
            onChange={(proofs) => set({ proofs })}
          />

          {missing.length > 0 && (
            <p className="text-xs text-amber-700">
              Still required: {missing.join(", ")}
            </p>
          )}
        </>
      )}

      {kind === "cmptMergeInbox" && (
        <p className="text-xs text-gray-500">
          MergeInbox carries no amount — it folds every pending inbox entry into
          the spendable confidential balance.
        </p>
      )}
    </div>
  );
}
