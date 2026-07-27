"use client";

import { useState } from "react";
import { JsonViewer } from "../../../components/JsonViewer";
import { useDefaultDomain } from "../../../contexts/DomainContext";
import { useSubmitConfidentialMPTMergeInbox } from "../../../hooks/useSubmitConfidentialMPT";
import type { CmptTokenIdentifier } from "../../../_actions/confidential-mpt";
import {
  Page,
  PageHeader,
  PageContainer,
  PageHero,
  SectionCard,
  SubmitButton,
  ErrorBanner,
  DomainWarning,
} from "../../../components/layout";
import {
  AccountField,
  TokenIdentifierField,
} from "../../../components/confidential-mpt/Fields";

export default function ConfidentialMptMergeInboxPage() {
  const { defaultDomainId } = useDefaultDomain();
  const { mutate, isPending, data: response, error } =
    useSubmitConfidentialMPTMergeInbox();

  const [accountId, setAccountId] = useState("");
  const [tokenIdentifier, setTokenIdentifier] = useState<CmptTokenIdentifier>({
    type: "MPTokenIssuanceId",
    issuanceId: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defaultDomainId) return;
    mutate({ domainId: defaultDomainId, accountId, tokenIdentifier });
  };

  return (
    <Page>
      <PageHeader
        title="cMPT Merge Inbox"
        subtitle="XRPL · ConfidentialMPTMergeInbox"
      />
      <PageContainer width="form">
        <PageHero
          theme="teal"
          icon="📥"
          title="cMPT Merge Inbox"
          description="Fold incoming confidential transfers from the account's inbox into its spendable confidential balance. Received amounts are not spendable until merged."
          badge={{
            label: "ConfidentialMPTMergeInbox",
            note: "No amount — merges everything pending",
          }}
        />

        {!defaultDomainId && (
          <DomainWarning action="submitting a ConfidentialMPTMergeInbox" />
        )}

        <SectionCard step={1} theme="teal" title="Merge inbox details">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AccountField
              value={accountId}
              onChange={setAccountId}
              help="The account whose confidential inbox is merged."
            />

            <TokenIdentifierField
              value={tokenIdentifier}
              onChange={setTokenIdentifier}
            />

            <SubmitButton
              theme="teal"
              pending={isPending}
              disabled={!defaultDomainId || isPending}
              pendingLabel="Proposing intent…"
            >
              Propose ConfidentialMPTMergeInbox intent
            </SubmitButton>
          </form>
        </SectionCard>

        <ErrorBanner error={error} />

        {response && (
          <JsonViewer data={response} title="ConfidentialMPTMergeInbox response" />
        )}
      </PageContainer>
    </Page>
  );
}
