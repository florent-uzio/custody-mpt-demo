"use client";

import { useState } from "react";
import { useAccountsWithAddresses } from "../../hooks/useAccountsWithAddresses";
import type { AccountWithAddress } from "../../_actions/accounts";

interface Props {
  /** Called with the selected account's resolved r-address (or "" if none). */
  onAddressChange: (address: string) => void;
  required?: boolean;
}

const accountLabel = (a: AccountWithAddress) =>
  a.address ? `${a.alias} — ${a.address}` : `${a.alias} (no address yet)`;

/** Dropdown of custody accounts that emits the chosen account's XRPL r-address.
 *  Accounts without an activated address are listed but disabled. */
export function CustodyAccountSelect({ onAddressChange, required }: Props) {
  const { accounts, loading } = useAccountsWithAddresses();
  const [selectedId, setSelectedId] = useState("");

  const handleChange = (id: string) => {
    setSelectedId(id);
    onAddressChange(accounts.find((a) => a.id === id)?.address ?? "");
  };

  return (
    <select
      value={selectedId}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      required={required}
      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors bg-white"
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
  );
}
