"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { Core_ApiManifest } from "custody";
import { CopyButton } from "../../../../components/CopyButton";
import { JsonViewer } from "../../../../components/JsonViewer";
import { useSidebarContext } from "../../../../contexts/SidebarContext";
import { getManifest } from "../../../../_actions/manifests";
import { PROCESSING_STYLES } from "../manifests.types";
import type { ManifestProcessingStatus } from "../manifests.types";

const PROCESSING_HEADER_BG: Record<ManifestProcessingStatus, string> = {
  Pending: "from-yellow-400 to-orange-400",
  Preparing: "from-blue-500 to-blue-600",
  Completed: "from-green-500 to-green-600",
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

function ManifestContentCard({ manifest }: { manifest: Core_ApiManifest }) {
  const content = manifest.data.content;

  if (content.type === "JWT") {
    const jwt = content as { type: "JWT"; header: Record<string, unknown>; payload: Record<string, unknown> };
    return (
      <InfoCard title="Content (JWT)" icon="📄">
        <InfoRow label="Type" value="JWT" />
        {jwt.header && (
          <>
            {(jwt.header as { type?: string }).type && (
              <InfoRow label="Header Type" value={(jwt.header as { type?: string }).type!} />
            )}
            {(jwt.header as { algorithm?: string }).algorithm && (
              <InfoRow label="Algorithm" value={(jwt.header as { algorithm?: string }).algorithm!} />
            )}
          </>
        )}
        {jwt.payload && (
          <>
            {(jwt.payload as { issuer?: string }).issuer && (
              <InfoRow label="Issuer" value={(jwt.payload as { issuer?: string }).issuer!} />
            )}
            {(jwt.payload as { subject?: string }).subject && (
              <InfoRow label="Subject" value={(jwt.payload as { subject?: string }).subject!} />
            )}
            {(jwt.payload as { audience?: string }).audience && (
              <InfoRow label="Audience" value={(jwt.payload as { audience?: string }).audience!} />
            )}
            {(jwt.payload as { jwtId?: string }).jwtId && (
              <InfoRow label="JWT ID" value={(jwt.payload as { jwtId?: string }).jwtId!} />
            )}
          </>
        )}
      </InfoCard>
    );
  }

  const typed = content as { type: string; value?: string };
  return (
    <InfoCard title={`Content (${content.type})`} icon="📄">
      <InfoRow label="Type" value={content.type} />
      {typed.value && (
        <InfoRow
          label="Value"
          value={
            <span className="font-mono text-xs break-all">{typed.value}</span>
          }
        />
      )}
    </InfoCard>
  );
}

export default function ManifestDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const accountId = params.id as string;
  const manifestId = params.manifestId as string;
  const domainId = searchParams.get("domainId") ?? "";
  const { sidebarOpen, setSidebarOpen } = useSidebarContext();

  const {
    data: manifest,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["manifest", domainId, accountId, manifestId],
    queryFn: () => getManifest(domainId, accountId, manifestId),
    enabled: !!domainId && !!accountId && !!manifestId,
    staleTime: 60_000,
  });

  const processingStatus = manifest?.additionalDetails?.processing?.type as
    | ManifestProcessingStatus
    | undefined;
  const headerBg = processingStatus
    ? PROCESSING_HEADER_BG[processingStatus]
    : "from-indigo-500 to-indigo-600";
  const badgeStyle = processingStatus
    ? PROCESSING_STYLES[processingStatus]
    : null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Gradient header */}
      <div
        className={`bg-gradient-to-r ${headerBg} shadow-md flex-shrink-0`}
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
                    href={`/accounts/${accountId}?domainId=${domainId}`}
                    className="text-white/60 hover:text-white text-xs font-medium transition-colors"
                  >
                    Account
                  </Link>
                  <span className="text-white/40 text-xs">/</span>
                  <Link
                    href={`/accounts/${accountId}/manifests?domainId=${domainId}`}
                    className="text-white/60 hover:text-white text-xs font-medium transition-colors"
                  >
                    Manifests
                  </Link>
                  <span className="text-white/40 text-xs">/</span>
                  <span className="text-white/80 text-xs font-medium">
                    Detail
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-white font-mono text-sm font-semibold break-all">
                    {manifestId}
                  </h1>
                  <div className="bg-white/20 rounded p-0.5">
                    <CopyButton
                      text={manifestId}
                      className="text-white hover:bg-white/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {processingStatus && badgeStyle && (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${badgeStyle.bg} ${badgeStyle.text}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${badgeStyle.dot}`}
                  />
                  {processingStatus}
                </span>
              )}
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white disabled:opacity-40"
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
            </div>
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
                className="animate-spin w-8 h-8 text-indigo-500"
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
              <p className="text-gray-500 text-sm">Loading manifest…</p>
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
                  Error loading manifest
                </p>
                <p className="text-sm text-red-600 mt-0.5">
                  {error instanceof Error ? error.message : "An error occurred"}
                </p>
              </div>
            </div>
          )}

          {/* Content */}
          {manifest && !isLoading && (
            <div className="space-y-5">
              {/* Summary bar */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Processing
                    </p>
                    {processingStatus && badgeStyle ? (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${badgeStyle.bg} ${badgeStyle.text}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot}`}
                        />
                        {processingStatus}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm italic">—</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Content Type
                    </p>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-100">
                      {manifest.data.content.type}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Created
                    </p>
                    <p className="text-sm text-gray-700">
                      {manifest.data.metadata?.createdAt
                        ? formatDate(
                            manifest.data.metadata.createdAt as string,
                          )
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Last Modified
                    </p>
                    <p className="text-sm text-gray-700">
                      {manifest.data.metadata?.lastModifiedAt
                        ? formatDate(
                            manifest.data.metadata.lastModifiedAt as string,
                          )
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Identity */}
                <InfoCard title="Identity" icon="🔑">
                  <InfoRow
                    label="Manifest ID"
                    value={
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs break-all">
                          {manifest.data.id}
                        </span>
                        <CopyButton text={manifest.data.id} />
                      </div>
                    }
                  />
                  <InfoRow
                    label="Account ID"
                    value={
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs break-all">
                          {manifest.data.accountId}
                        </span>
                        <CopyButton text={manifest.data.accountId} />
                      </div>
                    }
                  />
                  <InfoRow
                    label="Domain ID"
                    value={
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs break-all">
                          {manifest.data.domainId}
                        </span>
                        <CopyButton text={manifest.data.domainId} />
                      </div>
                    }
                  />
                  {manifest.data.ledgerId && (
                    <InfoRow
                      label="Ledger ID"
                      value={
                        <span className="font-mono text-xs">
                          {manifest.data.ledgerId}
                        </span>
                      }
                    />
                  )}
                </InfoCard>

                {/* Content */}
                <ManifestContentCard manifest={manifest} />

                {/* Signing */}
                <InfoCard title="Signing" icon="✍️">
                  <InfoRow
                    label="Signature"
                    value={
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs break-all">
                          {manifest.signature}
                        </span>
                        <CopyButton text={manifest.signature} />
                      </div>
                    }
                  />
                  <InfoRow
                    label="Signing Key"
                    value={
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs break-all">
                          {manifest.signingKey}
                        </span>
                        <CopyButton text={manifest.signingKey} />
                      </div>
                    }
                  />
                </InfoCard>

                {/* Value */}
                {manifest.data.value && (
                  <InfoCard title="Value" icon="💎">
                    <InfoRow label="Type" value={manifest.data.value.type} />
                    {"value" in manifest.data.value &&
                      (manifest.data.value as { value?: string }).value && (
                        <InfoRow
                          label="Value"
                          value={
                            <span className="font-mono text-xs break-all">
                              {
                                (manifest.data.value as { value: string })
                                  .value
                              }
                            </span>
                          }
                        />
                      )}
                    {"signature" in manifest.data.value &&
                      (manifest.data.value as { signature?: string })
                        .signature && (
                        <InfoRow
                          label="Signature"
                          value={
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs break-all">
                                {
                                  (
                                    manifest.data.value as {
                                      signature: string;
                                    }
                                  ).signature
                                }
                              </span>
                              <CopyButton
                                text={
                                  (
                                    manifest.data.value as {
                                      signature: string;
                                    }
                                  ).signature
                                }
                              />
                            </div>
                          }
                        />
                      )}
                    {"recoveryId" in manifest.data.value &&
                      (manifest.data.value as { recoveryId?: string })
                        .recoveryId && (
                        <InfoRow
                          label="Recovery ID"
                          value={
                            <span className="font-mono text-xs">
                              {
                                (
                                  manifest.data.value as {
                                    recoveryId: string;
                                  }
                                ).recoveryId
                              }
                            </span>
                          }
                        />
                      )}
                  </InfoCard>
                )}
              </div>

              {/* Raw JSON */}
              <JsonViewer data={manifest} title="Full Manifest (Raw)" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
