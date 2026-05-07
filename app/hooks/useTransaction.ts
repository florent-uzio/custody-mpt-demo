import { useQuery } from "@tanstack/react-query";
import { getTransaction } from "../_actions/transactions";

export function useTransaction(transactionId: string, domainId: string) {
  return useQuery({
    queryKey: ["transaction", transactionId, domainId],
    queryFn: () => getTransaction(domainId, transactionId),
    enabled: !!transactionId && !!domainId,
    staleTime: 60_000,
  });
}
