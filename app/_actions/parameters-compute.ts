"use server";

import type {
  Core_ApiInitiateParametersComputeResponse,
  Core_ApiParametersComputeStatusResponse,
  InitiateParametersComputeBody,
  WaitForParametersComputeOptions,
  WaitForParametersComputeResult,
} from "@florent-uzio/custody";
import { getCustodySDK } from "@/app/lib/custody";

/**
 * Polling knobs for the `…AndWait` variants. `WaitForParametersComputeOptions.onStatusCheck`
 * is deliberately dropped: a callback cannot cross the Server Action boundary, so the
 * UI reports only the final status.
 */
export type ParametersComputeWaitOptions = Omit<
  WaitForParametersComputeOptions,
  "onStatusCheck"
>;

export type InitiateParametersComputeInput = {
  domainId: string;
  accountId: string;
} & InitiateParametersComputeBody;

export type ParametersComputeStatusInput = {
  domainId: string;
  accountId: string;
  computeId: string;
};

function splitInitiateInput(input: InitiateParametersComputeInput) {
  const { domainId, accountId, ...body } = input;
  if (!domainId) throw new Error("domainId is required");
  if (!accountId) throw new Error("accountId is required");
  if (!body.tokenIdentifier?.issuanceId)
    throw new Error("tokenIdentifier.issuanceId is required");
  if (!body.amount) throw new Error("amount is required");
  if (!body.destination) throw new Error("destination is required");
  if (!body.ledgerId) throw new Error("ledgerId is required");
  return { params: { domainId, accountId }, body };
}

function statusParams(input: ParametersComputeStatusInput) {
  const { domainId, accountId, computeId } = input;
  if (!domainId) throw new Error("domainId is required");
  if (!accountId) throw new Error("accountId is required");
  if (!computeId) throw new Error("computeId is required");
  return { domainId, accountId, computeId };
}

export async function initiateParametersCompute(
  input: InitiateParametersComputeInput,
): Promise<Core_ApiInitiateParametersComputeResponse> {
  const { params, body } = splitInitiateInput(input);
  return getCustodySDK().accounts.initiateParametersCompute(params, body);
}

/** Initiates and polls until the computation reaches a terminal status. */
export async function initiateParametersComputeAndWait(
  input: InitiateParametersComputeInput,
  options?: ParametersComputeWaitOptions,
): Promise<WaitForParametersComputeResult> {
  const { params, body } = splitInitiateInput(input);
  return getCustodySDK().accounts.initiateParametersComputeAndWait(
    params,
    body,
    options,
  );
}

export async function getParametersComputeStatus(
  input: ParametersComputeStatusInput,
): Promise<Core_ApiParametersComputeStatusResponse> {
  return getCustodySDK().accounts.getParametersComputeStatus(
    statusParams(input),
  );
}

/** Polls an existing computation until it reaches a terminal status. */
export async function getParametersComputeStatusAndWait(
  input: ParametersComputeStatusInput,
  options?: ParametersComputeWaitOptions,
): Promise<WaitForParametersComputeResult> {
  return getCustodySDK().accounts.getParametersComputeStatusAndWait(
    statusParams(input),
    options,
  );
}
