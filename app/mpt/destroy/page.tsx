"use client";

import { useState } from "react";
import { JsonViewer } from "../../components/JsonViewer";
import { useAccounts } from "../../hooks/useAccounts";
import { useDefaultDomain } from "../../contexts/DomainContext";
import { CopyButton } from "../../components/CopyButton";
import { useSubmitMPTokenDestroy } from "../../hooks/useSubmitMPTokenDestroy";
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

export default function MptDestroyPage() {
  const { defaultDomainId } = useDefaultDomain();
  const { accounts, loading: accountsLoading } = useAccounts();
  const { mutate, isPending, data: response, error } = useSubmitMPTokenDestroy();

  const [accountId, setAccountId] = useState("");
  const [issuanceId, setIssuanceId] = useState("");
  const [confirmDestroy, setConfirmDestroy] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defaultDomainId) return;
    mutate({ accountId, domainId: defaultDomainId, issuanceId });
  };

  return (
    <Page>
      <PageHeader title="MPT Destroy" subtitle="XRPL · MPTokenIssuanceDestroy" />
      <PageContainer width="form">
        <PageHero
          theme="rose"
          icon="🗑️"
          title="Destroy MPT Issuance"
          description="Permanently delete a Multi-Purpose Token (MPT) issuance from the XRP Ledger. This action is irreversible and can only be performed by the issuer when there are no holders."
          badge={{
            label: "⚠️ Destructive",
            note: "This action cannot be undone",
          }}
        />

        {!defaultDomainId && <DomainWarning action="destroying an MPT" />}

        {/* Warning Box */}
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-5">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-2">
                Important Requirements
              </h3>
              <ul className="space-y-1 text-sm text-red-800">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">•</span>
                  <span>Only the issuer of the MPT can destroy the issuance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">•</span>
                  <span>
                    The MPT issuance must have no holders (all balances must be
                    zero)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">•</span>
                  <span>This action is permanent and cannot be reversed</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <SectionCard step={1} title="Issuer Account">
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors bg-white"
                required
                disabled={accountsLoading}
              >
                {accountsLoading ? (
                  <option>Loading accounts...</option>
                ) : accounts.length === 0 ? (
                  <option value="">No accounts found - set Default Domain ID</option>
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
              <p className="mt-2 text-xs text-gray-500">
                The account that issued the MPT (must be the issuer to destroy it)
              </p>
            </div>
          </SectionCard>

          <SectionCard step={2} title="MPT Issuance to Destroy">
            <div>
              <label
                htmlFor="issuanceId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                MPT Issuance ID
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  id="issuanceId"
                  value={issuanceId}
                  onChange={(e) => setIssuanceId(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors font-mono text-sm"
                  placeholder="05EECEBC97A7D635DE2393068691A015FED5A89AD203F5AA"
                  required
                />
                {issuanceId && <CopyButton text={issuanceId} />}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                The hexadecimal identifier of the MPT issuance to permanently delete
              </p>
            </div>
          </SectionCard>

          <SectionCard step={3} title="Confirmation">
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={confirmDestroy}
                  onChange={(e) => setConfirmDestroy(e.target.checked)}
                  className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 group-hover:text-red-700 transition-colors">
                    I understand this action is permanent and irreversible
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    By checking this box, you confirm that you are the issuer of this
                    MPT and that there are no holders with balances. Once destroyed,
                    this MPT issuance cannot be recovered.
                  </p>
                </div>
              </label>

              {confirmDestroy && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium text-sm">
                      Final confirmation: You are about to permanently destroy this
                      MPT issuance.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Configuration Summary */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-700 mb-3 text-sm">
              Configuration Summary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block text-xs">Domain ID</span>
                <span className="font-mono text-xs text-gray-800 truncate block">
                  {defaultDomainId || "Not set"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Action</span>
                <span className="font-mono text-gray-800 text-red-600 font-semibold">
                  Destroy
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Confirmed</span>
                <span className="font-mono text-gray-800">
                  {confirmDestroy ? "✓ Yes" : "✗ No"}
                </span>
              </div>
            </div>
          </div>

          <SubmitButton
            theme="rose"
            pending={isPending}
            disabled={
              isPending ||
              !defaultDomainId ||
              accounts.length === 0 ||
              !confirmDestroy ||
              !issuanceId
            }
            pendingLabel="Destroying MPT Issuance..."
          >
            Destroy MPT Issuance
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
