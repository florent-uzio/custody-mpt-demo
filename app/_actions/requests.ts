"use server";

import type {
  Core_RequestState,
  GetAllUserRequestsStateInDomainQueryParams,
  GetAllUserRequestsStateQueryParams,
} from "custody";

import { getCustodySDK } from "@/app/lib/custody";

export type RequestStatesFilters = {
  limit?: number;
  startingAfter?: string;
  sortBy?: string;
  sortOrder?: string;
};

function buildUserStatesQueryParams(
  filters: RequestStatesFilters,
): GetAllUserRequestsStateQueryParams {
  const q: GetAllUserRequestsStateQueryParams = {};
  if (filters.limit !== undefined) q.limit = filters.limit;
  if (filters.startingAfter) q.startingAfter = filters.startingAfter;
  if (filters.sortBy === "id") q.sortBy = filters.sortBy;
  if (filters.sortOrder === "ASC" || filters.sortOrder === "DESC")
    q.sortOrder = filters.sortOrder;
  return q;
}

function buildUserStatesInDomainQueryParams(
  filters: RequestStatesFilters,
): GetAllUserRequestsStateInDomainQueryParams {
  const q: GetAllUserRequestsStateInDomainQueryParams = {};
  if (filters.limit !== undefined) q.limit = filters.limit;
  if (filters.startingAfter) q.startingAfter = filters.startingAfter;
  if (filters.sortBy === "id") q.sortBy = filters.sortBy;
  if (filters.sortOrder === "ASC" || filters.sortOrder === "DESC")
    q.sortOrder = filters.sortOrder;
  return q;
}

export async function getRequestState(
  domainId: string,
  requestId: string,
): Promise<Core_RequestState> {
  if (!domainId) throw new Error("domainId is required");
  if (!requestId) throw new Error("requestId is required");
  const sdk = getCustodySDK();
  return sdk.requests.state({ domainId, requestId });
}

export async function listUserRequestStates(
  filters: RequestStatesFilters = {},
) {
  const sdk = getCustodySDK();
  return sdk.requests.userStates(buildUserStatesQueryParams(filters));
}

export async function listUserRequestStatesInDomain(
  domainId: string,
  filters: RequestStatesFilters = {},
) {
  if (!domainId) throw new Error("domainId is required");
  const sdk = getCustodySDK();
  return sdk.requests.userStatesInDomain(
    { domainId },
    buildUserStatesInDomainQueryParams(filters),
  );
}
