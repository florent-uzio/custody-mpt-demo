"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "../components/CopyButton";
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

type DecodedJwt = {
  header: unknown;
  payload: unknown;
  signature: string;
} | null;

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  if (typeof atob === "function") {
    return decodeURIComponent(
      atob(padded + padding)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
  }
  return Buffer.from(padded + padding, "base64").toString("utf-8");
}

function decodeJwt(token: string | null): DecodedJwt {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    return {
      header: JSON.parse(base64UrlDecode(parts[0])),
      payload: JSON.parse(base64UrlDecode(parts[1])),
      signature: parts[2],
    };
  } catch {
    return null;
  }
}

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

  const token = data?.token ?? null;
  const expiration = data?.expiration ?? null;
  const decoded = useMemo(() => decodeJwt(token), [token]);

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
          description="The current JWT used by the Custody SDK to authenticate API requests. Sourced from rippleCustody.auth.getCurrentToken()."
          badge={{
            label: "Read-only",
            note: "Inspect · Decode · Copy",
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

          {!isLoading && !token && !error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                No token available. The SDK has not authenticated yet — check that
                the Configuration tab has valid credentials.
              </p>
            </div>
          )}

          {token && (
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

              {/* Raw token */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Raw Token
                  </label>
                  <CopyButton text={token} />
                </div>
                <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs text-gray-800 break-all border border-gray-200 max-h-48 overflow-y-auto">
                  {token}
                </div>
              </div>

              {/* Decoded */}
              {decoded ? (
                <div className="space-y-4">
                  <JsonViewer data={decoded.header} title="Header" />
                  <JsonViewer data={decoded.payload} title="Payload" />
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
