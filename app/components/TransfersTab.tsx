"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useDefaultDomain } from "../contexts/DomainContext";
import { CopyButton } from "./CopyButton";

interface TransferItem {
  id: string;
  transactionId?: string;
  tickerId: string;
  quarantined: boolean;
  senders: Array<{
    accountId: string;
    domainId: string;
    amount: string;
  }>;
  recipient?: {
    accountId: string;
    domainId: string;
    amount: string;
  };
  value: string;
  kind: "Transfer" | "Fee" | "Recovery";
  registeredAt: string;
  metadata: unknown;
}

interface TransfersResponse {
  items: TransferItem[];
  count: number;
  currentStartingAfter?: string;
  nextStartingAfter?: string;
}

const KIND_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  Transfer: { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500" },
  Fee:      { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500" },
  Recovery: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
};

function KindBadge({ kind }: { kind: string }) {
  const s = KIND_STYLES[kind] ?? { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {kind}
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

function formatAmount(amount: string) {
  return parseInt(amount).toLocaleString();
}

export function TransfersTab() {
  const { defaultDomainId } = useDefaultDomain();
  const [kind, setKind] = useState<string>("");
  const [quarantinedFilter, setQuarantinedFilter] = useState<string>("true");

  const quarantinedParam =
    quarantinedFilter === "true" ? true : quarantinedFilter === "false" ? false : undefined;

  const { data, isLoading, isError, error, isFetching, refetch } =
    useQuery<TransfersResponse>({
      queryKey: ["transfers", defaultDomainId, kind, quarantinedFilter],
      queryFn: async () => {
        const res = await fetch("/api/transactions/transfers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            domainId: defaultDomainId,
            kind: kind || undefined,
            quarantined: quarantinedParam,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to get transfers");
        }
        return res.json();
      },
      enabled: !!defaultDomainId,
      staleTime: 60_000,
    });

  const items = data?.items ?? [];

  return (
    <div className="space-y-5">
      {/* Header + filters */}
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Transfers</h2>
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Kind
          </label>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
          >
            <option value="">All kinds</option>
            <option value="Transfer">Transfer</option>
            <option value="Fee">Fee</option>
            <option value="Recovery">Recovery</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Quarantined
          </label>
          <select
            value={quarantinedFilter}
            onChange={(e) => setQuarantinedFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
          >
            <option value="">Any</option>
            <option value="true">Quarantined</option>
            <option value="false">Not quarantined</option>
          </select>
        </div>
      </div>

      {/* No domain banner */}
      {!defaultDomainId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-700">
          Set a <strong>Default Domain ID</strong> in the sidebar to load transfers.
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-700">
            {error instanceof Error ? error.message : "Failed to load transfers"}
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-4 py-3.5 flex items-center gap-4 animate-pulse">
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
                    Kind
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Transfer ID
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Quarantined
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Value
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Registered At
                  </th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="px-4 py-3">
                      <KindBadge kind={item.kind} />
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
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.quarantined
                            ? "bg-red-50 text-red-700"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.quarantined ? "bg-red-500" : "bg-green-500"}`} />
                        {item.quarantined ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-700 font-medium">
                      {formatAmount(item.value)}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(item.registeredAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/transfers/${item.id}?domainId=${defaultDomainId}`}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-300 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium text-sm">No transfers found</p>
          <p className="text-gray-400 text-xs mt-1">Try adjusting the filters above</p>
        </div>
      )}

    </div>
  );
}
