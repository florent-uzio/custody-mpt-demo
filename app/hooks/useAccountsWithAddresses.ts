import { useQuery } from "@tanstack/react-query";
import {
  listAccountsWithAddresses,
  type AccountWithAddress,
} from "../_actions/accounts";
import { useDefaultDomain } from "../contexts/DomainContext";

export function useAccountsWithAddresses() {
  const { defaultDomainId } = useDefaultDomain();

  const {
    data: accounts = [],
    isLoading: loading,
    error,
  } = useQuery<AccountWithAddress[]>({
    queryKey: ["accounts-with-addresses", defaultDomainId],
    queryFn: () => listAccountsWithAddresses(defaultDomainId!),
    enabled: !!defaultDomainId,
    staleTime: 60_000,
  });

  return {
    accounts,
    loading,
    error: error instanceof Error ? error.message : null,
  };
}
