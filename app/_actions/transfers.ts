"use server";

import type { Core_TransferDetails } from "custody";

import { getCustodySDK } from "@/app/lib/custody";

export async function getTransfer(
  domainId: string,
  transferId: string,
): Promise<Core_TransferDetails> {
  if (!domainId) throw new Error("domainId is required");
  if (!transferId) throw new Error("transferId is required");
  const sdk = getCustodySDK();
  return sdk.transactions.transfer({ domainId, transferId });
}
