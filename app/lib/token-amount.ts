/**
 * The Ripple Custody backend multiplies a TrustSet limit value by 10^-81 before
 * submitting it to the XRP Ledger. Scaling the user's value by 10^81 cancels that
 * out, so they can enter a human-readable amount (e.g. "100") instead of "100"
 * followed by 81 zeros. See the XRPL token-precision docs (values down to
 * 1.0 × 10^-81):
 * https://xrpl.org/docs/concepts/tokens/fungible-tokens/trust-line-tokens#properties
 */
export const CUSTODY_VALUE_SCALE_EXPONENT = 81;

const DECIMAL_PATTERN = /^-?\d*\.?\d+$/;

/** True when `value` is a plain decimal number (no scientific notation, no junk). */
export function isDecimalString(value: string): boolean {
  return DECIMAL_PATTERN.test(value.trim());
}

/**
 * Multiplies a decimal string by 10^exponent by shifting the decimal point, so we
 * never lose precision or emit scientific notation the way `Number` would. Returns
 * the input unchanged when it is not a plain decimal number.
 */
export function scaleByPowerOfTen(value: string, exponent: number): string {
  const trimmed = value.trim();
  if (!isDecimalString(trimmed)) return value;

  const negative = trimmed.startsWith("-");
  const unsigned = negative ? trimmed.slice(1) : trimmed;
  const [intPart, fracPart = ""] = unsigned.split(".");

  // All significant digits with the decimal point removed.
  const digits = intPart + fracPart;
  // Digits remaining to the right of the decimal point after shifting right.
  const remainingFraction = fracPart.length - exponent;

  let result: string;
  if (remainingFraction <= 0) {
    result = digits + "0".repeat(-remainingFraction);
  } else {
    const cut = digits.length - remainingFraction;
    result = `${digits.slice(0, cut) || "0"}.${digits.slice(cut)}`;
  }

  // Drop leading zeros (e.g. "000…0" → "0", "0100" → "100").
  result = result.replace(/^0+(?=\d)/, "");
  return negative ? `-${result}` : result;
}
