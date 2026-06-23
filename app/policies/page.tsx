"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useDefaultDomain } from "../contexts/DomainContext";
import { PoliciesFilters } from "./components/PoliciesFilters";
import { PoliciesTable } from "./components/PoliciesTable";
import type {
  Core_TrustedPoliciesCollection,
  Core_PolicyScope,
  Core_Policy,
} from "@florent-uzio/custody";
import { listPolicies } from "../_actions/policies";
import {
  Page,
  PageHeader,
  PageContainer,
  PageHero,
  ErrorBanner,
} from "../components/layout";

type Core_LockStatus = Core_Policy["lock"];

export default function PoliciesPage() {
  const { defaultDomainId } = useDefaultDomain();

  const [scope, setScope] = useState<Core_PolicyScope | "">("");
  const [lock, setLock] = useState<Core_LockStatus | "">("");
  const [sortBy, setSortBy] = useState("metadata.createdAt");

  const { data, isLoading, isError, error, isFetching, refetch } =
    useQuery<Core_TrustedPoliciesCollection>({
      queryKey: ["policies", defaultDomainId, scope, lock, sortBy],
      queryFn: () =>
        listPolicies(defaultDomainId!, {
          scope: scope || undefined,
          lock: lock ? [lock] : undefined,
          sortBy: sortBy || undefined,
        }),
      enabled: !!defaultDomainId,
      staleTime: 60_000,
    });

  const items = data?.items ?? [];
  const totalCount = data?.count ?? 0;

  return (
    <Page>
      <PageHeader
        title="Policies"
        subtitle="Operations · Policies"
        actions={
          <>
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
            <Link
              href="/policies/new"
              className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
            >
              Create policy
            </Link>
          </>
        }
      />
      <PageContainer width="list">
        <PageHero
          theme="violet"
          icon="🛡️"
          title="Policies"
          description="Governance policies for the selected domain."
          badge={{ label: "Policies", note: `${totalCount} total` }}
        />

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
              policies.
            </p>
          </div>
        )}

        <PoliciesFilters
          scope={scope}
          onScopeChange={setScope}
          lock={lock}
          onLockChange={setLock}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          domainId={defaultDomainId}
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
          <PoliciesTable
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">No policies found</p>
            <p className="text-gray-400 text-sm mt-1">
              Try adjusting the filters above
            </p>
          </div>
        )}
      </PageContainer>
    </Page>
  );
}
