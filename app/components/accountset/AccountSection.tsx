"use client";

import { useState } from "react";
import { SectionCard } from "../layout";
import { useAccountsWithAddresses } from "../../hooks/useAccountsWithAddresses";
import type { AccountWithAddress } from "../../_actions/accounts";

interface Props {
  /** Called with the selected account's resolved r-address (or "" if none). */
  onChange: (address: string) => void;
}

const accountLabel = (a: AccountWithAddress) =>
  a.address ? `${a.alias} — ${a.address}` : `${a.alias} (no address yet)`;

/** Step 1 — pick the custody account whose settings the AccountSet modifies.
 *  Emits the account's XRPL r-address (what `xrpl.proposeIntent` expects).
 *  Accounts without an activated address are listed but disabled. */
export function AccountSection({ onChange }: Props) {
  const { accounts, loading } = useAccountsWithAddresses();
  const [selectedId, setSelectedId] = useState("");

  const handleChange = (id: string) => {
    setSelectedId(id);
    onChange(accounts.find((a) => a.id === id)?.address ?? "");
  };

  return (
    <SectionCard step={1} title="Account" theme="teal">
      <label
        htmlFor="accountset-account"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Account
      </label>
      <select
        id="accountset-account"
        value={selectedId}
        onChange={(e) => handleChange(e.target.value)}
        disabled={loading}
        required
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors bg-white"
      >
        {loading ? (
          <option>Loading accounts...</option>
        ) : accounts.length === 0 ? (
          <option value="">No accounts found - set Default Domain ID</option>
        ) : (
          <>
            <option value="" disabled>
              Select an account
            </option>
            {accounts.map((account) => (
              <option
                key={account.id}
                value={account.id}
                disabled={!account.address}
              >
                {accountLabel(account)}
              </option>
            ))}
          </>
        )}
      </select>
      <p className="mt-2 text-xs text-gray-500">
        The account whose settings this AccountSet will modify
      </p>
    </SectionCard>
  );
}
