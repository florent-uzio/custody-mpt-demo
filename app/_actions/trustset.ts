"use server";

import { convertStringToHex } from "xrpl";
import type { Core_ProposeIntentBody } from "custody";

import { getAccountLedgerId, getCustodySDK } from "@/app/lib/custody";
import {
  buildProposeIntent,
  buildTransactionOrderPayload,
} from "@/app/lib/intent-builder";

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
  const trustlineProperties = customProperties || {
    description: "Create a Trustline",
  };

  const request = buildProposeIntent({
    author: { id: CURRENT_USER_ID, domainId },
    targetDomainId: domainId,
    payload: buildTransactionOrderPayload({
      ledgerId,
      accountId,
      feePriority: "Low",
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
      description: "TrustSet",
      customProperties: trustlineProperties,
    }),
    description: "Create TrustSet",
    customProperties: trustlineProperties,
  });

  const sdk = getCustodySDK();
  const response = await sdk.intents.propose(request);
  return { request, response };
}
