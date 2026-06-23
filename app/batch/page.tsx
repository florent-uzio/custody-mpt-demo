"use client";

import { BatchWorkbench } from "../components/batch/BatchWorkbench";
import {
  Page,
  PageHeader,
  PageHero,
  PageContainer,
} from "../components/layout";

export default function BatchPage() {
  return (
    <Page>
      <PageHeader title="Batch" subtitle="XRPL · Batch" />
      <PageContainer width="detail">
        <PageHero
          theme="amber"
          icon="📦"
          title="Batch"
          description="Compose and submit a batch of inner transactions on the XRP Ledger."
          badge={{ label: "Batch", note: "XRPL native batch transaction" }}
        />
        <BatchWorkbench />
      </PageContainer>
    </Page>
  );
}
