"use server";

import type {
  Core_TransactionDetails,
  Core_TransactionsCollection,
  Core_TransfersCollection,
  GetTransactionsQueryParams,
} from "custody";

import { getCustodySDK } from "@/app/lib/custody";

export type TransactionsFilters = {
  accountId?: string;
  ledgerId?: string;
  sortBy?: string;
  limit?: number;
};

export type TransfersFilters = {
  kind?: "Transfer" | "Fee" | "Recovery";
  quarantined?: boolean;
};

type TransactionsQueryParams = NonNullable<GetTransactionsQueryParams>;

function buildTransactionsQueryParams(
  filters: TransactionsFilters,
): TransactionsQueryParams {
  const q: TransactionsQueryParams = {};
  if (filters.sortBy)
    q.sortBy = filters.sortBy as TransactionsQueryParams["sortBy"];
  if (filters.accountId) q.accountId = filters.accountId;
  if (filters.ledgerId) q.ledgerId = filters.ledgerId;
  if (filters.limit) q.limit = filters.limit;
  return q;
}

export async function listTransactions(
  domainId: string,
  filters: TransactionsFilters = {},
): Promise<Core_TransactionsCollection> {
  if (!domainId) throw new Error("domainId is required");
  const sdk = getCustodySDK();
  return sdk.transactions.transactions(
    { domainId },
    buildTransactionsQueryParams(filters),
  );
}

export async function getTransaction(
  domainId: string,
  transactionId: string,
): Promise<Core_TransactionDetails> {
  if (!domainId) throw new Error("domainId is required");
  if (!transactionId) throw new Error("transactionId is required");
  const sdk = getCustodySDK();
  return sdk.transactions.transaction({ domainId, transactionId });
}

export async function listTransfers(
  domainId: string,
  filters: TransfersFilters = {},
): Promise<Core_TransfersCollection> {
  if (!domainId) throw new Error("domainId is required");
  const sdk = getCustodySDK();
  const q: { kind?: TransfersFilters["kind"]; quarantined?: boolean } = {};
  if (filters.kind) q.kind = filters.kind;
  if (filters.quarantined !== undefined) q.quarantined = filters.quarantined;
  return sdk.transactions.transfers({ domainId }, q);
}
