"use server";

import type {
  Core_ApiTicker,
  Core_ProposeIntentBody,
  Core_TickersCollection,
  GetTickersQueryParams,
} from "@florent-uzio/custody";

import {
  getCustodySDK,
  getCurrentUser,
  proposeIntent,
  type ProposeIntentResult,
} from "@/app/lib/custody";
import { buildProposeIntent } from "@/app/lib/intent-builder";

type CreateTickerPayload = Extract<
  Core_ProposeIntentBody["request"]["payload"],
  { type: "v0_CreateTicker" }
>;
type UpdateTickerPayload = Extract<
  Core_ProposeIntentBody["request"]["payload"],
  { type: "v0_UpdateTicker" }
>;
type LockTickerPayload = Extract<
  Core_ProposeIntentBody["request"]["payload"],
  { type: "v0_LockTicker" }
>;
type UnlockTickerPayload = Extract<
  Core_ProposeIntentBody["request"]["payload"],
  { type: "v0_UnlockTicker" }
>;

export type ProposeCreateTickerInput = Omit<CreateTickerPayload, "type"> & {
  domainId: string;
};

export type ProposeUpdateTickerInput = Omit<UpdateTickerPayload, "type"> & {
  domainId: string;
};

export type ProposeLockTickerInput = Omit<LockTickerPayload, "type"> & {
  domainId: string;
};

export type ProposeUnlockTickerInput = Omit<UnlockTickerPayload, "type"> & {
  domainId: string;
};

export async function listTickers(
  params: GetTickersQueryParams = {},
): Promise<Core_TickersCollection> {
  const sdk = getCustodySDK();
  return sdk.tickers.list(params);
}

export async function getTicker(tickerId: string): Promise<Core_ApiTicker> {
  if (!tickerId) throw new Error("tickerId is required");
  const sdk = getCustodySDK();
  return sdk.tickers.get({ tickerId });
}

export async function proposeCreateTicker(
  input: ProposeCreateTickerInput,
): Promise<ProposeIntentResult> {
  const { domainId, ...rest } = input;
  if (!domainId) throw new Error("domainId is required");

  const currentUser = await getCurrentUser(domainId);

  const payload: CreateTickerPayload = { ...rest, type: "v0_CreateTicker" };

  const request = buildProposeIntent({
    author: { id: currentUser.userId, domainId: currentUser.domainId },
    targetDomainId: domainId,
    payload,
    description: `Create ticker: ${rest.name}`,
  });

  return proposeIntent(request);
}

export async function proposeUpdateTicker(
  input: ProposeUpdateTickerInput,
): Promise<ProposeIntentResult> {
  const { domainId, ...rest } = input;
  if (!domainId) throw new Error("domainId is required");

  const currentUser = await getCurrentUser(domainId);

  const payload: UpdateTickerPayload = { ...rest, type: "v0_UpdateTicker" };

  const request = buildProposeIntent({
    author: { id: currentUser.userId, domainId: currentUser.domainId },
    targetDomainId: domainId,
    payload,
    description: `Update ticker: ${rest.name}`,
  });

  return proposeIntent(request);
}

export async function proposeLockTicker(
  input: ProposeLockTickerInput,
): Promise<ProposeIntentResult> {
  const { domainId, ...rest } = input;
  if (!domainId) throw new Error("domainId is required");

  const currentUser = await getCurrentUser(domainId);

  const payload: LockTickerPayload = { ...rest, type: "v0_LockTicker" };

  const request = buildProposeIntent({
    author: { id: currentUser.userId, domainId: currentUser.domainId },
    targetDomainId: domainId,
    payload,
    description: "Lock ticker",
  });

  return proposeIntent(request);
}

export async function proposeUnlockTicker(
  input: ProposeUnlockTickerInput,
): Promise<ProposeIntentResult> {
  const { domainId, ...rest } = input;
  if (!domainId) throw new Error("domainId is required");

  const currentUser = await getCurrentUser(domainId);

  const payload: UnlockTickerPayload = { ...rest, type: "v0_UnlockTicker" };

  const request = buildProposeIntent({
    author: { id: currentUser.userId, domainId: currentUser.domainId },
    targetDomainId: domainId,
    payload,
    description: "Unlock ticker",
  });

  return proposeIntent(request);
}
