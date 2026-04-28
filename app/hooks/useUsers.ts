import { useInfiniteQuery } from "@tanstack/react-query";
import { listUsers, type UserFilters } from "../_actions/users";
import type {
  LockStatus,
  SortOrder,
  UserSortBy,
} from "../users/users.types";

interface UseUsersParams {
  domainId?: string;
  alias?: string;
  lock?: LockStatus[];
  sortBy?: UserSortBy;
  sortOrder?: SortOrder;
  limit?: number;
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
    queryFn: ({ pageParam }) => {
      const filters: UserFilters = { limit };
      if (pageParam) filters.startingAfter = pageParam as string;
      if (alias) filters.alias = alias;
      if (lock && lock.length > 0) filters.lock = lock;
      if (sortBy) filters.sortBy = sortBy;
      if (sortOrder) filters.sortOrder = sortOrder;
      return listUsers(domainId!, filters);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextStartingAfter ?? undefined,
    enabled: !!domainId,
    staleTime: 60_000,
  });
}
