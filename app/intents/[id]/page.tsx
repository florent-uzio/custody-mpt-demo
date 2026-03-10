"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CopyButton } from "../../components/CopyButton";
import { JsonViewer } from "../../components/JsonViewer";

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
    payload: { type: string; [key: string]: unknown };
    expiryAt: string;
    author: { id: string; domainId: string };
    targetDomainId: string;
    metadata: {
      description?: string;
      createdAt: string;
      customProperties: Record<string, string>;
    };
    proposalSignature: string;
  };
  state: {
    status: IntentStatus;
    lastModifiedAt?: string;
    error?: { code: string; message: string };
    progressPerPolicy?: unknown[];
  };
}

interface TrustedIntent {
  data: IntentEntity;
  signature: string;
  signingKey: string;
}

const STATUS_CONFIG: Record<
  IntentStatus,
  { headerBg: string; badgeBg: string; badgeText: string; dot: string; border: string }
> = {
  Open:      { headerBg: "from-blue-500 to-blue-600",     badgeBg: "bg-blue-100",    badgeText: "text-blue-800",    dot: "bg-blue-400",   border: "border-blue-200" },
  Approved:  { headerBg: "from-green-500 to-green-600",   badgeBg: "bg-green-100",   badgeText: "text-green-800",   dot: "bg-green-400",  border: "border-green-200" },
  Executed:  { headerBg: "from-emerald-500 to-teal-500",  badgeBg: "bg-emerald-100", badgeText: "text-emerald-800", dot: "bg-emerald-400",border: "border-emerald-200" },
  Executing: { headerBg: "from-yellow-400 to-orange-400", badgeBg: "bg-yellow-100",  badgeText: "text-yellow-800",  dot: "bg-yellow-400", border: "border-yellow-200" },
  Failed:    { headerBg: "from-red-500 to-rose-500",      badgeBg: "bg-red-100",     badgeText: "text-red-800",     dot: "bg-red-400",    border: "border-red-200" },
  Rejected:  { headerBg: "from-red-400 to-pink-500",      badgeBg: "bg-red-100",     badgeText: "text-red-800",     dot: "bg-red-400",    border: "border-red-200" },
  Expired:   { headerBg: "from-gray-400 to-gray-500",     badgeBg: "bg-gray-100",    badgeText: "text-gray-700",    dot: "bg-gray-400",   border: "border-gray-200" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function formatType(type: string) {
  return type.replace(/^v0_/, "").replace(/([A-Z])/g, " $1").trim();
}

function InfoRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider sm:w-36 flex-shrink-0 mt-0.5">
        {label}
      </span>
      <span className={`text-sm text-gray-800 break-all flex-1 ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function InfoCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{icon}</span>
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function IntentDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const intentId = params.id as string;
  const domainId = searchParams.get("domainId") ?? "";

  const [intent, setIntent] = useState<TrustedIntent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!intentId || !domainId) {
      setError("Missing intentId or domainId");
      setLoading(false);
      return;
    }

    const fetchIntent = async () => {
      try {
        const res = await fetch("/api/intents/get", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ intentId, domainId }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to fetch intent");
        }
        const result: TrustedIntent = await res.json();
        setIntent(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchIntent();
  }, [intentId, domainId]);

  const status = intent?.data.state.status;
  const cfg = status ? STATUS_CONFIG[status] : STATUS_CONFIG.Expired;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header strip */}
      <div className={`bg-gradient-to-r ${cfg.headerBg} shadow-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Link
                href={domainId ? `/intents?domainId=${domainId}` : "/intents"}
                className="mt-0.5 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
                title="Back to intents list"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">Intent Detail</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-white font-mono text-sm font-semibold break-all">
                    {intentId}
                  </h1>
                  <div className="bg-white/20 rounded p-0.5">
                    <CopyButton text={intentId} className="text-white hover:bg-white/20" />
                  </div>
                </div>
              </div>
            </div>

            {status && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.badgeBg} ${cfg.badgeText} flex-shrink-0`}>
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                {status}
              </span>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <svg className="animate-spin w-8 h-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-500 text-sm">Loading intent…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3 mt-4">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-700">Error loading intent</p>
              <p className="text-sm text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        {intent && !loading && (
          <div className="space-y-5">
            {/* Summary bar */}
            <div className={`bg-white rounded-xl border ${cfg.border} shadow-sm p-5`}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Type</p>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-100">
                    {formatType(intent.data.details.payload.type)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${cfg.badgeBg} ${cfg.badgeText}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {intent.data.state.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Created</p>
                  <p className="text-sm text-gray-700">{formatDate(intent.data.details.metadata.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Expires</p>
                  <p className="text-sm text-gray-700">{formatDate(intent.data.details.expiryAt)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* State */}
              <InfoCard title="State" icon="📊">
                <InfoRow label="Status" value={
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.badgeBg} ${cfg.badgeText}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {intent.data.state.status}
                  </span>
                } />
                {intent.data.state.lastModifiedAt && (
                  <InfoRow label="Last Modified" value={formatDate(intent.data.state.lastModifiedAt)} />
                )}
                {intent.data.state.error && (
                  <InfoRow label="Error" value={
                    <span className="text-red-600">
                      [{intent.data.state.error.code}] {intent.data.state.error.message}
                    </span>
                  } />
                )}
              </InfoCard>

              {/* Author */}
              <InfoCard title="Author" icon="👤">
                <InfoRow
                  label="User ID"
                  value={
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs">{intent.data.details.author.id}</span>
                      <CopyButton text={intent.data.details.author.id} />
                    </div>
                  }
                />
                <InfoRow
                  label="Domain ID"
                  value={
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs">{intent.data.details.author.domainId}</span>
                      <CopyButton text={intent.data.details.author.domainId} />
                    </div>
                  }
                />
                <InfoRow
                  label="Target Domain"
                  value={
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs">{intent.data.details.targetDomainId}</span>
                      <CopyButton text={intent.data.details.targetDomainId} />
                    </div>
                  }
                />
              </InfoCard>

              {/* Metadata */}
              <InfoCard title="Metadata" icon="🏷️">
                <InfoRow label="Description" value={intent.data.details.metadata.description || <span className="text-gray-300 italic">None</span>} />
                <InfoRow label="Created At" value={formatDate(intent.data.details.metadata.createdAt)} />
                {Object.keys(intent.data.details.metadata.customProperties ?? {}).length > 0 && (
                  <InfoRow
                    label="Custom Props"
                    value={
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(intent.data.details.metadata.customProperties).map(([k, v]) => (
                          <span key={k} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-600">
                            <span className="text-gray-400">{k}:</span>{v}
                          </span>
                        ))}
                      </div>
                    }
                  />
                )}
              </InfoCard>

              {/* Intent ID */}
              <InfoCard title="Identity" icon="🔑">
                <InfoRow
                  label="Intent ID"
                  value={
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs break-all">{intent.data.id}</span>
                      <CopyButton text={intent.data.id} />
                    </div>
                  }
                />
                <InfoRow label="Payload Type" value={
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-50 text-violet-700 border border-violet-100">
                    {intent.data.details.payload.type}
                  </span>
                } />
              </InfoCard>
            </div>

            {/* Payload */}
            <div>
              <JsonViewer data={intent.data.details.payload} title="Payload" />
            </div>

            {/* Full intent raw */}
            <div>
              <JsonViewer data={intent} title="Full Intent (Raw)" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
