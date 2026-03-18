"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { type Core_RequestState } from "custody";
import { CopyButton } from "../../components/CopyButton";
import { JsonViewer } from "../../components/JsonViewer";
import { useSidebarContext } from "../../contexts/SidebarContext";

const STATUS_CONFIG: Record<
  string,
  {
    headerBg: string;
    badgeBg: string;
    badgeText: string;
    dot: string;
    border: string;
  }
> = {
  Processing: {
    headerBg: "from-yellow-400 to-orange-400",
    badgeBg: "bg-yellow-100",
    badgeText: "text-yellow-800",
    dot: "bg-yellow-400",
    border: "border-yellow-200",
  },
  Succeeded: {
    headerBg: "from-emerald-500 to-teal-500",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800",
    dot: "bg-emerald-400",
    border: "border-emerald-200",
  },
  Failed: {
    headerBg: "from-red-500 to-rose-500",
    badgeBg: "bg-red-100",
    badgeText: "text-red-800",
    dot: "bg-red-400",
    border: "border-red-200",
  },
};

const DEFAULT_CONFIG = {
  headerBg: "from-gray-400 to-gray-500",
  badgeBg: "bg-gray-100",
  badgeText: "text-gray-700",
  dot: "bg-gray-400",
  border: "border-gray-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider sm:w-36 flex-shrink-0 mt-0.5">
        {label}
      </span>
      <span className="text-sm text-gray-800 break-all flex-1">{value}</span>
    </div>
  );
}

function InfoCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{icon}</span>
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
          {title}
        </h3>
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function RequestDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const requestId = params.id as string;
  const domainId = searchParams.get("domainId") ?? "";
  const { sidebarOpen, setSidebarOpen } = useSidebarContext();

  const {
    data: request,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["request", requestId, domainId],
    queryFn: async () => {
      const res = await fetch("/api/requests/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, domainId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch request");
      }
      return res.json() as Promise<Core_RequestState>;
    },
    enabled: !!requestId && !!domainId,
    staleTime: 60_000,
  });

  const status = request?.status ?? "";
  const cfg = STATUS_CONFIG[status] ?? DEFAULT_CONFIG;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Gradient header */}
      <div
        className={`bg-gradient-to-r ${cfg.headerBg} shadow-md flex-shrink-0`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mt-0.5 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
                aria-label="Toggle sidebar"
              >
                <svg
                  className="w-4 h-4"
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
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href="/requests"
                    className="text-white/60 hover:text-white text-xs font-medium transition-colors"
                  >
                    Requests
                  </Link>
                  <span className="text-white/40 text-xs">/</span>
                  <span className="text-white/80 text-xs font-medium">
                    Detail
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-white font-mono text-sm font-semibold break-all">
                    {requestId}
                  </h1>
                  <div className="bg-white/20 rounded p-0.5">
                    <CopyButton
                      text={requestId}
                      className="text-white hover:bg-white/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {status && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.badgeBg} ${cfg.badgeText} flex-shrink-0`}
              >
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                {status}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <svg
                className="animate-spin w-8 h-8 text-blue-500"
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
              <p className="text-gray-500 text-sm">Loading request…</p>
            </div>
          )}

          {/* No domain ID warning */}
          {!domainId && !isLoading && (
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
                A <strong>Domain ID</strong> is required. Set a Default Domain
                ID in the sidebar and navigate here from the requests list.
              </p>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3 mt-4">
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
              <div>
                <p className="text-sm font-semibold text-red-700">
                  Error loading request
                </p>
                <p className="text-sm text-red-600 mt-0.5">
                  {error instanceof Error ? error.message : "An error occurred"}
                </p>
              </div>
            </div>
          )}

          {/* Content */}
          {request && !isLoading && (
            <div className="space-y-5">
              {/* Summary bar */}
              <div
                className={`bg-white rounded-xl border ${cfg.border} shadow-sm p-5`}
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Status
                    </p>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${cfg.badgeBg} ${cfg.badgeText}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                      />
                      {request.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Request ID
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs text-gray-700 truncate">
                        {request.id}
                      </span>
                      <CopyButton text={request.id} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Last Modified
                    </p>
                    <p className="text-sm text-gray-700">
                      {request.lastModifiedAt
                        ? formatDate(request.lastModifiedAt)
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Intent
                    </p>
                    <p className="text-sm text-gray-700">
                      {request.intent ? (
                        <span className="font-mono text-xs">
                          {request.intent.id}
                        </span>
                      ) : (
                        <span className="text-gray-300 italic">None</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Requester */}
                <InfoCard title="Requester" icon="👤">
                  <InfoRow
                    label="User ID"
                    value={
                      request.requester?.id ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs">
                            {request.requester.id}
                          </span>
                          <CopyButton text={request.requester.id} />
                        </div>
                      ) : (
                        <span className="text-gray-300 italic">—</span>
                      )
                    }
                  />
                  {request.requester?.domainId && (
                    <InfoRow
                      label="Domain ID"
                      value={
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs">
                            {request.requester.domainId}
                          </span>
                          <CopyButton text={request.requester.domainId} />
                        </div>
                      }
                    />
                  )}
                </InfoCard>

                {/* Intent Reference */}
                {request.intent && (
                  <InfoCard title="Intent" icon="📋">
                    <InfoRow
                      label="Intent ID"
                      value={
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs">
                            {request.intent.id}
                          </span>
                          <CopyButton text={request.intent.id} />
                        </div>
                      }
                    />
                    {request.intent.domainId && (
                      <InfoRow
                        label="Domain ID"
                        value={
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs">
                              {request.intent.domainId}
                            </span>
                            <CopyButton text={request.intent.domainId} />
                          </div>
                        }
                      />
                    )}
                  </InfoCard>
                )}

                {/* History */}
                {request.history && request.history.length > 0 && (
                  <InfoCard title="History" icon="📜">
                    {request.history.map(
                      (
                        entry: { status: string; timestamp?: string },
                        i: number,
                      ) => (
                        <InfoRow
                          key={i}
                          label={entry.status}
                          value={
                            entry.timestamp
                              ? formatDate(entry.timestamp)
                              : "—"
                          }
                        />
                      ),
                    )}
                  </InfoCard>
                )}
              </div>

              <JsonViewer data={request} title="Full Request State (Raw)" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
