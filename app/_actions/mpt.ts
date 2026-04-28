"use server";

import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import type { Core_ProposeIntentBody } from "custody";

import {
  getAccountLedgerId,
  getCurrentUser,
  getCustodySDK,
} from "@/app/lib/custody";

const CURRENT_USER_ID = "6ac20654-450e-29e4-65e2-1bdecb7db7c4";

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

export type MptResult = {
  request: Core_ProposeIntentBody;
  response: unknown;
};

export async function mptCreate(input: MptCreateInput): Promise<MptResult> {
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

  const currentUser = await getCurrentUser(domainId);
  const ledgerId = await getAccountLedgerId(domainId, accountId);

  const request: Core_ProposeIntentBody = {
    request: {
      author: { id: currentUser.userId, domainId },
      expiryAt: dayjs().add(1, "day").toISOString(),
      targetDomainId: domainId,
      id: uuidv4(),
      payload: {
        id: uuidv4(),
        ledgerId,
        accountId,
        parameters: {
          type: "XRPL",
          feeStrategy: { priority: "Medium", type: "Priority" },
          maximumFee: "10000000",
          memos: [],
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
        },
        description: "MPT Issuance Create",
        customProperties: { property1: "mpt-create" },
        type: "v0_CreateTransactionOrder",
      },
      description: "Create new MPT Issuance",
      customProperties: { property1: "mpt-issuance-create" },
      type: "Propose",
    },
  };

  const sdk = getCustodySDK();
  const response = await sdk.intents.propose(request);
  return { request, response };
}

export async function mptAuthorize(
  input: MptAuthorizeInput,
): Promise<MptResult> {
  const { domainId, accountId, issuanceId } = input;
  if (!domainId) throw new Error("domainId is required");
  if (!issuanceId) throw new Error("issuanceId is required");
  if (!accountId) throw new Error("accountId is required");

  const currentUser = await getCurrentUser(domainId);
  const ledgerId = await getAccountLedgerId(domainId, accountId);

  const request: Core_ProposeIntentBody = {
    request: {
      author: { id: currentUser.userId, domainId: currentUser.domainId },
      expiryAt: dayjs().add(1, "day").toISOString(),
      targetDomainId: currentUser.domainId,
      id: uuidv4(),
      payload: {
        id: uuidv4(),
        ledgerId,
        accountId,
        parameters: {
          type: "XRPL",
          feeStrategy: { priority: "Medium", type: "Priority" },
          maximumFee: "10000000",
          memos: [],
          operation: {
            type: "MPTokenAuthorize",
            tokenIdentifier: { type: "MPTokenIssuanceId", issuanceId },
            flags: [],
          },
        },
        description: "Test MPT Authorize",
        customProperties: { property1: "flo" },
        type: "v0_CreateTransactionOrder",
      },
      description: "Transfer order creation intent",
      customProperties: { property1: "flo" },
      type: "Propose",
    },
  };

  const sdk = getCustodySDK();
  const response = await sdk.intents.propose(request);
  return { request, response };
}

export async function mptDestroy(input: MptDestroyInput): Promise<MptResult> {
  const { domainId, accountId, issuanceId } = input;
  if (!accountId) throw new Error("accountId is required");
  if (!domainId) throw new Error("domainId is required");
  if (!issuanceId) throw new Error("issuanceId is required");

  const ledgerId = await getAccountLedgerId(domainId, accountId);

  const request: Core_ProposeIntentBody = {
    request: {
      author: { id: CURRENT_USER_ID, domainId },
      expiryAt: dayjs().add(1, "day").toISOString(),
      targetDomainId: domainId,
      id: uuidv4(),
      payload: {
        id: uuidv4(),
        ledgerId,
        accountId,
        parameters: {
          type: "XRPL",
          feeStrategy: { priority: "Medium", type: "Priority" },
          maximumFee: "10000000",
          memos: [],
          operation: {
            type: "MPTokenIssuanceDestroy",
            tokenIdentifier: { type: "MPTokenIssuanceId", issuanceId },
          },
        },
        description: "MPT Issuance Destroy",
        customProperties: { property1: "mpt-destroy" },
        type: "v0_CreateTransactionOrder",
      },
      description: "Destroy MPT Issuance",
      customProperties: { property1: "mpt-issuance-destroy" },
      type: "Propose",
    },
  };

  const sdk = getCustodySDK();
  const response = await sdk.intents.propose(request);
  return { request, response };
}

export async function mptSet(input: MptSetInput): Promise<MptResult> {
  const { domainId, accountId, issuanceId, flags, holder } = input;
  if (!accountId) throw new Error("accountId is required");
  if (!domainId) throw new Error("domainId is required");
  if (!issuanceId) throw new Error("issuanceId is required");
  if (flags !== 1 && flags !== 2)
    throw new Error("flags must be 1 (Lock) or 2 (Unlock)");

  const sdkFlags: ("tfMPTLock" | "tfMPTUnlock")[] =
    flags === 1 ? ["tfMPTLock"] : ["tfMPTUnlock"];
  const ledgerId = await getAccountLedgerId(domainId, accountId);

  const request: Core_ProposeIntentBody = {
    request: {
      author: { id: CURRENT_USER_ID, domainId },
      expiryAt: dayjs().add(1, "day").toISOString(),
      targetDomainId: domainId,
      id: uuidv4(),
      payload: {
        id: uuidv4(),
        ledgerId,
        accountId,
        parameters: {
          type: "XRPL",
          feeStrategy: { priority: "Medium", type: "Priority" },
          maximumFee: "10000000",
          memos: [],
          operation: {
            type: "MPTokenIssuanceSet",
            tokenIdentifier: { type: "MPTokenIssuanceId", issuanceId },
            flags: sdkFlags,
            ...(holder && { holder }),
          } as never,
        },
        description: `MPT Issuance Set - ${flags === 1 ? "Lock" : "Unlock"}`,
        customProperties: { property1: "mpt-set" },
        type: "v0_CreateTransactionOrder",
      },
      description: `Set MPT Issuance - ${flags === 1 ? "Lock" : "Unlock"}`,
      customProperties: { property1: "mpt-issuance-set" },
      type: "Propose",
    },
  };

  const sdk = getCustodySDK();
  const response = await sdk.intents.propose(request);
  return { request, response };
}
