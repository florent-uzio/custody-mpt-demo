"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CopyButton } from "../../components/CopyButton";
import { JsonViewer } from "../../components/JsonViewer";
import { getMe } from "../../_actions/users";
import {
  Page,
  PageHeader,
  PageContainer,
  PageHero,
  ErrorBanner,
} from "../../components/layout";

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
  const {
    data: me,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    staleTime: 5 * 60_000,
  });

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
        title="Me"
        subtitle="Users · Profile"
        breadcrumbs={[{ label: "Users", href: "/users" }, { label: "Me" }]}
        actions={refreshAction}
      />
      <PageContainer width="detail">
        <PageHero
          theme="blue"
          icon="🪪"
          title={me?.domains[0]?.userReference.alias ?? "My Profile"}
          description="Your public key, login identity and domain memberships across this custody instance."
          badge={
            me ? { label: "Profile", note: `${me.domains.length} domain(s)` } : undefined
          }
        />

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

        {isError && <ErrorBanner error={error} />}

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
      </PageContainer>
    </Page>
  );
}
