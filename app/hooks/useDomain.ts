import { useQuery } from "@tanstack/react-query";
import { getDomain } from "../_actions/domains";

export function useDomain(domainId: string) {
  return useQuery({
    queryKey: ["domain", domainId],
    queryFn: () => getDomain(domainId),
    enabled: !!domainId,
    staleTime: 60_000,
  });
}
