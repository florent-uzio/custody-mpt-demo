"use server";

import type {
  Core_IntentResponse,
  Core_XrplOperation,
  CustodyAccountSet,
} from "@florent-uzio/custody";
import { getCustodySDK } from "@/app/lib/custody";

/** The eight `asf*` flags accepted by an AccountSet `setFlag`/`clearFlag`. */
export type AccountSetFlag = NonNullable<CustodyAccountSet["setFlag"]>;

type AccountSetOperation = Extract<Core_XrplOperation, { type: "AccountSet" }>;

export type AccountSetInput = {
  /** XRPL r-address of the account being modified. */
  account: string;
  domainId: string;
  setFlag?: AccountSetFlag;
  clearFlag?: AccountSetFlag;
  /** Raw transfer rate (1,000,000,000 = 0% fee; 0 removes the rate). */
  transferRate?: number;
};

/**
 * Result of `accountSet`. Unlike the shared `ProposeIntentResult` contract,
 * `custody.xrpl.proposeIntent` builds and submits the intent envelope internally
 * and only returns `Core_IntentResponse`, so there is no `request` body to echo.
 * `submitted` carries the exact params handed to the SDK for the request panel.
 */
export type AccountSetResult = {
  requestId: string;
  response: Core_IntentResponse;
  submitted: {
    Account: string;
    operation: AccountSetOperation;
    options: { domainId: string; feePriority: "Low"; description: string };
  };
};

export async function accountSet(
  input: AccountSetInput,
): Promise<AccountSetResult> {
  const { account, domainId, setFlag, clearFlag, transferRate } = input;

  if (!account) throw new Error("account is required");
  if (!domainId) throw new Error("domainId is required");
  if (setFlag && clearFlag && setFlag === clearFlag) {
    throw new Error("setFlag and clearFlag cannot be the same flag");
  }

  const operation: AccountSetOperation = { type: "AccountSet" };
  if (setFlag) operation.setFlag = setFlag;
  if (clearFlag) operation.clearFlag = clearFlag;
  if (transferRate !== undefined) operation.transferRate = transferRate;

  const options = {
    domainId,
    feePriority: "Low" as const,
    description: "AccountSet",
  };

  const sdk = getCustodySDK();
  const response = await sdk.xrpl.proposeIntent({ Account: account, operation }, options);

  return {
    requestId: response.requestId,
    response,
    submitted: { Account: account, operation, options },
  };
}
