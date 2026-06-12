"use client";

import { useState } from "react";
import { JsonViewer } from "../components/JsonViewer";
import { useAccounts } from "../hooks/useAccounts";
import { useSubmitTicketCreate } from "../hooks/useSubmitTicketCreate";
import { useDefaultDomain } from "../contexts/DomainContext";
import { useSidebarContext } from "../contexts/SidebarContext";
import {
  MAX_TICKET_COUNT,
  MIN_TICKET_COUNT,
} from "../components/TicketCreate.types";

export default function TicketsPage() {
  const { sidebarOpen, setSidebarOpen } = useSidebarContext();
  const { defaultDomainId } = useDefaultDomain();
  const { accounts, loading: accountsLoading } = useAccounts();
  const { mutate, isPending, data: response, error } = useSubmitTicketCreate();

  const [accountId, setAccountId] = useState("");
  const [ticketCount, setTicketCount] = useState(1);

  const countValid =
    Number.isInteger(ticketCount) &&
    ticketCount >= MIN_TICKET_COUNT &&
    ticketCount <= MAX_TICKET_COUNT;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defaultDomainId || !accountId || !countValid) return;

    mutate({
      accountId,
      domainId: defaultDomainId,
      ticketCount,
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center gap-3 flex-shrink-0 shadow-sm">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {sidebarOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tickets</h1>
          <p className="text-xs text-gray-500">XRPL · TicketCreate</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Hero */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
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
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">Create Tickets</h2>
            </div>
            <p className="text-blue-100 text-sm">
              Reserve sequence numbers on the XRP Ledger. A TicketCreate
              transaction sets aside ticket sequences that can later be used to
              submit transactions out of order.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="px-2 py-1 bg-white/20 rounded-full">
                TicketCreate
              </span>
              <span className="text-blue-200">
                Reserves {MIN_TICKET_COUNT}&ndash;{MAX_TICKET_COUNT} ticket
                sequences
              </span>
            </div>
          </div>

          {!defaultDomainId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-yellow-700">
                Set a <strong>Default Domain ID</strong> in the sidebar before
                creating tickets.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
                  1
                </span>
                Account
              </h3>

              <label
                htmlFor="account"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Source Account *
              </label>
              <select
                id="account"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                disabled={accountsLoading || accounts.length === 0}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-400"
                required
              >
                <option value="">
                  {accountsLoading
                    ? "Loading accounts..."
                    : accounts.length === 0
                      ? "No accounts found"
                      : "Select an account"}
                </option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.alias} ({account.id})
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gray-500">
                The account that will own the reserved ticket sequences.
              </p>
            </div>

            {/* Ticket Count */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
                  2
                </span>
                Ticket Count
              </h3>

              <label
                htmlFor="ticketCount"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Number of tickets *
              </label>
              <input
                type="number"
                id="ticketCount"
                value={Number.isNaN(ticketCount) ? "" : ticketCount}
                onChange={(e) => setTicketCount(e.target.valueAsNumber)}
                min={MIN_TICKET_COUNT}
                max={MAX_TICKET_COUNT}
                step={1}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              />
              <p className="mt-2 text-xs text-gray-500">
                How many ticket sequences to reserve ({MIN_TICKET_COUNT}&ndash;
                {MAX_TICKET_COUNT}).
              </p>
              {!countValid && (
                <p className="mt-2 text-xs text-red-600">
                  Enter a whole number between {MIN_TICKET_COUNT} and{" "}
                  {MAX_TICKET_COUNT}.
                </p>
              )}
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-700 mb-3 text-sm">
                Configuration Summary
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block text-xs">Domain ID</span>
                  <span className="font-mono text-xs text-gray-800 truncate block">
                    {defaultDomainId || "Not set"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Account</span>
                  <span className="font-mono text-xs text-gray-800 truncate block">
                    {accountId || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">
                    Ticket Count
                  </span>
                  <span className="font-mono text-gray-800">
                    {countValid ? ticketCount : "—"}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={
                isPending || !defaultDomainId || !accountId || !countValid
              }
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
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
                  Creating Tickets...
                </span>
              ) : (
                "Create Tickets"
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
      </div>
    </div>
  );
}
