import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ConfigEntry, ConfigKey } from "@/app/lib/config";
import { getConfig, resetConfig, updateConfig } from "../_actions/config";

type ConfigSummary = Record<ConfigKey, ConfigEntry>;

export function useConfig() {
  return useQuery({
    queryKey: ["config"],
    queryFn: async () => {
      const data = await getConfig();
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
      const data =
        "reset" in values && values.reset === true
          ? await resetConfig()
          : await updateConfig(values as Partial<Record<ConfigKey, string>>);
      return data.config as ConfigSummary;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config"] });
    },
  });
}
