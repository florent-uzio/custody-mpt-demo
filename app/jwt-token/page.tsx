"use client";

import { useEffect, useState } from "react";
import { JsonViewer } from "../components/JsonViewer";
import { useCurrentToken } from "../hooks/useCurrentToken";
import {
  Page,
  PageHeader,
  PageContainer,
  PageHero,
  SectionCard,
  ErrorBanner,
} from "../components/layout";

function formatRemaining(ms: number): string {
  if (ms <= 0) return "Expired";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export default function JwtTokenPage() {
  const { data, isLoading, isFetching, error, refetch } = useCurrentToken();
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const hasToken = data?.hasToken ?? false;
  const expiration = data?.expiration ?? null;
  const claims = data?.claims ?? null;
  const header = data?.header ?? null;

  const expirationDate = expiration ? new Date(expiration * 1000) : null;
  const remainingMs = expiration ? expiration * 1000 - now : null;
  const isExpired = remainingMs !== null && remainingMs <= 0;

  return (
    <Page>
      <PageHeader title="JWT Token" subtitle="Tools · JWT" />
      <PageContainer width="form">
        <PageHero
          theme="indigo"
          icon="🎫"
          title="JWT Token"
          description="The claims of the JWT the Custody SDK uses to authenticate API requests. The token is decoded on the server — the raw credential never reaches the browser."
          badge={{
            label: "Read-only",
            note: "Claims only · Token stays server-side",
          }}
        />

        <SectionCard title="Token">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-lg font-medium disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all text-sm shadow-sm"
            >
              {isFetching ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <ErrorBanner error={error} />

          {isLoading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-500">Loading token...</p>
            </div>
          )}

          {!isLoading && !hasToken && !error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                No token available. The SDK has not authenticated yet — check that
                the Configuration tab has valid credentials.
              </p>
            </div>
          )}

          {hasToken && (
            <>
              {/* Status / Expiration card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Status
                    </div>
                    {isExpired ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase tracking-widest rounded bg-red-100 text-red-700 border border-red-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        Expired
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase tracking-widest rounded bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Time Remaining
                    </div>
                    <div className="text-sm font-mono text-gray-800">
                      {remainingMs === null ? "—" : formatRemaining(remainingMs)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Expires At
                    </div>
                    <div className="text-sm font-mono text-gray-800">
                      {expirationDate ? expirationDate.toLocaleString() : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Exp (Unix)
                    </div>
                    <div className="text-sm font-mono text-gray-800">
                      {expiration ?? "—"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Decoded */}
              {claims ? (
                <div className="space-y-4">
                  <JsonViewer data={header} title="Header" />
                  <JsonViewer data={claims} title="Payload" />
                  <p className="text-xs text-gray-500">
                    The raw token is not shown or copyable — it stays on the
                    server and is only decoded for display.
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    Token is not in standard JWT format — could not decode header or payload.
                  </p>
                </div>
              )}
            </>
          )}
        </SectionCard>
      </PageContainer>
    </Page>
  );
}
