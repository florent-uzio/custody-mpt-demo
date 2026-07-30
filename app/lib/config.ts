export type ConfigKey =
  | "AUTH_URL"
  | "API_URL"
  | "PRIVATE_KEY"
  | "PUBLIC_KEY"
  | "XRPL_WSS_URL"
  | "XRPL_LEDGER_IDS"
  | "DEFAULT_LEDGER_ID";

export const CONFIG_KEYS: ConfigKey[] = [
  "AUTH_URL",
  "API_URL",
  "PRIVATE_KEY",
  "PUBLIC_KEY",
  "XRPL_WSS_URL",
  "XRPL_LEDGER_IDS",
  "DEFAULT_LEDGER_ID",
];

/**
 * Keys whose value must never cross the server→client boundary. They are
 * write-only: the config summary reports where they come from, not what they
 * are. Classify every new key here at the moment it is added.
 */
export const SECRET_KEYS: ReadonlySet<ConfigKey> = new Set([
  "PRIVATE_KEY",
  "PUBLIC_KEY",
]);

export interface ConfigEntry {
  /** Absent for secret keys — they are write-only. */
  value?: string;
  secret: boolean;
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
    const secret = SECRET_KEYS.has(key);

    const source =
      override !== undefined ? "override" : hasEnvFallback ? "env" : "empty";
    const value = override !== undefined ? override : envValue;

    result[key] = secret
      ? { secret, source, hasEnvFallback }
      : { value, secret, source, hasEnvFallback };
  }

  return result;
}

export function clearAllOverrides(): void {
  overrides.clear();
}
