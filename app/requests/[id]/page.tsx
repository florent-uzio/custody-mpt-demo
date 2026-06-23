"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { type Core_RequestState } from "@florent-uzio/custody";
import { CopyButton } from "../../components/CopyButton";
import { JsonViewer } from "../../components/JsonViewer";
import { getRequestState } from "../../_actions/requests";
import {
  Page,
  PageHeader,
  PageContainer,
  PageHero,
  ErrorBanner,
} from "../../components/layout";

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

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
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

  const {
    data: request,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["request", requestId, domainId],
    queryFn: () => getRequestState(domainId, requestId),
    enabled: !!requestId && !!domainId,
    staleTime: 60_000,
  });

  const status = request?.status ?? "";
  const cfg = STATUS_CONFIG[status] ?? DEFAULT_CONFIG;

  const shortId = requestId
    ? `${requestId.slice(0, 8)}…${requestId.slice(-4)}`
    : "Detail";

  const refreshAction = (
    <button
      onClick={() => refetch()}
      disabled={isFetching}
      className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 disabled:opacity-50"
      title="Refresh"
    >
      <svg
        className={`w-5 h-5 ${isFetching ? "animate-spin" : ""}`}
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
  );

  return (
    <Page>
      <PageHeader
        title="Request"
        breadcrumbs={[
          { label: "Requests", href: "/requests" },
          { label: shortId },
        ]}
        actions={refreshAction}
      />
      <PageContainer width="detail">
        <PageHero
          theme="blue"
          icon="📋"
          title={requestId}
          description="Inspect the current state, requester, intent reference, and status history for this custody request."
          badge={
            status
              ? { label: status }
              : undefined
          }
        />

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
        {isError && <ErrorBanner error={error} />}

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
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
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
                          entry.timestamp ? formatDate(entry.timestamp) : "—"
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
      </PageContainer>
    </Page>
  );
}
