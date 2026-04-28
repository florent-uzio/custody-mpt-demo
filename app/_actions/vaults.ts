"use server";

import { getCustodySDK } from "@/app/lib/custody";

export async function listVaults() {
  const sdk = getCustodySDK();
  return sdk.vaults.list();
}
