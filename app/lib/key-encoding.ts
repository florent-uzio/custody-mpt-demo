/**
 * Purpose keys are declared `Format: base64`, but XRPL transactions — and the MPT
 * Set form — carry the encryption keys as hex, so the UI shows and uses both.
 * Accepts a hex value too, in case an instance hands one back.
 *
 * Uses atob/btoa rather than Buffer so this works in client components.
 */
export function keyEncodings(publicKey: string): {
  base64: string;
  hex: string | null;
} {
  const value = publicKey.trim();

  if (value.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(value)) {
    const bytes = value.match(/../g)!.map((byte) => parseInt(byte, 16));
    return { base64: btoa(String.fromCharCode(...bytes)), hex: value.toUpperCase() };
  }

  try {
    const hex = Array.from(atob(value), (char) =>
      char.charCodeAt(0).toString(16).padStart(2, "0"),
    )
      .join("")
      .toUpperCase();
    return { base64: value, hex };
  } catch {
    return { base64: value, hex: null };
  }
}
