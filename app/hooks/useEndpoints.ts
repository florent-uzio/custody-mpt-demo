import { useQuery } from "@tanstack/react-query";
import { listEndpoints } from "../_actions/endpoints";
import { useDefaultDomain } from "../contexts/DomainContext";

export interface EndpointOption {
  id: string;
  alias: string;
  address: string;
  ledgerId: string;
}

export function useEndpoints() {
  const { defaultDomainId } = useDefaultDomain();

  const {
    data: endpoints = [],
    isLoading: loading,
    error,
  } = useQuery<EndpointOption[]>({
    queryKey: ["endpoints", defaultDomainId],
    queryFn: async (): Promise<EndpointOption[]> => {
      const res = await listEndpoints(defaultDomainId!);
      return res.items.map((e) => ({
        id: e.data.id,
        alias: e.data.alias || e.data.id,
        address: e.data.address,
        ledgerId: e.data.ledgerId,
      }));
    },
    enabled: !!defaultDomainId,
    staleTime: 60_000,
  });

  return {
    endpoints,
    loading,
    error: error instanceof Error ? error.message : null,
  };
}
