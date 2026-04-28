import { useInfiniteQuery } from "@tanstack/react-query";
import { listIntents, type IntentFilters } from "../_actions/intents";
import type {
  IntentSortBy,
  IntentStatus,
  SortOrder,
} from "../intents/intents.types";

interface UseIntentsParams {
  domainId?: string;
  statusFilter?: IntentStatus | "";
  sortBy?: IntentSortBy;
  sortOrder?: SortOrder;
  limit?: number;
}

export function useIntents({
  domainId,
  statusFilter = "",
  sortBy,
  sortOrder,
  limit = 20,
}: UseIntentsParams) {
  return useInfiniteQuery({
    queryKey: ["intents", domainId, statusFilter, sortBy, sortOrder, limit],
    queryFn: ({ pageParam }) => {
      const filters: IntentFilters = { limit };
      if (statusFilter) filters.status = [statusFilter];
      if (pageParam) filters.startingAfter = pageParam as string;
      if (sortBy) filters.sortBy = sortBy;
      if (sortOrder) filters.sortOrder = sortOrder;
      return listIntents(domainId!, filters);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextStartingAfter ?? undefined,
    enabled: !!domainId,
    staleTime: 60_000,
  });
}
