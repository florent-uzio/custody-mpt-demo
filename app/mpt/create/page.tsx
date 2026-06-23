"use client";

import { useState } from "react";
import { JsonViewer } from "../../components/JsonViewer";
import { useAccounts } from "../../hooks/useAccounts";
import { useSubmitMPTokenCreate } from "../../hooks/useSubmitMPTokenCreate";
import { useDefaultDomain } from "../../contexts/DomainContext";
import { IssuerAccountSection } from "../../components/mpt-create/IssuerAccountSection";
import { TokenPropertiesSection } from "../../components/mpt-create/TokenPropertiesSection";
import { TokenFlagsSection } from "../../components/mpt-create/TokenFlagsSection";
import { MetadataSection } from "../../components/mpt-create/MetadataSection";
import { ConfigSummary } from "../../components/mpt-create/ConfigSummary";
import type { MPTFlag } from "../../components/MPTCreate.types";
import {
  Page,
  PageHeader,
  PageContainer,
  PageHero,
  SubmitButton,
  ErrorBanner,
  DomainWarning,
} from "../../components/layout";

export default function MptCreatePage() {
  const { defaultDomainId } = useDefaultDomain();
  const { accounts, loading: accountsLoading } = useAccounts();
  const { mutate, isPending, data: response, error } = useSubmitMPTokenCreate();

  const [accountId, setAccountId] = useState("");
  const [assetScale, setAssetScale] = useState(2);
  const [transferFee, setTransferFee] = useState(0);
  const [maximumAmount, setMaximumAmount] = useState("");
  const [selectedFlags, setSelectedFlags] = useState<MPTFlag[]>([
    "tfMPTCanTransfer",
    "tfMPTCanTrade",
  ]);
  const [metadataHex, setMetadataHex] = useState("");

  const handleFlagToggle = (flag: MPTFlag) => {
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
      assetScale,
      transferFee,
      maximumAmount: maximumAmount || undefined,
      flags: selectedFlags,
      metadata: {
        type: "HexEncodedMetadata",
        value: metadataHex,
      },
    });
  };

  return (
    <Page>
      <PageHeader title="MPT Create" subtitle="XRPL · MPTokenIssuanceCreate" />
      <PageContainer width="form">
        <PageHero
          theme="amber"
          icon="🪙"
          title="MPT Create"
          description="Create a new Multi-Purpose Token (MPT) issuance on the XRP Ledger. This defines the properties of your token before minting."
          badge={{
            label: "XLS-89",
            note: "Metadata follows the XRPL Standards specification",
          }}
        />

        {!defaultDomainId && <DomainWarning action="creating an MPT" />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <IssuerAccountSection
            accountId={accountId}
            onChange={setAccountId}
            accounts={accounts}
            loading={accountsLoading}
          />

          <TokenPropertiesSection
            assetScale={assetScale}
            onAssetScaleChange={setAssetScale}
            transferFee={transferFee}
            onTransferFeeChange={setTransferFee}
            maximumAmount={maximumAmount}
            onMaximumAmountChange={setMaximumAmount}
          />

          <TokenFlagsSection
            selectedFlags={selectedFlags}
            onToggle={handleFlagToggle}
          />

          <MetadataSection onMetadataHexChange={setMetadataHex} />

          <ConfigSummary
            domainId={defaultDomainId}
            assetScale={assetScale}
            transferFee={transferFee}
            selectedFlags={selectedFlags}
          />

          <SubmitButton
            theme="amber"
            pending={isPending}
            disabled={isPending || !defaultDomainId || accounts.length === 0}
            pendingLabel="Creating MPT Issuance..."
          >
            Create MPT Issuance
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
