"use server";

import { getConfigValue } from "@/app/lib/config";
import { resolveLedgerConfig, type LedgerConfig } from "@/app/lib/ledgers";

/**
 * Ledger picker options + default, resolved from the runtime config (Config
 * page override, else .env). Kept separate from `getConfig` so the values can
 * be shipped to every page without also sending the key material.
 */
export async function getLedgerConfig(): Promise<LedgerConfig> {
  return resolveLedgerConfig(
    getConfigValue("XRPL_LEDGER_IDS"),
    getConfigValue("DEFAULT_LEDGER_ID"),
  );
}
