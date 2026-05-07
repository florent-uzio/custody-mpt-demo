"use server";

import type {
  Core_ApiTicker,
  Core_TickersCollection,
  GetTickersQueryParams,
} from "custody";

import { getCustodySDK } from "@/app/lib/custody";

export type TickerFilters = {
  ledgerIds?: string[];
  limit?: number;
  startingAfter?: string;
  sortBy?: string;
  sortOrder?: string;
  kind?: string;
  names?: string[];
  symbols?: string[];
  validationStatus?: string;
  locks?: string[];
};

type TickerQueryParams = NonNullable<GetTickersQueryParams>;

function buildTickerQueryParams(filters: TickerFilters): TickerQueryParams {
  const q: TickerQueryParams = {};
  if (filters.ledgerIds?.length) q.ledgerId = filters.ledgerIds;
  if (filters.limit !== undefined) q.limit = filters.limit;
  if (filters.startingAfter) q.startingAfter = filters.startingAfter;
  if (filters.sortBy) q.sortBy = filters.sortBy as TickerQueryParams["sortBy"];
  if (filters.sortOrder) q.sortOrder = filters.sortOrder as TickerQueryParams["sortOrder"];
  if (filters.kind) q.kind = filters.kind as TickerQueryParams["kind"];
  if (filters.names?.length) q.name = filters.names;
  if (filters.symbols?.length) q.symbol = filters.symbols;
  if (filters.validationStatus)
    q.validationStatus = filters.validationStatus as TickerQueryParams["validationStatus"];
  if (filters.locks?.length) q.lock = filters.locks as TickerQueryParams["lock"];
  return q;
}

export async function listTickers(
  filters: TickerFilters = {},
): Promise<Core_TickersCollection> {
  const sdk = getCustodySDK();
  return sdk.tickers.list(buildTickerQueryParams(filters));
}

export async function getTicker(tickerId: string): Promise<Core_ApiTicker> {
  if (!tickerId) throw new Error("tickerId is required");
  const sdk = getCustodySDK();
  return sdk.tickers.get({ tickerId });
}
