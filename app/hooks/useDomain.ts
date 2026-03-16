import { useQuery } from "@tanstack/react-query";
import { Core_TrustedDomain } from "custody";

export function useDomain(domainId: string) {
  return useQuery({
    queryKey: ["domain", domainId],
    queryFn: async () => {
      const res = await fetch("/api/domains/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch domain");
      }
      return res.json() as Promise<Core_TrustedDomain>;
    },
    enabled: !!domainId,
    staleTime: 60_000,
  });
}
