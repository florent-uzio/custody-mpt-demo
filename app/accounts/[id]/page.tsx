"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Core_ApiAccount, Core_AddressesCollection, Core_BalancesCollection } from "custody";
import { CopyButton } from "../../components/CopyButton";
import { JsonViewer } from "../../components/JsonViewer";
import { useSidebarContext } from "../../contexts/SidebarContext";

const LOCK_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  Unlocked: { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-400" },
  Locked: { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-400" },
};

const PROCESSING_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  Ready: { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-400" },
  Processing: { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-400" },
  Pending: { bg: "bg-yellow-100", text: "text-yellow-800", dot: "bg-yellow-400" },
  Failed: { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-400" },
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

function StatusBadge({
  value,
  config,
}: {
  value: string;
  config: Record<string, { bg: string; text: string; dot: string }>;
}) {
  const s = config[value] ?? { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {value}
    </span>
  );
}

export default function AccountDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const accountId = params.id as string;
  const domainId = searchParams.get("domainId") ?? "";
  const { sidebarOpen, setSidebarOpen } = useSidebarContext();

  const { data: account, isLoading, isError, error } = useQuery<Core_ApiAccount>({
    queryKey: ["account", accountId, domainId],
    queryFn: async () => {
      const res = await fetch("/api/accounts/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, domainId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch account");
      }
      return res.json();
    },
    enabled: !!accountId && !!domainId,
    staleTime: 60_000,
  });

  const { data: addressesData } = useQuery<Core_AddressesCollection>({
    queryKey: ["account-addresses", accountId, domainId],
    queryFn: async () => {
      const res = await fetch("/api/accounts/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, domainId }),
      });
      if (!res.ok) throw new Error("Failed to fetch addresses");
      return res.json();
    },
    enabled: !!accountId && !!domainId,
    staleTime: 60_000,
  });

  const { data: balancesData } = useQuery<Core_BalancesCollection>({
    queryKey: ["account-balances", accountId, domainId],
    queryFn: async () => {
      const res = await fetch("/api/accounts/balances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, domainId }),
      });
      if (!res.ok) throw new Error("Failed to fetch balances");
      return res.json();
    },
    enabled: !!accountId && !!domainId,
    staleTime: 60_000,
  });

  const addresses = addressesData?.items ?? [];
  const balances = balancesData?.items ?? [];

  const lockStatus = account?.data.lock;
  const processingStatus = account?.additionalDetails?.processing?.status;
  const activatedLedgerId = account?.additionalDetails?.ledgers?.find((l) => l.status === "Activated")?.ledgerId;
  const displayLedgerId = account?.data.ledgerId ?? activatedLedgerId;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-md flex-shrink-0">
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
                    href="/?tab=accounts"
                    className="text-white/60 hover:text-white text-xs font-medium transition-colors"
                  >
                    Accounts
                  </Link>
                  <span className="text-white/40 text-xs">/</span>
                  <span className="text-white/80 text-xs font-medium">Detail</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {account?.data.alias && (
                    <span className="text-white font-semibold text-base">
                      {account.data.alias}
                    </span>
                  )}
                  <span className="text-white/70 font-mono text-xs break-all">
                    {accountId}
                  </span>
                  <div className="bg-white/20 rounded p-0.5">
                    <CopyButton text={accountId} className="text-white hover:bg-white/20" />
                  </div>
                </div>
              </div>
            </div>

            {lockStatus && (
              <StatusBadge value={lockStatus} config={LOCK_CONFIG} />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <svg className="animate-spin w-8 h-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-500 text-sm">Loading account…</p>
            </div>
          )}

          {isError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-red-700">Error loading account</p>
                <p className="text-sm text-red-600 mt-0.5">
                  {error instanceof Error ? error.message : "An error occurred"}
                </p>
              </div>
            </div>
          )}

          {account && !isLoading && (
            <div className="space-y-5">
              {/* Summary bar */}
              <div className="bg-white rounded-xl border border-indigo-100 shadow-sm p-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Alias</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {account.data.alias || <span className="text-gray-400 italic font-normal">No alias</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Ledger</p>
                    <p className="text-sm font-mono text-gray-700 truncate">
                      {displayLedgerId || <span className="text-gray-400 italic font-sans font-normal">—</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Lock</p>
                    {lockStatus ? (
                      <StatusBadge value={lockStatus} config={LOCK_CONFIG} />
                    ) : (
                      <span className="text-gray-400 text-sm italic">—</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Processing</p>
                    {processingStatus ? (
                      <StatusBadge value={processingStatus} config={PROCESSING_CONFIG} />
                    ) : (
                      <span className="text-gray-400 text-sm italic">—</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Account Details */}
                <InfoCard title="Account Details" icon="🏦">
                  <InfoRow
                    label="Account ID"
                    value={
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs break-all">{account.data.id}</span>
                        <CopyButton text={account.data.id} />
                      </div>
                    }
                  />
                  <InfoRow
                    label="Domain ID"
                    value={
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs break-all">{account.data.domainId}</span>
                        <CopyButton text={account.data.domainId} />
                      </div>
                    }
                  />
                  {displayLedgerId && (
                    <InfoRow label="Ledger ID" value={<span className="font-mono text-xs">{displayLedgerId}</span>} />
                  )}
                  {lockStatus && (
                    <InfoRow label="Lock Status" value={<StatusBadge value={lockStatus} config={LOCK_CONFIG} />} />
                  )}
                  {processingStatus && (
                    <InfoRow label="Processing" value={<StatusBadge value={processingStatus} config={PROCESSING_CONFIG} />} />
                  )}
                  {account.data.metadata?.createdAt && (
                    <InfoRow label="Created At" value={formatDate(account.data.metadata.createdAt as string)} />
                  )}
                  {account.data.metadata?.lastModifiedAt && (
                    <InfoRow label="Modified At" value={formatDate(account.data.metadata.lastModifiedAt as string)} />
                  )}
                  {account.data.metadata?.description && (
                    <InfoRow label="Description" value={account.data.metadata.description as string} />
                  )}
                </InfoCard>

                {/* Balances */}
                <InfoCard title="Balances" icon="💰">
                  {balances.length === 0 ? (
                    <p className="text-sm text-gray-400 italic py-2">No balances found</p>
                  ) : (
                    balances.map((b, idx) => (
                      <div key={idx} className="py-3 border-b border-gray-50 last:border-0 flex items-center justify-between">
                        <span className="text-xs font-mono text-gray-500">{b.tickerId}</span>
                        <span className="text-sm font-semibold text-gray-800">
                          {parseInt(b.totalAmount).toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </InfoCard>

                {/* Addresses */}
                <InfoCard title="Addresses" icon="📍">
                  {addresses.length === 0 ? (
                    <p className="text-sm text-gray-400 italic py-2">No addresses found</p>
                  ) : (
                    addresses.map((addr, idx) => (
                      <div key={idx} className="py-3 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-gray-700 break-all flex-1">{addr.data.address}</span>
                          <CopyButton text={addr.data.address} />
                        </div>
                        {addr.data.ledgerId && (
                          <p className="text-xs text-gray-400 mt-1">Ledger: {addr.data.ledgerId}</p>
                        )}
                      </div>
                    ))
                  )}
                </InfoCard>

                {/* Provider Details */}
                {account.data.providerDetails && Object.keys(account.data.providerDetails).length > 0 && (
                  <InfoCard title="Provider Details" icon="🔑">
                    {Object.entries(account.data.providerDetails).map(([key, val]) => (
                      <InfoRow key={key} label={key} value={<span className="font-mono text-xs">{String(val)}</span>} />
                    ))}
                  </InfoCard>
                )}

                {/* Additional Ledgers */}
                {account.additionalDetails?.ledgers && account.additionalDetails.ledgers.length > 0 && (
                  <InfoCard title="Ledgers" icon="🔗">
                    {account.additionalDetails.ledgers.map((ledger, idx) => (
                      <div key={idx} className="py-3 border-b border-gray-50 last:border-0">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-gray-700">{ledger.ledgerId}</span>
                          {ledger.status && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{ledger.status}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </InfoCard>
                )}
              </div>

              <JsonViewer data={account} title="Full Account (Raw)" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
