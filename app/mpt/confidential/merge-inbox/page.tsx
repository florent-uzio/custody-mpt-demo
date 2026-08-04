"use client";

import { useState } from "react";
import {
  DEFAULT_MAXIMUM_FEE,
  type MaximumFee,
} from "../../../lib/maximum-fee";
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
  MaximumFeeSection,
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
  const [maximumFee, setMaximumFee] = useState<MaximumFee>(DEFAULT_MAXIMUM_FEE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defaultDomainId) return;
    mutate({ domainId: defaultDomainId, accountId, tokenIdentifier, maximumFee });
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <SectionCard step={1} theme="teal" title="Merge inbox details">
            <div className="space-y-4">
              <AccountField
                value={accountId}
                onChange={setAccountId}
                help="The account whose confidential inbox is merged."
              />

              <TokenIdentifierField
                value={tokenIdentifier}
                onChange={setTokenIdentifier}
              />
            </div>
          </SectionCard>

          <MaximumFeeSection
            step={2}
            theme="teal"
            value={maximumFee}
            onChange={setMaximumFee}
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

        <ErrorBanner error={error} />

        {response && (
          <JsonViewer data={response} title="ConfidentialMPTMergeInbox response" />
        )}
      </PageContainer>
    </Page>
  );
}
