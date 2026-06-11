"use client";

type Props = {
  value: string;
  onChange: (json: string) => void;
};

/**
 * Raw inner operation for any of the other `Core_BatchInnerOperation` types
 * (Q4 — option B). The JSON is an xrpl.js transaction; the server sets `Account`
 * + the inner-batch flag and runs it through the same autofill + adapter path.
 */
export function RawOpEditor({ value, onChange }: Props) {
  return (
    <div className="space-y-1">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        spellCheck={false}
        placeholder={'{\n  "TransactionType": "TrustSet",\n  "LimitAmount": { "currency": "USD", "issuer": "r…", "value": "100" }\n}'}
        className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
      />
      <p className="text-xs text-gray-400">
        xrpl.js transaction JSON — omit <code>Account</code>, <code>Sequence</code>,{" "}
        <code>Fee</code>, <code>SigningPubKey</code> and the inner-batch flag; they
        are set for you.
      </p>
    </div>
  );
}
