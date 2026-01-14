"use client";

import { useState } from "react";
import { JsonViewer } from "./JsonViewer";
import { useAccounts } from "../hooks/useAccounts";
import { saveSubmittedIntent } from "../utils/intentStorage";
import { DEFAULT_ACCOUNT_ID } from "../config/defaults";
import { useDefaultDomain } from "../contexts/DomainContext";
import { CopyButton } from "./CopyButton";

const CURRENT_USER_ID = "6ac20654-450e-29e4-65e2-1bdecb7db7c4";

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

export function MPTSetTab() {
  const { defaultDomainId } = useDefaultDomain();
  const { accounts, loading: accountsLoading } = useAccounts();

  // Form state
  const [accountId, setAccountId] = useState(DEFAULT_ACCOUNT_ID);
  const [issuanceId, setIssuanceId] = useState("");
  const [holderAddress, setHolderAddress] = useState("");
  const [applyToAll, setApplyToAll] = useState(true);
  const [selectedFlag, setSelectedFlag] = useState<number | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{
    request: unknown;
    response: unknown;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    if (!selectedFlag) {
      setError("Please select either Lock or Unlock flag");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/mpt/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId,
          domainId: defaultDomainId,
          issuanceId,
          holder: applyToAll ? undefined : holderAddress,
          flags: selectedFlag,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to set MPT issuance");
      }

      const result = await res.json();
      setResponse(result);

      // Save to localStorage if we have a requestId
      const responseData = result?.response || result;
      const requestId =
        responseData?.id || responseData?.requestId || responseData?.data?.id;
      if (requestId) {
        saveSubmittedIntent({
          type: "MPTIssuanceSet",
          requestId: requestId,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">MPT Issuance Set</h2>
        </div>
        <p className="text-amber-100 text-sm">
          Update mutable properties of a Multi-Purpose Token (MPT) issuance,
          including locking or unlocking tokens globally or for individual holders.
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className="px-2 py-1 bg-white/20 rounded-full">
            Lock/Unlock
          </span>
          <span className="text-amber-200">
            Control token balances and access
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
              1
            </span>
            Issuer Account
          </h3>

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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors bg-white"
              required
              disabled={accountsLoading}
            >
              {accountsLoading ? (
                <option>Loading accounts...</option>
              ) : accounts.length === 0 ? (
                <option value="">No accounts found - set Default Domain ID</option>
              ) : (
                accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.alias} ({account.id})
                  </option>
                ))
              )}
            </select>
            <p className="mt-2 text-xs text-gray-500">
              The account that will execute the set operation (must be the issuer)
            </p>
          </div>
        </div>

        {/* MPT Issuance ID */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
              2
            </span>
            MPT Issuance
          </h3>

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
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors font-mono text-sm"
                placeholder="05EECEBE97A7D635DE2393068691A015FED5A89AD203F5AA"
                required
              />
              {issuanceId && <CopyButton text={issuanceId} />}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              The hexadecimal identifier of the MPT issuance to update
            </p>
          </div>
        </div>

        {/* Lock/Unlock Action */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
              3
            </span>
            Action
          </h3>

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
                  className="mt-1 w-5 h-5 text-amber-600 border-gray-300 focus:ring-amber-500"
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
        </div>

        {/* Scope Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
              4
            </span>
            Scope
          </h3>

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
                className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500"
              />
              <label
                htmlFor="applyToAll"
                className="flex-1 cursor-pointer"
              >
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
                className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500"
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
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors font-mono text-sm"
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
        </div>

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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !defaultDomainId || accounts.length === 0 || !selectedFlag || (!applyToAll && !holderAddress)}
          className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {selectedFlag === 1
                ? "Locking MPT Issuance..."
                : selectedFlag === 2
                ? "Unlocking MPT Issuance..."
                : "Processing..."}
            </span>
          ) : (
            selectedFlag === 1
              ? "🔒 Lock MPT Issuance"
              : selectedFlag === 2
              ? "🔓 Unlock MPT Issuance"
              : "Set MPT Issuance"
          )}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-600 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-800 font-medium">Error: {error}</p>
          </div>
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div className="space-y-4">
          <JsonViewer data={response.request} title="Request Payload" />
          <JsonViewer data={response.response} title="API Response" />
        </div>
      )}
    </div>
  );
}

