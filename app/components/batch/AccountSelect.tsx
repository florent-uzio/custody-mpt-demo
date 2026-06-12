"use client";

import { useAccounts } from "../../hooks/useAccounts";

type Props = {
  value: string;
  onChange: (accountId: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

/** Custody-account dropdown shared by the submitter picker and inner entries. */
export function AccountSelect({ value, onChange, placeholder, disabled }: Props) {
  const { accounts, loading } = useAccounts();
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || loading}
      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white disabled:bg-gray-50"
    >
      <option value="">
        {loading ? "Loading accounts…" : (placeholder ?? "Select an account")}
      </option>
      {accounts.map((a) => (
        <option key={a.id} value={a.id}>
          {a.alias} ({a.id.slice(0, 8)}…)
        </option>
      ))}
    </select>
  );
}
