"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CopyButton } from "../../components/CopyButton";
import { JsonViewer } from "../../components/JsonViewer";
import { useSidebarContext } from "../../contexts/SidebarContext";

interface TransferDetail {
  id: string;
  transactionId?: string;
  tickerId: string;
  quarantined: boolean;
  senders: Array<{
    accountId: string;
    domainId: string;
    amount: string;
  }>;
  recipient?: {
    accountId: string;
    domainId: string;
    amount: string;
  };
  value: string;
  kind: "Transfer" | "Fee" | "Recovery";
  registeredAt: string;
  metadata: unknown;
}

const KIND_CONFIG: Record<
  string,
  { headerBg: string; badgeBg: string; badgeText: string; dot: string; border: string }
> = {
  Transfer: { headerBg: "from-blue-500 to-blue-600",     badgeBg: "bg-blue-100",   badgeText: "text-blue-800",   dot: "bg-blue-400",   border: "border-blue-200" },
  Fee:      { headerBg: "from-yellow-400 to-orange-400", badgeBg: "bg-yellow-100", badgeText: "text-yellow-800", dot: "bg-yellow-400", border: "border-yellow-200" },
  Recovery: { headerBg: "from-purple-500 to-purple-600", badgeBg: "bg-purple-100", badgeText: "text-purple-800", dot: "bg-purple-400", border: "border-purple-200" },
};

const FALLBACK_CONFIG = {
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

function formatAmount(amount: string) {
  return parseInt(amount).toLocaleString();
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

export default function TransferDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const transferId = params.id as string;
  const domainId = searchParams.get("domainId") ?? "";
  const { sidebarOpen, setSidebarOpen } = useSidebarContext();

  const { data: transfer, isLoading, isError, error } = useQuery({
    queryKey: ["transfer", transferId, domainId],
    queryFn: async () => {
      const res = await fetch("/api/transfers/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transferId, domainId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch transfer");
      }
      return res.json() as Promise<TransferDetail>;
    },
    enabled: !!transferId && !!domainId,
    staleTime: 60_000,
  });

  const cfg = transfer ? (KIND_CONFIG[transfer.kind] ?? FALLBACK_CONFIG) : FALLBACK_CONFIG;

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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {sidebarOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href="/?tab=transfers"
                    className="text-white/60 hover:text-white text-xs font-medium transition-colors"
                  >
                    Transfers
                  </Link>
                  <span className="text-white/40 text-xs">/</span>
                  <span className="text-white/80 text-xs font-medium">Detail</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-white font-mono text-sm font-semibold break-all">
                    {transferId}
                  </h1>
                  <div className="bg-white/20 rounded p-0.5">
                    <CopyButton text={transferId} className="text-white hover:bg-white/20" />
                  </div>
                </div>
              </div>
            </div>

            {transfer && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.badgeBg} ${cfg.badgeText} flex-shrink-0`}
              >
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                {transfer.kind}
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
              <svg className="animate-spin w-8 h-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-500 text-sm">Loading transfer…</p>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-red-700">Error loading transfer</p>
                <p className="text-sm text-red-600 mt-0.5">
                  {error instanceof Error ? error.message : "An error occurred"}
                </p>
              </div>
            </div>
          )}

          {/* Content */}
          {transfer && !isLoading && (
            <div className="space-y-5">
              {/* Summary bar */}
              <div className={`bg-white rounded-xl border ${cfg.border} shadow-sm p-5`}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Kind</p>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${cfg.badgeBg} ${cfg.badgeText}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {transfer.kind}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Quarantined</p>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${transfer.quarantined ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${transfer.quarantined ? "bg-red-400" : "bg-green-400"}`} />
                      {transfer.quarantined ? "Yes" : "No"}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Value</p>
                    <p className="text-sm font-semibold text-gray-700">{formatAmount(transfer.value)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Registered At</p>
                    <p className="text-sm text-gray-700">{formatDate(transfer.registeredAt)}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Details */}
                <InfoCard title="Transfer Details" icon="💸">
                  <InfoRow
                    label="Transfer ID"
                    value={
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs break-all">{transfer.id}</span>
                        <CopyButton text={transfer.id} />
                      </div>
                    }
                  />
                  <InfoRow
                    label="Ticker ID"
                    value={
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs break-all">{transfer.tickerId}</span>
                        <CopyButton text={transfer.tickerId} />
                      </div>
                    }
                  />
                  <InfoRow label="Value" value={formatAmount(transfer.value)} />
                  <InfoRow label="Registered At" value={formatDate(transfer.registeredAt)} />
                  {transfer.transactionId && (
                    <InfoRow
                      label="Transaction ID"
                      value={
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/transactions/${transfer.transactionId}?domainId=${domainId}`}
                            className="font-mono text-xs text-blue-600 hover:text-blue-700 hover:underline break-all"
                          >
                            {transfer.transactionId}
                          </Link>
                          <CopyButton text={transfer.transactionId} />
                        </div>
                      }
                    />
                  )}
                </InfoCard>

                {/* Recipient */}
                <InfoCard title="Recipient" icon="📥">
                  {transfer.recipient ? (
                    <>
                      <InfoRow
                        label="Account ID"
                        value={
                          transfer.recipient.accountId ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs">{transfer.recipient.accountId}</span>
                              <CopyButton text={transfer.recipient.accountId} />
                            </div>
                          ) : (
                            <span className="text-gray-300 italic">—</span>
                          )
                        }
                      />
                      <InfoRow
                        label="Domain ID"
                        value={
                          transfer.recipient.domainId ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs">{transfer.recipient.domainId}</span>
                              <CopyButton text={transfer.recipient.domainId} />
                            </div>
                          ) : (
                            <span className="text-gray-300 italic">—</span>
                          )
                        }
                      />
                      <InfoRow label="Amount" value={transfer.recipient.amount ? formatAmount(transfer.recipient.amount) : "—"} />
                    </>
                  ) : (
                    <p className="text-sm text-gray-400 italic py-2">No recipient</p>
                  )}
                </InfoCard>

                {/* Senders */}
                <InfoCard title="Senders" icon="📤">
                  {transfer.senders.length === 0 ? (
                    <p className="text-sm text-gray-400 italic py-2">No senders</p>
                  ) : (
                    transfer.senders.map((sender, idx) => (
                      <div key={idx} className="py-3 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-20 flex-shrink-0">
                            Account
                          </span>
                          {sender.accountId ? (
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-xs text-gray-700">{sender.accountId}</span>
                              <CopyButton text={sender.accountId} />
                            </div>
                          ) : (
                            <span className="text-gray-300 italic text-xs">—</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-20 flex-shrink-0">
                            Domain
                          </span>
                          {sender.domainId ? (
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-xs text-gray-500">{sender.domainId}</span>
                              <CopyButton text={sender.domainId} />
                            </div>
                          ) : (
                            <span className="text-gray-300 italic text-xs">—</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-20 flex-shrink-0">
                            Amount
                          </span>
                          <span className="text-sm text-gray-700 font-medium">
                            {sender.amount ? formatAmount(sender.amount) : "—"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </InfoCard>
              </div>

              {/* Raw */}
              <JsonViewer data={transfer} title="Full Transfer (Raw)" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
