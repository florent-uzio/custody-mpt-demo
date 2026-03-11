"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CopyButton } from "../../components/CopyButton";
import { JsonViewer } from "../../components/JsonViewer";
import { useSidebarContext } from "../../contexts/SidebarContext";

interface TransactionDetail {
  id: string;
  ledgerId: string;
  orderReference?: {
    id?: string;
    requestId?: string;
    intentId?: string;
  };
  relatedAccounts: Array<{
    id: string;
    domainId: string;
    sender?: boolean;
  }>;
  processing?: {
    status?: string;
    [key: string]: unknown;
  };
  registeredAt: string;
  ledgerTransactionData?: {
    ledgerStatus?: string;
    statusLastUpdatedAt?: string;
    failure?: string;
    ledgerTransactionId?: string;
    blockTime?: string;
    ledgerData?: {
      tokenData?: {
        issuanceId?: string;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}

type ProcessingStatus = "Completed" | "Failed" | "Submitted" | "Processing";

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
  Completed: {
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
  Submitted: {
    headerBg: "from-blue-500 to-blue-600",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-800",
    dot: "bg-blue-400",
    border: "border-blue-200",
  },
  Processing: {
    headerBg: "from-yellow-400 to-orange-400",
    badgeBg: "bg-yellow-100",
    badgeText: "text-yellow-800",
    dot: "bg-yellow-400",
    border: "border-yellow-200",
  },
};

const FALLBACK_CONFIG = {
  headerBg: "from-gray-400 to-gray-500",
  badgeBg: "bg-gray-100",
  badgeText: "text-gray-700",
  dot: "bg-gray-400",
  border: "border-gray-200",
};

const LEDGER_STATUS_STYLES: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  Success: { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-400" },
  Failed: { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-400" },
};

function LedgerStatusBadge({ status }: { status: string }) {
  const s = LEDGER_STATUS_STYLES[status] ?? {
    bg: "bg-gray-100",
    text: "text-gray-700",
    dot: "bg-gray-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

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

export default function TransactionDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const transactionId = params.id as string;
  const domainId = searchParams.get("domainId") ?? "";
  const { sidebarOpen, setSidebarOpen } = useSidebarContext();

  const {
    data: tx,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["transaction", transactionId, domainId],
    queryFn: async () => {
      const res = await fetch("/api/transactions/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, domainId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch transaction");
      }
      return res.json() as Promise<TransactionDetail>;
    },
    enabled: !!transactionId && !!domainId,
    staleTime: 60_000,
  });

  const processingStatus = tx?.processing?.status as
    | ProcessingStatus
    | undefined;
  const cfg = processingStatus
    ? (STATUS_CONFIG[processingStatus] ?? FALLBACK_CONFIG)
    : FALLBACK_CONFIG;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Gradient header */}
      <div
        className={`bg-gradient-to-r ${cfg.headerBg} shadow-md flex-shrink-0`}
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
                    href="/?tab=transactions"
                    className="text-white/60 hover:text-white text-xs font-medium transition-colors"
                  >
                    Transactions
                  </Link>
                  <span className="text-white/40 text-xs">/</span>
                  <span className="text-white/80 text-xs font-medium">
                    Detail
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-white font-mono text-sm font-semibold break-all">
                    {transactionId}
                  </h1>
                  <div className="bg-white/20 rounded p-0.5">
                    <CopyButton
                      text={transactionId}
                      className="text-white hover:bg-white/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {processingStatus && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.badgeBg} ${cfg.badgeText} flex-shrink-0`}
              >
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                {processingStatus}
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
              <p className="text-gray-500 text-sm">Loading transaction…</p>
            </div>
          )}

          {/* Error */}
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
                  Error loading transaction
                </p>
                <p className="text-sm text-red-600 mt-0.5">
                  {error instanceof Error ? error.message : "An error occurred"}
                </p>
              </div>
            </div>
          )}

          {/* Content */}
          {tx && !isLoading && (
            <div className="space-y-5">
              {/* Summary bar */}
              <div
                className={`bg-white rounded-xl border ${cfg.border} shadow-sm p-5`}
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Processing
                    </p>
                    {processingStatus ? (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${cfg.badgeBg} ${cfg.badgeText}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                        />
                        {processingStatus}
                      </span>
                    ) : (
                      <span className="text-gray-300 italic text-sm">—</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Ledger Status
                    </p>
                    {tx.ledgerTransactionData?.ledgerStatus ? (
                      <LedgerStatusBadge
                        status={tx.ledgerTransactionData.ledgerStatus}
                      />
                    ) : (
                      <span className="text-gray-300 italic text-sm">—</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Ledger
                    </p>
                    <p className="text-sm text-gray-700 font-mono truncate">
                      {tx.ledgerId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Registered At
                    </p>
                    <p className="text-sm text-gray-700">
                      {formatDate(tx.registeredAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Processing */}
                <InfoCard title="Processing" icon="⚙️">
                  <InfoRow
                    label="Status"
                    value={
                      processingStatus ? (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.badgeBg} ${cfg.badgeText}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                          />
                          {processingStatus}
                        </span>
                      ) : (
                        <span className="text-gray-300 italic">—</span>
                      )
                    }
                  />
                  <InfoRow
                    label="Transaction ID"
                    value={
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs break-all">
                          {tx.id}
                        </span>
                        <CopyButton text={tx.id} />
                      </div>
                    }
                  />
                  <InfoRow
                    label="Registered At"
                    value={formatDate(tx.registeredAt)}
                  />
                </InfoCard>

                {/* Ledger Data */}
                <InfoCard title="Ledger Data" icon="📒">
                  <InfoRow
                    label="Ledger ID"
                    value={
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs">{tx.ledgerId}</span>
                        <CopyButton text={tx.ledgerId} />
                      </div>
                    }
                  />
                  <InfoRow
                    label="Status"
                    value={
                      tx.ledgerTransactionData?.ledgerStatus ? (
                        <LedgerStatusBadge
                          status={tx.ledgerTransactionData.ledgerStatus}
                        />
                      ) : (
                        <span className="text-gray-300 italic">—</span>
                      )
                    }
                  />
                  {tx.ledgerTransactionData?.statusLastUpdatedAt && (
                    <InfoRow
                      label="Last Updated"
                      value={formatDate(
                        tx.ledgerTransactionData.statusLastUpdatedAt,
                      )}
                    />
                  )}
                </InfoCard>

                {/* Order Reference */}
                {tx.orderReference && (
                  <InfoCard title="Order Reference" icon="🔗">
                    {tx.orderReference.id && (
                      <InfoRow
                        label="Order ID"
                        value={
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs">
                              {tx.orderReference.id}
                            </span>
                            <CopyButton text={tx.orderReference.id} />
                          </div>
                        }
                      />
                    )}
                    {tx.orderReference.requestId && (
                      <InfoRow
                        label="Request ID"
                        value={
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs">
                              {tx.orderReference.requestId}
                            </span>
                            <CopyButton text={tx.orderReference.requestId} />
                          </div>
                        }
                      />
                    )}
                    {tx.orderReference.intentId && (
                      <InfoRow
                        label="Intent ID"
                        value={
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs">
                              {tx.orderReference.intentId}
                            </span>
                            <CopyButton text={tx.orderReference.intentId} />
                          </div>
                        }
                      />
                    )}
                  </InfoCard>
                )}

                {/* Related Accounts */}
                {tx.relatedAccounts?.length > 0 && (
                  <InfoCard title="Related Accounts" icon="👥">
                    {tx.relatedAccounts.map((acc, idx) => (
                      <div
                        key={idx}
                        className="py-3 border-b border-gray-50 last:border-0"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-24 flex-shrink-0">
                            Account ID
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-xs text-gray-700">
                              {acc.id}
                            </span>
                            <CopyButton text={acc.id} />
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-24 flex-shrink-0">
                            Domain
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-xs text-gray-500">
                              {acc.domainId}
                            </span>
                            <CopyButton text={acc.domainId} />
                          </div>
                        </div>
                        {acc.sender !== undefined && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-24 flex-shrink-0">
                              Role
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${acc.sender ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}
                            >
                              {acc.sender ? "Sender" : "Receiver"}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </InfoCard>
                )}

                {/* Ledger Transaction Data */}
                {tx.ledgerTransactionData && (
                  <InfoCard title="Ledger Transaction" icon="🔗">
                    {tx.ledgerTransactionData.ledgerStatus && (
                      <InfoRow
                        label="Status"
                        value={
                          <LedgerStatusBadge
                            status={tx.ledgerTransactionData.ledgerStatus}
                          />
                        }
                      />
                    )}
                    {tx.ledgerTransactionData.ledgerTransactionId && (
                      <InfoRow
                        label="Tx Hash"
                        value={
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs break-all">
                              {tx.ledgerTransactionData.ledgerTransactionId}
                            </span>
                            <CopyButton
                              text={
                                tx.ledgerTransactionData.ledgerTransactionId
                              }
                            />
                          </div>
                        }
                      />
                    )}
                    {tx.ledgerTransactionData.blockTime && (
                      <InfoRow
                        label="Block Time"
                        value={formatDate(tx.ledgerTransactionData.blockTime)}
                      />
                    )}
                    {tx.ledgerTransactionData.failure && (
                      <InfoRow
                        label="Failure"
                        value={
                          <span className="text-red-600 text-xs">
                            {tx.ledgerTransactionData.failure}
                          </span>
                        }
                      />
                    )}
                    {tx.ledgerTransactionData.ledgerData?.tokenData
                      ?.issuanceId && (
                      <InfoRow
                        label="Issuance ID"
                        value={
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs break-all">
                              {
                                tx.ledgerTransactionData.ledgerData.tokenData
                                  .issuanceId
                              }
                            </span>
                            <CopyButton
                              text={
                                tx.ledgerTransactionData.ledgerData.tokenData
                                  .issuanceId
                              }
                            />
                          </div>
                        }
                      />
                    )}
                  </InfoCard>
                )}
              </div>

              {/* Raw */}
              <JsonViewer data={tx} title="Full Transaction (Raw)" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
