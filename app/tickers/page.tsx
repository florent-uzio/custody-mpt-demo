"use client";

import { useState } from "react";
import Link from "next/link";
import { GetTickersQueryParams, XrplLedgerId } from "@florent-uzio/custody";
import { useTickersList } from "../hooks/useTickers";
import { TickersFilters } from "./components/TickersFilters";
import { TickersTable } from "./components/TickersTable";
import { JsonViewer } from "../components/JsonViewer";
import {
  Page,
  PageHeader,
  PageHero,
  PageContainer,
  ErrorBanner,
} from "../components/layout";

type Params = NonNullable<GetTickersQueryParams>;
type SortBy = NonNullable<Params["sortBy"]>;
type Kind = NonNullable<Params["kind"]>;
type ValidationStatus = NonNullable<Params["validationStatus"]>;
type LockStatus = NonNullable<Params["lock"]>[number];

const DEFAULT_LEDGER_ID: XrplLedgerId = "xrpl-testnet-august-2024";

function parseList(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function TickersPage() {
  const [ledgerId, setLedgerId] = useState<XrplLedgerId>(DEFAULT_LEDGER_ID);
  const [kind, setKind] = useState<Kind | undefined>(undefined);
  const [validationStatus, setValidationStatus] = useState<
    ValidationStatus | undefined
  >(undefined);
  const [lock, setLock] = useState<LockStatus[]>([]);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [sortBy, setSortBy] = useState<SortBy | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [limit, setLimit] = useState(20);

  const params: GetTickersQueryParams = {
    ledgerId: [ledgerId],
    ...(kind && { kind }),
    ...(validationStatus && { validationStatus }),
    ...(lock.length > 0 && { lock }),
    ...(name.trim() && { name: parseList(name) }),
    ...(symbol.trim() && { symbol: parseList(symbol) }),
    ...(sortBy && { sortBy }),
    sortOrder,
    limit,
  };

  const { data, isLoading, isError, error, isFetching, refetch } =
    useTickersList(params);

  const tickers = data?.items ?? [];
  const count = data?.count ?? 0;

  const handleSort = (field: SortBy) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(field);
      setSortOrder("DESC");
    }
  };

  return (
    <Page>
      <PageHeader
        title="Tickers"
        subtitle="Data · Tickers"
        actions={
          <>
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
            <button
              onClick={() => refetch()}
              disabled={isFetching}
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
            <Link
              href="/tickers/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              New ticker
            </Link>
          </>
        }
      />
      <PageContainer width="list">
        <PageHero
          theme="blue"
          icon="📊"
          title="Tickers"
          description="Custody tickers and token references."
          badge={{ label: "Tickers", note: `${count} total` }}
        />

        <TickersFilters
          ledgerId={ledgerId}
          onLedgerIdChange={setLedgerId}
          kind={kind}
          onKindChange={setKind}
          validationStatus={validationStatus}
          onValidationStatusChange={setValidationStatus}
          lock={lock}
          onLockChange={setLock}
          name={name}
          onNameChange={setName}
          symbol={symbol}
          onSymbolChange={setSymbol}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          limit={limit}
          onLimitChange={setLimit}
        />

        {isError && <ErrorBanner error={error} />}

        {isLoading && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-50">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="px-4 py-3.5 flex items-center gap-4 animate-pulse"
                >
                  <div className="h-4 w-28 bg-gray-100 rounded" />
                  <div className="h-4 w-16 bg-gray-100 rounded" />
                  <div className="h-5 w-16 bg-gray-100 rounded-full" />
                  <div className="h-4 w-32 bg-gray-100 rounded hidden md:block" />
                  <div className="h-4 w-40 bg-gray-100 rounded hidden lg:block ml-auto" />
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && tickers.length > 0 && (
          <TickersTable
            tickers={tickers}
            totalCount={count}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        )}

        {!isLoading && data && tickers.length === 0 && (
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
                  d="M9 7h6m-6 4h6m-6 4h4m5 5H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">No tickers found</p>
            <p className="text-gray-400 text-sm mt-1">
              Try adjusting the filters above
            </p>
          </div>
        )}

        {data && <JsonViewer data={data} title="Full Tickers Response" />}
      </PageContainer>
    </Page>
  );
}
