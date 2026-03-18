import type { Account } from "../../hooks/useAccounts";

interface Props {
  accountId: string;
  onChange: (id: string) => void;
  accounts: Account[];
  loading: boolean;
}

export function IssuerAccountSection({
  accountId,
  onChange,
  accounts,
  loading,
}: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
          1
        </span>
        Issuer Account
      </h3>

      <div>
        <label
          htmlFor="accountId"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Account ID
        </label>
        <select
          id="accountId"
          value={accountId}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors bg-white"
          required
          disabled={loading}
        >
          {loading ? (
            <option>Loading accounts...</option>
          ) : accounts.length === 0 ? (
            <option value="">No accounts found - set Default Domain ID</option>
          ) : (
            accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.alias} ({account.id})
              </option>
            ))
          )}
        </select>
        <p className="mt-2 text-xs text-gray-500">
          The account that will become the issuer of this MPT
        </p>
      </div>
    </div>
  );
}
