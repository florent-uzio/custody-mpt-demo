import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ConfigKey, ConfigEntry } from "@/app/lib/config";

type ConfigSummary = Record<ConfigKey, ConfigEntry>;

export function useConfig() {
  return useQuery({
    queryKey: ["config"],
    queryFn: async () => {
      const res = await fetch("/api/config");
      if (!res.ok) throw new Error("Failed to fetch config");
      const data = await res.json();
      return data.config as ConfigSummary;
    },
  });
}

export function useConfigMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      values: Partial<Record<ConfigKey, string>> | { reset: true },
    ) => {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save config");
      return data.config as ConfigSummary;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config"] });
    },
  });
}
