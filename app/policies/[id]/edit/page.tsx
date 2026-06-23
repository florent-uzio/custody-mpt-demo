"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getPolicy,
  proposeUpdatePolicy,
  type ProposeUpdatePolicyInput,
} from "../../../_actions/policies";
import {
  PolicyForm,
  type PolicyFormInitial,
  type PolicyFormResult,
} from "../../components/PolicyForm";
import type { Core_TrustedPolicy } from "@florent-uzio/custody";
import {
  Page,
  PageHeader,
  PageContainer,
  PageHero,
  ErrorBanner,
  DomainWarning,
} from "../../../components/layout";

export default function EditPolicyPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const policyId = params.id as string;
  const domainId = searchParams.get("domainId") ?? "";

  const detailHref = `/policies/${policyId}${domainId ? `?domainId=${domainId}` : ""}`;

  const {
    data: policy,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["policy", policyId, domainId],
    queryFn: () => getPolicy(domainId, policyId) as Promise<Core_TrustedPolicy>,
    enabled: !!policyId && !!domainId,
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: (input: ProposeUpdatePolicyInput) => proposeUpdatePolicy(input),
    onSuccess: ({ requestId }) => {
      router.push(`/intents/${requestId}`);
    },
  });

  const handleSubmit = (result: PolicyFormResult) => {
    if (!policy) return;
    mutation.mutate({
      domainId,
      policyId,
      revision: policy.data.metadata.revision,
      ...result,
    });
  };

  const initial: PolicyFormInitial | undefined = policy
    ? {
        alias: policy.data.alias,
        rank: policy.data.rank,
        scope: policy.data.scope,
        intentTypes: policy.data.intentTypes ?? [],
        condition: policy.data.condition ?? null,
        workflow: policy.data.workflow ?? null,
        description: policy.data.metadata?.description,
        customProperties: policy.data.metadata?.customProperties,
      }
    : undefined;

  return (
    <Page>
      <PageHeader
        title="Edit Policy"
        subtitle="Policies · Edit"
        breadcrumbs={[
          { label: "Policies", href: "/policies" },
          { label: "Edit" },
        ]}
      />
      <PageContainer width="form">
        <PageHero
          theme="violet"
          icon="🛡️"
          title="Propose Update Policy"
          description="Propose a change to an existing policy. The update will be submitted as an intent and routed through the configured approval workflow."
          badge={{
            label: policy ? `${policy.data.alias} · revision ${policy.data.metadata.revision}` : "Edit Policy",
            note: "Propose update intent",
          }}
        />

        {!domainId && <DomainWarning action="editing a policy" />}

        {domainId && isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <svg
              className="animate-spin w-8 h-8 text-violet-500"
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
            <p className="text-gray-500 text-sm">Loading policy…</p>
          </div>
        )}

        {isError && <ErrorBanner error={error} />}

        {policy && initial && !isLoading && (
          <PolicyForm
            mode="update"
            initial={initial}
            submitting={mutation.isPending}
            submitError={
              mutation.isError
                ? mutation.error instanceof Error
                  ? mutation.error.message
                  : "Failed to propose update policy intent"
                : null
            }
            cancelHref={detailHref}
            onSubmit={handleSubmit}
          />
        )}
      </PageContainer>
    </Page>
  );
}
