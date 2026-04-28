"use server";

import {
  CONFIG_KEYS,
  clearAllOverrides,
  getConfigSummary,
  getConfigValue,
  setConfigOverride,
  type ConfigKey,
} from "@/app/lib/config";
import { resetCustodySDK } from "@/app/lib/custody";

export async function getConfig() {
  return { config: getConfigSummary() };
}

export async function resetConfig() {
  clearAllOverrides();
  resetCustodySDK();
  return { config: getConfigSummary() };
}

export async function updateConfig(overrides: Partial<Record<ConfigKey, string>>) {
  for (const key of CONFIG_KEYS) {
    if (key in overrides) {
      setConfigOverride(key, overrides[key] as string);
    }
  }

  const authUrl = getConfigValue("AUTH_URL");
  const apiUrl = getConfigValue("API_URL");

  if (!authUrl || !apiUrl) {
    const missing: string[] = [];
    if (!authUrl) missing.push("AUTH_URL");
    if (!apiUrl) missing.push("API_URL");
    throw new Error(
      `${missing.join(" and ")} must have a value (either from override or .env)`,
    );
  }

  resetCustodySDK();
  return { config: getConfigSummary() };
}
