import { useInfiniteQuery } from "@tanstack/react-query";
import type { Core_ManifestsCollection } from "custody";
import type {
  ManifestContentType,
  ManifestProcessingStatus,
  ManifestSortBy,
  SortOrder,
} from "../accounts/[id]/manifests/manifests.types";

interface UseManifestsParams {
  domainId?: string;
  accountId?: string;
  contentTypeFilter?: ManifestContentType | "";
  processingStatusFilter?: ManifestProcessingStatus | "";
  sortBy?: ManifestSortBy;
  sortOrder?: SortOrder;
  limit?: number;
}

async function fetchManifestsPage(
  domainId: string,
  accountId: string,
  pageParam: string | undefined,
  opts: {
    contentTypeFilter?: ManifestContentType | "";
    processingStatusFilter?: ManifestProcessingStatus | "";
    sortBy?: ManifestSortBy;
    sortOrder?: SortOrder;
    limit: number;
  },
): Promise<Core_ManifestsCollection> {
  const body: Record<string, unknown> = { domainId, accountId, limit: opts.limit };
  if (opts.contentTypeFilter) body.contentType = [opts.contentTypeFilter];
  if (opts.processingStatusFilter) body.processingStatus = opts.processingStatusFilter;
  if (pageParam) body.startingAfter = pageParam;
  if (opts.sortBy) body.sortBy = opts.sortBy;
  if (opts.sortOrder) body.sortOrder = opts.sortOrder;

  const res = await fetch("/api/manifests/list", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to fetch manifests");
  }

  return res.json();
}

export function useManifests({
  domainId,
  accountId,
  contentTypeFilter = "",
  processingStatusFilter = "",
  sortBy,
  sortOrder,
  limit = 20,
}: UseManifestsParams) {
  return useInfiniteQuery({
    queryKey: [
      "manifests",
      domainId,
      accountId,
      contentTypeFilter,
      processingStatusFilter,
      sortBy,
      sortOrder,
      limit,
    ],
    queryFn: ({ pageParam }) =>
      fetchManifestsPage(domainId!, accountId!, pageParam as string | undefined, {
        contentTypeFilter,
        processingStatusFilter,
        sortBy,
        sortOrder,
        limit,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextStartingAfter ?? undefined,
    enabled: !!domainId && !!accountId,
    staleTime: 60_000,
  });
}
