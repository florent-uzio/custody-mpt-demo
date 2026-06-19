"use server";

import { convertStringToHex } from "xrpl";
import type { Core_ProposeIntentBody } from "@florent-uzio/custody";

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

// Derive the Clawback operation shape from the SDK rather than redeclaring it.
type TxOrderPayload = Extract<
  Core_ProposeIntentBody["request"]["payload"],
  { type: "v0_CreateTransactionOrder" }
>;
type XrplParameters = Extract<TxOrderPayload["parameters"], { type: "XRPL" }>;
type XrplOperation = NonNullable<XrplParameters["operation"]>;
type ClawbackOperation = Extract<XrplOperation, { type: "Clawback" }>;

export type ClawbackCurrency = ClawbackOperation["currency"];
export type ClawbackHolder = ClawbackOperation["holder"];

export type ClawbackInput = {
  domainId: string;
  /** The issuer account performing the clawback. */
  accountId: string;
  currency: ClawbackCurrency;
  holder: ClawbackHolder;
  value: string;
  customProperties?: Record<string, string>;
};

/** XRPL currency codes longer than 3 chars must be sent as 40-char hex. */
function toCurrencyHex(currency: string): string {
  if (currency.length <= 3) return currency;
  return convertStringToHex(currency).padEnd(40, "0");
}

function normalizeCurrency(currency: ClawbackCurrency): ClawbackCurrency {
  switch (currency.type) {
    case "Currency":
      if (!currency.code?.trim() || !currency.issuer?.trim())
        throw new Error("Currency clawback requires a code and an issuer.");
      return { ...currency, code: toCurrencyHex(currency.code.trim()) };
    case "MultiPurposeToken":
      if (!currency.issuanceId?.trim())
        throw new Error("MultiPurposeToken clawback requires an issuanceId.");
      return currency;
    case "TickerId":
      if (!currency.tickerId?.trim())
        throw new Error("TickerId clawback requires a tickerId.");
      return currency;
    default:
      return currency;
  }
}

function validateHolder(holder: ClawbackHolder): void {
  if (holder.type === "Account" && !holder.accountId?.trim())
    throw new Error("Account holder requires an accountId.");
  if (holder.type === "Address" && !holder.address?.trim())
    throw new Error("Address holder requires an address.");
  if (holder.type === "Endpoint" && !holder.endpointId?.trim())
    throw new Error("Endpoint holder requires an endpointId.");
}

export async function clawback(
  input: ClawbackInput,
): Promise<ProposeIntentResult> {
  const { domainId, accountId, currency, holder, value, customProperties } =
    input;

  if (!domainId) throw new Error("domainId is required");
  if (!accountId) throw new Error("accountId is required");
  if (value === undefined || value === "") throw new Error("value is required");

  const normalizedCurrency = normalizeCurrency(currency);
  validateHolder(holder);

  const currentUser = await getCurrentUser(domainId);
  const ledgerId = await getAccountLedgerId(domainId, accountId);
  const props = customProperties ?? { description: "Clawback" };

  const operation: ClawbackOperation = {
    type: "Clawback",
    currency: normalizedCurrency,
    holder,
    value: String(value),
  };

  const request = buildProposeIntent({
    author: { id: currentUser.userId, domainId: currentUser.domainId },
    targetDomainId: domainId,
    payload: buildTransactionOrderPayload({
      ledgerId,
      accountId,
      feePriority: "Low",
      operation,
      description: "Clawback",
      customProperties: props,
    }),
    description: "Clawback",
    customProperties: props,
  });

  return proposeIntent(request);
}
