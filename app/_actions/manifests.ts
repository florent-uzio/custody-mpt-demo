"use server";

import type {
  Core_ApiManifest,
  Core_ManifestsCollection,
  GetManifestsQueryParams,
} from "custody";

import { getCustodySDK } from "@/app/lib/custody";

export type ManifestFilters = {
  limit?: number;
  startingAfter?: string;
  sortBy?: string;
  sortOrder?: string;
  contentType?: string[];
  processingStatus?: string;
};

type ManifestQueryParams = NonNullable<GetManifestsQueryParams>;

function buildManifestQueryParams(filters: ManifestFilters): ManifestQueryParams {
  const q: ManifestQueryParams = {};
  if (filters.limit !== undefined) q.limit = filters.limit;
  if (filters.startingAfter) q.startingAfter = filters.startingAfter;
  if (filters.sortBy) q.sortBy = filters.sortBy as ManifestQueryParams["sortBy"];
  if (filters.sortOrder) q.sortOrder = filters.sortOrder as ManifestQueryParams["sortOrder"];
  if (filters.contentType?.length)
    q["content.type"] = filters.contentType as ManifestQueryParams["content.type"];
  if (filters.processingStatus)
    q["additionalDetails.processingStatus"] =
      filters.processingStatus as ManifestQueryParams["additionalDetails.processingStatus"];
  return q;
}

export async function listManifests(
  domainId: string,
  accountId: string,
  filters: ManifestFilters = {},
): Promise<Core_ManifestsCollection> {
  if (!domainId) throw new Error("domainId is required");
  if (!accountId) throw new Error("accountId is required");
  const sdk = getCustodySDK();
  return sdk.accounts.getManifests(
    { domainId, accountId },
    buildManifestQueryParams(filters),
  );
}

export async function getManifest(
  domainId: string,
  accountId: string,
  manifestId: string,
): Promise<Core_ApiManifest> {
  if (!domainId) throw new Error("domainId is required");
  if (!accountId) throw new Error("accountId is required");
  if (!manifestId) throw new Error("manifestId is required");
  const sdk = getCustodySDK();
  return sdk.accounts.getManifest({ domainId, accountId, manifestId });
}
