"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Core_AccountsCollection } from "custody";
import { useDefaultDomain } from "../contexts/DomainContext";
import { CopyButton } from "./CopyButton";

interface AccountFilters {
  limit: string;
  sortBy: string;
  sortOrder: string;
  ledgerId: string;
  alias: string;
  vaultId: string;
  createdBy: string;
  lastModifiedBy: string;
  description: string;
  customProperties: string;
  locks: string[];
  processingStatus: string;
  additionalLedgerIds: string;
  additionalLedgerStatuses: string[];
}

const SORT_BY_OPTIONS = [
  { value: "", label: "Default" },
  { value: "id", label: "ID" },
  { value: "alias", label: "Alias" },
  { value: "ledgerId", label: "Ledger ID" },
  { value: "lock", label: "Lock" },
  { value: "metadata.createdAt", label: "Created At" },
  { value: "metadata.lastModifiedAt", label: "Last Modified At" },
];

const PROCESSING_STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "Pending", label: "Pending" },
  { value: "Processing", label: "Processing" },
  { value: "Ready", label: "Ready" },
  { value: "Failed", label: "Failed" },
];

const LEDGER_STATUS_OPTIONS = ["Pending", "Active", "Inactive", "Failed"];
const LOCK_OPTIONS = ["Unlocked", "Locked"];

const LOCK_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  Unlocked: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  Locked: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

const PROCESSING_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  Ready: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  Processing: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  Pending: { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500" },
  Failed: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

function StatusBadge({
  value,
  styles,
}: {
  value: string;
  styles: Record<string, { bg: string; text: string; dot: string }>;
}) {
  const s = styles[value] ?? { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {value}
    </span>
  );
}

function truncateId(id: string) {
  if (id.length <= 16) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

const EMPTY_FILTERS: AccountFilters = {
  limit: "",
  sortBy: "",
  sortOrder: "",
  ledgerId: "",
  alias: "",
  vaultId: "",
  createdBy: "",
  lastModifiedBy: "",
  description: "",
  customProperties: "",
  locks: [],
  processingStatus: "",
  additionalLedgerIds: "",
  additionalLedgerStatuses: [],
};

export function AccountsTab() {
  const { defaultDomainId } = useDefaultDomain();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AccountFilters>(EMPTY_FILTERS);

  const setField = <K extends keyof AccountFilters>(k: K, v: AccountFilters[K]) =>
    setFilters((prev) => ({ ...prev, [k]: v }));

  const toggleArray = (field: "locks" | "additionalLedgerStatuses", val: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: prev[field].includes(val)
        ? prev[field].filter((x) => x !== val)
        : [...prev[field], val],
    }));
  };

  const buildBody = () => {
    const body: Record<string, unknown> = { domainId: defaultDomainId };
    if (filters.limit) body.limit = parseInt(filters.limit, 10);
    if (filters.sortBy) body.sortBy = filters.sortBy;
    if (filters.sortOrder) body.sortOrder = filters.sortOrder;
    if (filters.ledgerId) body.ledgerId = filters.ledgerId;
    if (filters.alias) body.alias = filters.alias;
    if (filters.vaultId) body.vaultId = filters.vaultId;
    if (filters.createdBy) body.createdBy = filters.createdBy;
    if (filters.lastModifiedBy) body.lastModifiedBy = filters.lastModifiedBy;
    if (filters.description) body.description = filters.description;
    if (filters.customProperties)
      body.customProperties = filters.customProperties.split(",").map((p) => p.trim()).filter(Boolean);
    if (filters.locks.length > 0) body.locks = filters.locks;
    if (filters.processingStatus) body.processingStatus = filters.processingStatus;
    if (filters.additionalLedgerIds)
      body.additionalLedgerIds = filters.additionalLedgerIds.split(",").map((s) => s.trim()).filter(Boolean);
    if (filters.additionalLedgerStatuses.length > 0)
      body.additionalLedgerStatuses = filters.additionalLedgerStatuses;
    return body;
  };

  const { data, isLoading, isError, error, isFetching, refetch } =
    useQuery<Core_AccountsCollection>({
      queryKey: ["accounts", defaultDomainId, filters],
      queryFn: async () => {
        const res = await fetch("/api/accounts/list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildBody()),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to list accounts");
        }
        return res.json();
      },
      enabled: !!defaultDomainId,
      staleTime: 60_000,
    });

  const items = data?.items ?? [];
  const count = data?.count ?? 0;

  const activeFiltersCount = [
    filters.limit,
    filters.sortBy,
    filters.sortOrder,
    filters.ledgerId,
    filters.alias,
    filters.vaultId,
    filters.createdBy,
    filters.lastModifiedBy,
    filters.description,
    filters.customProperties,
    filters.locks.length > 0 ? "1" : "",
    filters.processingStatus,
    filters.additionalLedgerIds,
    filters.additionalLedgerStatuses.length > 0 ? "1" : "",
  ].filter(Boolean).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Accounts</h2>
        <div className="flex items-center gap-2">
          {data && (
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
              {count} {count === 1 ? "account" : "accounts"}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filters toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showFilters ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Filters
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              {activeFiltersCount} active
            </span>
          )}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Filter Options</span>
            <button
              type="button"
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Reset all
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Alias</label>
              <input
                type="text"
                value={filters.alias}
                onChange={(e) => setField("alias", e.target.value)}
                placeholder="Filter by alias"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ledger ID</label>
              <input
                type="text"
                value={filters.ledgerId}
                onChange={(e) => setField("ledgerId", e.target.value)}
                placeholder="e.g. xrpl-testnet"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Processing Status</label>
              <select
                value={filters.processingStatus}
                onChange={(e) => setField("processingStatus", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                {PROCESSING_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setField("sortBy", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                {SORT_BY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sort Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => setField("sortOrder", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="">Default</option>
                <option value="Ascending">Ascending</option>
                <option value="Descending">Descending</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Limit</label>
              <input
                type="number"
                value={filters.limit}
                onChange={(e) => setField("limit", e.target.value)}
                placeholder="e.g. 20"
                min="1"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vault ID</label>
              <input
                type="text"
                value={filters.vaultId}
                onChange={(e) => setField("vaultId", e.target.value)}
                placeholder="Provider vault ID"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Created By</label>
              <input
                type="text"
                value={filters.createdBy}
                onChange={(e) => setField("createdBy", e.target.value)}
                placeholder="User ID"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Last Modified By</label>
              <input
                type="text"
                value={filters.lastModifiedBy}
                onChange={(e) => setField("lastModifiedBy", e.target.value)}
                placeholder="User ID"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <input
                type="text"
                value={filters.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Filter by description"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Additional Ledger IDs</label>
              <input
                type="text"
                value={filters.additionalLedgerIds}
                onChange={(e) => setField("additionalLedgerIds", e.target.value)}
                placeholder="ledger1, ledger2"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Custom Properties</label>
              <input
                type="text"
                value={filters.customProperties}
                onChange={(e) => setField("customProperties", e.target.value)}
                placeholder="key=value, key2=value2"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Lock Status</label>
              <div className="flex gap-3">
                {LOCK_OPTIONS.map((val) => (
                  <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.locks.includes(val)}
                      onChange={() => toggleArray("locks", val)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{val}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Ledger Statuses</label>
              <div className="flex flex-wrap gap-3">
                {LEDGER_STATUS_OPTIONS.map((val) => (
                  <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.additionalLedgerStatuses.includes(val)}
                      onChange={() => toggleArray("additionalLedgerStatuses", val)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-700">{val}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No domain banner */}
      {!defaultDomainId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-700">
          Set a <strong>Default Domain ID</strong> in the sidebar to load accounts.
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-700">
            {error instanceof Error ? error.message : "Failed to load accounts"}
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-4 py-3.5 flex items-center gap-4 animate-pulse">
                <div className="h-4 w-28 bg-gray-100 rounded" />
                <div className="h-4 w-40 bg-gray-100 rounded" />
                <div className="h-5 w-20 bg-gray-100 rounded-full hidden sm:block" />
                <div className="h-5 w-16 bg-gray-100 rounded-full hidden md:block ml-auto" />
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
                    Alias
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Account ID
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Ledger ID
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Lock
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Processing
                  </th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => (
                  <tr key={item.data.id} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-800">
                        {item.data.alias || <span className="text-gray-400 italic text-xs">No alias</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-gray-700">
                          {truncateId(item.data.id)}
                        </span>
                        <CopyButton text={item.data.id} />
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="font-mono text-xs text-gray-500">
                        {item.data.ledgerId
                          || item.additionalDetails?.ledgers?.find((l) => l.status === "Activated")?.ledgerId
                          || <span className="text-gray-300">—</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {item.data.lock ? (
                        <StatusBadge value={item.data.lock} styles={LOCK_STYLES} />
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {item.additionalDetails?.processing?.status ? (
                        <StatusBadge value={item.additionalDetails.processing.status} styles={PROCESSING_STYLES} />
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/accounts/${item.data.id}?domainId=${defaultDomainId}`}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium text-sm">No accounts found</p>
          <p className="text-gray-400 text-xs mt-1">Try adjusting the filters above</p>
        </div>
      )}
    </div>
  );
}
