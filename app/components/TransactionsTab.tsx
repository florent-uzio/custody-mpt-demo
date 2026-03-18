"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useDefaultDomain } from "../contexts/DomainContext";
import { useAccounts } from "../hooks/useAccounts";
import { CopyButton } from "./CopyButton";

const DEFAULT_LEDGER_ID = "xrpl-testnet-august-2024";

interface TransactionItem {
  id: string;
  ledgerId: string;
  orderReference?: {
    id?: string;
    requestId?: string;
    intentId?: string;
  };
  relatedAccounts: Array<{
    accountId: string;
    domainId: string;
  }>;
  processing?: {
    status?: string;
    [key: string]: unknown;
  };
  registeredAt: string;
  ledgerTransactionData?: {
    ledgerStatus?: string;
    statusLastUpdatedAt?: string;
    [key: string]: unknown;
  };
}

interface TransactionsResponse {
  items: TransactionItem[];
  count: number;
  nextStartingAfter?: string | null;
}

const PROCESSING_STYLES: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  Completed:  { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Failed:     { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500" },
  Submitted:  { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500" },
  Processing: { bg: "bg-yellow-50",  text: "text-yellow-700",  dot: "bg-yellow-500" },
};

const LEDGER_STYLES: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  Success: { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500" },
  Failed:  { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-400" },
};

function StatusBadge({
  status,
  styleMap,
}: {
  status: string;
  styleMap: typeof PROCESSING_STYLES;
}) {
  const s = styleMap[status] ?? {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function truncateId(id: string) {
  if (id.length <= 16) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TransactionsTab() {
  const { defaultDomainId } = useDefaultDomain();
  const { accounts, loading: accountsLoading } = useAccounts();
  const [accountId, setAccountId] = useState("");
  const [ledgerId, setLedgerId] = useState(DEFAULT_LEDGER_ID);
  const [sortBy, setSortBy] = useState("registeredAt");
  const [limit, setLimit] = useState(20);

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery<TransactionsResponse>({
    queryKey: ["transactions", defaultDomainId, accountId, ledgerId, sortBy, limit],
    queryFn: async () => {
      const res = await fetch("/api/transactions/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainId: defaultDomainId,
          accountId: accountId || undefined,
          ledgerId: ledgerId || undefined,
          sortBy: sortBy || undefined,
          limit,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to get transactions");
      }
      return res.json();
    },
    enabled: !!defaultDomainId,
    staleTime: 60_000,
  });

  const items = data?.items ?? [];

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Transactions</h2>
        <button
          onClick={() => refetch()}
          disabled={isFetching || !defaultDomainId}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40"
          title="Refresh"
        >
          <svg
            className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {data && (
            <span className="text-xs text-gray-400">{data.count} total</span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Account
          </label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
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
            onChange={(e) => setLedgerId(e.target.value)}
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
            onChange={(e) => setSortBy(e.target.value)}
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
            Limit
          </label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* No domain banner */}
      {!defaultDomainId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-700">
          Set a <strong>Default Domain ID</strong> in the sidebar to load
          transactions.
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <svg
            className="w-4 h-4 text-red-500 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-red-700">
            {error instanceof Error ? error.message : "Failed to load"}
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="px-4 py-3.5 flex items-center gap-4 animate-pulse"
              >
                <div className="h-6 w-20 bg-gray-100 rounded-full" />
                <div className="h-4 w-36 bg-gray-100 rounded" />
                <div className="h-5 w-16 bg-gray-100 rounded hidden sm:block" />
                <div className="h-4 w-32 bg-gray-100 rounded hidden lg:block ml-auto" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && items.length > 0 && (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Processing
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Ledger Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Registered At
                  </th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50/40 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      {item.processing?.status ? (
                        <StatusBadge
                          status={item.processing.status}
                          styleMap={PROCESSING_STYLES}
                        />
                      ) : (
                        <span className="text-gray-300 text-xs italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-gray-700">
                          {truncateId(item.id)}
                        </span>
                        <CopyButton text={item.id} />
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {item.ledgerTransactionData?.ledgerStatus ? (
                        <StatusBadge
                          status={item.ledgerTransactionData.ledgerStatus}
                          styleMap={LEDGER_STYLES}
                        />
                      ) : (
                        <span className="text-gray-300 text-xs italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(item.registeredAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/transactions/${item.id}?domainId=${defaultDomainId}`}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-300 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && data && items.length === 0 && (
        <div className="rounded-lg border border-gray-200 p-12 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-600 font-medium text-sm">
            No transactions found
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Try adjusting the filters above
          </p>
        </div>
      )}
    </div>
  );
}
