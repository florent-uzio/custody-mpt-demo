"use client";

import { useState } from "react";
import { JsonViewer } from "../components/JsonViewer";
import { useAccounts } from "../hooks/useAccounts";
import { useSubmitTrustSet } from "../hooks/useSubmitTrustSet";
import { useDefaultDomain } from "../contexts/DomainContext";
import { AccountSection } from "../components/trustset/AccountSection";
import { LimitAmountSection } from "../components/trustset/LimitAmountSection";
import { FlagsSection } from "../components/trustset/FlagsSection";
import { OptionsSection } from "../components/trustset/OptionsSection";
import { CustomPropertiesSection } from "../components/trustset/CustomPropertiesSection";
import { ConfigSummary } from "../components/trustset/ConfigSummary";
import type { TrustSetFlag } from "../components/TrustSet.types";
import {
  CUSTODY_VALUE_SCALE_EXPONENT,
  scaleByPowerOfTen,
} from "../lib/token-amount";
import {
  Page,
  PageHeader,
  PageContainer,
  PageHero,
  SubmitButton,
  ErrorBanner,
  DomainWarning,
} from "../components/layout";

export default function TrustSetPage() {
  const { defaultDomainId } = useDefaultDomain();
  const { accounts, loading: accountsLoading } = useAccounts();
  const { mutate, isPending, data: response, error } = useSubmitTrustSet();

  const [accountId, setAccountId] = useState("");
  const [currency, setCurrency] = useState("");
  const [issuer, setIssuer] = useState("");
  const [value, setValue] = useState("");
  const [scaleValue, setScaleValue] = useState(true);
  const [selectedFlags, setSelectedFlags] = useState<TrustSetFlag[]>([]);
  const [enableRippling, setEnableRippling] = useState(false);
  const [customProperties, setCustomProperties] = useState<
    Record<string, string>
  >({ description: "Create a Trustline" });

  const handleFlagToggle = (flag: TrustSetFlag) => {
    setSelectedFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defaultDomainId) return;

    mutate({
      accountId,
      domainId: defaultDomainId,
      currency,
      issuer,
      value: scaleValue
        ? scaleByPowerOfTen(value, CUSTODY_VALUE_SCALE_EXPONENT)
        : value,
      flags: selectedFlags,
      enableRippling,
      customProperties,
    });
  };

  return (
    <Page>
      <PageHeader title="TrustSet" subtitle="XRPL · TrustSet" />
      <PageContainer width="form">
        <PageHero
          theme="emerald"
          icon="🔗"
          title="Create Trustline"
          description="Create a trustline on the XRP Ledger. A trustline represents the willingness to hold a specific token issued by another account."
          badge={{ label: "TrustSet", note: "XRPL native trustline transaction" }}
        />

        {!defaultDomainId && <DomainWarning action="creating a trustline" />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <AccountSection
            accountId={accountId}
            onChange={setAccountId}
            accounts={accounts}
            loading={accountsLoading}
          />

          <LimitAmountSection
            currency={currency}
            onCurrencyChange={setCurrency}
            issuer={issuer}
            onIssuerChange={setIssuer}
            value={value}
            onValueChange={setValue}
            scaleValue={scaleValue}
            onScaleChange={setScaleValue}
          />

          <FlagsSection
            selectedFlags={selectedFlags}
            onToggle={handleFlagToggle}
          />

          <OptionsSection
            enableRippling={enableRippling}
            onEnableRipplingChange={setEnableRippling}
          />

          <CustomPropertiesSection
            customProperties={customProperties}
            onChange={setCustomProperties}
          />

          <ConfigSummary
            domainId={defaultDomainId}
            selectedFlags={selectedFlags}
            enableRippling={enableRippling}
          />

          <SubmitButton
            theme="emerald"
            pending={isPending}
            disabled={!defaultDomainId || accounts.length === 0}
            pendingLabel="Creating TrustSet..."
          >
            Create TrustSet
          </SubmitButton>
        </form>

        <ErrorBanner error={error} />

        {response && (
          <div className="space-y-4">
            <JsonViewer data={response.request} title="Request Payload" />
            <JsonViewer data={response.response} title="API Response" />
          </div>
        )}
      </PageContainer>
    </Page>
  );
}
