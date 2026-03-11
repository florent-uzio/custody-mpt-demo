"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CopyButton } from "../../components/CopyButton";
import { JsonViewer } from "../../components/JsonViewer";
import { useSidebarContext } from "../../contexts/SidebarContext";
import { LockBadge } from "../components/LockBadge";
import { LOCK_STYLES, type TrustedUser } from "../users.types";

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

export default function UserDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params.id as string;
  const domainId = searchParams.get("domainId") ?? "";
  const { sidebarOpen, setSidebarOpen } = useSidebarContext();

  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ["user", userId, domainId],
    queryFn: async () => {
      const res = await fetch("/api/users/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, domainId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch user");
      }
      return res.json() as Promise<TrustedUser>;
    },
    enabled: !!userId && !!domainId,
    staleTime: 60_000,
  });

  const lock = user?.data.lock;
  const cfg = lock ? (LOCK_STYLES[lock] ?? LOCK_STYLES.Archived) : LOCK_STYLES.Archived;

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
                    href="/users"
                    className="text-white/60 hover:text-white text-xs font-medium transition-colors"
                  >
                    Users
                  </Link>
                  <span className="text-white/40 text-xs">/</span>
                  <span className="text-white/80 text-xs font-medium">
                    {user?.data.alias ?? "Detail"}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-white font-mono text-sm font-semibold break-all">
                    {userId}
                  </h1>
                  <div className="bg-white/20 rounded p-0.5">
                    <CopyButton
                      text={userId}
                      className="text-white hover:bg-white/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {lock && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text} flex-shrink-0`}
              >
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                {lock}
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
              <p className="text-gray-500 text-sm">Loading user…</p>
            </div>
          )}

          {isError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
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
                  Error loading user
                </p>
                <p className="text-sm text-red-600 mt-0.5">
                  {error instanceof Error ? error.message : "An error occurred"}
                </p>
              </div>
            </div>
          )}

          {user && !isLoading && (
            <div className="space-y-5">
              {/* Summary bar */}
              <div className={`bg-white rounded-xl border ${cfg.border} shadow-sm p-5`}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Alias
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {user.data.alias}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Lock
                    </p>
                    <LockBadge status={user.data.lock} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Created
                    </p>
                    <p className="text-sm text-gray-700">
                      {formatDate(user.data.metadata.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Last Modified
                    </p>
                    <p className="text-sm text-gray-700">
                      {formatDate(user.data.metadata.lastModifiedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Identity */}
                <InfoCard title="Identity" icon="🪪">
                  <InfoRow
                    label="User ID"
                    value={
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs">
                          {user.data.id}
                        </span>
                        <CopyButton text={user.data.id} />
                      </div>
                    }
                  />
                  <InfoRow label="Alias" value={user.data.alias} />
                  <InfoRow
                    label="Domain ID"
                    value={
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs">
                          {user.data.domainId}
                        </span>
                        <CopyButton text={user.data.domainId} />
                      </div>
                    }
                  />
                  <InfoRow
                    label="Lock"
                    value={<LockBadge status={user.data.lock} />}
                  />
                  {user.data.metadata.description && (
                    <InfoRow
                      label="Description"
                      value={user.data.metadata.description}
                    />
                  )}
                </InfoCard>

                {/* Roles */}
                <InfoCard title="Roles & Access" icon="🔐">
                  <InfoRow
                    label="Roles"
                    value={
                      user.data.roles.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {user.data.roles.map((role) => (
                            <span
                              key={role}
                              className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-100"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-300 italic">No roles</span>
                      )
                    }
                  />
                  <InfoRow
                    label="Public Key"
                    value={
                      <div className="flex items-start gap-1.5">
                        <span className="font-mono text-xs break-all text-gray-600">
                          {user.data.publicKey}
                        </span>
                        <CopyButton text={user.data.publicKey} />
                      </div>
                    }
                  />
                  {user.data.loginIds && user.data.loginIds.length > 0 && (
                    <InfoRow
                      label="Login IDs"
                      value={
                        <div className="space-y-1">
                          {user.data.loginIds.map((login, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 text-xs"
                            >
                              <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-mono">
                                {login.providerId}
                              </span>
                              <span className="font-mono text-gray-700">
                                {login.id}
                              </span>
                            </div>
                          ))}
                        </div>
                      }
                    />
                  )}
                </InfoCard>

                {/* Metadata */}
                <InfoCard title="Metadata" icon="🏷️">
                  <InfoRow
                    label="Created At"
                    value={formatDate(user.data.metadata.createdAt)}
                  />
                  <InfoRow
                    label="Last Modified"
                    value={formatDate(user.data.metadata.lastModifiedAt)}
                  />
                  <InfoRow
                    label="Revision"
                    value={
                      <span className="font-mono text-xs">
                        {user.data.metadata.revision}
                      </span>
                    }
                  />
                  {Object.keys(user.data.metadata.customProperties ?? {})
                    .length > 0 && (
                    <InfoRow
                      label="Custom Props"
                      value={
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(
                            user.data.metadata.customProperties,
                          ).map(([k, v]) => (
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

              <JsonViewer data={user} title="Full User (Raw)" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
