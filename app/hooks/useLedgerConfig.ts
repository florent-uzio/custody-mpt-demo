import { useQuery } from "@tanstack/react-query";
import { getLedgerConfig } from "../_actions/ledgers";
import { BUILT_IN_XRPL_LEDGER_IDS, type LedgerConfig } from "../lib/ledgers";

export const LEDGER_CONFIG_QUERY_KEY = ["ledger-config"] as const;

const FALLBACK: LedgerConfig = {
  ledgerIds: [...BUILT_IN_XRPL_LEDGER_IDS],
  defaultLedgerId: BUILT_IN_XRPL_LEDGER_IDS[0],
};

/**
 * Ledger picker options and the preselected default. The root layout seeds this
 * query from the server, so it resolves synchronously on first render and
 * filters never flash a different ledger. FALLBACK only applies if that seeding
 * is missing.
 */
export function useLedgerConfig(): LedgerConfig {
  const { data } = useQuery({
    queryKey: LEDGER_CONFIG_QUERY_KEY,
    queryFn: getLedgerConfig,
    staleTime: Infinity,
  });

  return data ?? FALLBACK;
}
