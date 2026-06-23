"use client";

import { useParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useTicker } from "../../../hooks/useTickers";
import { useDefaultDomain } from "../../../contexts/DomainContext";
import {
  proposeUpdateTicker,
  type ProposeUpdateTickerInput,
} from "../../../_actions/tickers";
import {
  TickerEditForm,
  type TickerEditInitial,
  type TickerEditResult,
} from "../../components/TickerEditForm";
import { JsonViewer } from "../../../components/JsonViewer";
import {
  Page,
  PageHeader,
  PageContainer,
  PageHero,
  DomainWarning,
} from "../../../components/layout";

export default function EditTickerPage() {
  const params = useParams();
  const tickerId = params.id as string;
  const { defaultDomainId } = useDefaultDomain();

  const detailHref = `/tickers/${tickerId}`;

  const { data: ticker, isLoading, isError, error } = useTicker(tickerId);
  const data = ticker?.data;
  const revision = data?.metadata?.revision;

  const mutation = useMutation({
    mutationFn: (input: ProposeUpdateTickerInput) => proposeUpdateTicker(input),
  });

  const handleSubmit = (result: TickerEditResult) => {
    if (revision === undefined) return;
    mutation.mutate({
      domainId: defaultDomainId!,
      reference: { id: tickerId, revision },
      ...result,
    });
  };

  const initial: TickerEditInitial | undefined = data
    ? {
        name: data.name,
        decimals: data.decimals,
        symbol: data.symbol,
        description: data.metadata?.description,
        customProperties: data.metadata?.customProperties,
      }
    : undefined;

  return (
    <Page>
      <PageHeader
        title="Edit Ticker"
        subtitle="Tickers · Edit"
        breadcrumbs={[{ label: "Tickers", href: "/tickers" }, { label: "Edit" }]}
      />
      <PageContainer width="form">
        <PageHero
          theme="blue"
          icon="📊"
          title="Propose Update Ticker"
          description="Propose an update to an existing ticker. Changes will be submitted as an intent for review."
          badge={{
            label: data?.name ?? "Edit Ticker",
            note: revision !== undefined ? `revision ${revision}` : undefined,
          }}
        />

        {!defaultDomainId && <DomainWarning action="editing a ticker" />}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <svg
              className="animate-spin w-8 h-8 text-blue-500"
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
            <p className="text-gray-500 text-sm">Loading ticker…</p>
          </div>
        )}

        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-700">
                Error loading ticker
              </p>
              <p className="text-sm text-red-600 mt-0.5">
                {error instanceof Error ? error.message : "An error occurred"}
              </p>
            </div>
          </div>
        )}

        {ticker && initial && !isLoading && (
          <TickerEditForm
            initial={initial}
            submitting={mutation.isPending}
            disabled={!defaultDomainId || revision === undefined}
            disabledReason={
              revision === undefined
                ? "This ticker has no revision, so it can't be updated."
                : null
            }
            submitError={
              mutation.isError
                ? mutation.error instanceof Error
                  ? mutation.error.message
                  : "Failed to propose update ticker intent"
                : null
            }
            cancelHref={detailHref}
            onSubmit={handleSubmit}
          />
        )}

        {mutation.data && (
          <div className="mt-6 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
              Update ticker intent proposed. Intent ID:{" "}
              <span className="font-mono">
                {mutation.data.request.request.id}
              </span>
            </div>
            <JsonViewer
              data={mutation.data.request}
              title="Proposed intent (request)"
            />
            <JsonViewer data={mutation.data.response} title="Response" />
          </div>
        )}
      </PageContainer>
    </Page>
  );
}
