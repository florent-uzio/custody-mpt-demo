"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDefaultDomain } from "../contexts/DomainContext";
import { useSidebarContext } from "../contexts/SidebarContext";
import { TransactionsFilters } from "./components/TransactionsFilters";
import { TransactionsTable } from "./components/TransactionsTable";
import { listTransactions } from "../_actions/transactions";

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

export default function TransactionsPage() {
  const { defaultDomainId } = useDefaultDomain();
  const { sidebarOpen, setSidebarOpen } = useSidebarContext();

  const [accountId, setAccountId] = useState("");
  const [ledgerId, setLedgerId] = useState(DEFAULT_LEDGER_ID);
  const [sortBy, setSortBy] = useState("registeredAt");
  const [limit, setLimit] = useState(20);

  const { data, isLoading, isError, error, isFetching, refetch } =
    useQuery<TransactionsResponse>({
      queryKey: [
        "transactions",
        defaultDomainId,
        accountId,
        ledgerId,
        sortBy,
        limit,
      ],
      queryFn: () =>
        listTransactions(defaultDomainId!, {
          accountId: accountId || undefined,
          ledgerId: ledgerId || undefined,
          sortBy: sortBy || undefined,
          limit,
        }) as unknown as Promise<TransactionsResponse>,
      enabled: !!defaultDomainId,
      staleTime: 60_000,
    });

  const items = data?.items ?? [];
  const totalCount = data?.count ?? 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {sidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Transactions</h1>
            <p className="text-xs text-gray-500">Operations</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isFetching && !isLoading && (
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <svg
                className="animate-spin w-3.5 h-3.5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Refreshing…
            </span>
          )}
          {data && (
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
              {totalCount} total
            </span>
          )}
          <button
            onClick={() => refetch()}
            disabled={isFetching || !defaultDomainId}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 disabled:opacity-40"
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
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {!defaultDomainId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-yellow-700">
                Set a <strong>Default Domain ID</strong> in the sidebar to load
                transactions.
              </p>
            </div>
          )}

          <TransactionsFilters
            accountId={accountId}
            onAccountChange={setAccountId}
            ledgerId={ledgerId}
            onLedgerIdChange={setLedgerId}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            limit={limit}
            onLimitChange={setLimit}
            domainId={defaultDomainId}
          />

          {isError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-red-700 font-medium">
                {error instanceof Error
                  ? error.message
                  : "Failed to load transactions"}
              </p>
            </div>
          )}

          {isLoading && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-50">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="px-4 py-3.5 flex items-center gap-4 animate-pulse"
                  >
                    <div className="h-6 w-20 bg-gray-100 rounded-full" />
                    <div className="h-4 w-36 bg-gray-100 rounded" />
                    <div className="h-5 w-28 bg-gray-100 rounded" />
                    <div className="h-4 w-48 bg-gray-100 rounded hidden md:block" />
                    <div className="h-4 w-32 bg-gray-100 rounded hidden lg:block ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isLoading && items.length > 0 && (
            <TransactionsTable
              items={items}
              totalCount={totalCount}
              domainId={defaultDomainId}
            />
          )}

          {!isLoading && data && items.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg
                  className="w-7 h-7 text-gray-400"
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
              <p className="text-gray-600 font-medium">
                No transactions found
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Try adjusting the filters above
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
