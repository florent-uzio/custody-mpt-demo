"use client";

import { useState } from "react";
import Link from "next/link";
import { JsonViewer } from "../../../components/JsonViewer";
import { useDefaultDomain } from "../../../contexts/DomainContext";
import { useSubmitConfidentialMPTSend } from "../../../hooks/useSubmitConfidentialMPT";
import type {
  CmptDestination,
  CmptTokenIdentifier,
} from "../../../_actions/confidential-mpt";
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
  DestinationField,
  TextField,
  TokenIdentifierField,
} from "../../../components/confidential-mpt/Fields";
import {
  ProofFieldsEditor,
  missingProofFields,
  toProofs,
  type CmptProofsDraft,
} from "../../../components/confidential-mpt/ProofFields";

export default function ConfidentialMptSendPage() {
  const { defaultDomainId } = useDefaultDomain();
  const { mutate, isPending, data: response, error } =
    useSubmitConfidentialMPTSend();

  const [accountId, setAccountId] = useState("");
  const [tokenIdentifier, setTokenIdentifier] = useState<CmptTokenIdentifier>({
    type: "MPTokenIssuanceId",
    issuanceId: "",
  });
  const [destination, setDestination] = useState<CmptDestination>({
    type: "Address",
    address: "",
  });
  const [amount, setAmount] = useState("");

  const [advanced, setAdvanced] = useState(false);
  const [proofs, setProofs] = useState<CmptProofsDraft>({});
  const [senderEncryptedBalance, setSenderEncryptedBalance] = useState("");
  const [senderEncryptedBalanceVersion, setSenderEncryptedBalanceVersion] =
    useState("");

  const missing = advanced ? missingProofFields(proofs) : [];
  const canSubmit =
    !!defaultDomainId && !isPending && (advanced ? missing.length === 0 : !!amount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defaultDomainId || !canSubmit) return;
    mutate({
      domainId: defaultDomainId,
      accountId,
      tokenIdentifier,
      destination,
      ...(amount && { amount }),
      ...(advanced && {
        proofs: toProofs(proofs),
        ...(senderEncryptedBalance.trim() && {
          senderEncryptedBalance: senderEncryptedBalance.trim(),
        }),
        ...(senderEncryptedBalanceVersion.trim() && {
          senderEncryptedBalanceVersion: Number(senderEncryptedBalanceVersion),
        }),
      }),
    });
  };

  return (
    <Page>
      <PageHeader title="cMPT Send" subtitle="XRPL · ConfidentialMPTSend" />
      <PageContainer width="form">
        <PageHero
          theme="indigo"
          icon="🕶️"
          title="cMPT Send"
          description="Transfer a confidential MPT balance. By default the plaintext amount is submitted and the Custody service derives the ciphertexts and zero-knowledge proof; alternatively, supply a pre-computed proof bundle."
          badge={{
            label: "ConfidentialMPTSend",
            note: "Amount is encrypted on-ledger",
          }}
        />

        {!defaultDomainId && (
          <DomainWarning action="submitting a ConfidentialMPTSend" />
        )}

        <SectionCard step={1} theme="indigo" title="Transfer details">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AccountField
              label="Sender account"
              value={accountId}
              onChange={setAccountId}
              help="The account spending its confidential balance."
            />

            <TokenIdentifierField
              value={tokenIdentifier}
              onChange={setTokenIdentifier}
            />

            <DestinationField value={destination} onChange={setDestination} />

            <TextField
              label={advanced ? "Amount (optional)" : "Amount"}
              value={amount}
              onChange={setAmount}
              placeholder="1000"
              required={!advanced}
              help={
                advanced
                  ? "Optional when a proof bundle is supplied — the amount only exists as ciphertext on-ledger."
                  : "Plaintext MPT amount, in the token's smallest unit. The service derives the proofs."
              }
            />

            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={advanced}
                  onChange={(e) => setAdvanced(e.target.checked)}
                />
                Advanced — supply cryptographic fields
              </label>
              <p className="text-xs text-gray-500">
                Paste the bundle returned by a{" "}
                <Link
                  href="/mpt/confidential/compute"
                  className="text-blue-600 hover:underline"
                >
                  cMPT compute
                </Link>
                . Values are hex, exactly as the compute endpoint returns them;
                they are base64-encoded before being put on the operation.
              </p>

              {advanced && (
                <>
                  <ProofFieldsEditor value={proofs} onChange={setProofs} />

                  <div className="grid sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Sender encrypted balance (optional)
                      </label>
                      <textarea
                        value={senderEncryptedBalance}
                        onChange={(e) => setSenderEncryptedBalance(e.target.value)}
                        rows={2}
                        spellCheck={false}
                        placeholder="hex"
                        className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none break-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Sender encrypted balance version (optional)
                      </label>
                      <input
                        type="number"
                        value={senderEncryptedBalanceVersion}
                        onChange={(e) =>
                          setSenderEncryptedBalanceVersion(e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {missing.length > 0 && (
                    <p className="text-xs text-amber-700">
                      Still required: {missing.join(", ")}
                    </p>
                  )}
                </>
              )}
            </div>

            <SubmitButton
              theme="indigo"
              pending={isPending}
              disabled={!canSubmit}
              pendingLabel="Proposing intent…"
            >
              Propose ConfidentialMPTSend intent
            </SubmitButton>
          </form>
        </SectionCard>

        <ErrorBanner error={error} />

        {response && (
          <JsonViewer data={response} title="ConfidentialMPTSend response" />
        )}
      </PageContainer>
    </Page>
  );
}
