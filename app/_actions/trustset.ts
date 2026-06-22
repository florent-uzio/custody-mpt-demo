"use server";

import { convertStringToHex } from "xrpl";

import {
  getAccountLedgerId,
  getCurrentUser,
  proposeIntent,
  type ProposeIntentResult,
} from "@/app/lib/custody";
import {
  buildProposeIntent,
  buildTransactionOrderPayload,
} from "@/app/lib/intent-builder";

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

function toCurrencyHex(currency: string): string {
  if (currency.length <= 3) return currency;
  const hex = convertStringToHex(currency);
  return hex.padEnd(40, "0");
}

export async function trustSet(
  input: TrustSetInput,
): Promise<ProposeIntentResult> {
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

  const [ledgerId, currentUser] = await Promise.all([
    getAccountLedgerId(domainId, accountId),
    getCurrentUser(domainId),
  ]);
  const trustlineProperties = customProperties || {
    description: "Create a Trustline",
  };

  const request = buildProposeIntent({
    author: { id: currentUser.userId, domainId },
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

  return proposeIntent(request);
}
