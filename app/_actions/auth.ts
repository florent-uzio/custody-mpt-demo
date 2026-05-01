"use server";

import { getCustodySDK } from "@/app/lib/custody";

export type CurrentTokenInfo = {
  token: string | null;
  expiration: number | null;
};

export async function getCurrentJwtToken(): Promise<CurrentTokenInfo> {
  const sdk = getCustodySDK();

  // The SDK fetches tokens lazily on the first API call. Prime it with a
  // benign `users.me()` request so we have something to display.
  if (!sdk.auth.getCurrentToken()) {
    await sdk.users.me();
  }

  return {
    token: sdk.auth.getCurrentToken(),
    expiration: sdk.auth.getTokenExpiration(),
  };
}
