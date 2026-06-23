"use client";

import { useState } from "react";
import { JsonViewer } from "../../components/JsonViewer";
import { useAccounts } from "../../hooks/useAccounts";
import { useDefaultDomain } from "../../contexts/DomainContext";
import { useSubmitMPTokenAuthorize } from "../../hooks/useSubmitMPTokenAuthorize";
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

export default function MptAuthorizePage() {
  const { defaultDomainId } = useDefaultDomain();
  const { accounts, loading: accountsLoading } = useAccounts();
  const { mutate, isPending, data: response, error } = useSubmitMPTokenAuthorize();
  const [issuanceId, setIssuanceId] = useState("");
  const [accountId, setAccountId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defaultDomainId) return;
    mutate({ domainId: defaultDomainId, issuanceId, accountId });
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

        <SectionCard step={1} title="Authorize Details">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                The ID of the MPT to authorize. This is created outside of Custody
                with xrpl.js SDK.
              </p>
            </div>

            <div>
              <label
                htmlFor="accountId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Account ID
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
                    xrpl-testnet-august-2024
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Fee Strategy:</span>
                  <span className="ml-2 text-gray-800">Medium Priority</span>
                </div>
              </div>
            </div>

            <SubmitButton
              theme="emerald"
              pending={isPending}
              disabled={!defaultDomainId || isPending}
              pendingLabel="Proposing Intent..."
            >
              Propose Authorize Intent
            </SubmitButton>
          </form>
        </SectionCard>

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
