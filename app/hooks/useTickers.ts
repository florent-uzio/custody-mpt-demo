import { useQuery } from "@tanstack/react-query";
import { Core_ApiTicker } from "custody";

export function useTickers(tickerIds: string[]) {
  return useQuery({
    queryKey: ["tickers", tickerIds],
    queryFn: async () => {
      const results = await Promise.all(
        tickerIds.map(async (tickerId) => {
          const res = await fetch("/api/tickers/get", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tickerId }),
          });
          if (!res.ok) return null;
          return res.json() as Promise<Core_ApiTicker>;
        })
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
    queryFn: async () => {
      const res = await fetch("/api/tickers/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickerId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to get ticker");
      }
      return res.json() as Promise<Core_ApiTicker>;
    },
    enabled: !!tickerId,
    staleTime: 5 * 60_000,
  });
}
