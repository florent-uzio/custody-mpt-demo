"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { CopyButton } from "../../components/CopyButton";
import { JsonViewer } from "../../components/JsonViewer";
import { getTransfer } from "../../_actions/transfers";
import { proposeReleaseTransfers } from "../../_actions/intents";
import {
  Page,
  PageHeader,
  PageContainer,
  PageHero,
  ErrorBanner,
} from "../../components/layout";

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
  {
    headerBg: string;
    badgeBg: string;
    badgeText: string;
    dot: string;
    border: string;
  }
> = {
  Transfer: {
    headerBg: "from-blue-500 to-blue-600",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-800",
    dot: "bg-blue-400",
    border: "border-blue-200",
  },
  Fee: {
    headerBg: "from-yellow-400 to-orange-400",
    badgeBg: "bg-yellow-100",
    badgeText: "text-yellow-800",
    dot: "bg-yellow-400",
    border: "border-yellow-200",
  },
  Recovery: {
    headerBg: "from-purple-500 to-purple-600",
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-800",
    dot: "bg-purple-400",
    border: "border-purple-200",
  },
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

  const releaseMutation = useMutation({
    mutationFn: (accountId: string) =>
      proposeReleaseTransfers({
        accountId,
        transferIds: [transferId],
        domainId,
      }),
  });

  const {
    data: transfer,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["transfer", transferId, domainId],
    queryFn: () => getTransfer(domainId, transferId) as unknown as Promise<TransferDetail>,
    enabled: !!transferId && !!domainId,
    staleTime: 60_000,
  });

  const cfg = transfer
    ? (KIND_CONFIG[transfer.kind] ?? FALLBACK_CONFIG)
    : FALLBACK_CONFIG;

  const shortId = transferId
    ? `${transferId.slice(0, 8)}…${transferId.slice(-4)}`
    : "—";

  const refreshAction = (
    <button
      onClick={() => {}}
      className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
      title="Refresh"
    >
      <svg
        className="w-5 h-5"
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
        title="Transfer"
        breadcrumbs={[
          { label: "Transfers", href: "/transfers" },
          { label: shortId },
        ]}
        actions={refreshAction}
      />
      <PageContainer width="detail">
        <PageHero
          theme="sky"
          icon="💸"
          title={transferId}
          description="Inspect the full details of this transfer, including senders, recipient, value, and raw metadata."
          badge={transfer ? { label: transfer.kind } : undefined}
        />

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
            <p className="text-gray-500 text-sm">Loading transfer…</p>
          </div>
        )}

        {/* Error */}
        {isError && <ErrorBanner error={error} />}

        {/* Content */}
        {transfer && !isLoading && (
          <div className="space-y-5">
              {/* Summary bar */}
              <div
                className={`bg-white rounded-xl border ${cfg.border} shadow-sm p-5`}
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Kind
                    </p>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${cfg.badgeBg} ${cfg.badgeText}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {transfer.kind}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Quarantined
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${transfer.quarantined ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${transfer.quarantined ? "bg-red-400" : "bg-green-400"}`}
                        />
                        {transfer.quarantined ? "Yes" : "No"}
                      </span>
                      {transfer.quarantined &&
                        transfer.recipient?.accountId && (
                          <button
                            onClick={() =>
                              releaseMutation.mutate(
                                transfer.recipient!.accountId,
                              )
                            }
                            disabled={
                              releaseMutation.isPending ||
                              releaseMutation.isSuccess
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {releaseMutation.isPending ? (
                              <>
                                <svg
                                  className="animate-spin w-3 h-3"
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
                                Releasing…
                              </>
                            ) : releaseMutation.isSuccess ? (
                              "Released"
                            ) : (
                              "Release quarantined funds"
                            )}
                          </button>
                        )}
                    </div>
                    {releaseMutation.isSuccess && (
                      <p className="text-xs mt-1.5 text-green-600">
                        Release intent proposed successfully.
                      </p>
                    )}
                    {releaseMutation.isError && (
                      <p className="text-xs mt-1.5 text-red-600">
                        {releaseMutation.error instanceof Error
                          ? releaseMutation.error.message
                          : "An error occurred"}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Value
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      {formatAmount(transfer.value)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Registered At
                    </p>
                    <p className="text-sm text-gray-700">
                      {formatDate(transfer.registeredAt)}
                    </p>
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
                        <span className="font-mono text-xs break-all">
                          {transfer.id}
                        </span>
                        <CopyButton text={transfer.id} />
                      </div>
                    }
                  />
                  <InfoRow
                    label="Ticker ID"
                    value={
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs break-all">
                          {transfer.tickerId}
                        </span>
                        <CopyButton text={transfer.tickerId} />
                      </div>
                    }
                  />
                  <InfoRow label="Value" value={formatAmount(transfer.value)} />
                  <InfoRow
                    label="Registered At"
                    value={formatDate(transfer.registeredAt)}
                  />
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
                              <span className="font-mono text-xs">
                                {transfer.recipient.accountId}
                              </span>
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
                              <span className="font-mono text-xs">
                                {transfer.recipient.domainId}
                              </span>
                              <CopyButton text={transfer.recipient.domainId} />
                            </div>
                          ) : (
                            <span className="text-gray-300 italic">—</span>
                          )
                        }
                      />
                      <InfoRow
                        label="Amount"
                        value={
                          transfer.recipient.amount
                            ? formatAmount(transfer.recipient.amount)
                            : "—"
                        }
                      />
                    </>
                  ) : (
                    <p className="text-sm text-gray-400 italic py-2">
                      No recipient
                    </p>
                  )}
                </InfoCard>

                {/* Senders */}
                <InfoCard title="Senders" icon="📤">
                  {transfer.senders.length === 0 ? (
                    <p className="text-sm text-gray-400 italic py-2">
                      No senders
                    </p>
                  ) : (
                    transfer.senders.map((sender, idx) => (
                      <div
                        key={idx}
                        className="py-3 border-b border-gray-50 last:border-0"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-20 flex-shrink-0">
                            Account
                          </span>
                          {sender.accountId ? (
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-xs text-gray-700">
                                {sender.accountId}
                              </span>
                              <CopyButton text={sender.accountId} />
                            </div>
                          ) : (
                            <span className="text-gray-300 italic text-xs">
                              —
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-20 flex-shrink-0">
                            Domain
                          </span>
                          {sender.domainId ? (
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-xs text-gray-500">
                                {sender.domainId}
                              </span>
                              <CopyButton text={sender.domainId} />
                            </div>
                          ) : (
                            <span className="text-gray-300 italic text-xs">
                              —
                            </span>
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
        </PageContainer>
    </Page>
  );
}
