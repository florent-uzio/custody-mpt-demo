"use client";

import { useState } from "react";
import { JsonViewer } from "../../../components/JsonViewer";
import { CopyButton } from "../../../components/CopyButton";
import { useDefaultDomain } from "../../../contexts/DomainContext";
import { useLedgerConfig } from "../../../hooks/useLedgerConfig";
import {
  useCmptComputeStatus,
  useInitiateCmptCompute,
} from "../../../hooks/useCmptCompute";
import type { CmptWaitOptions } from "../../../_actions/cmpt-compute";
import {
  Page,
  PageHeader,
  PageContainer,
  PageHero,
  SectionCard,
  ErrorBanner,
  DomainWarning,
} from "../../../components/layout";
import {
  AccountField,
  CMPT_INPUT,
  Field,
  TextField,
} from "../../../components/confidential-mpt/Fields";

/** `{ cmptComputeId }` from an initiate, `{ compute: { id } }` from an …AndWait. */
function computeIdOf(result: unknown): string | undefined {
  if (!result || typeof result !== "object") return undefined;
  const r = result as { cmptComputeId?: string; compute?: { id?: string } };
  return r.cmptComputeId ?? r.compute?.id;
}

function WaitControls({
  wait,
  onWaitChange,
  options,
  onOptionsChange,
  label,
}: {
  wait: boolean;
  onWaitChange: (wait: boolean) => void;
  options: CmptWaitOptions;
  onOptionsChange: (next: CmptWaitOptions) => void;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <input
          type="checkbox"
          checked={wait}
          onChange={(e) => onWaitChange(e.target.checked)}
        />
        {label}
      </label>
      {wait && (
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Max retries (default 10)
            </label>
            <input
              type="number"
              min={1}
              value={options.maxRetries ?? ""}
              onChange={(e) =>
                onOptionsChange({
                  ...options,
                  maxRetries: e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Interval ms (default 3000)
            </label>
            <input
              type="number"
              min={100}
              value={options.intervalMs ?? ""}
              onChange={(e) =>
                onOptionsChange({
                  ...options,
                  intervalMs: e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function CmptComputePage() {
  const { defaultDomainId } = useDefaultDomain();
  const { ledgerIds, defaultLedgerId } = useLedgerConfig();

  const initiate = useInitiateCmptCompute();
  const status = useCmptComputeStatus();

  // ── Initiate ──
  const [accountId, setAccountId] = useState("");
  const [issuanceId, setIssuanceId] = useState("");
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [ticketSequence, setTicketSequence] = useState("");
  const [ledgerId, setLedgerId] = useState<string>();
  const [initiateWait, setInitiateWait] = useState(true);
  const [initiateOptions, setInitiateOptions] = useState<CmptWaitOptions>({});

  // ── Status ──
  const [computeId, setComputeId] = useState("");
  const [statusWait, setStatusWait] = useState(false);
  const [statusOptions, setStatusOptions] = useState<CmptWaitOptions>({});

  const selectedLedgerId = ledgerId ?? defaultLedgerId;

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defaultDomainId) return;
    initiate.mutate(
      {
        input: {
          domainId: defaultDomainId,
          accountId,
          tokenIdentifier: { issuanceId },
          amount,
          ledgerId: selectedLedgerId,
          ...(destination.trim() && { destination: destination.trim() }),
          ...(ticketSequence.trim() && {
            ticketSequence: Number(ticketSequence),
          }),
        },
        wait: initiateWait,
        options: initiateWait ? initiateOptions : undefined,
      },
      {
        onSuccess: (result) => {
          const id = computeIdOf(result);
          if (id) setComputeId(id);
        },
      },
    );
  };

  const handleStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defaultDomainId) return;
    status.mutate({
      input: { domainId: defaultDomainId, accountId, computeId },
      wait: statusWait,
      options: statusWait ? statusOptions : undefined,
    });
  };

  return (
    <Page>
      <PageHeader
        title="cMPT Compute"
        subtitle="XRPL · Confidential MPT cryptographic computation"
      />
      <PageContainer width="detail">
        <PageHero
          theme="slate"
          icon="🧮"
          title="cMPT Compute"
          description="Ask the Custody service to compute the ciphertexts and zero-knowledge proof for a confidential MPT operation, then poll for the result. The returned cryptographicFields feed the Advanced section of cMPT Send and the batch workbench."
          badge={{
            label: "initiateCmptCompute · getCmptComputeStatus",
            note: "Each step also has an …AndWait variant",
          }}
        />

        {!defaultDomainId && <DomainWarning action="running a cMPT compute" />}

        <SectionCard step={1} theme="slate" title="Initiate a computation">
          <form onSubmit={handleInitiate} className="space-y-4">
            <AccountField
              value={accountId}
              onChange={setAccountId}
              help="Also used as the account for the status lookup below."
            />

            <TextField
              label="MPT Issuance ID"
              value={issuanceId}
              onChange={setIssuanceId}
              placeholder="00CA8BD9F2582AF39B51725D510C5401ED4495ECFB250591"
              required
              help="The compute endpoint takes a resolved identifier — issuance ID only, no ticker."
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <TextField
                label="Amount"
                value={amount}
                onChange={setAmount}
                placeholder="1000"
                required
              />
              <Field label="Ledger">
                <select
                  value={selectedLedgerId}
                  onChange={(e) => setLedgerId(e.target.value)}
                  className={`${CMPT_INPUT} bg-white`}
                >
                  {ledgerIds.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <TextField
                label="Destination address (optional)"
                value={destination}
                onChange={setDestination}
                placeholder="r…"
                help="Set it for a Send computation; leave blank for Convert / Convert Back."
              />
              <TextField
                label="Ticket sequence (optional)"
                value={ticketSequence}
                onChange={setTicketSequence}
                type="number"
              />
            </div>

            <WaitControls
              wait={initiateWait}
              onWaitChange={setInitiateWait}
              options={initiateOptions}
              onOptionsChange={setInitiateOptions}
              label="Wait for a terminal status (initiateCmptComputeAndWait)"
            />

            <button
              type="submit"
              disabled={!defaultDomainId || initiate.isPending}
              className="w-full px-6 py-3 bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800 text-white rounded-xl font-semibold disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {initiate.isPending
                ? initiateWait
                  ? "Computing and waiting…"
                  : "Initiating…"
                : initiateWait
                  ? "Initiate and wait"
                  : "Initiate"}
            </button>
          </form>

          <ErrorBanner error={initiate.error} />

          {initiate.data && (
            <div className="mt-4">
              <JsonViewer
                data={initiate.data}
                title={
                  initiateWait
                    ? "initiateCmptComputeAndWait result"
                    : "initiateCmptCompute response"
                }
              />
            </div>
          )}
        </SectionCard>

        <SectionCard step={2} theme="slate" title="Check a computation's status">
          <form onSubmit={handleStatus} className="space-y-4">
            <Field
              label="Compute ID"
              help="Prefilled from step 1; paste an earlier computation's ID to poll it instead."
            >
              <div className="flex items-center gap-2">
                <input
                  value={computeId}
                  onChange={(e) => setComputeId(e.target.value)}
                  placeholder="Compute UUID"
                  required
                  className={`${CMPT_INPUT} font-mono text-sm`}
                />
                {computeId && <CopyButton text={computeId} />}
              </div>
            </Field>

            <WaitControls
              wait={statusWait}
              onWaitChange={setStatusWait}
              options={statusOptions}
              onOptionsChange={setStatusOptions}
              label="Poll until terminal (getCmptComputeStatusAndWait)"
            />

            <button
              type="submit"
              disabled={!defaultDomainId || status.isPending}
              className="w-full px-6 py-3 bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800 text-white rounded-xl font-semibold disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {status.isPending
                ? statusWait
                  ? "Polling…"
                  : "Fetching…"
                : statusWait
                  ? "Get status and wait"
                  : "Get status"}
            </button>
          </form>

          <ErrorBanner error={status.error} />

          {status.data && (
            <div className="mt-4">
              <JsonViewer
                data={status.data}
                title={
                  statusWait
                    ? "getCmptComputeStatusAndWait result"
                    : "getCmptComputeStatus response"
                }
              />
            </div>
          )}
        </SectionCard>
      </PageContainer>
    </Page>
  );
}
