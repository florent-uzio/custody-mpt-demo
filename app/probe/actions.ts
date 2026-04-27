"use server";

import { getCustodySDK } from "@/app/lib/custody";

export async function probeMe() {
  const sdk = getCustodySDK();
  const me = await sdk.users.me();
  return {
    publicKey: me.publicKey,
    domainCount: me.domains?.length ?? 0,
    firstDomainId: me.domains?.[0]?.id ?? null,
  };
}
