"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { JsonViewer } from "./JsonViewer";
import { CopyButton } from "./CopyButton";
import { useDefaultDomain } from "../contexts/DomainContext";

interface AccountData {
  id: string;
  domainId: string;
  alias: string;
  ledgerId?: string;
  providerDetails?: unknown;
  lock?: string;
  metadata?: unknown;
}

interface AccountItem {
  data: AccountData;
  signature: string;
  signingKey: string;
  additionalDetails?: unknown;
}

interface AccountsResponse {
  items: AccountItem[];
  count: number;
  currentStartingAfter?: string;
  nextStartingAfter?: string;
}

interface AddressItem {
  address: string;
  ledgerId?: string;
  [key: string]: unknown;
}

interface AddressesResponse {
  items?: AddressItem[];
  [key: string]: unknown;
}

async function fetchAccounts(domainId: string): Promise<AccountsResponse> {
  const res = await fetch("/api/accounts/list", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domainId }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to list accounts");
  }

  return res.json();
}

async function fetchAddresses(
  domainId: string,
  accountId: string
): Promise<AddressesResponse> {
  const res = await fetch("/api/accounts/addresses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domainId, accountId }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to fetch addresses");
  }

  return res.json();
}

function AccountCard({
  account,
  domainId,
}: {
  account: AccountItem;
  domainId: string;
}) {
  const [showAddresses, setShowAddresses] = useState(false);

  const {
    data: addressesData,
    isLoading: addressesLoading,
    error: addressesError,
  } = useQuery({
    queryKey: ["addresses", domainId, account.data.id],
    queryFn: () => fetchAddresses(domainId, account.data.id),
    enabled: showAddresses,
  });

  // Extract addresses from response
  const addresses = Array.isArray(addressesData)
    ? addressesData
    : addressesData?.items || [];

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Account ID
          </p>
          <div className="flex items-center gap-1">
            <p className="text-sm font-mono text-gray-900 break-all flex-1">
              {account.data.id}
            </p>
            <CopyButton text={account.data.id} />
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Alias
          </p>
          <p className="text-base font-semibold text-gray-900">
            {account.data.alias || (
              <span className="text-gray-400 italic font-normal">
                No alias set
              </span>
            )}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Ledger ID
          </p>
          <p className="text-sm font-mono text-gray-600">
            {account.data.ledgerId || (
              <span className="text-gray-400 italic">Not specified</span>
            )}
          </p>
        </div>

        {account.data.lock && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Lock Status
            </p>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                account.data.lock === "Unlocked"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {account.data.lock}
            </span>
          </div>
        )}

        {/* Addresses Section */}
        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={() => setShowAddresses(!showAddresses)}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
          >
            <svg
              className={`w-4 h-4 transition-transform ${
                showAddresses ? "rotate-90" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            {showAddresses ? "Hide Addresses" : "Show Addresses"}
          </button>

          {showAddresses && (
            <div className="mt-2">
              {addressesLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg
                    className="animate-spin h-4 w-4"
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
                  Loading addresses...
                </div>
              )}

              {addressesError && (
                <p className="text-sm text-red-600">
                  Error: {addressesError.message}
                </p>
              )}

              {addressesData && addresses.length > 0 && (
                <div className="space-y-2">
                  {addresses.map((addr, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 rounded p-2 text-xs font-mono"
                    >
                      <div className="flex items-center gap-1">
                        <p className="text-gray-900 break-all flex-1">
                          {addr.address}
                        </p>
                        <CopyButton text={addr.address} />
                      </div>
                      {addr.ledgerId && (
                        <p className="text-gray-500 mt-1">
                          Ledger: {addr.ledgerId}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {addressesData && addresses.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  No addresses found
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AccountsTab() {
  const { defaultDomainId } = useDefaultDomain();
  const [domainId, setDomainId] = useState("");
  const [searchDomainId, setSearchDomainId] = useState("");

  // Initialize with default domain ID when it changes
  useEffect(() => {
    if (defaultDomainId && !domainId) {
      setDomainId(defaultDomainId);
    }
  }, [defaultDomainId, domainId]);

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["accounts", searchDomainId],
    queryFn: () => fetchAccounts(searchDomainId),
    enabled: !!searchDomainId,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (domainId.trim()) {
      setSearchDomainId(domainId.trim());
    }
  };

  const handleUseDefault = () => {
    if (defaultDomainId) {
      setDomainId(defaultDomainId);
    }
  };

  const accounts = response?.items || [];
  const count = response?.count ?? accounts.length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Accounts</h2>
        <p className="text-sm text-gray-600 mb-6">
          View all accounts for a specific domain. Click on an account to see
          its addresses.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="domainId"
                className="block text-sm font-medium text-gray-700"
              >
                Domain ID
              </label>
              {defaultDomainId && domainId !== defaultDomainId && (
                <button
                  type="button"
                  onClick={handleUseDefault}
                  className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Use default
                </button>
              )}
            </div>
            <input
              type="text"
              id="domainId"
              value={domainId}
              onChange={(e) => setDomainId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="Enter domain ID (UUID)"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !domainId.trim()}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isLoading ? (
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
                Loading...
              </span>
            ) : (
              "List Accounts"
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-600 mr-2"
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
                Error: {error.message}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {response && count > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Accounts ({count} {count === 1 ? "account" : "accounts"})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <AccountCard
                key={account.data.id}
                account={account}
                domainId={searchDomainId}
              />
            ))}
          </div>
        </div>
      )}

      {response && count === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            No accounts found for this domain.
          </p>
        </div>
      )}

      {response && (
        <div>
          <JsonViewer data={response} title="Full Accounts Response" />
        </div>
      )}
    </div>
  );
}
