import { useQuery } from "@tanstack/react-query";
import { Core_ApiTicker } from "custody";
import { getTicker } from "../_actions/tickers";

export function useTickers(tickerIds: string[]) {
  return useQuery({
    queryKey: ["tickers", tickerIds],
    queryFn: async () => {
      const results = await Promise.all(
        tickerIds.map(async (tickerId) => {
          try {
            return await getTicker(tickerId);
          } catch {
            return null;
          }
        }),
      );

      const map = new Map<string, Core_ApiTicker>();
      for (const ticker of results) {
        if (ticker) map.set(ticker.data.id, ticker);
      }
      return map;
    },
    enabled: tickerIds.length > 0,
    staleTime: 5 * 60_000,
  });
}

export function useTicker(tickerId: string | undefined) {
  return useQuery({
    queryKey: ["ticker", tickerId],
    queryFn: () => getTicker(tickerId!),
    enabled: !!tickerId,
    staleTime: 5 * 60_000,
  });
}
