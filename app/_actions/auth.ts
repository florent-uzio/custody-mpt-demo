"use server";

import { getCustodySDK } from "@/app/lib/custody";

export type CurrentTokenInfo = {
  /** A token is cached server-side; its raw value never leaves the server. */
  hasToken: boolean;
  /** Decoded, non-sensitive JWT header — never the raw token. */
  header: Record<string, unknown> | null;
  /** Decoded, non-sensitive JWT claims — never the raw token. */
  claims: Record<string, unknown> | null;
  expiration: number | null;
};

function decodeSegment(segment: string): Record<string, unknown> | null {
  try {
    const json = Buffer.from(segment, "base64url").toString("utf-8");
    const parsed = JSON.parse(json);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export async function getCurrentJwtToken(): Promise<CurrentTokenInfo> {
  const sdk = getCustodySDK();

  // The SDK fetches tokens lazily on the first API call. Prime it with a
  // benign `users.me()` request so we have something to display.
  if (!sdk.auth.getCurrentToken()) {
    await sdk.users.me();
  }

  const token = sdk.auth.getCurrentToken();
  const parts = token?.split(".") ?? [];

  return {
    hasToken: Boolean(token),
    header: parts.length === 3 ? decodeSegment(parts[0]) : null,
    claims: parts.length === 3 ? decodeSegment(parts[1]) : null,
    expiration: sdk.auth.getTokenExpiration(),
  };
}
