"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useTicker } from "../../../hooks/useTickers";
import { useDefaultDomain } from "../../../contexts/DomainContext";
import { useSidebarContext } from "../../../contexts/SidebarContext";
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

export default function EditTickerPage() {
  const params = useParams();
  const tickerId = params.id as string;
  const { defaultDomainId } = useDefaultDomain();
  const { sidebarOpen, setSidebarOpen } = useSidebarContext();

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
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 shadow-md flex-shrink-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-start gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mt-0.5 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
              aria-label="Toggle sidebar"
            >
              <svg
                className="w-4 h-4"
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
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href="/tickers"
                  className="text-white/60 hover:text-white text-xs font-medium transition-colors"
                >
                  Tickers
                </Link>
                <span className="text-white/40 text-xs">/</span>
                <Link
                  href={detailHref}
                  className="text-white/60 hover:text-white text-xs font-medium transition-colors"
                >
                  Detail
                </Link>
                <span className="text-white/40 text-xs">/</span>
                <span className="text-white/80 text-xs font-medium">Edit</span>
              </div>
              <h1 className="text-white text-lg font-semibold">
                Propose update ticker
              </h1>
              {data && (
                <p className="text-white/70 text-xs mt-1 font-medium">
                  {data.name}
                  {revision !== undefined && <> · revision {revision}</>}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!defaultDomainId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3 mb-6">
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
                updating a ticker.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <svg
                className="animate-spin w-8 h-8 text-amber-500"
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
        </main>
      </div>
    </div>
  );
}
