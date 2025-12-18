"use client";

import { useState, useEffect } from "react";
import { JsonViewer } from "./JsonViewer";
import {
  getSubmittedIntents,
  updateIntentIntentId,
  clearSubmittedIntents,
  type SubmittedIntent,
} from "../utils/intentStorage";

const DEFAULT_DOMAIN_ID = "5cd224fe-193e-8bce-c94c-c6c05245e2d1";

export function SubmittedIntentsTab() {
  const [intents, setIntents] = useState<SubmittedIntent[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingIntentIds, setFetchingIntentIds] = useState<Set<string>>(
    new Set()
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadIntents();
  }, []);

  const loadIntents = () => {
    const storedIntents = getSubmittedIntents();
    setIntents(storedIntents);
    // Fetch intentIds for intents that don't have them
    storedIntents.forEach((intent) => {
      if (!intent.intentId && !fetchingIntentIds.has(intent.id)) {
        fetchIntentId(intent);
      }
    });
  };

  const fetchIntentId = async (intent: SubmittedIntent) => {
    if (fetchingIntentIds.has(intent.id)) return;
    
    setFetchingIntentIds((prev) => new Set(prev).add(intent.id));

    try {
      const res = await fetch("/api/requests/state", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: intent.requestId,
          domainId: DEFAULT_DOMAIN_ID,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        // Extract intentId from the response
        // The structure may vary, but typically it's in result.intentId or result.data.intentId
        const intentId =
          result?.intentId ||
          result?.data?.intentId ||
          result?.intent?.id ||
          null;

        if (intentId) {
          updateIntentIntentId(intent.id, intentId);
          setIntents((prev) =>
            prev.map((i) =>
              i.id === intent.id ? { ...i, intentId } : i
            )
          );
        }
      }
    } catch (err) {
      console.error(`Failed to fetch intentId for ${intent.requestId}:`, err);
    } finally {
      setFetchingIntentIds((prev) => {
        const next = new Set(prev);
        next.delete(intent.id);
        return next;
      });
    }
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all submitted intents?")) {
      clearSubmittedIntents();
      setIntents([]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Submitted Intents History
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Track all intents you've submitted through the app
            </p>
          </div>
          {intents.length > 0 && (
            <button
              onClick={handleClear}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {intents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No submitted intents yet</p>
            <p className="text-sm mt-2">
              Submit an intent from the Intents or MPT Payment tab to see it
              here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Intent ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {intents.map((intent) => (
                  <tr key={intent.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          intent.type === "MPTAuthorize"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {intent.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono text-gray-900 break-all max-w-xs">
                          {intent.requestId}
                        </p>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              intent.requestId,
                              `request-${intent.id}`
                            )
                          }
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy Request ID"
                        >
                          {copiedId === `request-${intent.id}` ? (
                            <svg
                              className="w-4 h-4 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {fetchingIntentIds.has(intent.id) ? (
                        <span className="text-sm text-gray-400">
                          Loading...
                        </span>
                      ) : intent.intentId ? (
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono text-gray-900 break-all max-w-xs">
                            {intent.intentId}
                          </p>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                intent.intentId!,
                                `intent-${intent.id}`
                              )
                            }
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Copy Intent ID"
                          >
                            {copiedId === `intent-${intent.id}` ? (
                              <svg
                                className="w-4 h-4 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">-</span>
                          <button
                            onClick={() => fetchIntentId(intent)}
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            Fetch
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm text-gray-500">
                        {formatDate(intent.submittedAt)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

