"use client";

import { useState } from "react";
import { JsonViewer } from "../../components/JsonViewer";
import { useDefaultDomain } from "../../contexts/DomainContext";
import { useAccountsWithAddresses } from "../../hooks/useAccountsWithAddresses";
import { useLedgerConfig } from "../../hooks/useLedgerConfig";
import { useProvisionElGamalKeyPair } from "../../hooks/useProvisionElGamalKeyPair";
import {
  Page,
  PageHeader,
  PageContainer,
  PageHero,
  SectionCard,
  SubmitButton,
  ErrorBanner,
  DomainWarning,
} from "../../components/layout";
import { CMPT_INPUT, Field } from "../../components/confidential-mpt/Fields";

export default function ProvisionElGamalKeyPairPage() {
  const { defaultDomainId } = useDefaultDomain();
  const { ledgerIds } = useLedgerConfig();
  const { accounts, loading: accountsLoading } = useAccountsWithAddresses();
  const { mutate, isPending, data: response, error } =
    useProvisionElGamalKeyPair();

  const [accountId, setAccountId] = useState("");
  const [ledgerId, setLedgerId] = useState("");

  // Offer the selected account's own ledgers first — the key pair is provisioned
  // per (account, ledger) — falling back to the configured list before selection.
  const selectedAccount = accounts.find((a) => a.id === accountId);
  const accountLedgerIds = selectedAccount?.addresses.map((a) => a.ledgerId) ?? [];
  const ledgerOptions = accountLedgerIds.length > 0 ? accountLedgerIds : ledgerIds;
  const effectiveLedgerId = ledgerOptions.includes(ledgerId)
    ? ledgerId
    : (ledgerOptions[0] ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defaultDomainId) return;
    mutate({ domainId: defaultDomainId, accountId, ledgerId: effectiveLedgerId });
  };

  return (
    <Page>
      <PageHeader
        title="Provision ElGamal Key Pair"
        subtitle="Intent · v0_ProvisionElGamalKeyPair"
        breadcrumbs={[
          { label: "Intents", href: "/intents" },
          { label: "Provision ElGamal" },
        ]}
      />
      <PageContainer width="form">
        <PageHero
          theme="violet"
          icon="🔑"
          title="Provision ElGamal Key Pair"
          description="Provision the ElGamal key pair an account needs before it can hold or move a confidential MPT balance. Run this once per account and ledger."
          badge={{
            label: "v0_ProvisionElGamalKeyPair",
            note: "Prerequisite for every ConfidentialMPT operation",
          }}
        />

        {!defaultDomainId && (
          <DomainWarning action="provisioning an ElGamal key pair" />
        )}

        <SectionCard step={1} theme="violet" title="Key pair details">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="Account"
              help="The account the ElGamal key pair is provisioned for."
            >
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                required
                disabled={accountsLoading}
                className={`${CMPT_INPUT} bg-white`}
              >
                <option value="" disabled>
                  {accountsLoading ? "Loading accounts…" : "Select an account"}
                </option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.alias}
                    {account.address ? ` (${account.address})` : ""}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Ledger"
              help={
                accountLedgerIds.length > 0
                  ? "Ledgers this account has an address on."
                  : "Select an account to narrow this to its own ledgers."
              }
            >
              <select
                value={effectiveLedgerId}
                onChange={(e) => setLedgerId(e.target.value)}
                required
                className={`${CMPT_INPUT} bg-white`}
              >
                {ledgerOptions.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </Field>

            <SubmitButton
              theme="violet"
              pending={isPending}
              disabled={!defaultDomainId || !accountId || isPending}
              pendingLabel="Proposing intent…"
            >
              Propose ProvisionElGamalKeyPair intent
            </SubmitButton>
          </form>
        </SectionCard>

        <ErrorBanner error={error} />

        {response && (
          <JsonViewer data={response} title="ProvisionElGamalKeyPair response" />
        )}
      </PageContainer>
    </Page>
  );
}
