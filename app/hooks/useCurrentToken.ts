import { useQuery } from "@tanstack/react-query";
import { getCurrentJwtToken } from "../_actions/auth";

export function useCurrentToken() {
  return useQuery({
    queryKey: ["jwt-token"],
    queryFn: getCurrentJwtToken,
    refetchOnWindowFocus: false,
  });
}
