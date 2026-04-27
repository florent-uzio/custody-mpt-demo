import { useQuery } from "@tanstack/react-query";
import { listAccounts } from "../_actions/accounts";
import { useDefaultDomain } from "../contexts/DomainContext";

export interface Account {
  id: string;
  alias: string;
  domainId: string;
}

export function useAccounts() {
  const { defaultDomainId } = useDefaultDomain();

  const { data: accounts = [], isLoading: loading, error } = useQuery({
    queryKey: ["accounts", defaultDomainId],
    queryFn: async (): Promise<Account[]> => {
      const result = await listAccounts(defaultDomainId!);
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
