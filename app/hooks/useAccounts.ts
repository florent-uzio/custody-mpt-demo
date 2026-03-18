import { useQuery } from "@tanstack/react-query";
import { useDefaultDomain } from "../contexts/DomainContext";

export interface Account {
  id: string;
  alias: string;
  domainId: string;
}

async function fetchAccounts(domainId: string): Promise<Account[]> {
  const res = await fetch("/api/accounts/list", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domainId }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to fetch accounts");
  }

  const result = await res.json();
  return result.items.map((item: { data: { id: string; alias?: string; domainId: string } }) => ({
    id: item.data.id,
    alias: item.data.alias || item.data.id,
    domainId: item.data.domainId,
  }));
}

export function useAccounts() {
  const { defaultDomainId } = useDefaultDomain();

  const { data: accounts = [], isLoading: loading, error } = useQuery({
    queryKey: ["accounts", defaultDomainId],
    queryFn: () => fetchAccounts(defaultDomainId!),
    enabled: !!defaultDomainId,
  });

  return {
    accounts,
    loading,
    error: error instanceof Error ? error.message : null,
  };
}
