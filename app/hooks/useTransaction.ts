import { useQuery } from "@tanstack/react-query";
import { Core_TransactionDetails } from "custody";

export function useTransaction(transactionId: string, domainId: string) {
  return useQuery({
    queryKey: ["transaction", transactionId, domainId],
    queryFn: async () => {
      const res = await fetch("/api/transactions/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, domainId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch transaction");
      }
      return res.json() as Promise<Core_TransactionDetails>;
    },
    enabled: !!transactionId && !!domainId,
    staleTime: 60_000,
  });
}
