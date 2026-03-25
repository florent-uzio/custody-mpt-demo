"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useAccounts } from "../../hooks/useAccounts";

interface Props {
  accountId: string;
  onAccountChange: (v: string) => void;
  ledgerId: string;
  onLedgerIdChange: (v: string) => void;
  sortBy: string;
  onSortByChange: (v: string) => void;
  limit: number;
  onLimitChange: (v: number) => void;
  domainId?: string;
}

export function TransactionsFilters({
  accountId,
  onAccountChange,
  ledgerId,
  onLedgerIdChange,
  sortBy,
  onSortByChange,
  limit,
  onLimitChange,
  domainId,
}: Props) {
  const router = useRouter();
  const { accounts, loading: accountsLoading } = useAccounts();
  const idInputRef = useRef<HTMLInputElement>(null);

  const handleIdSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = idInputRef.current?.value.trim();
    if (!id) return;
    const params = domainId ? `?domainId=${domainId}` : "";
    router.push(`/transactions/${id}${params}`);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Filters
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Account
          </label>
          <select
            value={accountId}
            onChange={(e) => onAccountChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
            disabled={accountsLoading}
          >
            <option value="">All accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.alias}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Ledger ID
          </label>
          <input
            type="text"
            value={ledgerId}
            onChange={(e) => onLedgerIdChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            placeholder="Ledger ID"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Sort by
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
          >
            <option value="registeredAt">Registered At</option>
            <option value="id">ID</option>
            <option value="ledgerId">Ledger ID</option>
            <option value="processingStatus">Processing Status</option>
            <option value="ledgerTransactionData.ledgerStatus">
              Ledger Status
            </option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Per page
          </label>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleIdSearch}>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Find by ID
          </label>
          <div className="flex gap-2">
            <input
              ref={idInputRef}
              type="text"
              placeholder="Enter transaction ID…"
              className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors font-mono"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
            >
              Go
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
