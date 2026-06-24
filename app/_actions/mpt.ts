"use server";

import {
  proposeXrplTransaction,
  type ProposeIntentResult,
} from "@/app/lib/custody";

export type MptCreateInput = {
  domainId: string;
  accountId: string;
  assetScale?: number;
  transferFee?: number;
  maximumAmount?: string | number;
  flags?: string[];
  metadata?: Record<string, unknown>;
};

export type MptAuthorizeInput = {
  domainId: string;
  accountId: string;
  issuanceId: string;
};

export type MptDestroyInput = {
  domainId: string;
  accountId: string;
  issuanceId: string;
};

export type MptSetInput = {
  domainId: string;
  accountId: string;
  issuanceId: string;
  flags: 1 | 2;
  holder?: string;
};

export async function mptCreate(input: MptCreateInput): Promise<ProposeIntentResult> {
  const {
    domainId,
    accountId,
    assetScale,
    transferFee,
    maximumAmount,
    flags,
    metadata,
  } = input;
  if (!accountId) throw new Error("accountId is required");
  if (!domainId) throw new Error("domainId is required");

  return proposeXrplTransaction({
    domainId,
    accountId,
    // SDK's flags union is stricter than the demo's free-form input;
    // matching the original route's `body: any` posture.
    operation: {
      type: "MPTokenIssuanceCreate",
      ...(assetScale !== undefined && { assetScale }),
      ...(transferFee !== undefined && transferFee > 0 && { transferFee }),
      ...(maximumAmount && { maximumAmount: String(maximumAmount) }),
      ...(flags && flags.length > 0 && { flags }),
      ...(metadata && { metadata }),
    } as never,
    description: "Create new MPT Issuance",
    customProperties: { property1: "mpt-issuance-create" },
    payloadDescription: "MPT Issuance Create",
    payloadCustomProperties: { property1: "mpt-create" },
  });
}

export async function mptAuthorize(
  input: MptAuthorizeInput,
): Promise<ProposeIntentResult> {
  const { domainId, accountId, issuanceId } = input;
  if (!domainId) throw new Error("domainId is required");
  if (!issuanceId) throw new Error("issuanceId is required");
  if (!accountId) throw new Error("accountId is required");

  return proposeXrplTransaction({
    domainId,
    accountId,
    operation: {
      type: "MPTokenAuthorize",
      tokenIdentifier: { type: "MPTokenIssuanceId", issuanceId },
      flags: [],
    },
    description: "Transfer order creation intent",
    customProperties: { property1: "flo" },
    payloadDescription: "Test MPT Authorize",
  });
}

export async function mptDestroy(input: MptDestroyInput): Promise<ProposeIntentResult> {
  const { domainId, accountId, issuanceId } = input;
  if (!accountId) throw new Error("accountId is required");
  if (!domainId) throw new Error("domainId is required");
  if (!issuanceId) throw new Error("issuanceId is required");

  return proposeXrplTransaction({
    domainId,
    accountId,
    operation: {
      type: "MPTokenIssuanceDestroy",
      tokenIdentifier: { type: "MPTokenIssuanceId", issuanceId },
    },
    description: "Destroy MPT Issuance",
    customProperties: { property1: "mpt-issuance-destroy" },
    payloadDescription: "MPT Issuance Destroy",
    payloadCustomProperties: { property1: "mpt-destroy" },
  });
}

export async function mptSet(input: MptSetInput): Promise<ProposeIntentResult> {
  const { domainId, accountId, issuanceId, flags, holder } = input;
  if (!accountId) throw new Error("accountId is required");
  if (!domainId) throw new Error("domainId is required");
  if (!issuanceId) throw new Error("issuanceId is required");
  if (flags !== 1 && flags !== 2)
    throw new Error("flags must be 1 (Lock) or 2 (Unlock)");

  const sdkFlags: ("tfMPTLock" | "tfMPTUnlock")[] =
    flags === 1 ? ["tfMPTLock"] : ["tfMPTUnlock"];
  const label = flags === 1 ? "Lock" : "Unlock";

  return proposeXrplTransaction({
    domainId,
    accountId,
    operation: {
      type: "MPTokenIssuanceSet",
      tokenIdentifier: { type: "MPTokenIssuanceId", issuanceId },
      flags: sdkFlags,
      ...(holder && { holder }),
    } as never,
    description: `Set MPT Issuance - ${label}`,
    customProperties: { property1: "mpt-issuance-set" },
    payloadDescription: `MPT Issuance Set - ${label}`,
    payloadCustomProperties: { property1: "mpt-set" },
  });
}
