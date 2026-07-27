/**
 * The cMPT compute endpoints return their cryptographic material as hex
 * ("Hex encoded string" in the spec), but the `cryptographicFields` members of a
 * ConfidentialMPT operation are declared `Format: base64`. The UI works in hex
 * throughout — it is what you copy off the compute page and what an xrpl.js
 * transaction carries — so the server actions convert at the boundary.
 */
export function hexToBase64(hex: string): string {
  const normalized = hex.trim().replace(/^0x/i, "");
  if (normalized.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(normalized)) {
    throw new Error(
      `Expected an even-length hex string, got "${hex.slice(0, 24)}${hex.length > 24 ? "…" : ""}".`,
    );
  }
  return Buffer.from(normalized, "hex").toString("base64");
}
