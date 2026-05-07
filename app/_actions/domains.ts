"use server";

import type {
  Core_TrustedDomain,
  Core_TrustedDomainsCollection,
  GetDomainsQueryParams,
} from "custody";

import { getCustodySDK } from "@/app/lib/custody";

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
