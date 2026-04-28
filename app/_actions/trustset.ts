"use server";

import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import { convertStringToHex } from "xrpl";
import type { Core_ProposeIntentBody } from "custody";

import { getAccountLedgerId, getCustodySDK } from "@/app/lib/custody";

const CURRENT_USER_ID = "6ac20654-450e-29e4-65e2-1bdecb7db7c4";

export type TrustSetInput = {
  domainId: string;
  accountId: string;
  currency: string;
  issuer: string;
  value: string | number;
  flags?: string[];
  enableRippling?: boolean;
  customProperties?: Record<string, string>;
};

export type TrustSetResult = {
  request: Core_ProposeIntentBody;
  response: unknown;
};

function toCurrencyHex(currency: string): string {
  if (currency.length <= 3) return currency;
  const hex = convertStringToHex(currency);
  return hex.padEnd(40, "0");
}

export async function trustSet(input: TrustSetInput): Promise<TrustSetResult> {
  const {
    domainId,
    accountId,
    currency,
    issuer,
    value,
    flags,
    enableRippling,
    customProperties,
  } = input;

  if (!accountId) throw new Error("accountId is required");
  if (!domainId) throw new Error("domainId is required");
  if (!currency || !issuer) throw new Error("currency and issuer are required");
  if (value === undefined || value === "") throw new Error("value is required");

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
          feeStrategy: { priority: "Low", type: "Priority" },
          maximumFee: "10000000",
          memos: [],
          operation: {
            type: "TrustSet",
            flags: (flags || []) as never,
            limitAmount: {
              currency: {
                type: "Currency",
                code: toCurrencyHex(currency),
                issuer,
              },
              value: String(value),
            },
            ...(enableRippling !== undefined && { enableRippling }),
          },
        },
        description: "TrustSet",
        customProperties: customProperties || {
          description: "Create a Trustline",
        },
        type: "v0_CreateTransactionOrder",
      },
      description: "Create TrustSet",
      customProperties: customProperties || {
        description: "Create a Trustline",
      },
      type: "Propose",
    },
  };

  const sdk = getCustodySDK();
  const response = await sdk.intents.propose(request);
  return { request, response };
}
