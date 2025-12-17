"use client";

import { useState } from "react";
import { JsonViewer } from "./JsonViewer";

const DEFAULT_DOMAIN_ID = "5cd224fe-193e-8bce-c94c-c6c05245e2d1";
const DEFAULT_ACCOUNT_ID = "a2e100cb-ac0a-4a31-a21f-9e8f803d042c";
const DEFAULT_LEDGER_ID = "xrpl-testnet-august-2024";

interface TransactionItem {
  id: string;
  ledgerId: string;
  orderReference?: {
    id?: string;
    requestId?: string;
    intentId?: string;
  };
  relatedAccounts: Array<{
    accountId: string;
    domainId: string;
  }>;
  processing?: {
    status?: string;
    [key: string]: unknown;
  };
  registeredAt: string;
  ledgerTransactionData?: {
    ledgerStatus?: string;
    statusLastUpdatedAt?: string;
    [key: string]: unknown;
  };
}

interface TransactionsResponse {
  items: TransactionItem[];
  count: number;
  currentStartingAfter?: string | null;
  nextStartingAfter?: string | null;
}

export function TransactionsTab() {
  const [domainId, setDomainId] = useState(DEFAULT_DOMAIN_ID);
  const [accountId, setAccountId] = useState(DEFAULT_ACCOUNT_ID);
  const [ledgerId, setLedgerId] = useState(DEFAULT_LEDGER_ID);
  const [sortBy, setSortBy] = useState<string>("registeredAt");
  const [limit, setLimit] = useState<string>("10");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<TransactionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/transactions/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domainId,
          accountId: accountId || undefined,
          ledgerId: ledgerId || undefined,
          sortBy: sortBy || undefined,
          limit: limit ? parseInt(limit) : undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to get transactions");
      }

      const result = await res.json();
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Transactions
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          View transaction history for a specific domain and account.
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="accountId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Account ID (Optional)
              </label>
              <input
                type="text"
                id="accountId"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="Enter account ID"
              />
            </div>

            <div>
              <label
                htmlFor="ledgerId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Ledger ID (Optional)
              </label>
              <input
                type="text"
                id="ledgerId"
                value={ledgerId}
                onChange={(e) => setLedgerId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="Enter ledger ID"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="sortBy"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Sort By (Optional)
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              >
                <option value="">None</option>
                <option value="id">ID</option>
                <option value="registeredAt">Registered At</option>
                <option value="ledgerId">Ledger ID</option>
                <option value="processingStatus">Processing Status</option>
                <option value="ledgerTransactionData.ledgerStatus">
                  Ledger Status
                </option>
                <option value="ledgerTransactionData.statusLastUpdatedAt">
                  Status Last Updated
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="limit"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Limit (Optional)
              </label>
              <input
                type="number"
                id="limit"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="Enter limit"
                min="1"
              />
            </div>
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
              "Get Transactions"
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 overflow-x-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Transactions ({response.count}{" "}
            {response.count === 1 ? "item" : "items"})
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ledger ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Reference
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Related Accounts
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Processing
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered At
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ledger Transaction Data
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {response.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm font-mono text-gray-900 break-all max-w-xs">
                        {item.id}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{item.ledgerId}</p>
                    </td>
                    <td className="px-4 py-3">
                      {item.orderReference ? (
                        <div className="text-sm text-gray-900 space-y-1">
                          {item.orderReference.id && (
                            <p className="font-mono text-xs">
                              ID: {item.orderReference.id.substring(0, 16)}...
                            </p>
                          )}
                          {item.orderReference.requestId && (
                            <p className="font-mono text-xs">
                              Request:{" "}
                              {item.orderReference.requestId.substring(0, 16)}
                              ...
                            </p>
                          )}
                          {item.orderReference.intentId && (
                            <p className="font-mono text-xs">
                              Intent:{" "}
                              {item.orderReference.intentId.substring(0, 16)}
                              ...
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.relatedAccounts &&
                      item.relatedAccounts.length > 0 ? (
                        <div className="text-sm text-gray-900 space-y-1">
                          {item.relatedAccounts.map((account, idx) => (
                            <div key={idx} className="font-mono text-xs">
                              <p className="text-gray-600">
                                {account.accountId
                                  ? `${account.accountId.substring(0, 8)}...`
                                  : "-"}
                              </p>
                              <p className="text-gray-500 text-xs">
                                {account.domainId
                                  ? `${account.domainId.substring(0, 8)}...`
                                  : "-"}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.processing ? (
                        <div className="text-sm text-gray-900">
                          {item.processing.status && (
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                item.processing.status === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : item.processing.status === "Failed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {item.processing.status}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm text-gray-500">
                        {formatDate(item.registeredAt)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {item.ledgerTransactionData ? (
                        <div className="text-sm text-gray-900 space-y-1">
                          {item.ledgerTransactionData.ledgerStatus && (
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                item.ledgerTransactionData.ledgerStatus ===
                                "Success"
                                  ? "bg-green-100 text-green-800"
                                  : item.ledgerTransactionData.ledgerStatus ===
                                    "Failed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {item.ledgerTransactionData.ledgerStatus}
                            </span>
                          )}
                          {item.ledgerTransactionData.statusLastUpdatedAt && (
                            <p className="text-xs text-gray-500">
                              Updated:{" "}
                              {formatDate(
                                item.ledgerTransactionData.statusLastUpdatedAt
                              )}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {response && response.items && response.items.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            No transactions found for the specified criteria.
          </p>
        </div>
      )}

      {response && (
        <div>
          <JsonViewer data={response} title="Full Transactions Response" />
        </div>
      )}
    </div>
  );
}

