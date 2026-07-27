import type { XrplLedgerId } from "@florent-uzio/custody";

/**
 * Ledgers offered when XRPL_LEDGER_IDS is not configured. Ordered so the first
 * entry — the fallback default when DEFAULT_LEDGER_ID is unset — is a test
 * network, never mainnet.
 */
export const BUILT_IN_XRPL_LEDGER_IDS: readonly XrplLedgerId[] = [
  "xrpl-testnet-august-2024",
  "xrpl-devnet",
  "xrpl-custody-devnet",
  "xrpl",
];

export interface LedgerConfig {
  /** Ledger IDs offered in every ledger picker. */
  ledgerIds: XrplLedgerId[];
  /** Ledger ID preselected in every filter/form. Always a member of ledgerIds. */
  defaultLedgerId: XrplLedgerId;
}

/**
 * Resolve the ledger picker options and preselected default from raw config
 * values. `rawIds` is a comma-separated list; empty falls back to the built-ins.
 * A `rawDefault` that isn't in the list is prepended rather than ignored, so a
 * one-off default doesn't silently resolve to a different ledger.
 */
export function resolveLedgerConfig(
  rawIds: string,
  rawDefault: string,
): LedgerConfig {
  const ledgerIds = rawIds
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (ledgerIds.length === 0) ledgerIds.push(...BUILT_IN_XRPL_LEDGER_IDS);

  const wanted = rawDefault.trim();
  if (wanted && !ledgerIds.includes(wanted)) ledgerIds.unshift(wanted);

  return { ledgerIds, defaultLedgerId: wanted || ledgerIds[0] };
}
