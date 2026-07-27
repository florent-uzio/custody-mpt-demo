"use client";

import type { CmptSendProofsHex } from "../../_actions/confidential-mpt";

export type CmptProofKey = keyof CmptSendProofsHex;

/** Draft form of the proof bundle — every member optional while being typed in. */
export type CmptProofsDraft = Partial<Record<CmptProofKey, string>>;

/**
 * The `Send` proof bundle, in the order the cMPT compute endpoint returns it.
 * `auditorEncryptedAmount` is the only optional member (it is present when the
 * issuance has an auditor configured).
 */
export const CMPT_PROOF_FIELDS: {
  key: CmptProofKey;
  label: string;
  optional?: boolean;
}[] = [
  { key: "senderEncryptedAmount", label: "Sender encrypted amount" },
  { key: "destinationEncryptedAmount", label: "Destination encrypted amount" },
  { key: "issuerEncryptedAmount", label: "Issuer encrypted amount" },
  { key: "balanceCommitment", label: "Balance commitment" },
  { key: "amountCommitment", label: "Amount commitment" },
  { key: "zkProof", label: "ZK proof" },
  { key: "auditorEncryptedAmount", label: "Auditor encrypted amount", optional: true },
];

const REQUIRED_KEYS = CMPT_PROOF_FIELDS.filter((f) => !f.optional).map((f) => f.key);

/** Returns the required proof members that are still blank. */
export function missingProofFields(draft: CmptProofsDraft): CmptProofKey[] {
  return REQUIRED_KEYS.filter((key) => !draft[key]?.trim());
}

/**
 * Narrows a complete draft to the action's input type. Returns `undefined` when
 * a required member is missing, so callers can fall back to the amount-only path.
 */
export function toProofs(draft: CmptProofsDraft): CmptSendProofsHex | undefined {
  if (missingProofFields(draft).length > 0) return undefined;
  return {
    senderEncryptedAmount: draft.senderEncryptedAmount!.trim(),
    destinationEncryptedAmount: draft.destinationEncryptedAmount!.trim(),
    issuerEncryptedAmount: draft.issuerEncryptedAmount!.trim(),
    balanceCommitment: draft.balanceCommitment!.trim(),
    amountCommitment: draft.amountCommitment!.trim(),
    zkProof: draft.zkProof!.trim(),
    ...(draft.auditorEncryptedAmount?.trim() && {
      auditorEncryptedAmount: draft.auditorEncryptedAmount.trim(),
    }),
  };
}

/** Seven hex textareas — the output of a cMPT compute, pasted in. */
export function ProofFieldsEditor({
  value,
  onChange,
}: {
  value: CmptProofsDraft;
  onChange: (next: CmptProofsDraft) => void;
}) {
  return (
    <div className="space-y-3">
      {CMPT_PROOF_FIELDS.map(({ key, label, optional }) => (
        <div key={key}>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {label}
            {optional && <span className="ml-1 text-gray-400">(optional)</span>}
          </label>
          <textarea
            value={value[key] ?? ""}
            onChange={(e) => onChange({ ...value, [key]: e.target.value })}
            rows={2}
            spellCheck={false}
            placeholder="hex"
            className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none break-all"
          />
        </div>
      ))}
    </div>
  );
}
