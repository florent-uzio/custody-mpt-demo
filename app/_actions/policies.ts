"use server";

import type {
  Core_TrustedPoliciesCollection,
  Core_TrustedPolicy,
  GetPoliciesQueryParams,
} from "custody";

import { getCustodySDK } from "@/app/lib/custody";

export type PolicyFilters = {
  limit?: number;
  startingAfter?: string;
  sortBy?: string;
  sortOrder?: string;
  scope?: string;
  lock?: string[];
};

type PolicyQueryParams = NonNullable<GetPoliciesQueryParams>;

function buildPolicyQueryParams(filters: PolicyFilters): PolicyQueryParams {
  const q: PolicyQueryParams = {};
  if (filters.limit !== undefined) q.limit = filters.limit;
  if (filters.startingAfter) q.startingAfter = filters.startingAfter;
  if (filters.sortBy) q.sortBy = filters.sortBy as PolicyQueryParams["sortBy"];
  if (filters.sortOrder) q.sortOrder = filters.sortOrder as PolicyQueryParams["sortOrder"];
  if (filters.scope) q.scope = filters.scope as PolicyQueryParams["scope"];
  if (filters.lock?.length) q.lock = filters.lock as PolicyQueryParams["lock"];
  return q;
}

export async function listPolicies(
  domainId: string,
  filters: PolicyFilters = {},
): Promise<Core_TrustedPoliciesCollection> {
  if (!domainId) throw new Error("domainId is required");
  const sdk = getCustodySDK();
  return sdk.policies.list({ domainId }, buildPolicyQueryParams(filters));
}

export async function getPolicy(
  domainId: string,
  policyId: string,
): Promise<Core_TrustedPolicy> {
  if (!domainId) throw new Error("domainId is required");
  if (!policyId) throw new Error("policyId is required");
  const sdk = getCustodySDK();
  return sdk.policies.get({ domainId, policyId });
}
