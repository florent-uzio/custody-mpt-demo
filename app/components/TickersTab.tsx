"use client";

import { useState } from "react";
import { JsonViewer } from "./JsonViewer";
import { CopyButton } from "./CopyButton";

const DEFAULT_LEDGER_ID = "xrpl-testnet-august-2024";

interface TickerItem {
  id: string;
  ledgerId: string;
  kind: string;
  name: string;
  decimals?: number;
  symbol?: string;
  ledgerDetails: {
    properties: {
      issuanceId?: string;
      type?: string;
    };
    type: string;
  };
  data: {
    id: string;
    ledgerId: string;
    kind: string;
    name: string;
    decimals?: number;
    symbol?: string;
    ledgerDetails: {
      properties: {
        issuanceId?: string;
        type?: string;
      };
      type: string;
    };
    lock: string;
    metadata: unknown;
  };
  signature?: string | null;
}

interface TickersResponse {
  items: TickerItem[];
  count: number;
  currentStartingAfter?: string | null;
  nextStartingAfter?: string | null;
}

interface Filters {
  ledgerId: string;
  limit: string;
  startingAfter: string;
  sortBy: string;
  sortOrder: string;
  kind: string;
  names: string;
  symbols: string;
  validationStatus: string;
  locks: string[];
}

const SORT_BY_OPTIONS = [
  { value: "", label: "None" },
  { value: "id", label: "ID" },
  { value: "ledgerId", label: "Ledger ID" },
  { value: "kind", label: "Kind" },
  { value: "name", label: "Name" },
  { value: "symbol", label: "Symbol" },
];

const SORT_ORDER_OPTIONS = [
  { value: "", label: "Default" },
  { value: "Ascending", label: "Ascending" },
  { value: "Descending", label: "Descending" },
];

const KIND_OPTIONS = [
  { value: "", label: "All" },
  { value: "Native", label: "Native" },
  { value: "Token", label: "Token" },
];

const VALIDATION_STATUS_OPTIONS = [
  { value: "", label: "Default" },
  { value: "All", label: "All" },
  { value: "Validated", label: "Validated" },
  { value: "Unvalidated", label: "Unvalidated" },
];

const LOCK_OPTIONS = [
  { value: "Unlocked", label: "Unlocked" },
  { value: "Locked", label: "Locked" },
];

export function TickersTab() {
  const [filters, setFilters] = useState<Filters>({
    ledgerId: DEFAULT_LEDGER_ID,
    limit: "",
    startingAfter: "",
    sortBy: "",
    sortOrder: "",
    kind: "",
    names: "",
    symbols: "",
    validationStatus: "",
    locks: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<TickersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilterChange = (
    field: keyof Filters,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Build request body
      const body: Record<string, unknown> = {};

      if (filters.ledgerId) {
        body.ledgerIds = [filters.ledgerId];
      }

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

      if (filters.kind) {
        body.kind = filters.kind;
      }

      if (filters.names) {
        body.names = filters.names.split(",").map((n) => n.trim()).filter(Boolean);
      }

      if (filters.symbols) {
        body.symbols = filters.symbols.split(",").map((s) => s.trim()).filter(Boolean);
      }

      if (filters.validationStatus) {
        body.validationStatus = filters.validationStatus;
      }

      if (filters.locks.length > 0) {
        body.locks = filters.locks;
      }

      const res = await fetch("/api/tickers/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to list tickers");
      }

      const result = await res.json();
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!response?.nextStartingAfter) return;

    setFilters((prev) => ({
      ...prev,
      startingAfter: response.nextStartingAfter || "",
    }));
  };

  const resetFilters = () => {
    setFilters({
      ledgerId: DEFAULT_LEDGER_ID,
      limit: "",
      startingAfter: "",
      sortBy: "",
      sortOrder: "",
      kind: "",
      names: "",
      symbols: "",
      validationStatus: "",
      locks: [],
    });
  };

  const isMultiPurposeToken = (ticker: TickerItem) => {
    return (
      ticker.data.ledgerDetails?.properties?.type === "MultiPurposeToken" ||
      ticker.ledgerDetails?.properties?.type === "MultiPurposeToken"
    );
  };

  const getIssuanceId = (ticker: TickerItem) => {
    return (
      ticker.data.ledgerDetails?.properties?.issuanceId ||
      ticker.ledgerDetails?.properties?.issuanceId ||
      null
    );
  };

  const activeFiltersCount = [
    filters.limit,
    filters.startingAfter,
    filters.sortBy,
    filters.sortOrder,
    filters.kind,
    filters.names,
    filters.symbols,
    filters.validationStatus,
    filters.locks.length > 0 ? "locks" : "",
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tickers</h2>
        <p className="text-sm text-gray-600 mb-6">
          View available tickers. Use filters to narrow down results.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ledger ID - Always visible */}
          <div>
            <label
              htmlFor="ledgerId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Ledger ID
            </label>
            <input
              type="text"
              id="ledgerId"
              value={filters.ledgerId}
              onChange={(e) => handleFilterChange("ledgerId", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="Enter ledger ID (e.g., xrpl-testnet-august-2024)"
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
                    onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    {SORT_ORDER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Kind */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Kind
                  </label>
                  <select
                    value={filters.kind}
                    onChange={(e) => handleFilterChange("kind", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    {KIND_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Validation Status */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Validation Status
                  </label>
                  <select
                    value={filters.validationStatus}
                    onChange={(e) =>
                      handleFilterChange("validationStatus", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    {VALIDATION_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
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

                {/* Names */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Names (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={filters.names}
                    onChange={(e) => handleFilterChange("names", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="e.g., XRP, USD"
                  />
                </div>

                {/* Symbols */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Symbols (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={filters.symbols}
                    onChange={(e) => handleFilterChange("symbols", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="e.g., XRP, USD"
                  />
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
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {loading ? (
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading...
              </span>
            ) : (
              "Get Tickers"
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
            <p className="text-sm text-red-800 font-medium">Error: {error}</p>
          </div>
        </div>
      )}

      {response && response.items && response.items.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Tickers ({response.count} {response.count === 1 ? "item" : "items"})
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
            {response.items.map((ticker) => (
              <div
                key={ticker.data.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Name
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {ticker.data.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Symbol
                      </p>
                      <p className="text-sm font-mono text-gray-900">
                        {ticker.data.symbol || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Kind
                      </p>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          ticker.data.kind === "Native"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {ticker.data.kind}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Decimals
                      </p>
                      <p className="text-sm text-gray-900">
                        {ticker.data.decimals ?? "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Lock
                      </p>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          ticker.data.lock === "Unlocked"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {ticker.data.lock}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Ticker ID
                    </p>
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-mono text-gray-600 break-all flex-1">
                        {ticker.data.id}
                      </p>
                      <CopyButton text={ticker.data.id} />
                    </div>
                  </div>

                  {isMultiPurposeToken(ticker) && getIssuanceId(ticker) && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        MPT Issuance ID
                      </p>
                      <div className="flex items-center gap-1">
                        <a
                          href={`https://testnet.xrpl.org/mpt/${getIssuanceId(ticker)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono text-blue-600 hover:text-blue-800 break-all underline flex-1"
                        >
                          {getIssuanceId(ticker)}
                        </a>
                        <CopyButton text={getIssuanceId(ticker) || ""} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
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

      {response && response.items && response.items.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            No tickers found with the specified filters.
          </p>
        </div>
      )}

      {response && (
        <div>
          <JsonViewer data={response} title="Full Tickers Response" />
        </div>
      )}
    </div>
  );
}
