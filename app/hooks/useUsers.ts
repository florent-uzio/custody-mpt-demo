import { useInfiniteQuery } from "@tanstack/react-query";
import type {
  UsersCollection,
  LockStatus,
  UserSortBy,
  SortOrder,
} from "../users/users.types";

interface UseUsersParams {
  domainId?: string;
  alias?: string;
  lock?: LockStatus[];
  sortBy?: UserSortBy;
  sortOrder?: SortOrder;
  limit?: number;
}

async function fetchUsersPage(
  domainId: string,
  pageParam: string | undefined,
  opts: {
    alias?: string;
    lock?: LockStatus[];
    sortBy?: UserSortBy;
    sortOrder?: SortOrder;
    limit: number;
  },
): Promise<UsersCollection> {
  const body: Record<string, unknown> = { domainId, limit: opts.limit };
  if (pageParam) body.startingAfter = pageParam;
  if (opts.alias) body.alias = opts.alias;
  if (opts.lock && opts.lock.length > 0) body.lock = opts.lock;
  if (opts.sortBy) body.sortBy = opts.sortBy;
  if (opts.sortOrder) body.sortOrder = opts.sortOrder;

  const res = await fetch("/api/users/list", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to fetch users");
  }

  return res.json();
}

export function useUsers({
  domainId,
  alias,
  lock,
  sortBy,
  sortOrder,
  limit = 20,
}: UseUsersParams) {
  return useInfiniteQuery({
    queryKey: ["users", domainId, alias, lock, sortBy, sortOrder, limit],
    queryFn: ({ pageParam }) =>
      fetchUsersPage(domainId!, pageParam as string | undefined, {
        alias,
        lock,
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
