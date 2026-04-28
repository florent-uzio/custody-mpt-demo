"use server";

import type {
  Core_IntentResponse,
  Core_ProposeIntentBody,
  Core_TrustedIntent,
  Core_GetIntentsQueryParams,
} from "custody";

import {
  getAccountLedgerId,
  getCurrentUser,
  getCustodySDK,
} from "@/app/lib/custody";
import {
  buildProposeIntent,
  buildTransactionOrderPayload,
} from "@/app/lib/intent-builder";
import type { IntentsCollection } from "@/app/intents/intents.types";

export type PaymentType = "XRP" | "IOU" | "MPT";
export type DestinationType = "Address" | "Account" | "Endpoint";

export type ProposePaymentInput = {
  domainId: string;
  accountId: string;
  paymentType?: PaymentType;
  destinationType?: DestinationType;
  destinationAddress?: string;
  destinationAccountId?: string;
  destinationEndpointId?: string;
  amount: string;
  currency?: string;
  issuer?: string;
  issuanceId?: string;
  description?: string;
};

export type ProposeReleaseTransfersInput = {
  domainId: string;
  accountId: string;
  transferIds: string[];
};

export type ProposeIntentResult = {
  request: Core_ProposeIntentBody;
  response: unknown;
};

export type IntentFilters = {
  limit?: number;
  startingAfter?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: string[];
};

type IntentQueryParams = NonNullable<Core_GetIntentsQueryParams>;

function buildIntentQueryParams(filters: IntentFilters): IntentQueryParams {
  const q: IntentQueryParams = {};
  if (filters.limit !== undefined) q.limit = filters.limit;
  if (filters.startingAfter) q.startingAfter = filters.startingAfter;
  if (filters.sortBy) q.sortBy = filters.sortBy as IntentQueryParams["sortBy"];
  if (filters.sortOrder) q.sortOrder = filters.sortOrder as IntentQueryParams["sortOrder"];
  if (filters.status?.length)
    q["state.status"] = filters.status as IntentQueryParams["state.status"];
  return q;
}

export async function listIntents(
  domainId: string,
  filters: IntentFilters = {},
): Promise<IntentsCollection> {
  if (!domainId) throw new Error("domainId is required");
  const sdk = getCustodySDK();
  return sdk.intents.list(
    { domainId },
    buildIntentQueryParams(filters),
  ) as unknown as Promise<IntentsCollection>;
}

export async function getIntent(
  domainId: string,
  intentId: string,
): Promise<Core_IntentResponse | Core_TrustedIntent> {
  if (!domainId) throw new Error("domainId is required");
  if (!intentId) throw new Error("intentId is required");
  const sdk = getCustodySDK();
  return sdk.intents.get({ domainId, intentId });
}

function buildPaymentDestination(
  destinationType: DestinationType,
  input: ProposePaymentInput,
) {
  if (destinationType === "Account") {
    return { accountId: input.destinationAccountId as string, type: "Account" };
  }
  if (destinationType === "Endpoint") {
    return {
      endpointId: input.destinationEndpointId as string,
      type: "Endpoint",
    };
  }
  return { address: input.destinationAddress as string, type: "Address" };
}

function buildPaymentAmount(
  paymentType: PaymentType,
  amount: string,
  input: ProposePaymentInput,
): unknown {
  if (paymentType === "IOU") {
    return {
      value: amount,
      currency: input.currency as string,
      issuer: input.issuer as string,
    };
  }
  if (paymentType === "MPT") {
    return {
      value: amount,
      mpt_issuance_id: input.issuanceId as string,
    };
  }
  return amount;
}

export async function proposePayment(
  input: ProposePaymentInput,
): Promise<ProposeIntentResult> {
  const {
    domainId,
    accountId,
    paymentType = "XRP",
    destinationType = "Address",
    amount,
    description,
  } = input;

  if (!domainId) throw new Error("domainId is required");
  if (!accountId) throw new Error("accountId is required");
  if (!amount) throw new Error("amount is required");
  if (destinationType === "Address" && !input.destinationAddress)
    throw new Error("destinationAddress is required");
  if (destinationType === "Account" && !input.destinationAccountId)
    throw new Error("destinationAccountId is required");
  if (destinationType === "Endpoint" && !input.destinationEndpointId)
    throw new Error("destinationEndpointId is required");
  if (paymentType === "IOU" && (!input.currency || !input.issuer))
    throw new Error("currency and issuer are required for IOU payments");
  if (paymentType === "MPT" && !input.issuanceId)
    throw new Error("issuanceId is required for MPT payments");

  const currentUser = await getCurrentUser(domainId);
  const ledgerId = await getAccountLedgerId(domainId, accountId);

  const request = buildProposeIntent({
    author: { id: currentUser.userId, domainId: currentUser.domainId },
    targetDomainId: currentUser.domainId,
    payload: buildTransactionOrderPayload({
      ledgerId,
      accountId,
      operation: {
        // @ts-expect-error preserved from original route
        destination: buildPaymentDestination(destinationType, input),
        amount: buildPaymentAmount(paymentType, amount, input) as string,
        type: "Payment",
      },
      description: description || "Payment",
      customProperties: { property1: "flo" },
    }),
    description: description || "Payment",
    customProperties: { property1: "flo" },
  });

  const sdk = getCustodySDK();
  const response = await sdk.intents.propose(request);
  return { request, response };
}

export async function proposeReleaseTransfers(
  input: ProposeReleaseTransfersInput,
): Promise<ProposeIntentResult> {
  const { domainId, accountId, transferIds } = input;
  if (!accountId) throw new Error("accountId is required");
  if (!transferIds || transferIds.length === 0)
    throw new Error("transferIds array is required and must not be empty");
  if (!domainId) throw new Error("domainId is required");

  const currentUser = await getCurrentUser(domainId);

  const request = buildProposeIntent({
    author: { id: currentUser.userId, domainId: currentUser.domainId },
    targetDomainId: currentUser.domainId,
    payload: {
      accountId,
      transferIds,
      type: "v0_ReleaseQuarantinedTransfers",
    },
    description: `Release ${transferIds.length} quarantined transfer${
      transferIds.length > 1 ? "s" : ""
    }`,
  });

  const sdk = getCustodySDK();
  const response = await sdk.intents.propose(request);
  return { request, response };
}
