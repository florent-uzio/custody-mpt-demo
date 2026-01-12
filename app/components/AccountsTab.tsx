"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { JsonViewer } from "./JsonViewer";
import { CopyButton } from "./CopyButton";
import { useDefaultDomain } from "../contexts/DomainContext";

interface AccountData {
  id: string;
  domainId: string;
  alias: string;
  ledgerId?: string;
  providerDetails?: unknown;
  lock?: string;
  metadata?: unknown;
}

interface AccountItem {
  data: AccountData;
  signature: string;
  signingKey: string;
  additionalDetails?: unknown;
}

interface AccountsResponse {
  items: AccountItem[];
  count: number;
  currentStartingAfter?: string;
  nextStartingAfter?: string;
}

interface AddressItem {
  address: string;
  ledgerId?: string;
  [key: string]: unknown;
}

interface AddressesResponse {
  items?: AddressItem[];
  [key: string]: unknown;
}

interface AccountFilters {
  domainId: string;
  limit: string;
  startingAfter: string;
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
  { value: "", label: "None" },
  { value: "id", label: "ID" },
  { value: "alias", label: "Alias" },
  { value: "ledgerId", label: "Ledger ID" },
  { value: "lock", label: "Lock" },
  { value: "metadata.createdAt", label: "Created At" },
  { value: "metadata.lastModifiedAt", label: "Last Modified At" },
];

const SORT_ORDER_OPTIONS = [
  { value: "", label: "Default" },
  { value: "Ascending", label: "Ascending" },
  { value: "Descending", label: "Descending" },
];

const LOCK_OPTIONS = [
  { value: "Unlocked", label: "Unlocked" },
  { value: "Locked", label: "Locked" },
];

const PROCESSING_STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "Pending", label: "Pending" },
  { value: "Processing", label: "Processing" },
  { value: "Ready", label: "Ready" },
  { value: "Failed", label: "Failed" },
];

const LEDGER_STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "Failed", label: "Failed" },
];

async function fetchAccounts(
  filters: AccountFilters
): Promise<AccountsResponse> {
  const body: Record<string, unknown> = {
    domainId: filters.domainId,
  };

  if (filters.limit) {
    body.limit = parseInt(filters.limit, 10);
  }

  if (filters.startingAfter) {
    body.startingAfter = filters.startingAfter;
  }

  if (filters.sortBy) {
    body.sortBy = filters.sortBy;
  }

  if (filters.sortOrder) {
    body.sortOrder = filters.sortOrder;
  }

  if (filters.ledgerId) {
    body.ledgerId = filters.ledgerId;
  }

  if (filters.alias) {
    body.alias = filters.alias;
  }

  if (filters.vaultId) {
    body.vaultId = filters.vaultId;
  }

  if (filters.createdBy) {
    body.createdBy = filters.createdBy;
  }

  if (filters.lastModifiedBy) {
    body.lastModifiedBy = filters.lastModifiedBy;
  }

  if (filters.description) {
    body.description = filters.description;
  }

  if (filters.customProperties) {
    body.customProperties = filters.customProperties
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
  }

  if (filters.locks.length > 0) {
    body.locks = filters.locks;
  }

  if (filters.processingStatus) {
    body.processingStatus = filters.processingStatus;
  }

  if (filters.additionalLedgerIds) {
    body.additionalLedgerIds = filters.additionalLedgerIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
  }

  if (filters.additionalLedgerStatuses.length > 0) {
    body.additionalLedgerStatuses = filters.additionalLedgerStatuses;
  }

  const res = await fetch("/api/accounts/list", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to list accounts");
  }

  return res.json();
}

async function fetchAddresses(
  domainId: string,
  accountId: string
): Promise<AddressesResponse> {
  const res = await fetch("/api/accounts/addresses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domainId, accountId }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to fetch addresses");
  }

  return res.json();
}

function AccountCard({
  account,
  domainId,
}: {
  account: AccountItem;
  domainId: string;
}) {
  const [showAddresses, setShowAddresses] = useState(false);

  const {
    data: addressesData,
    isLoading: addressesLoading,
    error: addressesError,
  } = useQuery({
    queryKey: ["addresses", domainId, account.data.id],
    queryFn: () => fetchAddresses(domainId, account.data.id),
    enabled: showAddresses,
  });

  // Extract addresses from response
  const addresses = Array.isArray(addressesData)
    ? addressesData
    : addressesData?.items || [];

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Account ID
          </p>
          <div className="flex items-center gap-1">
            <p className="text-sm font-mono text-gray-900 break-all flex-1">
              {account.data.id}
            </p>
            <CopyButton text={account.data.id} />
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Alias
          </p>
          <p className="text-base font-semibold text-gray-900">
            {account.data.alias || (
              <span className="text-gray-400 italic font-normal">
                No alias set
              </span>
            )}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Ledger ID
          </p>
          <p className="text-sm font-mono text-gray-600">
            {account.data.ledgerId || (
              <span className="text-gray-400 italic">Not specified</span>
            )}
          </p>
        </div>

        {account.data.lock && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Lock Status
            </p>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                account.data.lock === "Unlocked"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {account.data.lock}
            </span>
          </div>
        )}

        {/* Addresses Section */}
        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={() => setShowAddresses(!showAddresses)}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
          >
            <svg
              className={`w-4 h-4 transition-transform ${
                showAddresses ? "rotate-90" : ""
              }`}
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
            {showAddresses ? "Hide Addresses" : "Show Addresses"}
          </button>

          {showAddresses && (
            <div className="mt-2">
              {addressesLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg
                    className="animate-spin h-4 w-4"
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
                  Loading addresses...
                </div>
              )}

              {addressesError && (
                <p className="text-sm text-red-600">
                  Error: {addressesError.message}
                </p>
              )}

              {addressesData && addresses.length > 0 && (
                <div className="space-y-2">
                  {addresses.map((addr, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 rounded p-2 text-xs font-mono"
                    >
                      <div className="flex items-center gap-1">
                        <p className="text-gray-900 break-all flex-1">
                          {addr.address}
                        </p>
                        <CopyButton text={addr.address} />
                      </div>
                      {addr.ledgerId && (
                        <p className="text-gray-500 mt-1">
                          Ledger: {addr.ledgerId}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {addressesData && addresses.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  No addresses found
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AccountsTab() {
  const { defaultDomainId } = useDefaultDomain();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AccountFilters>({
    domainId: "",
    limit: "",
    startingAfter: "",
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
  });
  const [searchFilters, setSearchFilters] = useState<AccountFilters | null>(
    null
  );

  // Initialize with default domain ID when it changes
  useEffect(() => {
    if (defaultDomainId && !filters.domainId) {
      setFilters((prev) => ({ ...prev, domainId: defaultDomainId }));
    }
  }, [defaultDomainId, filters.domainId]);

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["accounts", searchFilters],
    queryFn: () => fetchAccounts(searchFilters!),
    enabled: !!searchFilters?.domainId,
  });

  const handleFilterChange = (
    field: keyof AccountFilters,
    value: string | string[]
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleLockToggle = (lock: string) => {
    setFilters((prev) => ({
      ...prev,
      locks: prev.locks.includes(lock)
        ? prev.locks.filter((l) => l !== lock)
        : [...prev.locks, lock],
    }));
  };

  const handleLedgerStatusToggle = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      additionalLedgerStatuses: prev.additionalLedgerStatuses.includes(status)
        ? prev.additionalLedgerStatuses.filter((s) => s !== status)
        : [...prev.additionalLedgerStatuses, status],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filters.domainId.trim()) {
      setSearchFilters({ ...filters, domainId: filters.domainId.trim() });
    }
  };

  const handleUseDefault = () => {
    if (defaultDomainId) {
      setFilters((prev) => ({ ...prev, domainId: defaultDomainId }));
    }
  };

  const handleLoadMore = () => {
    if (response?.nextStartingAfter) {
      setFilters((prev) => ({
        ...prev,
        startingAfter: response.nextStartingAfter || "",
      }));
    }
  };

  const resetFilters = () => {
    setFilters({
      domainId: filters.domainId, // Keep domain ID
      limit: "",
      startingAfter: "",
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
    });
  };

  const activeFiltersCount = [
    filters.limit,
    filters.startingAfter,
    filters.sortBy,
    filters.sortOrder,
    filters.ledgerId,
    filters.alias,
    filters.vaultId,
    filters.createdBy,
    filters.lastModifiedBy,
    filters.description,
    filters.customProperties,
    filters.locks.length > 0 ? "locks" : "",
    filters.processingStatus,
    filters.additionalLedgerIds,
    filters.additionalLedgerStatuses.length > 0 ? "ledgerStatuses" : "",
  ].filter(Boolean).length;

  const accounts = response?.items || [];
  const count = response?.count ?? accounts.length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Accounts</h2>
        <p className="text-sm text-gray-600 mb-6">
          View all accounts for a specific domain. Use filters to narrow down
          results.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Domain ID - Always visible */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="domainId"
                className="block text-sm font-medium text-gray-700"
              >
                Domain ID
              </label>
              {defaultDomainId && filters.domainId !== defaultDomainId && (
                <button
                  type="button"
                  onClick={handleUseDefault}
                  className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Use default
                </button>
              )}
            </div>
            <input
              type="text"
              id="domainId"
              value={filters.domainId}
              onChange={(e) => handleFilterChange("domainId", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="Enter domain ID (UUID)"
              required
            />
          </div>

          {/* Filters Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-transform ${showFilters ? "rotate-90" : ""}`}
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
              Advanced Filters
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                  {activeFiltersCount} active
                </span>
              )}
            </button>
          </div>

          {/* Collapsible Filters */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700">Filters</h4>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Reset all
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Limit */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Limit
                  </label>
                  <input
                    type="number"
                    value={filters.limit}
                    onChange={(e) => handleFilterChange("limit", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="e.g., 10"
                    min="1"
                  />
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    {SORT_BY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Sort Order
                  </label>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) =>
                      handleFilterChange("sortOrder", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    {SORT_ORDER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ledger ID */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Ledger ID
                  </label>
                  <input
                    type="text"
                    value={filters.ledgerId}
                    onChange={(e) =>
                      handleFilterChange("ledgerId", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="e.g., xrpl-testnet-august-2024"
                  />
                </div>

                {/* Alias */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Alias
                  </label>
                  <input
                    type="text"
                    value={filters.alias}
                    onChange={(e) => handleFilterChange("alias", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Filter by alias"
                  />
                </div>

                {/* Lock Status */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Lock Status
                  </label>
                  <div className="flex gap-2">
                    {LOCK_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center gap-1.5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.locks.includes(opt.value)}
                          onChange={() => handleLockToggle(opt.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Processing Status */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Processing Status
                  </label>
                  <select
                    value={filters.processingStatus}
                    onChange={(e) =>
                      handleFilterChange("processingStatus", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    {PROCESSING_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vault ID */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Vault ID
                  </label>
                  <input
                    type="text"
                    value={filters.vaultId}
                    onChange={(e) =>
                      handleFilterChange("vaultId", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Provider vault ID"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={filters.description}
                    onChange={(e) =>
                      handleFilterChange("description", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Filter by description"
                  />
                </div>

                {/* Created By */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Created By
                  </label>
                  <input
                    type="text"
                    value={filters.createdBy}
                    onChange={(e) =>
                      handleFilterChange("createdBy", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="User ID"
                  />
                </div>

                {/* Last Modified By */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Last Modified By
                  </label>
                  <input
                    type="text"
                    value={filters.lastModifiedBy}
                    onChange={(e) =>
                      handleFilterChange("lastModifiedBy", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="User ID"
                  />
                </div>

                {/* Custom Properties */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Custom Properties (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={filters.customProperties}
                    onChange={(e) =>
                      handleFilterChange("customProperties", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="key1=value1, key2=value2"
                  />
                </div>

                {/* Additional Ledger IDs */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Additional Ledger IDs (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={filters.additionalLedgerIds}
                    onChange={(e) =>
                      handleFilterChange("additionalLedgerIds", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="ledger1, ledger2"
                  />
                </div>

                {/* Ledger Statuses */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Ledger Statuses
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LEDGER_STATUS_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center gap-1.5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.additionalLedgerStatuses.includes(
                            opt.value
                          )}
                          onChange={() => handleLedgerStatusToggle(opt.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-700">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Starting After (for pagination) */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Starting After (cursor)
                  </label>
                  <input
                    type="text"
                    value={filters.startingAfter}
                    onChange={(e) =>
                      handleFilterChange("startingAfter", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Pagination cursor"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !filters.domainId.trim()}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                Loading...
              </span>
            ) : (
              "List Accounts"
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-red-800 font-medium">
                Error: {error.message}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {response && count > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Accounts ({count} {count === 1 ? "account" : "accounts"})
            </h3>
            {response.nextStartingAfter && (
              <button
                onClick={handleLoadMore}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Load more →
              </button>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <AccountCard
                key={account.data.id}
                account={account}
                domainId={searchFilters?.domainId || ""}
              />
            ))}
          </div>

          {response.nextStartingAfter && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-center">
              <button
                onClick={handleLoadMore}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Load more results
              </button>
            </div>
          )}
        </div>
      )}

      {response && count === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            No accounts found with the specified filters.
          </p>
        </div>
      )}

      {response && (
        <div>
          <JsonViewer data={response} title="Full Accounts Response" />
        </div>
      )}
    </div>
  );
}
