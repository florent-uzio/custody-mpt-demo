"use client";

import { useState } from "react";
import { JsonViewer } from "./JsonViewer";
import { useAccounts } from "../hooks/useAccounts";
import { saveSubmittedIntent } from "../utils/intentStorage";
import { DEFAULT_ACCOUNT_ID } from "../config/defaults";

const DOMAIN_ID = "5cd224fe-193e-8bce-c94c-c6c05245e2d1";
const CURRENT_USER_ID = "6ac20654-450e-29e4-65e2-1bdecb7db7c4";

export function IntentsTab() {
  const { accounts, loading: accountsLoading } = useAccounts();
  const [issuanceId, setIssuanceId] = useState("");
  const [accountId, setAccountId] = useState(DEFAULT_ACCOUNT_ID);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  // Get Intent state
  const [intentId, setIntentId] = useState("");
  const [getLoading, setGetLoading] = useState(false);
  const [getResponse, setGetResponse] = useState<unknown>(null);
  const [getError, setGetError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/intents/propose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          issuanceId,
          accountId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to propose intent");
      }

      const result = await res.json();
      setResponse(result);

      // Save to localStorage if we have a requestId
      // The response from custody.intents.propose typically has an 'id' field
      const requestId = result?.id || result?.requestId || result?.data?.id;
      if (requestId) {
        saveSubmittedIntent({
          type: "MPTAuthorize",
          requestId: requestId,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGetIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    setGetLoading(true);
    setGetError(null);
    setGetResponse(null);

    try {
      const res = await fetch("/api/intents/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intentId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to get intent");
      }

      const result = await res.json();
      setGetResponse(result);
    } catch (err) {
      setGetError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setGetLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Propose MPT Authorize Intent
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Create an intent to authorize a Multi-Purpose Token (MPT) for your
          account.
        </p>
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
                accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.alias} ({account.id})
                  </option>
                ))
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
                  {DOMAIN_ID}
                </span>
              </div>
              <div>
                <span className="text-gray-600">User ID:</span>
                <span className="ml-2 font-mono text-xs text-gray-800">
                  {CURRENT_USER_ID}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Ledger:</span>
                <span className="ml-2 text-gray-800">
                  xrpl-testnet-august-2024
                </span>
              </div>
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
                Proposing Intent...
              </span>
            ) : (
              "Propose Intent"
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

      {response !== null && (
        <div>
          <JsonViewer data={response} title="Intent Proposal Response" />
        </div>
      )}

      {/* Get Intent Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Get Intent</h2>
        <p className="text-sm text-gray-600 mb-6">
          Retrieve an intent by its ID to view its current state and details.
        </p>
        <form onSubmit={handleGetIntent} className="space-y-4">
          <div>
            <label
              htmlFor="intentId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Intent ID
            </label>
            <input
              type="text"
              id="intentId"
              value={intentId}
              onChange={(e) => setIntentId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="Enter Intent ID"
              required
            />
          </div>

          <button
            type="submit"
            disabled={getLoading}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {getLoading ? (
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
              "Get Intent"
            )}
          </button>
        </form>
      </div>

      {getError && (
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
              Error: {getError}
            </p>
          </div>
        </div>
      )}

      {getResponse !== null && (
        <div>
          <JsonViewer data={getResponse} title="Intent Details" />
        </div>
      )}
    </div>
  );
}
