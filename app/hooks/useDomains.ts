import { useQuery } from "@tanstack/react-query";
import { GetDomainsQueryParams } from "custody";
import { listDomains } from "../_actions/domains";

export function useDomains(params: GetDomainsQueryParams) {
  return useQuery({
    queryKey: ["domains", params],
    queryFn: () => listDomains(params),
    staleTime: 30_000,
  });
}
