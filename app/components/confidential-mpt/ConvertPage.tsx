"use client";

import { useState } from "react";
import { JsonViewer } from "../JsonViewer";
import { useDefaultDomain } from "../../contexts/DomainContext";
import {
  useSubmitConfidentialMPTConvert,
  useSubmitConfidentialMPTConvertBack,
} from "../../hooks/useSubmitConfidentialMPT";
import type { CmptTokenIdentifier } from "../../_actions/confidential-mpt";
import {
  Page,
  PageHeader,
  PageContainer,
  PageHero,
  SectionCard,
  SubmitButton,
  ErrorBanner,
  DomainWarning,
} from "../layout";
import { AccountField, TextField, TokenIdentifierField } from "./Fields";

/**
 * ConfidentialMPTConvert and ConfidentialMPTConvertBack take the same three
 * inputs (account, token, amount) and differ only in direction, so both routes
 * render this form.
 */
export function ConvertPage({ direction }: { direction: "to" | "from" }) {
  const toConfidential = direction === "to";
  const { defaultDomainId } = useDefaultDomain();

  const convert = useSubmitConfidentialMPTConvert();
  const convertBack = useSubmitConfidentialMPTConvertBack();
  const { mutate, isPending, data: response, error } = toConfidential
    ? convert
    : convertBack;

  const [accountId, setAccountId] = useState("");
  const [tokenIdentifier, setTokenIdentifier] = useState<CmptTokenIdentifier>({
    type: "MPTokenIssuanceId",
    issuanceId: "",
  });
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defaultDomainId) return;
    mutate({ domainId: defaultDomainId, accountId, tokenIdentifier, amount });
  };

  const title = toConfidential ? "cMPT Convert" : "cMPT Convert Back";
  const txType = toConfidential
    ? "ConfidentialMPTConvert"
    : "ConfidentialMPTConvertBack";

  return (
    <Page>
      <PageHeader title={title} subtitle={`XRPL · ${txType}`} />
      <PageContainer width="form">
        <PageHero
          theme={toConfidential ? "violet" : "sky"}
          icon={toConfidential ? "🔒" : "🔓"}
          title={title}
          description={
            toConfidential
              ? "Move a public MPT balance into the account's confidential balance. The amount is submitted in plaintext — the Custody service derives the encrypted balance and proofs server-side."
              : "Move a confidential MPT balance back into the account's public balance. The amount is submitted in plaintext — the Custody service derives the proofs server-side."
          }
          badge={{
            label: txType,
            note: toConfidential
              ? "Public → confidential"
              : "Confidential → public",
          }}
        />

        {!defaultDomainId && (
          <DomainWarning action={`submitting a ${txType}`} />
        )}

        <SectionCard
          step={1}
          theme={toConfidential ? "violet" : "sky"}
          title={`${txType} details`}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <AccountField
              value={accountId}
              onChange={setAccountId}
              help="The account whose balance is converted. It must already have an ElGamal key pair provisioned."
            />

            <TokenIdentifierField
              value={tokenIdentifier}
              onChange={setTokenIdentifier}
            />

            <TextField
              label="Amount"
              value={amount}
              onChange={setAmount}
              placeholder="1000"
              required
              help="Plaintext MPT amount, in the token's smallest unit."
            />

            <SubmitButton
              theme={toConfidential ? "violet" : "sky"}
              pending={isPending}
              disabled={!defaultDomainId || isPending}
              pendingLabel="Proposing intent…"
            >
              Propose {txType} intent
            </SubmitButton>
          </form>
        </SectionCard>

        <ErrorBanner error={error} />

        {response && <JsonViewer data={response} title={`${txType} response`} />}
      </PageContainer>
    </Page>
  );
}
