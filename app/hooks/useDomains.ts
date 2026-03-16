import { useQuery } from "@tanstack/react-query";
import { Core_TrustedDomainsCollection, GetDomainsQueryParams } from "custody";

export function useDomains(params: GetDomainsQueryParams) {
  return useQuery({
    queryKey: ["domains", params],
    queryFn: async () => {
      const res = await fetch("/api/domains/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to list domains");
      }
      return res.json() as Promise<Core_TrustedDomainsCollection>;
    },
    staleTime: 30_000,
  });
}
