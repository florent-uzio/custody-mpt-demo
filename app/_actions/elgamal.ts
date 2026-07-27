"use server";

import {
  getCurrentUser,
  proposeIntent,
  type ProposeIntentResult,
} from "@/app/lib/custody";
import { buildProposeIntent } from "@/app/lib/intent-builder";

export type ProvisionElGamalKeyPairInput = {
  domainId: string;
  accountId: string;
  ledgerId: string;
};

/**
 * Proposes a `v0_ProvisionElGamalKeyPair` intent — provisions the ElGamal key
 * pair an account needs before it can hold or move a confidential MPT balance.
 */
export async function provisionElGamalKeyPair(
  input: ProvisionElGamalKeyPairInput,
): Promise<ProposeIntentResult> {
  const { domainId, accountId, ledgerId } = input;
  if (!domainId) throw new Error("domainId is required");
  if (!accountId) throw new Error("accountId is required");
  if (!ledgerId) throw new Error("ledgerId is required");

  const currentUser = await getCurrentUser(domainId);

  const request = buildProposeIntent({
    author: { id: currentUser.userId, domainId: currentUser.domainId },
    targetDomainId: domainId,
    payload: {
      accountId,
      ledgerId,
      type: "v0_ProvisionElGamalKeyPair",
    },
    description: "Provision ElGamal key pair",
    customProperties: { property1: "provision-elgamal" },
  });

  return proposeIntent(request);
}
