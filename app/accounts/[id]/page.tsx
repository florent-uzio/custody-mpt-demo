"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  getAccount,
  getAccountAddresses,
  getAccountBalances,
} from "../../_actions/accounts";
import { CopyButton } from "../../components/CopyButton";
import { JsonViewer } from "../../components/JsonViewer";
import { useTickers } from "../../hooks/useTickers";
import {
  Page,
  PageHeader,
  PageHero,
  PageContainer,
  ErrorBanner,
} from "../../components/layout";

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

const SUFFIXES = ["", "K", "M", "B", "T"] as const;
const MAX_SUFFIX_DIGITS = SUFFIXES.length * 3; // 15 digits → up to trillions

/** Add thousand separators to a digit string without losing precision. */
function addSeparators(digits: string): string {
  const parts: string[] = [];
  for (let i = digits.length; i > 0; i -= 3) {
    parts.unshift(digits.slice(Math.max(0, i - 3), i));
  }
  return parts.join(",");
}

function formatAmount(raw: string): { short: string; full: string } {
  const negative = raw.startsWith("-");
  const digits = negative ? raw.slice(1) : raw;
  const sign = negative ? "-" : "";
  const full = sign + addSeparators(digits);

  if (digits.length <= 6) return { short: full, full };

  // For very large numbers (beyond trillions), use scientific notation
  if (digits.length > MAX_SUFFIX_DIGITS) {
    const exponent = digits.length - 1;
    const intPart = digits[0];
    const fracPart = digits.slice(1, 3).replace(/0+$/, "");
    const short = `${sign}${intPart}${fracPart ? `.${fracPart}` : ""} × 10^${exponent}`;
    return { short, full };
  }

  const tier = Math.floor((digits.length - 1) / 3);
  const splitIdx = digits.length - tier * 3;
  const whole = digits.slice(0, splitIdx);
  const fracStr = digits.slice(splitIdx, splitIdx + 2);
  const trimmed = fracStr.replace(/0+$/, "");
  const short = `${sign}${addSeparators(whole)}${trimmed ? `.${trimmed}` : ""}${SUFFIXES[tier]}`;

  return { short, full };
}

function AmountDisplay({ raw, className }: { raw: string; className?: string }) {
  const { short, full } = formatAmount(raw);
  const isCompact = short !== full;
  return (
    <span className={className} title={isCompact ? full : undefined}>
      {short}
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

/** Compact label-above-value row, for the narrow identity rail. */
function RailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="py-2.5 border-b border-gray-50 last:border-0 last:pb-0 first:pt-0">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <div className="text-sm text-gray-800 break-all">{value}</div>
    </div>
  );
}

function MonoCopy({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-1.5">
      <span className="font-mono text-xs break-all flex-1">{text}</span>
      <CopyButton text={text} />
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

function PublicKeyValue({
  publicKey,
}: {
  publicKey: { type: string; value: string; chainCode?: string };
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-xs break-all flex-1">{publicKey.value}</span>
        <CopyButton text={publicKey.value} />
      </div>
      <p className="text-xs text-gray-400">
        {publicKey.type}
        {publicKey.chainCode && ` · chain code ${publicKey.chainCode}`}
      </p>
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

  const { data: account, isLoading, isError, error } = useQuery({
    queryKey: ["account", accountId, domainId],
    queryFn: () => getAccount(domainId, accountId),
    enabled: !!accountId && !!domainId,
    staleTime: 60_000,
  });

  const { data: addressesData } = useQuery({
    queryKey: ["account-addresses", accountId, domainId],
    queryFn: () => getAccountAddresses(domainId, accountId),
    enabled: !!accountId && !!domainId,
    staleTime: 60_000,
  });

  const { data: balancesData } = useQuery({
    queryKey: ["account-balances", accountId, domainId],
    queryFn: () => getAccountBalances(domainId, accountId),
    enabled: !!accountId && !!domainId,
    staleTime: 60_000,
  });

  const addresses = addressesData?.items ?? [];
  const balances = balancesData?.items ?? [];

  const tickerIds = balances.map((b) => b.tickerId);
  const { data: tickersMap } = useTickers(tickerIds);

  const lockStatus = account?.data.lock;
  const processingStatus = account?.additionalDetails?.processing?.status;
  const activatedLedgerId = account?.additionalDetails?.ledgers?.find((l) => l.status === "Activated")?.ledgerId;
  const displayLedgerId = account?.data.ledgerId ?? activatedLedgerId;

  const providerDetails = account?.data.providerDetails;
  const purposeKeys =
    providerDetails && "purposeKeys" in providerDetails ? providerDetails.purposeKeys : undefined;

  const heroTitle = account?.data.alias ?? accountId;
  const heroDescription = account?.data.alias ? accountId : undefined;

  /** Few enough addresses to show inline in the hero; more than that stays in the rail only. */
  const heroAddresses = addresses.length <= 2 ? addresses : [];

  return (
    <Page>
      <PageHeader
        title="Account"
        breadcrumbs={[
          { label: "Accounts", href: "/accounts" },
          { label: account?.data.alias ?? accountId },
        ]}
        actions={
          <Link
            href={`/accounts/${accountId}/manifests?domainId=${domainId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Manifests
          </Link>
        }
      />

      <PageContainer width="detail">
        <PageHero
          theme="indigo"
          icon="👤"
          title={heroTitle}
          description={heroDescription ?? "Account detail"}
          badge={lockStatus ? { label: lockStatus } : undefined}
        >
          {/* With only one or two addresses, surface them here for quick copying. */}
          {heroAddresses.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {heroAddresses.map((addr, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 bg-white/15 rounded-lg pl-3 pr-1 py-1.5 min-w-0"
                >
                  <div className="min-w-0">
                    {addr.data.ledgerId && (
                      <p className="text-[10px] uppercase tracking-wider text-white/60 leading-none mb-1">
                        {addr.data.ledgerId}
                      </p>
                    )}
                    <p className="font-mono text-xs text-white break-all leading-none">
                      {addr.data.address}
                    </p>
                  </div>
                  <CopyButton text={addr.data.address} tone="light" />
                </div>
              ))}
            </div>
          )}
        </PageHero>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <svg className="animate-spin w-8 h-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-500 text-sm">Loading account…</p>
          </div>
        )}

        {isError && <ErrorBanner error={error} />}

        {account && !isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-5 items-start">
            {/* Identity rail — short, scalar facts */}
            <div className="space-y-5 lg:sticky lg:top-6">
              <InfoCard title="Identity" icon="🪪">
                <RailRow label="Account ID" value={<MonoCopy text={account.data.id} />} />
                <RailRow label="Domain ID" value={<MonoCopy text={account.data.domainId} />} />
                {displayLedgerId && (
                  <RailRow label="Ledger" value={<span className="font-mono text-xs">{displayLedgerId}</span>} />
                )}
                {lockStatus && (
                  <RailRow label="Lock" value={<StatusBadge value={lockStatus} config={LOCK_CONFIG} />} />
                )}
                {processingStatus && (
                  <RailRow label="Processing" value={<StatusBadge value={processingStatus} config={PROCESSING_CONFIG} />} />
                )}
                {account.data.metadata?.createdAt && (
                  <RailRow label="Created" value={formatDate(account.data.metadata.createdAt as string)} />
                )}
                {account.data.metadata?.lastModifiedAt && (
                  <RailRow label="Modified" value={formatDate(account.data.metadata.lastModifiedAt as string)} />
                )}
                {account.data.metadata?.description && (
                  <RailRow label="Description" value={account.data.metadata.description as string} />
                )}
              </InfoCard>

              <InfoCard title={`Addresses${addresses.length > 0 ? ` (${addresses.length})` : ""}`} icon="📍">
                {addresses.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No addresses found</p>
                ) : (
                  addresses.map((addr, idx) => (
                    <div key={idx} className="py-2.5 border-b border-gray-50 last:border-0 last:pb-0 first:pt-0">
                      <MonoCopy text={addr.data.address} />
                      {addr.data.ledgerId && (
                        <p className="text-xs text-gray-400 mt-1">{addr.data.ledgerId}</p>
                      )}
                    </div>
                  ))
                )}
              </InfoCard>

              {account.additionalDetails?.ledgers && account.additionalDetails.ledgers.length > 0 && (
                <InfoCard title={`Ledgers (${account.additionalDetails.ledgers.length})`} icon="🔗">
                  {account.additionalDetails.ledgers.map((ledger, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 py-2.5 border-b border-gray-50 last:border-0 last:pb-0 first:pt-0"
                    >
                      <span className="font-mono text-xs text-gray-700 truncate">{ledger.ledgerId}</span>
                      {ledger.status && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                          {ledger.status}
                        </span>
                      )}
                    </div>
                  ))}
                </InfoCard>
              )}
            </div>

            {/* Content column — tall, list-shaped data */}
            <div className="space-y-5">
              <InfoCard title={`Balances${balances.length > 0 ? ` (${balances.length})` : ""}`} icon="💰">
                {balances.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No balances found</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {balances.map((b, idx) => {
                      const ticker = tickersMap?.get(b.tickerId);
                      return (
                        <div key={idx} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3 min-w-0">
                            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                              <span className="text-sm font-semibold text-gray-900 truncate" title={ticker?.data.name ?? b.tickerId}>
                                {ticker?.data.name ?? (b.tickerId.length > 16 ? `${b.tickerId.slice(0, 8)}…${b.tickerId.slice(-4)}` : b.tickerId)}
                              </span>
                              <span className="text-xs text-gray-400 font-mono truncate" title={b.tickerId}>
                                {ticker?.data.symbol && `${ticker.data.symbol} · `}{b.tickerId}
                              </span>
                            </div>
                            <CopyButton text={b.tickerId} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Total</p>
                              <AmountDisplay raw={b.totalAmount} className="text-sm font-semibold text-gray-900 tabular-nums" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Available</p>
                              <AmountDisplay raw={b.availableAmount} className="text-sm font-semibold text-gray-900 tabular-nums" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Reserved</p>
                              <AmountDisplay raw={b.reservedAmount} className="text-sm font-semibold text-orange-600 tabular-nums" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Quarantined</p>
                              <AmountDisplay raw={b.quarantinedAmount} className="text-sm font-semibold text-red-600 tabular-nums" />
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
                            Last updated: {formatDate(b.lastUpdatedAt)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </InfoCard>

              {purposeKeys && purposeKeys.length > 0 && (
                <InfoCard title={`Encryption Keys (${purposeKeys.length})`} icon="🔐">
                  {purposeKeys.map((pk, idx) => (
                    <div key={idx} className="py-3 border-b border-gray-50 last:border-0 last:pb-0 first:pt-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-purple-100 text-purple-800">
                          {pk.purpose}
                        </span>
                        <span className="text-xs text-gray-400 font-mono truncate">{pk.ledgerId}</span>
                      </div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        Base64 <span className="normal-case font-normal">— use in MPT Set</span>
                      </p>
                      <MonoCopy text={pk.publicKey} />
                    </div>
                  ))}
                </InfoCard>
              )}

              {providerDetails && (
                <InfoCard title="Provider Details" icon="🔑">
                  <InfoRow label="Type" value={providerDetails.type} />
                  {providerDetails.type === "Vault" ? (
                    <>
                      <InfoRow label="Vault ID" value={<MonoCopy text={providerDetails.vaultId} />} />
                      <InfoRow label="Key Strategy" value={providerDetails.keyStrategy} />
                      <InfoRow label="Key Type" value={providerDetails.keyInformation.type} />
                      {"derivationPath" in providerDetails.keyInformation && (
                        <InfoRow
                          label="Derivation Path"
                          value={<span className="font-mono text-xs">{providerDetails.keyInformation.derivationPath}</span>}
                        />
                      )}
                      {providerDetails.keyInformation.publicKey && (
                        <InfoRow
                          label="Public Key"
                          value={<PublicKeyValue publicKey={providerDetails.keyInformation.publicKey} />}
                        />
                      )}
                      {providerDetails.keys?.map((key) => (
                        <InfoRow
                          key={key.id}
                          label={key.id}
                          value={
                            <div className="space-y-1">
                              {key.publicKey && <PublicKeyValue publicKey={key.publicKey} />}
                              {"derivationPath" in key && (
                                <p className="text-xs text-gray-400 font-mono break-all">{key.derivationPath}</p>
                              )}
                            </div>
                          }
                        />
                      ))}
                    </>
                  ) : (
                    <>
                      <InfoRow
                        label="Provider ID"
                        value={<span className="font-mono text-xs break-all">{providerDetails.providerId}</span>}
                      />
                      <InfoRow
                        label="Location ID"
                        value={<span className="font-mono text-xs break-all">{providerDetails.locationId}</span>}
                      />
                      {providerDetails.providerAccountId && (
                        <InfoRow
                          label="Provider Account ID"
                          value={<span className="font-mono text-xs break-all">{providerDetails.providerAccountId}</span>}
                        />
                      )}
                    </>
                  )}
                </InfoCard>
              )}

              <JsonViewer data={account} title="Full Account (Raw)" />
            </div>
          </div>
        )}
      </PageContainer>
    </Page>
  );
}
