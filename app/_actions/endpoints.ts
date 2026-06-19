"use server";

import type {
  Core_TrustedEndpoint,
  Core_TrustedEndpointsCollection,
} from "@florent-uzio/custody";

import { getCustodySDK } from "@/app/lib/custody";

export async function listEndpoints(
  domainId: string,
): Promise<Core_TrustedEndpointsCollection> {
  if (!domainId) throw new Error("domainId is required");
  const sdk = getCustodySDK();
  return sdk.endpoints.list({ domainId });
}

export async function getEndpoint(
  domainId: string,
  endpointId: string,
): Promise<Core_TrustedEndpoint> {
  if (!domainId) throw new Error("domainId is required");
  if (!endpointId) throw new Error("endpointId is required");
  const sdk = getCustodySDK();
  return sdk.endpoints.get({ domainId, endpointId });
}
