import { useQuery } from "@tanstack/react-query";
import { listAccounts } from "../_actions/accounts";
import { useDefaultDomain } from "../contexts/DomainContext";

export interface Account {
  id: string;
  alias: string;
  domainId: string;
}

/**
 * Accounts of the current domain, unlocked only — a locked account can't sign
 * anything, so it must never appear in a transaction dropdown. Pass
 * `includeLocked` for read-only views (e.g. filtering past transactions).
 */
export function useAccounts({ includeLocked = false } = {}) {
  const { defaultDomainId } = useDefaultDomain();

  const { data: accounts = [], isLoading: loading, error } = useQuery({
    queryKey: ["accounts", defaultDomainId, includeLocked],
    queryFn: async (): Promise<Account[]> => {
      const result = await listAccounts(defaultDomainId!, {
        ...(includeLocked ? {} : { locks: ["Unlocked"] }),
      });
      return result.items.map((item) => ({
        id: item.data.id,
        alias: item.data.alias || item.data.id,
        domainId: item.data.domainId,
      }));
    },
    enabled: !!defaultDomainId,
  });

  return {
    accounts,
    loading,
    error: error instanceof Error ? error.message : null,
  };
}
