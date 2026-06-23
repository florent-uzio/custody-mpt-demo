"use client";

import { useState } from "react";
import { JsonViewer } from "../components/JsonViewer";
import { useAccounts } from "../hooks/useAccounts";
import { useSubmitTicketCreate } from "../hooks/useSubmitTicketCreate";
import { useDefaultDomain } from "../contexts/DomainContext";
import {
  MAX_TICKET_COUNT,
  MIN_TICKET_COUNT,
} from "../components/TicketCreate.types";
import {
  Page,
  PageHeader,
  PageContainer,
  PageHero,
  SectionCard,
  SubmitButton,
  ErrorBanner,
  DomainWarning,
} from "../components/layout";

export default function TicketsPage() {
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
    <Page>
      <PageHeader title="Tickets" subtitle="XRPL · TicketCreate" />
      <PageContainer width="form">
        <PageHero
          theme="blue"
          icon="🎟️"
          title="Create Tickets"
          description="Reserve sequence numbers on the XRP Ledger. A TicketCreate transaction sets aside ticket sequences that can later be used to submit transactions out of order."
          badge={{
            label: "TicketCreate",
            note: `Reserves ${MIN_TICKET_COUNT}–${MAX_TICKET_COUNT} ticket sequences`,
          }}
        />

        {!defaultDomainId && <DomainWarning action="creating tickets" />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <SectionCard step={1} title="Account" theme="blue">
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
          </SectionCard>

          <SectionCard step={2} title="Ticket Count" theme="blue">
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
          </SectionCard>

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

          <SubmitButton
            theme="blue"
            pending={isPending}
            disabled={isPending || !defaultDomainId || !accountId || !countValid}
            pendingLabel="Creating Tickets..."
          >
            Create Tickets
          </SubmitButton>
        </form>

        <ErrorBanner error={error} />

        {response && (
          <div className="space-y-4">
            <JsonViewer data={response.request} title="Request Payload" />
            <JsonViewer data={response.response} title="API Response" />
          </div>
        )}
      </PageContainer>
    </Page>
  );
}
