"use client";

import { useState } from "react";
import { DEFAULT_MAXIMUM_FEE, type MaximumFee } from "../../lib/maximum-fee";
import { JsonViewer } from "../../components/JsonViewer";
import { useAccounts } from "../../hooks/useAccounts";
import { useDefaultDomain } from "../../contexts/DomainContext";
import { useLedgerConfig } from "../../hooks/useLedgerConfig";
import type { MptAuthorizeFlag } from "../../_actions/mpt";
import { DryRunResult } from "../../components/mpt-authorize/DryRunResult";
import { useDryRunMPTokenAuthorize } from "../../hooks/useDryRunMPTokenAuthorize";
import { useSubmitMPTokenAuthorize } from "../../hooks/useSubmitMPTokenAuthorize";
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
} from "../../components/layout";

export default function MptAuthorizePage() {
  const { defaultDomainId } = useDefaultDomain();
  const { defaultLedgerId } = useLedgerConfig();
  const { accounts, loading: accountsLoading } = useAccounts();
  const {
    mutate,
    isPending,
    data: response,
    error,
  } = useSubmitMPTokenAuthorize();
  const dryRun = useDryRunMPTokenAuthorize();
  const [issuanceId, setIssuanceId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [holderAccountId, setHolderAccountId] = useState("");
  const [unauthorize, setUnauthorize] = useState(false);
  const [maximumFee, setMaximumFee] = useState<MaximumFee>(DEFAULT_MAXIMUM_FEE);

  const input = () => ({
    domainId: defaultDomainId!,
    issuanceId,
    accountId,
    holderAccountId: holderAccountId || undefined,
    flags: unauthorize ? (["tfMPTUnauthorize"] as MptAuthorizeFlag[]) : [],
    maximumFee,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defaultDomainId) return;
    mutate(input());
  };

  const handleDryRun = () => {
    if (!defaultDomainId) return;
    dryRun.mutate(input());
  };

  return (
    <Page>
      <PageHeader title="MPT Authorize" subtitle="XRPL · MPTokenAuthorize" />
      <PageContainer width="form">
        <PageHero
          theme="emerald"
          icon="✅"
          title="MPT Authorize"
          description="Create an intent to authorize a Multi-Purpose Token (MPT) for your account. This allows the account to hold the specified MPT."
          badge={{
            label: "MPTokenAuthorize",
            note: "Grants MPT holding permission to an account",
          }}
        />

        {!defaultDomainId && <DomainWarning action="authorizing an MPT" />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <SectionCard step={1} theme="emerald" title="Authorize Details">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="issuanceId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  MPT Issuance ID
                </label>
                <input
                  type="text"
                  id="issuanceId"
                  value={issuanceId}
                  onChange={(e) => setIssuanceId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Enter MPT Issuance ID (e.g., 00CA8BD9F2582AF39B51725D510C5401ED4495ECFB250591)"
                  required
                />
                <p className="mt-2 text-xs text-gray-500">
                  The ID of the MPT to authorize. This is created outside of
                  Custody with xrpl.js SDK.
                </p>
              </div>

              <div>
                <label
                  htmlFor="accountId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {holderAccountId ? "Issuer Account" : "Account"}
                </label>
                <select
                  id="accountId"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
                  required
                  disabled={accountsLoading}
                >
                  {accountsLoading ? (
                    <option>Loading accounts...</option>
                  ) : (
                    <>
                      <option value="" disabled>
                        Select an account
                      </option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.alias} ({account.id})
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="holderAccountId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Holder Account{" "}
                  <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <select
                  id="holderAccountId"
                  value={holderAccountId}
                  onChange={(e) => setHolderAccountId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors bg-white"
                  disabled={accountsLoading}
                >
                  <option value="">
                    None — the account above is the holder
                  </option>
                  {accounts
                    .filter((account) => account.id !== accountId)
                    .map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.alias} ({account.id})
                      </option>
                    ))}
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  Leave empty when the holder opts in to the MPT itself. Select
                  a holder when the issuer authorizes it (the issuance must
                  require authorization).
                </p>
              </div>

              <label
                htmlFor="unauthorize"
                className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                  unauthorize
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  id="unauthorize"
                  checked={unauthorize}
                  onChange={(e) => setUnauthorize(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-emerald-600"
                />
                <span>
                  <span className="block text-sm font-medium text-gray-800">
                    <code className="font-mono">tfMPTUnauthorize</code>
                  </span>
                  <span className="block text-xs text-gray-500 mt-1">
                    {holderAccountId
                      ? "Revoke the holder's authorization."
                      : "Opt out: delete your MPToken (balance must be zero)."}
                  </span>
                </span>
              </label>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <h3 className="font-medium text-gray-700 mb-2">
                  Fixed Configuration:
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-600">Domain ID:</span>
                    <span className="ml-2 font-mono text-xs text-gray-800">
                      {defaultDomainId || "Not set"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ledger:</span>
                    <span className="ml-2 text-gray-800">
                      {defaultLedgerId}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Fee Strategy:</span>
                    <span className="ml-2 text-gray-800">Medium Priority</span>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          <MaximumFeeSection
            step={2}
            theme="emerald"
            value={maximumFee}
            onChange={setMaximumFee}
          />

          <button
            type="button"
            onClick={handleDryRun}
            disabled={
              !defaultDomainId || !issuanceId || !accountId || dryRun.isPending
            }
            className="w-full px-6 py-3 rounded-xl border-2 border-emerald-600 text-emerald-700 font-semibold bg-white hover:bg-emerald-50 disabled:border-gray-300 disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
          >
            {dryRun.isPending
              ? "Running dry run..."
              : "🧪 Dry Run (nothing is submitted)"}
          </button>

          <SubmitButton
            theme="emerald"
            pending={isPending}
            disabled={!defaultDomainId || isPending}
            pendingLabel="Proposing Intent..."
          >
            Propose Authorize Intent
          </SubmitButton>
        </form>

        <ErrorBanner error={dryRun.error} />
        {dryRun.data && <DryRunResult data={dryRun.data} />}

        <ErrorBanner error={error} />

        {response && (
          <div>
            <JsonViewer data={response} title="MPT Authorize Intent Response" />
          </div>
        )}
      </PageContainer>
    </Page>
  );
}
