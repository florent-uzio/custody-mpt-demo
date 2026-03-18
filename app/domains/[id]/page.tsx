"use client";

import { useParams } from "next/navigation";
import { useDomain } from "../../hooks/useDomain";
import { JsonViewer } from "../../components/JsonViewer";
import { getLockStatusConfig } from "../../components/domain/config";
import { DomainHeader } from "../../components/domain/DomainHeader";
import { DomainSummaryBar } from "../../components/domain/DomainSummaryBar";
import { DomainDetailsCard } from "../../components/domain/DomainDetailsCard";
import { DomainMetadataCard } from "../../components/domain/DomainMetadataCard";
import { DomainPermissionsCard } from "../../components/domain/DomainPermissionsCard";
import { DomainSignatureCard } from "../../components/domain/DomainSignatureCard";

export default function DomainDetailPage() {
  const params = useParams();
  const domainId = params.id as string;

  const { data: trustedDomain, isLoading, isError, error } = useDomain(domainId);

  const domain = trustedDomain?.data;
  const lockStatus = domain?.lock;
  const cfg = getLockStatusConfig(lockStatus);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <DomainHeader
        domainId={domainId}
        alias={domain?.alias}
        lockStatus={lockStatus}
        cfg={cfg}
      />

      <div className="flex-1 overflow-y-auto">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading && <LoadingState />}
          {isError && <ErrorState error={error} />}

          {domain && trustedDomain && !isLoading && (
            <div className="space-y-5">
              <DomainSummaryBar domain={domain} cfg={cfg} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <DomainDetailsCard domain={domain} cfg={cfg} />
                <DomainMetadataCard metadata={domain.metadata} />
                <DomainPermissionsCard permissions={domain.permissions} />
                <DomainSignatureCard
                  signature={trustedDomain.signature}
                  signingKey={trustedDomain.signingKey}
                />
              </div>

              <JsonViewer data={trustedDomain} title="Full Domain (Raw)" />
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
      <p className="text-gray-500 text-sm">Loading domain…</p>
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
        <p className="text-sm font-semibold text-red-700">Error loading domain</p>
        <p className="text-sm text-red-600 mt-0.5">
          {error instanceof Error ? error.message : "An error occurred"}
        </p>
      </div>
    </div>
  );
}
