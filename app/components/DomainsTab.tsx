"use client";

import { useState } from "react";
import { GetDomainsQueryParams } from "custody";
import { useDomains } from "../hooks/useDomains";
import { DomainsFilters } from "./domains/DomainsFilters";
import { DomainsTable } from "./domains/DomainsTable";
import { JsonViewer } from "./JsonViewer";

type SortBy = NonNullable<NonNullable<GetDomainsQueryParams>["sortBy"]>;
type LockStatus = NonNullable<NonNullable<GetDomainsQueryParams>["lock"]>[number];

export function DomainsTab() {
  const [alias, setAlias] = useState("");
  const [parentId, setParentId] = useState("");
  const [lock, setLock] = useState<LockStatus[]>([]);
  const [sortBy, setSortBy] = useState<SortBy | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [limit, setLimit] = useState(20);

  const params: GetDomainsQueryParams = {
    ...(alias && { alias }),
    ...(parentId && { parentId }),
    ...(lock.length > 0 && { lock }),
    ...(sortBy && { sortBy }),
    sortOrder,
    limit,
  };

  const { data, isLoading, isError, error, isFetching, refetch } =
    useDomains(params);

  const domains = data?.items ?? [];
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Domains</h2>
          <p className="text-sm text-gray-500">
            View and filter domains in the current environment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && !isLoading && (
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <svg
                className="animate-spin w-3.5 h-3.5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Refreshing…
            </span>
          )}
          {data && (
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
              {count} {count === 1 ? "domain" : "domains"}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filters */}
      <DomainsFilters
        alias={alias}
        onAliasChange={setAlias}
        parentId={parentId}
        onParentIdChange={setParentId}
        lock={lock}
        onLockChange={setLock}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        limit={limit}
        onLimitChange={setLimit}
      />

      {/* Error */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-700 font-medium">
            {error instanceof Error ? error.message : "Failed to load domains"}
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-4 py-3.5 flex items-center gap-4 animate-pulse">
                <div className="h-4 w-28 bg-gray-100 rounded" />
                <div className="h-4 w-36 bg-gray-100 rounded" />
                <div className="h-5 w-16 bg-gray-100 rounded-full" />
                <div className="h-4 w-32 bg-gray-100 rounded hidden md:block" />
                <div className="h-4 w-24 bg-gray-100 rounded hidden lg:block ml-auto" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && domains.length > 0 && (
        <DomainsTable
          domains={domains}
          totalCount={count}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      )}

      {/* Empty state */}
      {!isLoading && data && domains.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">No domains found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting the filters above</p>
        </div>
      )}

      {/* Raw JSON */}
      {data && <JsonViewer data={data} title="Full Domains Response" />}
    </div>
  );
}
