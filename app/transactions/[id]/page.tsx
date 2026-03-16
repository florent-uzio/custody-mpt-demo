"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useTransaction } from "../../hooks/useTransaction";
import { JsonViewer } from "../../components/JsonViewer";
import { getStatusConfig, ProcessingStatus } from "../../components/transaction/config";
import { TransactionHeader } from "../../components/transaction/TransactionHeader";
import { SummaryBar } from "../../components/transaction/SummaryBar";
import { ProcessingCard } from "../../components/transaction/ProcessingCard";
import { LedgerDataCard } from "../../components/transaction/LedgerDataCard";
import { OrderReferenceCard } from "../../components/transaction/OrderReferenceCard";
import { RelatedAccountsCard } from "../../components/transaction/RelatedAccountsCard";
import { LedgerTransactionCard } from "../../components/transaction/LedgerTransactionCard";

export default function TransactionDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const transactionId = params.id as string;
  const domainId = searchParams.get("domainId") ?? "";

  const { data: tx, isLoading, isError, error } = useTransaction(transactionId, domainId);

  const processingStatus = tx?.processing?.status as ProcessingStatus | undefined;
  const cfg = getStatusConfig(processingStatus);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TransactionHeader
        transactionId={transactionId}
        processingStatus={processingStatus}
        cfg={cfg}
      />

      <div className="flex-1 overflow-y-auto">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading && <LoadingState />}
          {isError && <ErrorState error={error} />}

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
        </main>
      </div>
    </div>
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

function ErrorState({ error }: { error: Error | null }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
      <div>
        <p className="text-sm font-semibold text-red-700">Error loading transaction</p>
        <p className="text-sm text-red-600 mt-0.5">
          {error instanceof Error ? error.message : "An error occurred"}
        </p>
      </div>
    </div>
  );
}
