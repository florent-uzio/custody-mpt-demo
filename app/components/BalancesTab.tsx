"use client";

import { useState } from "react";
import { JsonViewer } from "./JsonViewer";
import { useAccounts } from "../hooks/useAccounts";

const DEFAULT_DOMAIN_ID = "5cd224fe-193e-8bce-c94c-c6c05245e2d1";
const DEFAULT_ACCOUNT_ID = "a2e100cb-ac0a-4a31-a21f-9e8f803d042c";

interface BalanceItem {
  accountReference: {
    id: string;
    domainId: string;
  };
  tickerId: string;
  totalAmount: string;
  reservedAmount: string;
  quarantinedAmount: string;
  lastUpdatedAt: string;
  tickerName?: string;
}

interface BalancesResponse {
  items: BalanceItem[];
  count: number;
  currentStartingAfter: string | null;
  nextStartingAfter: string | null;
}

export function BalancesTab() {
  const { accounts, loading: accountsLoading } = useAccounts();
  const [domainId, setDomainId] = useState(DEFAULT_DOMAIN_ID);
  const [accountId, setAccountId] = useState(DEFAULT_ACCOUNT_ID);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<BalancesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/accounts/balances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domainId,
          accountId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to get account balances");
      }

      const result = await res.json();

      // Fetch ticker names for all items
      if (result.items && result.items.length > 0) {
        const tickerPromises = result.items.map(async (item: BalanceItem) => {
          try {
            const tickerRes = await fetch("/api/tickers/get", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                tickerId: item.tickerId,
              }),
            });

            if (tickerRes.ok) {
              const tickerData = await tickerRes.json();
              return {
                ...item,
                tickerName: tickerData.symbol || "Unknown",
              };
            }
          } catch (err) {
            console.error(`Failed to fetch ticker ${item.tickerId}:`, err);
          }
          return {
            ...item,
            tickerName: "Unknown",
          };
        });

        const itemsWithNames = await Promise.all(tickerPromises);
        setResponse({
          ...result,
          items: itemsWithNames,
        });
      } else {
        setResponse(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: string) => {
    // Format large numbers with commas
    return parseInt(amount).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Account Balances
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          View account balances for a specific account and domain.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="domainId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Domain ID
            </label>
            <input
              type="text"
              id="domainId"
              value={domainId}
              onChange={(e) => setDomainId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="Enter domain ID"
              required
            />
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
                accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.alias} ({account.id})
                  </option>
                ))
              )}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors shadow-sm"
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
                Loading...
              </span>
            ) : (
              "Get Balances"
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
            <p className="text-sm text-red-800 font-medium">Error: {error}</p>
          </div>
        </div>
      )}

      {response && response.items && response.items.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Balance Summary ({response.count}{" "}
            {response.count === 1 ? "item" : "items"})
          </h3>
          <div className="space-y-4">
            {response.items.map((item, index) => (
              <div
                key={item.tickerId}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Ticker
                    </p>
                    {item.tickerName && (
                      <p className="text-base font-semibold text-gray-900 mb-1">
                        {item.tickerName}
                      </p>
                    )}
                    <p className="text-xs font-mono text-gray-500 break-all">
                      {item.tickerId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Total Amount
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatAmount(item.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Reserved Amount
                    </p>
                    <p className="text-lg font-semibold text-orange-600">
                      {formatAmount(item.reservedAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Quarantined Amount
                    </p>
                    <p className="text-lg font-semibold text-red-600">
                      {formatAmount(item.quarantinedAmount)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Last Updated:{" "}
                    {new Date(item.lastUpdatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {response && response.items && response.items.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            No balances found for this account.
          </p>
        </div>
      )}

      {response && (
        <div>
          <JsonViewer data={response} title="Full Balance Response" />
        </div>
      )}
    </div>
  );
}
