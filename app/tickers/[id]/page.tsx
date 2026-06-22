"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Core_ApiTicker } from "@florent-uzio/custody";
import { useTicker } from "../../hooks/useTickers";
import { useDefaultDomain } from "../../contexts/DomainContext";
import { useSidebarContext } from "../../contexts/SidebarContext";
import {
  proposeLockTicker,
  proposeUnlockTicker,
  type ProposeLockTickerInput,
  type ProposeUnlockTickerInput,
} from "../../_actions/tickers";
import { JsonViewer } from "../../components/JsonViewer";
import { CopyButton } from "../../components/CopyButton";

type Ticker = Core_ApiTicker;

function getXrplProperties(ticker: Ticker) {
  const details = ticker.data.ledgerDetails;
  return details.type === "XRPL" ? details.properties : null;
}

function xrplExplorerBase(ledgerId: string) {
  if (ledgerId === "xrpl") return "https://livenet.xrpl.org";
  if (ledgerId === "xrpl-devnet") return "https://devnet.xrpl.org";
  return "https://testnet.xrpl.org";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TickerDetailPage() {
  const params = useParams();
  const tickerId = params.id as string;
  const { defaultDomainId } = useDefaultDomain();
  const { sidebarOpen, setSidebarOpen } = useSidebarContext();

  const { data: ticker, isLoading, isError, error } = useTicker(tickerId);
  const data = ticker?.data;
  const properties = ticker ? getXrplProperties(ticker) : null;
  const revision = data?.metadata?.revision;

  const lockMutation = useMutation({
    mutationFn: (input: ProposeLockTickerInput) => proposeLockTicker(input),
  });

  const handleLock = () => {
    if (revision === undefined) return;
    lockMutation.mutate({
      domainId: defaultDomainId!,
      reference: { id: tickerId, revision },
    });
  };

  const unlockMutation = useMutation({
    mutationFn: (input: ProposeUnlockTickerInput) => proposeUnlockTicker(input),
  });

  const handleUnlock = () => {
    if (revision === undefined) return;
    unlockMutation.mutate({
      domainId: defaultDomainId!,
      reference: { id: tickerId, revision },
    });
  };

  // Explains why the Lock/Unlock action is disabled (null when it's available).
  const lockAction =
    data?.lock === "Unlocked"
      ? "lock"
      : data?.lock === "Locked"
        ? "unlock"
        : null;
  let lockActionNote: string | null = null;
  if (lockAction) {
    if (revision === undefined) {
      lockActionNote = `This ticker has no revision, so it can't be ${lockAction}ed.`;
    } else if (!defaultDomainId) {
      lockActionNote = `Set a Default Domain ID in the sidebar to ${lockAction} this ticker.`;
    }
  }

  // Proposed lock/unlock intent result (shown inline after a successful submit).
  const lockResult = lockMutation.data ?? unlockMutation.data;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md flex-shrink-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-start justify-between gap-3">
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
                    href="/tickers"
                    className="text-white/60 hover:text-white text-xs font-medium transition-colors"
                  >
                    Tickers
                  </Link>
                  <span className="text-white/40 text-xs">/</span>
                  <span className="text-white/80 text-xs font-medium">
                    Detail
                  </span>
                </div>
                <h1 className="text-white text-lg font-semibold">
                  {data?.name ?? "Ticker"}
                </h1>
              </div>
            </div>
            <div className="mt-0.5 flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-2">
              {data?.lock === "Unlocked" && (
                <button
                  onClick={handleLock}
                  disabled={
                    lockMutation.isPending ||
                    !defaultDomainId ||
                    revision === undefined
                  }
                  title={
                    !defaultDomainId
                      ? "Set a Default Domain ID in the sidebar to lock"
                      : revision === undefined
                        ? "Ticker revision unavailable"
                        : undefined
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white text-sm font-medium"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  {lockMutation.isPending ? "Locking…" : "Lock"}
                </button>
              )}
              {data?.lock === "Locked" && (
                <button
                  onClick={handleUnlock}
                  disabled={
                    unlockMutation.isPending ||
                    !defaultDomainId ||
                    revision === undefined
                  }
                  title={
                    !defaultDomainId
                      ? "Set a Default Domain ID in the sidebar to unlock"
                      : revision === undefined
                        ? "Ticker revision unavailable"
                        : undefined
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white text-sm font-medium"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 11V7a4 4 0 018 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                  </svg>
                  {unlockMutation.isPending ? "Unlocking…" : "Unlock"}
                </button>
              )}
              <Link
                href={`/tickers/${tickerId}/edit`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white text-sm font-medium"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </Link>
              </div>
              {lockActionNote && (
                <p className="text-white/80 text-xs max-w-xs text-right leading-snug">
                  {lockActionNote}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {lockMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 text-sm text-red-700 font-medium">
              {lockMutation.error instanceof Error
                ? lockMutation.error.message
                : "Failed to propose lock ticker intent"}
            </div>
          )}

          {unlockMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 text-sm text-red-700 font-medium">
              {unlockMutation.error instanceof Error
                ? unlockMutation.error.message
                : "Failed to propose unlock ticker intent"}
            </div>
          )}

          {lockResult && (
            <div className="mb-5 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
                {lockMutation.data ? "Lock" : "Unlock"} ticker intent proposed.
                Intent ID:{" "}
                <span className="font-mono">
                  {lockResult.request.request.id}
                </span>
              </div>
              <JsonViewer
                data={lockResult.request}
                title="Proposed intent (request)"
              />
              <JsonViewer data={lockResult.response} title="Response" />
            </div>
          )}

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
              <p className="text-gray-500 text-sm">Loading ticker…</p>
            </div>
          )}

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
                  Error loading ticker
                </p>
                <p className="text-sm text-red-600 mt-0.5">
                  {error instanceof Error ? error.message : "An error occurred"}
                </p>
              </div>
            </div>
          )}

          {ticker && data && !isLoading && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Details */}
                <Card title="Details">
                  <Row label="Name" value={data.name} />
                  <Row label="Symbol" value={data.symbol ?? "—"} mono />
                  <Row label="Kind" value={data.kind} />
                  <Row
                    label="Decimals"
                    value={data.decimals === undefined ? "—" : String(data.decimals)}
                  />
                  <Row label="Lock" value={data.lock} />
                  <Row label="Ledger" value={data.ledgerId} mono />
                  <div className="flex items-start justify-between gap-3 py-1.5">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-0.5">
                      Ticker ID
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-gray-700 break-all text-right">
                        {data.id}
                      </span>
                      <CopyButton text={data.id} />
                    </div>
                  </div>
                </Card>

                {/* Ledger details */}
                <Card title="Ledger details">
                  <Row label="Type" value={data.ledgerDetails.type} />
                  {properties && (
                    <Row label="Property type" value={properties.type} />
                  )}
                  {properties?.type === "FungibleToken" && (
                    <>
                      <Row
                        label="Currency code"
                        value={properties.currencyCode}
                        mono
                      />
                      <div className="flex items-start justify-between gap-3 py-1.5">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-0.5">
                          Issuer
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-gray-700 break-all text-right">
                            {properties.issuer}
                          </span>
                          <CopyButton text={properties.issuer} />
                        </div>
                      </div>
                    </>
                  )}
                  {properties?.type === "MultiPurposeToken" && (
                    <div className="flex items-start justify-between gap-3 py-1.5">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-0.5">
                        Issuance ID
                      </span>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`${xrplExplorerBase(data.ledgerId)}/mpt/${properties.issuanceId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-blue-600 hover:text-blue-800 underline break-all text-right"
                        >
                          {properties.issuanceId}
                        </a>
                        <CopyButton text={properties.issuanceId} />
                      </div>
                    </div>
                  )}
                </Card>

                {/* Metadata */}
                {data.metadata && (
                  <Card title="Metadata">
                    <Row
                      label="Revision"
                      value={String(data.metadata.revision)}
                    />
                    <Row
                      label="Created"
                      value={formatDate(data.metadata.createdAt)}
                    />
                    <Row
                      label="Last modified"
                      value={formatDate(data.metadata.lastModifiedAt)}
                    />
                    {data.metadata.description && (
                      <Row
                        label="Description"
                        value={data.metadata.description}
                      />
                    )}
                  </Card>
                )}

                {/* Signature */}
                {ticker.signature && (
                  <Card title="Signature">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-gray-600 break-all">
                        {ticker.signature}
                      </span>
                      <CopyButton text={ticker.signature} />
                    </div>
                  </Card>
                )}
              </div>

              <JsonViewer data={ticker} title="Full Ticker (Raw)" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">{title}</h2>
      <div className="divide-y divide-gray-50">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {label}
      </span>
      <span
        className={`text-sm text-gray-800 text-right ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
