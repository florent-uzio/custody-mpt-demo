"use server";

import type { Core_XrplOperation, CustodyAccountSet } from "@florent-uzio/custody";
import {
  proposeXrplTransaction,
  type ProposeIntentResult,
} from "@/app/lib/custody";
import type { MaximumFee } from "@/app/lib/maximum-fee";

/** The eight `asf*` flags accepted by an AccountSet `setFlag`/`clearFlag`. */
export type AccountSetFlag = NonNullable<CustodyAccountSet["setFlag"]>;

type AccountSetOperation = Extract<Core_XrplOperation, { type: "AccountSet" }>;

export type AccountSetInput = {
  /** Custody account whose settings are modified. */
  accountId: string;
  domainId: string;
  setFlag?: AccountSetFlag;
  clearFlag?: AccountSetFlag;
  /** Raw transfer rate (1,000,000,000 = 0% fee; 0 removes the rate). */
  transferRate?: number;
  /** Cap on the fee this transaction may burn. Omit for the default; `null` to send no cap. */
  maximumFee?: MaximumFee;
};

export async function accountSet(
  input: AccountSetInput,
): Promise<ProposeIntentResult> {
  const { accountId, domainId, setFlag, clearFlag, transferRate, maximumFee } =
    input;

  if (!accountId) throw new Error("accountId is required");
  if (!domainId) throw new Error("domainId is required");
  if (setFlag && clearFlag && setFlag === clearFlag) {
    throw new Error("setFlag and clearFlag cannot be the same flag");
  }

  const operation: AccountSetOperation = { type: "AccountSet" };
  if (setFlag) operation.setFlag = setFlag;
  if (clearFlag) operation.clearFlag = clearFlag;
  if (transferRate !== undefined) operation.transferRate = transferRate;

  return proposeXrplTransaction({
    domainId,
    accountId,
    feePriority: "Low",
    maximumFee,
    operation,
    description: "AccountSet",
  });
}
