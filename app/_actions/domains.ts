"use server";

import { randomUUID } from "node:crypto";
import type {
  Core_ProposeIntentBody,
  Core_TrustedDomain,
  Core_TrustedDomainsCollection,
  GetDomainsQueryParams,
} from "@florent-uzio/custody";

import {
  getCustodySDK,
  getCurrentUser,
  proposeIntent,
  type ProposeIntentResult,
} from "@/app/lib/custody";
import { buildProposeIntent } from "@/app/lib/intent-builder";

type CreateDomainPayload = Extract<
  Core_ProposeIntentBody["request"]["payload"],
  { type: "v0_CreateDomain" }
>;

export type ProposeCreateDomainInput = {
  domainId: string;
  alias: string;
  description?: string;
  lock?: CreateDomainPayload["lock"];
  governingStrategy?: CreateDomainPayload["governingStrategy"];
  permissions?: CreateDomainPayload["permissions"];
  users?: CreateDomainPayload["users"];
};

export async function listDomains(
  filters: GetDomainsQueryParams = {},
): Promise<Core_TrustedDomainsCollection> {
  const sdk = getCustodySDK();
  return sdk.domains.list(filters);
}

export async function getDomain(domainId: string): Promise<Core_TrustedDomain> {
  if (!domainId) throw new Error("domainId is required");
  const sdk = getCustodySDK();
  return sdk.domains.get({ domainId });
}

export async function proposeCreateDomain(
  input: ProposeCreateDomainInput,
): Promise<ProposeIntentResult> {
  const {
    domainId,
    alias,
    description,
    lock = "Unlocked",
    governingStrategy,
    permissions,
    users,
  } = input;
  if (!domainId) throw new Error("domainId is required");
  if (!alias?.trim()) throw new Error("alias is required");

  const currentUser = await getCurrentUser(domainId);

  const payload: CreateDomainPayload = {
    id: randomUUID(),
    alias: alias.trim(),
    lock,
    permissions: permissions ?? {
      readAccess: {
        domains: [],
        users: [],
        endpoints: [],
        policies: [],
        accounts: [],
        transactions: [],
        requests: [],
        events: [],
      },
    },
    users: users ?? [],
    policies: [],
    customProperties: {},
    type: "v0_CreateDomain",
    ...(governingStrategy && { governingStrategy }),
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
