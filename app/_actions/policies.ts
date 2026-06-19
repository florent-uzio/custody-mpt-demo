"use server";

import { randomUUID } from "node:crypto";
import type {
  Core_ProposeIntentBody,
  Core_TrustedPoliciesCollection,
  Core_TrustedPolicy,
  GetPoliciesQueryParams,
} from "@florent-uzio/custody";

import {
  getCustodySDK,
  getCurrentUser,
  proposeIntent,
  type ProposeIntentResult,
} from "@/app/lib/custody";
import { buildProposeIntent } from "@/app/lib/intent-builder";

type CreatePolicyPayload = Extract<
  Core_ProposeIntentBody["request"]["payload"],
  { type: "v0_CreatePolicy" }
>;
type UpdatePolicyPayload = Extract<
  Core_ProposeIntentBody["request"]["payload"],
  { type: "v0_UpdatePolicy" }
>;

const SCRIPTING_ENGINE: CreatePolicyPayload["scriptingEngine"] = "Javascript_v0";

export type ProposeCreatePolicyInput = {
  domainId: string;
  alias: string;
  rank: number;
  scope: CreatePolicyPayload["scope"];
  intentTypes?: CreatePolicyPayload["intentTypes"];
  condition?: CreatePolicyPayload["condition"];
  workflow?: CreatePolicyPayload["workflow"];
  lock?: CreatePolicyPayload["lock"];
  description?: string;
  customProperties?: CreatePolicyPayload["customProperties"];
};

export type ProposeUpdatePolicyInput = {
  domainId: string;
  policyId: string;
  revision: number;
  alias: string;
  rank: number;
  scope: UpdatePolicyPayload["scope"];
  intentTypes?: UpdatePolicyPayload["intentTypes"];
  condition?: UpdatePolicyPayload["condition"];
  workflow?: UpdatePolicyPayload["workflow"];
  description?: string;
  customProperties?: UpdatePolicyPayload["customProperties"];
};

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
  if (filters.sortOrder)
    q.sortOrder = filters.sortOrder as PolicyQueryParams["sortOrder"];
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

export async function proposeCreatePolicy(
  input: ProposeCreatePolicyInput,
): Promise<ProposeIntentResult> {
  const {
    domainId,
    alias,
    rank,
    scope,
    intentTypes,
    condition,
    workflow,
    lock = "Unlocked",
    description,
    customProperties,
  } = input;
  if (!domainId) throw new Error("domainId is required");
  if (!alias?.trim()) throw new Error("alias is required");

  const currentUser = await getCurrentUser(domainId);

  const payload: CreatePolicyPayload = {
    id: randomUUID(),
    alias: alias.trim(),
    rank,
    scope,
    scriptingEngine: SCRIPTING_ENGINE,
    lock,
    customProperties: customProperties ?? {},
    type: "v0_CreatePolicy",
    ...(intentTypes && intentTypes.length > 0 && { intentTypes }),
    ...(condition && { condition }),
    ...(workflow && workflow.length > 0 && { workflow }),
    ...(description?.trim() && { description: description.trim() }),
  };

  const request = buildProposeIntent({
    author: { id: currentUser.userId, domainId: currentUser.domainId },
    targetDomainId: domainId,
    payload,
    ...(description?.trim() && { description: description.trim() }),
  });

  return proposeIntent(request);
}

export async function proposeUpdatePolicy(
  input: ProposeUpdatePolicyInput,
): Promise<ProposeIntentResult> {
  const {
    domainId,
    policyId,
    revision,
    alias,
    rank,
    scope,
    intentTypes,
    condition,
    workflow,
    description,
    customProperties,
  } = input;
  if (!domainId) throw new Error("domainId is required");
  if (!policyId) throw new Error("policyId is required");
  if (!alias?.trim()) throw new Error("alias is required");

  const currentUser = await getCurrentUser(domainId);

  const payload: UpdatePolicyPayload = {
    reference: { id: policyId, revision },
    alias: alias.trim(),
    rank,
    scope,
    scriptingEngine: SCRIPTING_ENGINE,
    customProperties: customProperties ?? {},
    type: "v0_UpdatePolicy",
    ...(intentTypes && intentTypes.length > 0 && { intentTypes }),
    ...(condition && { condition }),
    ...(workflow && workflow.length > 0 && { workflow }),
    ...(description?.trim() && { description: description.trim() }),
  };

  const request = buildProposeIntent({
    author: { id: currentUser.userId, domainId: currentUser.domainId },
    targetDomainId: domainId,
    payload,
    ...(description?.trim() && { description: description.trim() }),
  });

  return proposeIntent(request);
}
