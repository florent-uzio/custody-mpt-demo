"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CopyButton } from "../../components/CopyButton";
import { JsonViewer } from "../../components/JsonViewer";
import { useSidebarContext } from "../../contexts/SidebarContext";
import { getMe } from "../../_actions/users";

interface MeDomainReference {
  id: string;
  alias: string;
  userReference: {
    id: string;
    alias: string;
    roles: string[];
  };
}

interface MeReference {
  publicKey: string;
  domains: MeDomainReference[];
  loginId?: { id: string; providerId: string };
}

async function fetchMe(): Promise<MeReference> {
  const result = await getMe();
  return result as unknown as MeReference;
}

export default function MePage() {
  const { sidebarOpen, setSidebarOpen } = useSidebarContext();

  const { data: me, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    staleTime: 5 * 60_000,
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
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
                <div className="flex items-center gap-2 mb-0.5">
                  <Link
                    href="/users"
                    className="text-white/60 hover:text-white text-xs font-medium transition-colors"
                  >
                    Users
                  </Link>
                  <span className="text-white/40 text-xs">/</span>
                  <span className="text-white/80 text-xs font-medium">Me</span>
                </div>
                <h1 className="text-white text-xl font-bold">
                  {me ? me.domains[0]?.userReference.alias ?? "My Profile" : "My Profile"}
                </h1>
              </div>
            </div>

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white disabled:opacity-50"
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <svg
                className="animate-spin w-8 h-8 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-500 text-sm">Loading credentials…</p>
            </div>
          )}

          {isError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-red-700">Error loading credentials</p>
                <p className="text-sm text-red-600 mt-0.5">
                  {error instanceof Error ? error.message : "An error occurred"}
                </p>
              </div>
            </div>
          )}

          {me && (
            <>
              {/* Credentials card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-lg">🔑</span>
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Credentials
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Public Key
                    </p>
                    <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                      <span className="font-mono text-xs text-gray-700 break-all flex-1">
                        {me.publicKey}
                      </span>
                      <CopyButton text={me.publicKey} />
                    </div>
                  </div>

                  {me.loginId && (
                    <div className="flex items-center gap-6 pt-1">
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Login Provider
                        </p>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                          {me.loginId.providerId}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Login ID
                        </p>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-sm text-gray-700">
                            {me.loginId.id}
                          </span>
                          <CopyButton text={me.loginId.id} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Domains */}
              <div>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
                  Domains ({me.domains.length})
                </h2>
                <div className="space-y-4">
                  {me.domains.map((domain) => (
                    <div
                      key={domain.id}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {domain.alias}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-xs text-gray-400">
                              {domain.id}
                            </span>
                            <CopyButton text={domain.id} />
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 flex-shrink-0">
                          Domain
                        </span>
                      </div>

                      <div className="border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            User Alias
                          </p>
                          <p className="text-sm text-gray-800 font-medium">
                            {domain.userReference.alias}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            User ID
                          </p>
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/users/${domain.userReference.id}?domainId=${domain.id}`}
                              className="font-mono text-xs text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              {domain.userReference.id.slice(0, 8)}…{domain.userReference.id.slice(-4)}
                            </Link>
                            <CopyButton text={domain.userReference.id} />
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            Roles
                          </p>
                          {domain.userReference.roles.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {domain.userReference.roles.map((role) => (
                                <span
                                  key={role}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-100"
                                >
                                  {role}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-300 italic text-xs">
                              None
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <JsonViewer data={me} title="Raw Response" />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
