"use client";

import { useParams } from "next/navigation";
import { useDomain } from "../../hooks/useDomain";
import { JsonViewer } from "../../components/JsonViewer";
import { getLockStatusConfig } from "../../components/domain/config";
import { DomainSummaryBar } from "../../components/domain/DomainSummaryBar";
import { DomainDetailsCard } from "../../components/domain/DomainDetailsCard";
import { DomainMetadataCard } from "../../components/domain/DomainMetadataCard";
import { DomainPermissionsCard } from "../../components/domain/DomainPermissionsCard";
import { DomainSignatureCard } from "../../components/domain/DomainSignatureCard";
import {
  Page,
  PageHeader,
  PageContainer,
  PageHero,
  ErrorBanner,
} from "../../components/layout";

export default function DomainDetailPage() {
  const params = useParams();
  const domainId = params.id as string;

  const { data: trustedDomain, isLoading, isError, error, refetch, isFetching } = useDomain(domainId);

  const domain = trustedDomain?.data;
  const lockStatus = domain?.lock;
  const cfg = getLockStatusConfig(lockStatus);

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
        title="Domain"
        breadcrumbs={[
          { label: "Domains", href: "/domains" },
          { label: domain?.alias ?? domainId },
        ]}
        actions={refreshAction}
      />
      <PageContainer width="detail">
        <PageHero
          theme="blue"
          icon="🌐"
          title={domain?.alias ?? domainId}
          description={domain?.alias ? domainId : "Domain detail"}
          badge={lockStatus ? { label: lockStatus } : undefined}
        />

        {isLoading && <LoadingState />}
        {isError && <ErrorBanner error={error} />}

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
      <p className="text-gray-500 text-sm">Loading domain…</p>
    </div>
  );
}
