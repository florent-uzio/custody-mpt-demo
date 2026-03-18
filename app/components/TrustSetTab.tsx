"use client";

import { useState } from "react";
import { JsonViewer } from "./JsonViewer";
import { useAccounts } from "../hooks/useAccounts";
import { useTrustSet } from "../hooks/useTrustSet";
import { DEFAULT_ACCOUNT_ID } from "../config/defaults";
import { useDefaultDomain } from "../contexts/DomainContext";
import { AccountSection } from "./trustset/AccountSection";
import { LimitAmountSection } from "./trustset/LimitAmountSection";
import { FlagsSection } from "./trustset/FlagsSection";
import { OptionsSection } from "./trustset/OptionsSection";
import { CustomPropertiesSection } from "./trustset/CustomPropertiesSection";
import { ConfigSummary } from "./trustset/ConfigSummary";
import type { TrustSetFlag } from "./TrustSet.types";

export function TrustSetTab() {
  const { defaultDomainId } = useDefaultDomain();
  const { accounts, loading: accountsLoading } = useAccounts();
  const { mutate, isPending, data: response, error } = useTrustSet();

  const [accountId, setAccountId] = useState(DEFAULT_ACCOUNT_ID);
  const [currency, setCurrency] = useState("");
  const [issuer, setIssuer] = useState("");
  const [value, setValue] = useState("");
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
      value,
      flags: selectedFlags,
      enableRippling,
      customProperties,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg p-6 text-white">
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
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">TrustSet</h2>
        </div>
        <p className="text-emerald-100 text-sm">
          Create a trustline on the XRP Ledger. A trustline represents the
          willingness to hold a specific token issued by another account.
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className="px-2 py-1 bg-white/20 rounded-full">TrustSet</span>
          <span className="text-emerald-200">
            XRPL native trustline transaction
          </span>
        </div>
      </div>

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

        <button
          type="submit"
          disabled={isPending || !defaultDomainId || accounts.length === 0}
          className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
        >
          {isPending ? (
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creating TrustSet...
            </span>
          ) : (
            "Create TrustSet"
          )}
        </button>
      </form>

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
            <p className="text-sm text-red-800 font-medium">
              Error: {error instanceof Error ? error.message : String(error)}
            </p>
          </div>
        </div>
      )}

      {response && (
        <div className="space-y-4">
          <JsonViewer data={response.request} title="Request Payload" />
          <JsonViewer data={response.response} title="API Response" />
        </div>
      )}
    </div>
  );
}
