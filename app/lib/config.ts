export type ConfigKey = "AUTH_URL" | "API_URL" | "PRIVATE_KEY" | "PUBLIC_KEY";

export const CONFIG_KEYS: ConfigKey[] = [
  "AUTH_URL",
  "API_URL",
  "PRIVATE_KEY",
  "PUBLIC_KEY",
];

export interface ConfigEntry {
  value: string;
  source: "override" | "env" | "empty";
  hasEnvFallback: boolean;
}

const overrides = new Map<ConfigKey, string>();

export function getConfigValue(key: ConfigKey): string {
  return overrides.get(key) ?? process.env[key] ?? "";
}

export function setConfigOverride(key: ConfigKey, value: string): void {
  if (value === "") {
    overrides.delete(key);
  } else {
    overrides.set(key, value);
  }
}

export function getConfigSummary(): Record<ConfigKey, ConfigEntry> {
  const result = {} as Record<ConfigKey, ConfigEntry>;

  for (const key of CONFIG_KEYS) {
    const override = overrides.get(key);
    const envValue = process.env[key] ?? "";
    const hasEnvFallback = envValue !== "";

    if (override !== undefined) {
      result[key] = { value: override, source: "override", hasEnvFallback };
    } else if (hasEnvFallback) {
      result[key] = { value: envValue, source: "env", hasEnvFallback };
    } else {
      result[key] = { value: "", source: "empty", hasEnvFallback: false };
    }
  }

  return result;
}

export function clearAllOverrides(): void {
  overrides.clear();
}
