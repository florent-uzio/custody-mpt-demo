"use client";

import { useState } from "react";
import { JsonViewer } from "./JsonViewer";

const DEFAULT_LEDGER_ID = "xrpl-testnet-august-2024";

interface TickerItem {
  id: string;
  ledgerId: string;
  kind: string;
  name: string;
  decimals?: number;
  symbol?: string;
  ledgerDetails: {
    properties: {
      issuanceId?: string;
      type?: string;
    };
    type: string;
  };
  data: {
    id: string;
    ledgerId: string;
    kind: string;
    name: string;
    decimals?: number;
    symbol?: string;
    ledgerDetails: {
      properties: {
        issuanceId?: string;
        type?: string;
      };
      type: string;
    };
    lock: string;
    metadata: unknown;
  };
  signature?: string | null;
}

interface TickersResponse {
  items: TickerItem[];
  count: number;
  currentStartingAfter?: string | null;
  nextStartingAfter?: string | null;
}

export function TickersTab() {
  const [ledgerId, setLedgerId] = useState(DEFAULT_LEDGER_ID);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<TickersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/tickers/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ledgerIds: [ledgerId],
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to list tickers");
      }

      const result = await res.json();
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const isMultiPurposeToken = (ticker: TickerItem) => {
    return (
      ticker.data.ledgerDetails?.properties?.type === "MultiPurposeToken" ||
      ticker.ledgerDetails?.properties?.type === "MultiPurposeToken"
    );
  };

  const getIssuanceId = (ticker: TickerItem) => {
    return (
      ticker.data.ledgerDetails?.properties?.issuanceId ||
      ticker.ledgerDetails?.properties?.issuanceId ||
      null
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tickers</h2>
        <p className="text-sm text-gray-600 mb-6">
          View available tickers for a specific ledger.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="ledgerId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Ledger ID
            </label>
            <input
              type="text"
              id="ledgerId"
              value={ledgerId}
              onChange={(e) => setLedgerId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="Enter ledger ID (e.g., xrpl-testnet-august-2024)"
              required
            />
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
              "Get Tickers"
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
            Tickers ({response.count} {response.count === 1 ? "item" : "items"})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {response.items.map((ticker) => (
              <div
                key={ticker.data.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Name
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {ticker.data.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Symbol
                      </p>
                      <p className="text-sm font-mono text-gray-900">
                        {ticker.data.symbol || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Kind
                      </p>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          ticker.data.kind === "Native"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {ticker.data.kind}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Decimals
                      </p>
                      <p className="text-sm text-gray-900">
                        {ticker.data.decimals ?? "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Lock
                      </p>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          ticker.data.lock === "Unlocked"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {ticker.data.lock}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Ticker ID
                    </p>
                    <p className="text-xs font-mono text-gray-600 break-all">
                      {ticker.data.id}
                    </p>
                  </div>

                  {isMultiPurposeToken(ticker) && getIssuanceId(ticker) && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        MPT Issuance ID
                      </p>
                      <a
                        href={`https://testnet.xrpl.org/mpt/${getIssuanceId(
                          ticker
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-blue-600 hover:text-blue-800 break-all underline"
                      >
                        {getIssuanceId(ticker)}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {response && response.items && response.items.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            No tickers found for the specified ledger.
          </p>
        </div>
      )}

      {response && (
        <div>
          <JsonViewer data={response} title="Full Tickers Response" />
        </div>
      )}
    </div>
  );
}
