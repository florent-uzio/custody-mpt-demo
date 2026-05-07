import { useInfiniteQuery } from "@tanstack/react-query";
import { listManifests, type ManifestFilters } from "../_actions/manifests";
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
    queryFn: ({ pageParam }) => {
      const filters: ManifestFilters = { limit };
      if (contentTypeFilter) filters.contentType = [contentTypeFilter];
      if (processingStatusFilter) filters.processingStatus = processingStatusFilter;
      if (pageParam) filters.startingAfter = pageParam as string;
      if (sortBy) filters.sortBy = sortBy;
      if (sortOrder) filters.sortOrder = sortOrder;
      return listManifests(domainId!, accountId!, filters);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextStartingAfter ?? undefined,
    enabled: !!domainId && !!accountId,
    staleTime: 60_000,
  });
}
