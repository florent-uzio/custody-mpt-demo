"use server";

import type {
  Core_ApiCmptComputeStatusResponse,
  Core_ApiInitiateCmptComputeResponse,
  InitiateCmptComputeBody,
  WaitForCmptComputeOptions,
  WaitForCmptComputeResult,
} from "@florent-uzio/custody";
import { getCustodySDK } from "@/app/lib/custody";

/**
 * Polling knobs for the `…AndWait` variants. `WaitForCmptComputeOptions.onStatusCheck`
 * is deliberately dropped: a callback cannot cross the Server Action boundary, so the
 * UI reports only the final status.
 */
export type CmptWaitOptions = Omit<WaitForCmptComputeOptions, "onStatusCheck">;

export type InitiateCmptComputeInput = {
  domainId: string;
  accountId: string;
} & InitiateCmptComputeBody;

export type CmptComputeStatusInput = {
  domainId: string;
  accountId: string;
  computeId: string;
};

function splitInitiateInput(input: InitiateCmptComputeInput) {
  const { domainId, accountId, ...body } = input;
  if (!domainId) throw new Error("domainId is required");
  if (!accountId) throw new Error("accountId is required");
  if (!body.tokenIdentifier?.issuanceId)
    throw new Error("tokenIdentifier.issuanceId is required");
  if (!body.amount) throw new Error("amount is required");
  if (!body.ledgerId) throw new Error("ledgerId is required");
  return { params: { domainId, accountId }, body };
}

function statusParams(input: CmptComputeStatusInput) {
  const { domainId, accountId, computeId } = input;
  if (!domainId) throw new Error("domainId is required");
  if (!accountId) throw new Error("accountId is required");
  if (!computeId) throw new Error("computeId is required");
  return { domainId, accountId, computeId };
}

export async function initiateCmptCompute(
  input: InitiateCmptComputeInput,
): Promise<Core_ApiInitiateCmptComputeResponse> {
  const { params, body } = splitInitiateInput(input);
  return getCustodySDK().accounts.initiateCmptCompute(params, body);
}

/** Initiates and polls until the computation reaches a terminal status. */
export async function initiateCmptComputeAndWait(
  input: InitiateCmptComputeInput,
  options?: CmptWaitOptions,
): Promise<WaitForCmptComputeResult> {
  const { params, body } = splitInitiateInput(input);
  return getCustodySDK().accounts.initiateCmptComputeAndWait(
    params,
    body,
    options,
  );
}

export async function getCmptComputeStatus(
  input: CmptComputeStatusInput,
): Promise<Core_ApiCmptComputeStatusResponse> {
  return getCustodySDK().accounts.getCmptComputeStatus(statusParams(input));
}

/** Polls an existing computation until it reaches a terminal status. */
export async function getCmptComputeStatusAndWait(
  input: CmptComputeStatusInput,
  options?: CmptWaitOptions,
): Promise<WaitForCmptComputeResult> {
  return getCustodySDK().accounts.getCmptComputeStatusAndWait(
    statusParams(input),
    options,
  );
}
