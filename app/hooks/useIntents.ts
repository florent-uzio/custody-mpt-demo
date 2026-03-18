import { useInfiniteQuery } from "@tanstack/react-query";
import type {
  IntentsCollection,
  IntentStatus,
  IntentSortBy,
  SortOrder,
} from "../intents/intents.types";

interface UseIntentsParams {
  domainId?: string;
  statusFilter?: IntentStatus | "";
  sortBy?: IntentSortBy;
  sortOrder?: SortOrder;
  limit?: number;
}

async function fetchIntentsPage(
  domainId: string,
  pageParam: string | undefined,
  opts: {
    statusFilter?: IntentStatus | "";
    sortBy?: IntentSortBy;
    sortOrder?: SortOrder;
    limit: number;
  },
): Promise<IntentsCollection> {
  const body: Record<string, unknown> = { domainId, limit: opts.limit };
  if (opts.statusFilter) body.status = [opts.statusFilter];
  if (pageParam) body.startingAfter = pageParam;
  if (opts.sortBy) body.sortBy = opts.sortBy;
  if (opts.sortOrder) body.sortOrder = opts.sortOrder;

  const res = await fetch("/api/intents/list", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to fetch intents");
  }

  return res.json();
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
    queryFn: ({ pageParam }) =>
      fetchIntentsPage(domainId!, pageParam as string | undefined, {
        statusFilter,
        sortBy,
        sortOrder,
        limit,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextStartingAfter ?? undefined,
    enabled: !!domainId,
    staleTime: 60_000,
  });
}
