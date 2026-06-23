"use client";

import { useState } from "react";
import Link from "next/link";
import { GetDomainsQueryParams } from "@florent-uzio/custody";
import { useDomains } from "../hooks/useDomains";
import { DomainsFilters } from "../components/domains/DomainsFilters";
import { DomainsTable } from "../components/domains/DomainsTable";
import { JsonViewer } from "../components/JsonViewer";
import {
  Page,
  PageHeader,
  PageHero,
  PageContainer,
  ErrorBanner,
} from "../components/layout";

type SortBy = NonNullable<NonNullable<GetDomainsQueryParams>["sortBy"]>;
type LockStatus = NonNullable<
  NonNullable<GetDomainsQueryParams>["lock"]
>[number];

export default function DomainsPage() {
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
    <Page>
      <PageHeader
        title="Domains"
        subtitle="General · Domains"
        actions={
          <div className="flex items-center gap-3">
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
              href="/domains/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Create domain
            </Link>
          </div>
        }
      />
      <PageContainer width="list">
        <PageHero
          theme="blue"
          icon="🌐"
          title="Domains"
          description="Custody domains and their configuration."
          badge={{ label: "Domains", note: `${count} total` }}
        />

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
                    <div className="h-4 w-36 bg-gray-100 rounded" />
                    <div className="h-5 w-16 bg-gray-100 rounded-full" />
                    <div className="h-4 w-32 bg-gray-100 rounded hidden md:block" />
                    <div className="h-4 w-24 bg-gray-100 rounded hidden lg:block ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isLoading && domains.length > 0 && (
            <DomainsTable
              domains={domains}
              totalCount={count}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          )}

          {!isLoading && data && domains.length === 0 && (
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">No domains found</p>
              <p className="text-gray-400 text-sm mt-1">
                Try adjusting the filters above
              </p>
            </div>
          )}

        {data && <JsonViewer data={data} title="Full Domains Response" />}
      </PageContainer>
    </Page>
  );
}
