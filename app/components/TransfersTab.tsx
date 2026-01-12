"use client";

import { useState } from "react";
import { JsonViewer } from "./JsonViewer";
import { useAccounts } from "../hooks/useAccounts";
import { DEFAULT_ACCOUNT_ID } from "../config/defaults";
import { useDefaultDomain } from "../contexts/DomainContext";

interface TransferItem {
  id: string;
  transactionId?: string;
  tickerId: string;
  quarantined: boolean;
  senders: Array<{
    accountId: string;
    domainId: string;
    amount: string;
  }>;
  recipient?: {
    accountId: string;
    domainId: string;
    amount: string;
  };
  value: string;
  kind: "Transfer" | "Fee" | "Recovery";
  registeredAt: string;
  metadata: unknown;
}

interface TransfersResponse {
  items: TransferItem[];
  count: number;
  currentStartingAfter?: string;
  nextStartingAfter?: string;
}

export function TransfersTab() {
  const { accounts, loading: accountsLoading } = useAccounts();
  const { defaultDomainId } = useDefaultDomain();
  const [domainId, setDomainId] = useState(defaultDomainId);
  const [kind, setKind] = useState<string>("Transfer");
  const [quarantined, setQuarantined] = useState(true);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<TransfersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Release transfers state
  const [selectedTransferIds, setSelectedTransferIds] = useState<string[]>([]);
  const [accountId, setAccountId] = useState(DEFAULT_ACCOUNT_ID);
  const [releaseLoading, setReleaseLoading] = useState(false);
  const [releaseResponse, setReleaseResponse] = useState<{
    request: unknown;
    response: unknown;
  } | null>(null);
  const [releaseError, setReleaseError] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/transactions/transfers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domainId,
          kind: kind || undefined,
          quarantined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to get transfers");
      }

      const result = await res.json();
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: string) => {
    return parseInt(amount).toLocaleString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleTransferSelect = (transferId: string, checked: boolean) => {
    if (checked) {
      setSelectedTransferIds([...selectedTransferIds, transferId]);
    } else {
      setSelectedTransferIds(
        selectedTransferIds.filter((id) => id !== transferId)
      );
    }
  };

  const handleReleaseTransfers = async (e: React.FormEvent) => {
    e.preventDefault();
    setReleaseLoading(true);
    setReleaseError(null);
    setReleaseResponse(null);

    try {
      const res = await fetch("/api/intents/release-transfers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId,
          transferIds: selectedTransferIds,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to release transfers");
      }

      const result = await res.json();
      setReleaseResponse(result);
      setShowRequestModal(true);
    } catch (err) {
      setReleaseError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setReleaseLoading(false);
    }
  };

  const quarantinedTransfers =
    response?.items.filter((item) => item.quarantined) || [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Transfers</h2>
        <p className="text-sm text-gray-600 mb-6">
          View transfer transactions for a specific domain.
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
              htmlFor="kind"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Kind (Optional)
            </label>
            <select
              id="kind"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            >
              <option value="">All</option>
              <option value="Transfer">Transfer</option>
              <option value="Fee">Fee</option>
              <option value="Recovery">Recovery</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="quarantined"
              checked={quarantined}
              onChange={(e) => setQuarantined(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="quarantined"
              className="ml-2 block text-sm text-gray-700"
            >
              Quarantined
            </label>
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
              "Get Transfers"
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
            Transfers ({response.count}{" "}
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
                    Transaction ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticker ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kind
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quarantined
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Senders
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered At
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
                      {item.transactionId ? (
                        <p className="text-sm font-mono text-gray-900 break-all max-w-xs">
                          {item.transactionId}
                        </p>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm font-mono text-gray-900 break-all max-w-xs">
                        {item.tickerId}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.kind === "Transfer"
                            ? "bg-blue-100 text-blue-800"
                            : item.kind === "Fee"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {item.kind}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatAmount(item.value)}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.quarantined
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {item.quarantined ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 space-y-1">
                        {item.senders.map((sender, idx) => (
                          <div key={idx} className="font-mono text-xs">
                            <p className="text-gray-600">
                              {sender.accountId
                                ? `${sender.accountId.substring(0, 8)}...`
                                : "-"}
                            </p>
                            <p className="text-gray-500">
                              {sender.amount
                                ? formatAmount(sender.amount)
                                : "-"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {item.recipient ? (
                        <div className="text-sm text-gray-900">
                          <p className="font-mono text-xs text-gray-600">
                            {item.recipient.accountId
                              ? `${item.recipient.accountId.substring(0, 8)}...`
                              : "-"}
                          </p>
                          <p className="text-gray-500">
                            {item.recipient.amount
                              ? formatAmount(item.recipient.amount)
                              : "-"}
                          </p>
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
            No transfers found for the specified criteria.
          </p>
        </div>
      )}

      {response && (
        <div>
          <JsonViewer data={response} title="Full Transfers Response" />
        </div>
      )}

      {/* Release Quarantined Transfers Section */}
      {response && quarantinedTransfers.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Release Quarantined Transfers
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Select quarantined transfers to release and create a release intent.
          </p>
          <form onSubmit={handleReleaseTransfers} className="space-y-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Quarantined Transfers ({selectedTransferIds.length}{" "}
                selected)
              </label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                {quarantinedTransfers.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No quarantined transfers found.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {quarantinedTransfers.map((transfer) => (
                      <label
                        key={transfer.id}
                        className="flex items-start p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTransferIds.includes(transfer.id)}
                          onChange={(e) =>
                            handleTransferSelect(transfer.id, e.target.checked)
                          }
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-mono text-gray-900">
                            {transfer.id}
                          </p>
                          <p className="text-xs text-gray-500">
                            Ticker: {transfer.tickerId.substring(0, 16)}... |
                            Value: {formatAmount(transfer.value)} | Kind:{" "}
                            {transfer.kind}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={releaseLoading || selectedTransferIds.length === 0}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {releaseLoading ? (
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
                  Releasing...
                </span>
              ) : (
                `Release ${selectedTransferIds.length} Transfer${
                  selectedTransferIds.length !== 1 ? "s" : ""
                }`
              )}
            </button>
          </form>
        </div>
      )}

      {releaseError && (
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
            <p className="text-sm text-red-800 font-medium">
              Error: {releaseError}
            </p>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && releaseResponse && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowRequestModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Release Intent Request
              </h2>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-auto flex-1">
              <JsonViewer data={releaseResponse.request} title="Request" />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {releaseResponse && (
        <div>
          <JsonViewer
            data={releaseResponse.response}
            title="Release Intent Response"
          />
        </div>
      )}
    </div>
  );
}
