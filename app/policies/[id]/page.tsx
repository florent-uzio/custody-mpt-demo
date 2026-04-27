"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CopyButton } from "../../components/CopyButton";
import { JsonViewer } from "../../components/JsonViewer";
import { useSidebarContext } from "../../contexts/SidebarContext";
import type {
  Core_TrustedPolicy,
  Core_PolicyScope,
  Core_Policy,
} from "custody";

type Core_LockStatus = Core_Policy["lock"];

const SCOPE_CONFIG: Record<
  Core_PolicyScope,
  { headerBg: string; badgeBg: string; badgeText: string; dot: string; border: string }
> = {
  Self:               { headerBg: "from-blue-500 to-blue-600",     badgeBg: "bg-blue-100",   badgeText: "text-blue-800",   dot: "bg-blue-400",   border: "border-blue-200" },
  Descendants:        { headerBg: "from-violet-500 to-violet-600", badgeBg: "bg-violet-100", badgeText: "text-violet-800", dot: "bg-violet-400", border: "border-violet-200" },
  SelfAndDescendants: { headerBg: "from-indigo-500 to-indigo-600", badgeBg: "bg-indigo-100", badgeText: "text-indigo-800", dot: "bg-indigo-400", border: "border-indigo-200" },
};

const LOCK_STYLES: Record<
  Core_LockStatus,
  { bg: string; text: string; dot: string }
> = {
  Unlocked: { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-400" },
  Locked:   { bg: "bg-red-100",   text: "text-red-800",   dot: "bg-red-400" },
  Archived: { bg: "bg-gray-100",  text: "text-gray-700",  dot: "bg-gray-400" },
};

const DEFAULT_CFG = SCOPE_CONFIG.Self;

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

export default function PolicyDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const policyId = params.id as string;
  const domainId = searchParams.get("domainId") ?? "";
  const { sidebarOpen, setSidebarOpen } = useSidebarContext();

  const {
    data: policy,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["policy", policyId, domainId],
    queryFn: async () => {
      const res = await fetch("/api/policies/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policyId, domainId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch policy");
      }
      return res.json() as Promise<Core_TrustedPolicy>;
    },
    enabled: !!policyId && !!domainId,
    staleTime: 60_000,
  });

  const scope = policy?.data.scope;
  const cfg = scope ? SCOPE_CONFIG[scope] : DEFAULT_CFG;
  const lock = policy?.data.lock;
  const lockStyle = lock ? LOCK_STYLES[lock] : LOCK_STYLES.Unlocked;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Gradient header */}
      <div className={`bg-gradient-to-r ${cfg.headerBg} shadow-md flex-shrink-0`}>
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
                    href="/policies"
                    className="text-white/60 hover:text-white text-xs font-medium transition-colors"
                  >
                    Policies
                  </Link>
                  <span className="text-white/40 text-xs">/</span>
                  <span className="text-white/80 text-xs font-medium">
                    Detail
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-white font-mono text-sm font-semibold break-all">
                    {policyId}
                  </h1>
                  <div className="bg-white/20 rounded p-0.5">
                    <CopyButton
                      text={policyId}
                      className="text-white hover:bg-white/20"
                    />
                  </div>
                </div>
                {policy?.data.alias && (
                  <p className="text-white/70 text-xs mt-1 font-medium">
                    {policy.data.alias}
                  </p>
                )}
              </div>
            </div>

            {scope && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.badgeBg} ${cfg.badgeText} flex-shrink-0`}
              >
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                {scope}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <p className="text-gray-500 text-sm">Loading policy…</p>
            </div>
          )}

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
                  Error loading policy
                </p>
                <p className="text-sm text-red-600 mt-0.5">
                  {error instanceof Error ? error.message : "An error occurred"}
                </p>
              </div>
            </div>
          )}

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
                A <strong>domainId</strong> is required to load this policy.
                Return to{" "}
                <Link href="/policies" className="underline font-medium">
                  Policies
                </Link>{" "}
                and set a Default Domain ID in the sidebar.
              </p>
            </div>
          )}

          {policy && !isLoading && (
            <div className="space-y-5">
              {/* Summary bar */}
              <div className={`bg-white rounded-xl border ${cfg.border} shadow-sm p-5`}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Alias
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {policy.data.alias}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Rank
                    </p>
                    <p className="text-sm font-semibold text-gray-800 tabular-nums">
                      {policy.data.rank}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Lock
                    </p>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${lockStyle.bg} ${lockStyle.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${lockStyle.dot}`} />
                      {policy.data.lock}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Engine
                    </p>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-100">
                      {policy.data.scriptingEngine}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Identity */}
                <InfoCard title="Identity" icon="🔑">
                  <InfoRow
                    label="Policy ID"
                    value={
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs break-all">
                          {policy.data.id}
                        </span>
                        <CopyButton text={policy.data.id} />
                      </div>
                    }
                  />
                  <InfoRow
                    label="Domain ID"
                    value={
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs break-all">
                          {policy.data.domainId}
                        </span>
                        <CopyButton text={policy.data.domainId} />
                      </div>
                    }
                  />
                  <InfoRow label="Alias" value={policy.data.alias} />
                  <InfoRow label="Rank" value={policy.data.rank} />
                </InfoCard>

                {/* Configuration */}
                <InfoCard title="Configuration" icon="⚙️">
                  <InfoRow
                    label="Scope"
                    value={
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.badgeBg} ${cfg.badgeText}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {policy.data.scope}
                      </span>
                    }
                  />
                  <InfoRow
                    label="Lock"
                    value={
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${lockStyle.bg} ${lockStyle.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${lockStyle.dot}`} />
                        {policy.data.lock}
                      </span>
                    }
                  />
                  <InfoRow
                    label="Engine"
                    value={
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-50 text-violet-700 border border-violet-100">
                        {policy.data.scriptingEngine}
                      </span>
                    }
                  />
                  {policy.data.intentTypes && policy.data.intentTypes.length > 0 && (
                    <InfoRow
                      label="Intent Types"
                      value={
                        <div className="flex flex-wrap gap-1.5">
                          {policy.data.intentTypes.map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center px-2 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-600"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      }
                    />
                  )}
                </InfoCard>

                {/* Metadata */}
                <InfoCard title="Metadata" icon="🏷️">
                  <InfoRow
                    label="Description"
                    value={
                      policy.data.metadata?.description || (
                        <span className="text-gray-300 italic">None</span>
                      )
                    }
                  />
                  <InfoRow
                    label="Created At"
                    value={
                      policy.data.metadata?.createdAt
                        ? formatDate(policy.data.metadata.createdAt)
                        : "—"
                    }
                  />
                  <InfoRow
                    label="Last Modified"
                    value={
                      policy.data.metadata?.lastModifiedAt
                        ? formatDate(policy.data.metadata.lastModifiedAt)
                        : "—"
                    }
                  />
                  <InfoRow
                    label="Revision"
                    value={policy.data.metadata?.revision ?? "—"}
                  />
                  {Object.keys(policy.data.metadata?.customProperties ?? {}).length > 0 && (
                    <InfoRow
                      label="Custom Props"
                      value={
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(policy.data.metadata.customProperties).map(([k, v]) => (
                            <span
                              key={k}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-600"
                            >
                              <span className="text-gray-400">{k}:</span>
                              {v}
                            </span>
                          ))}
                        </div>
                      }
                    />
                  )}
                </InfoCard>
              </div>

              {policy.data.condition && (
                <JsonViewer data={policy.data.condition} title="Condition" />
              )}

              {policy.data.workflow && policy.data.workflow.length > 0 && (
                <JsonViewer data={policy.data.workflow} title="Workflow" />
              )}

              <JsonViewer data={policy} title="Full Policy (Raw)" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
