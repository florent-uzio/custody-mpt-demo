/**
 * `parameters.maximumFee` — the cap on what an XRPL transaction order may burn
 * in fees, in drops.
 *
 * Dependency-free on purpose: the client-side fee field imports from here, so
 * this must not drag `intent-builder` (and its dayjs/uuid/SDK imports) into the
 * browser bundle.
 */

/** Ceiling the app has always sent: 10 XRP, in drops. */
export const DEFAULT_MAXIMUM_FEE = "10000000";

/**
 * Per-action override for `maximumFee`.
 *
 * - omitted → {@link DEFAULT_MAXIMUM_FEE}
 * - a drops string → sent as-is
 * - `null` → `maximumFee` is left off the transaction order entirely (it is
 *   optional in the custody API schema, which then applies its own ceiling)
 */
export type MaximumFee = string | null;

/** Drops are a positive whole number — no decimals, no leading zero. */
export const MAXIMUM_FEE_PATTERN = "[1-9][0-9]*";

export function isValidMaximumFee(drops: string): boolean {
  return new RegExp(`^${MAXIMUM_FEE_PATTERN}$`).test(drops);
}

/** `"10000000"` → `"10 XRP"`. Returns null when `drops` isn't a valid amount. */
export function formatDropsAsXrp(drops: string): string | null {
  if (!isValidMaximumFee(drops)) return null;
  const xrp = Number(drops) / 1_000_000;
  return `${xrp.toLocaleString("en-US", { maximumFractionDigits: 6 })} XRP`;
}
