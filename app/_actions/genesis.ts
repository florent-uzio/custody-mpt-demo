"use server";

import type { RunGenesisBody } from "@florent-uzio/custody";
import { getCustodySDK } from "@/app/lib/custody";

export async function runGenesis(body: RunGenesisBody): Promise<void> {
  if (!body?.rootDomainSetup) throw new Error("rootDomainSetup is required");
  const rds = body.rootDomainSetup;
  if (!rds.id?.trim()) throw new Error("rootDomainSetup.id is required");
  if (!rds.alias?.trim()) throw new Error("rootDomainSetup.alias is required");
  if (!rds.lock) throw new Error("rootDomainSetup.lock is required");
  if (!rds.permissions)
    throw new Error("rootDomainSetup.permissions is required");
  if (!Array.isArray(rds.users))
    throw new Error("rootDomainSetup.users must be an array");
  if (!Array.isArray(rds.policies))
    throw new Error("rootDomainSetup.policies must be an array");

  const sdk = getCustodySDK();
  await sdk.genesis.run(body);
}
