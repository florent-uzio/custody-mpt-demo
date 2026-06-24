"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useTransaction } from "../../hooks/useTransaction";
import { JsonViewer } from "../../components/JsonViewer";
import { getStatusConfig, ProcessingStatus } from "../../components/transaction/config";
import { SummaryBar } from "../../components/transaction/SummaryBar";
import { ProcessingCard } from "../../components/transaction/ProcessingCard";
import { LedgerDataCard } from "../../components/transaction/LedgerDataCard";
import { OrderReferenceCard } from "../../components/transaction/OrderReferenceCard";
import { RelatedAccountsCard } from "../../components/transaction/RelatedAccountsCard";
import { LedgerTransactionCard } from "../../components/transaction/LedgerTransactionCard";
import {
  Page,
  PageHeader,
  PageContainer,
  PageHero,
  ErrorBanner,
} from "../../components/layout";

export default function TransactionDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const transactionId = params.id as string;
  const domainId = searchParams.get("domainId") ?? "";

  const {
    data: tx,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useTransaction(transactionId, domainId);

  const processingStatus = tx?.processing?.status as ProcessingStatus | undefined;
  const cfg = getStatusConfig(processingStatus);

  const shortId = transactionId
    ? `${transactionId.slice(0, 8)}…${transactionId.slice(-4)}`
    : "…";

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
        title="Transaction"
        breadcrumbs={[
          { label: "Transactions", href: "/transactions" },
          { label: shortId },
        ]}
        actions={refreshAction}
      />
      <PageContainer width="detail">
        <PageHero
          theme="blue"
          icon="📝"
          title={transactionId}
          description="Ledger transaction detail — processing status, ledger data, and related accounts."
          badge={
            processingStatus
              ? { label: processingStatus }
              : undefined
          }
        />

        {isLoading && <LoadingState />}
        {isError && <ErrorBanner error={error} />}

        {tx && !isLoading && (
          <div className="space-y-5">
            <SummaryBar tx={tx} processingStatus={processingStatus} cfg={cfg} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ProcessingCard tx={tx} processingStatus={processingStatus} cfg={cfg} />
              <LedgerDataCard tx={tx} />
              {tx.orderReference && (
                <OrderReferenceCard orderReference={tx.orderReference} />
              )}
              {tx.relatedAccounts.length > 0 && (
                <RelatedAccountsCard accounts={tx.relatedAccounts} />
              )}
              {tx.ledgerTransactionData && (
                <LedgerTransactionCard data={tx.ledgerTransactionData} />
              )}
            </div>

            <JsonViewer data={tx} title="Full Transaction (Raw)" />
          </div>
        )}
      </PageContainer>
    </Page>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <svg
        className="animate-spin w-8 h-8 text-blue-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <p className="text-gray-500 text-sm">Loading transaction…</p>
    </div>
  );
}
