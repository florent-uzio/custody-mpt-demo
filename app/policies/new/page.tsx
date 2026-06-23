"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useDefaultDomain } from "../../contexts/DomainContext";
import {
  proposeCreatePolicy,
  type ProposeCreatePolicyInput,
} from "../../_actions/policies";
import { PolicyForm, type PolicyFormResult } from "../components/PolicyForm";
import {
  Page,
  PageHeader,
  PageContainer,
  PageHero,
  DomainWarning,
} from "../../components/layout";

export default function NewPolicyPage() {
  const router = useRouter();
  const { defaultDomainId } = useDefaultDomain();

  const mutation = useMutation({
    mutationFn: (input: ProposeCreatePolicyInput) => proposeCreatePolicy(input),
    onSuccess: ({ requestId }) => {
      router.push(`/intents/${requestId}`);
    },
  });

  const handleSubmit = (result: PolicyFormResult) => {
    if (!defaultDomainId) return;
    mutation.mutate({ domainId: defaultDomainId, ...result });
  };

  return (
    <Page>
      <PageHeader
        title="Create Policy"
        subtitle="Policies · Create"
        breadcrumbs={[
          { label: "Policies", href: "/policies" },
          { label: "Create" },
        ]}
      />
      <PageContainer width="form">
        <PageHero
          theme="violet"
          icon="🛡️"
          title="Create Policy"
          description="Propose a new policy intent on the custody platform."
          badge={{ label: "Create Policy", note: "Propose create policy intent" }}
        />

        {!defaultDomainId && <DomainWarning action="creating a policy" />}

        <PolicyForm
          mode="create"
          submitting={mutation.isPending}
          disabled={!defaultDomainId}
          submitError={
            mutation.isError
              ? mutation.error instanceof Error
                ? mutation.error.message
                : "Failed to propose create policy intent"
              : null
          }
          cancelHref="/policies"
          onSubmit={handleSubmit}
        />
      </PageContainer>
    </Page>
  );
}
