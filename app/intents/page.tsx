"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useDefaultDomain } from "../contexts/DomainContext";
import { CopyButton } from "../components/CopyButton";

type IntentStatus =
  | "Open"
  | "Approved"
  | "Executed"
  | "Failed"
  | "Expired"
  | "Rejected"
  | "Executing";

interface IntentEntity {
  id: string;
  details: {
    payload: { type: string };
    expiryAt: string;
    author: { id: string; domainId: string };
    targetDomainId: string;
    metadata: {
      description?: string;
      createdAt: string;
      customProperties: Record<string, string>;
    };
  };
  state: {
    status: IntentStatus;
    lastModifiedAt?: string;
    error?: { code: string; message: string };
  };
}

interface TrustedIntent {
  data: IntentEntity;
  signature: string;
  signingKey: string;
}

interface IntentsCollection {
  items: TrustedIntent[];
  count: number;
  nextStartingAfter?: string;
}

const STATUS_STYLES: Record<IntentStatus, { bg: string; text: string; dot: string }> = {
  Open:      { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500" },
  Approved:  { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500" },
  Executed:  { bg: "bg-emerald-50",text: "text-emerald-700",dot: "bg-emerald-500" },
  Executing: { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500" },
  Failed:    { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-500" },
  Rejected:  { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-400" },
  Expired:   { bg: "bg-gray-100",  text: "text-gray-600",   dot: "bg-gray-400" },
};

function StatusBadge({ status }: { status: IntentStatus }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.Expired;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function truncateId(id: string) {
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatType(type: string) {
  return type.replace(/^v0_/, "").replace(/([A-Z])/g, " $1").trim();
}

export default function IntentsPage() {
  const { defaultDomainId, setDefaultDomainId } = useDefaultDomain();
  const [data, setData] = useState<IntentsCollection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<IntentStatus | "">("");
  const [limit, setLimit] = useState(20);

  const fetchIntents = useCallback(
    async (startingAfter?: string) => {
      if (!defaultDomainId) {
        setError("Please set a default domain ID in the sidebar first");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const body: Record<string, unknown> = { domainId: defaultDomainId, limit };
        if (statusFilter) body.status = [statusFilter];
        if (startingAfter) body.startingAfter = startingAfter;

        const res = await fetch("/api/intents/list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to fetch intents");
        }
        const result: IntentsCollection = await res.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [defaultDomainId, statusFilter, limit],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchIntents();
  };

  const intents = data?.items ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800"
            title="Back to dashboard"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Intents</h1>
            <p className="text-xs text-gray-500">Operations</p>
          </div>
        </div>
        {data && (
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
            {data.count} total
          </span>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Filters card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Filters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Domain ID</label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={defaultDomainId}
                  onChange={(e) => setDefaultDomainId(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2 text-sm font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Enter domain UUID"
                  required
                />
                {defaultDomainId && <CopyButton text={defaultDomainId} />}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as IntentStatus | "")}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
              >
                <option value="">All statuses</option>
                {(["Open","Approved","Executed","Executing","Failed","Rejected","Expired"] as IntentStatus[]).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Limit</label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>{n} per page</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Load Intents
                </>
              )}
            </button>
            {data && (
              <span className="text-xs text-gray-400">
                Showing {intents.length} of {data.count}
              </span>
            )}
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Table */}
        {intents.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Intent ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Description</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Created</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Expires</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {intents.map(({ data: intent }) => (
                    <tr
                      key={intent.id}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3">
                        <StatusBadge status={intent.state.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-gray-700">
                            {truncateId(intent.id)}
                          </span>
                          <CopyButton text={intent.id} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-50 text-violet-700 border border-violet-100">
                          {formatType(intent.details.payload.type)}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell max-w-xs">
                        <span className="text-gray-600 truncate block">
                          {intent.details.metadata.description || <span className="text-gray-300 italic">—</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(intent.details.metadata.createdAt)}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(intent.details.expiryAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/intents/${intent.id}?domainId=${defaultDomainId}`}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-300 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors"
                          onClick={(e) => e.stopPropagation()}
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

            {/* Pagination */}
            {data?.nextStartingAfter && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Showing {intents.length} of {data.count}
                </span>
                <button
                  onClick={() => fetchIntents(data.nextStartingAfter)}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  Load more
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {data && intents.length === 0 && !loading && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">No intents found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting the filters above</p>
          </div>
        )}
      </main>
    </div>
  );
}
