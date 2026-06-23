"use client";

import { useState } from "react";
import { JsonViewer } from "../../components/JsonViewer";
import { useAccounts } from "../../hooks/useAccounts";
import { useDefaultDomain } from "../../contexts/DomainContext";
import { CopyButton } from "../../components/CopyButton";
import { useSubmitMPTokenSet } from "../../hooks/useSubmitMPTokenSet";
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

// MPT Set Flags
const MPT_SET_FLAGS = [
  {
    name: "tfMPTLock",
    value: 1,
    description: "Lock balances of this MPT issuance",
    icon: "🔒",
    color: "red",
  },
  {
    name: "tfMPTUnlock",
    value: 2,
    description: "Unlock balances of this MPT issuance",
    icon: "🔓",
    color: "green",
  },
];

export default function MptSetPage() {
  const { defaultDomainId } = useDefaultDomain();
  const { accounts, loading: accountsLoading } = useAccounts();
  const { mutate, isPending, data: response, error } = useSubmitMPTokenSet();

  const [accountId, setAccountId] = useState("");
  const [issuanceId, setIssuanceId] = useState("");
  const [holderAddress, setHolderAddress] = useState("");
  const [applyToAll, setApplyToAll] = useState(true);
  const [selectedFlag, setSelectedFlag] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defaultDomainId || !selectedFlag) return;
    mutate({
      accountId,
      domainId: defaultDomainId,
      issuanceId,
      holder: applyToAll ? undefined : holderAddress,
      flags: selectedFlag as 1 | 2,
    });
  };

  const submitLabel =
    selectedFlag === 1
      ? "🔒 Lock MPT Issuance"
      : selectedFlag === 2
      ? "🔓 Unlock MPT Issuance"
      : "Set MPT Issuance";

  const pendingLabel =
    selectedFlag === 1
      ? "Locking MPT Issuance..."
      : selectedFlag === 2
      ? "Unlocking MPT Issuance..."
      : "Processing...";

  return (
    <Page>
      <PageHeader title="MPT Set" subtitle="XRPL · MPTokenIssuanceSet" />
      <PageContainer width="form">
        <PageHero
          theme="violet"
          icon="⚙️"
          title="MPT Set"
          description="Update mutable properties of a Multi-Purpose Token (MPT) issuance, including locking or unlocking tokens globally or for individual holders."
          badge={{
            label: "Lock/Unlock",
            note: "Control token balances and access",
          }}
        />

        {!defaultDomainId && <DomainWarning action="setting MPT flags" />}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Selection */}
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors bg-white"
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
                The account that will execute the set operation (must be the issuer)
              </p>
            </div>
          </SectionCard>

          {/* MPT Issuance ID */}
          <SectionCard step={2} title="MPT Issuance">
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
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors font-mono text-sm"
                  placeholder="05EECEBE97A7D635DE2393068691A015FED5A89AD203F5AA"
                  required
                />
                {issuanceId && <CopyButton text={issuanceId} />}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                The hexadecimal identifier of the MPT issuance to update
              </p>
            </div>
          </SectionCard>

          {/* Lock/Unlock Action */}
          <SectionCard step={3} title="Action">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MPT_SET_FLAGS.map((flag) => (
                <label
                  key={flag.name}
                  className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedFlag === flag.value
                      ? flag.color === "red"
                        ? "border-red-500 bg-red-50"
                        : "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="flag"
                    value={flag.value}
                    checked={selectedFlag === flag.value}
                    onChange={() => setSelectedFlag(flag.value)}
                    className="mt-1 w-5 h-5 text-violet-600 border-gray-300 focus:ring-violet-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{flag.icon}</span>
                      <span className="font-semibold text-gray-900">
                        {flag.name}
                      </span>
                      <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">
                        {flag.value}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{flag.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </SectionCard>

          {/* Scope Selection */}
          <SectionCard step={4} title="Scope">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="applyToAll"
                  name="scope"
                  checked={applyToAll}
                  onChange={() => {
                    setApplyToAll(true);
                    setHolderAddress("");
                  }}
                  className="w-4 h-4 text-violet-600 border-gray-300 focus:ring-violet-500"
                />
                <label htmlFor="applyToAll" className="flex-1 cursor-pointer">
                  <div className="font-medium text-gray-900">
                    Apply to All Holders
                  </div>
                  <p className="text-sm text-gray-500">
                    {selectedFlag === 1
                      ? "Lock balances for all accounts holding this MPT"
                      : selectedFlag === 2
                      ? "Unlock balances for all accounts holding this MPT"
                      : "Apply the selected action to all holders"}
                  </p>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="applyToHolder"
                  name="scope"
                  checked={!applyToAll}
                  onChange={() => setApplyToAll(false)}
                  className="w-4 h-4 text-violet-600 border-gray-300 focus:ring-violet-500"
                />
                <label
                  htmlFor="applyToHolder"
                  className="flex-1 cursor-pointer"
                >
                  <div className="font-medium text-gray-900">
                    Apply to Specific Holder
                  </div>
                  <p className="text-sm text-gray-500">
                    {selectedFlag === 1
                      ? "Lock balances for a specific account only"
                      : selectedFlag === 2
                      ? "Unlock balances for a specific account only"
                      : "Apply the selected action to a specific holder"}
                  </p>
                </label>
              </div>

              {!applyToAll && (
                <div className="ml-7 mt-2">
                  <label
                    htmlFor="holderAddress"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Holder Address
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      id="holderAddress"
                      value={holderAddress}
                      onChange={(e) => setHolderAddress(e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors font-mono text-sm"
                      placeholder="rNFta7UKwcoiCpxEYbhH2v92numE3cceB6"
                      required={!applyToAll}
                    />
                    {holderAddress && <CopyButton text={holderAddress} />}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    The XRPL address of the specific holder to apply the action to
                  </p>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Configuration Summary */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-700 mb-3 text-sm">
              Configuration Summary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block text-xs">Domain ID</span>
                <span className="font-mono text-xs text-gray-800 truncate block">
                  {defaultDomainId || "Not set"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Action</span>
                <span className="font-mono text-gray-800">
                  {selectedFlag === 1
                    ? "Lock"
                    : selectedFlag === 2
                    ? "Unlock"
                    : "Not selected"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Scope</span>
                <span className="font-mono text-gray-800">
                  {applyToAll ? "All Holders" : "Specific Holder"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Flag Value</span>
                <span className="font-mono text-gray-800">
                  {selectedFlag || "—"}
                </span>
              </div>
            </div>
          </div>

          <SubmitButton
            theme="violet"
            pending={isPending}
            pendingLabel={pendingLabel}
            disabled={
              isPending ||
              !defaultDomainId ||
              accounts.length === 0 ||
              !selectedFlag ||
              (!applyToAll && !holderAddress)
            }
          >
            {submitLabel}
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
