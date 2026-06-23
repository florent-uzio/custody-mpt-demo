"use client";

import { useState } from "react";
import { JsonViewer } from "../components/JsonViewer";
import { useSubmitAccountSet } from "../hooks/useSubmitAccountSet";
import { useDefaultDomain } from "../contexts/DomainContext";
import { AccountSection } from "../components/accountset/AccountSection";
import { FlagsSection } from "../components/accountset/FlagsSection";
import { TransferRateSection } from "../components/accountset/TransferRateSection";
import { ConfigSummary } from "../components/accountset/ConfigSummary";
import type { AccountSetFlag } from "../components/AccountSet.types";
import {
  Page,
  PageHeader,
  PageContainer,
  PageHero,
  SubmitButton,
  ErrorBanner,
  DomainWarning,
} from "../components/layout";

export default function AccountSetPage() {
  const { defaultDomainId } = useDefaultDomain();
  const { mutate, isPending, data: response, error } = useSubmitAccountSet();

  const [account, setAccount] = useState("");
  const [setFlag, setSetFlag] = useState<AccountSetFlag | "">("");
  const [clearFlag, setClearFlag] = useState<AccountSetFlag | "">("");
  const [transferRate, setTransferRate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defaultDomainId || !account) return;

    mutate({
      account,
      domainId: defaultDomainId,
      setFlag: setFlag || undefined,
      clearFlag: clearFlag || undefined,
      transferRate: transferRate.trim() === "" ? undefined : Number(transferRate),
    });
  };

  return (
    <Page>
      <PageHeader title="AccountSet" subtitle="XRPL · AccountSet" />
      <PageContainer width="form">
        <PageHero
          theme="teal"
          icon="🔧"
          title="Configure Account"
          description="Modify XRPL account settings. Enable or disable an account flag and optionally set a transfer rate for tokens this account issues."
          badge={{ label: "AccountSet", note: "XRPL native account-settings transaction" }}
        />

        {!defaultDomainId && <DomainWarning action="submitting an AccountSet" />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <AccountSection onChange={setAccount} />

          <FlagsSection
            setFlag={setFlag}
            clearFlag={clearFlag}
            onSetFlagChange={setSetFlag}
            onClearFlagChange={setClearFlag}
          />

          <TransferRateSection
            transferRate={transferRate}
            onChange={setTransferRate}
          />

          <ConfigSummary
            domainId={defaultDomainId}
            setFlag={setFlag}
            clearFlag={clearFlag}
            transferRate={transferRate}
          />

          <SubmitButton
            theme="teal"
            pending={isPending}
            disabled={!defaultDomainId || !account}
            pendingLabel="Submitting AccountSet..."
          >
            Submit AccountSet
          </SubmitButton>
        </form>

        <ErrorBanner error={error} />

        {response && (
          <div className="space-y-4">
            <JsonViewer data={response.submitted} title="Submitted Parameters" />
            <JsonViewer data={response.response} title="API Response" />
          </div>
        )}
      </PageContainer>
    </Page>
  );
}
