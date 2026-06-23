"use client";

import { useMutation } from "@tanstack/react-query";
import { useDefaultDomain } from "../../contexts/DomainContext";
import {
  proposeCreateTicker,
  type ProposeCreateTickerInput,
} from "../../_actions/tickers";
import {
  TickerCreateForm,
  type TickerCreateResult,
} from "../components/TickerCreateForm";
import { JsonViewer } from "../../components/JsonViewer";
import {
  Page,
  PageHeader,
  PageContainer,
  PageHero,
  DomainWarning,
} from "../../components/layout";

export default function NewTickerPage() {
  const { defaultDomainId } = useDefaultDomain();

  const mutation = useMutation({
    mutationFn: (input: ProposeCreateTickerInput) => proposeCreateTicker(input),
  });

  const handleSubmit = (result: TickerCreateResult) => {
    mutation.mutate({ domainId: defaultDomainId!, ...result });
  };

  return (
    <Page>
      <PageHeader
        title="Create Ticker"
        subtitle="Tickers · Create"
        breadcrumbs={[{ label: "Tickers", href: "/tickers" }, { label: "Create" }]}
      />
      <PageContainer width="form">
        <PageHero
          theme="blue"
          icon="📊"
          title="Create Ticker"
          description="Propose a new ticker creation intent. A ticker defines a currency symbol and its associated metadata for use within a domain."
          badge={{ label: "Propose create ticker", note: "Creates a custody intent" }}
        />

        {!defaultDomainId && <DomainWarning action="creating a ticker" />}

        <TickerCreateForm
          submitting={mutation.isPending}
          disabled={!defaultDomainId}
          submitError={
            mutation.isError
              ? mutation.error instanceof Error
                ? mutation.error.message
                : "Failed to propose create ticker intent"
              : null
          }
          cancelHref="/tickers"
          onSubmit={handleSubmit}
        />

        {mutation.data && (
          <div className="mt-6 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
              Create ticker intent proposed. Intent ID:{" "}
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
