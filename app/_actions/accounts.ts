"use server";

import { v4 as uuidv4 } from "uuid";
import type {
  Core_AccountsCollection,
  Core_AddressesCollection,
  Core_ApiAccount,
  Core_BalancesCollection,
  Core_ProposeIntentBody,
  GetAccountsQueryParams,
} from "custody";

import { getCurrentUser, getCustodySDK } from "@/app/lib/custody";
import { buildProposeIntent } from "@/app/lib/intent-builder";

export type AccountFilters = {
  limit?: number;
  startingAfter?: string;
  sortBy?: string;
  sortOrder?: string;
  ledgerId?: string;
  alias?: string;
  vaultId?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  description?: string;
  customProperties?: string[];
  locks?: string[];
  processingStatus?: string;
  additionalLedgerIds?: string[];
  additionalLedgerStatuses?: string[];
};

export type CreateAccountInput = {
  domainId: string;
  alias: string;
  vaultId: string;
  keyStrategy: "VaultSoft" | "VaultHard" | "Random";
  ledgerIds?: string[];
  lock?: "Unlocked" | "Locked";
  description?: string;
};

export type CreateAccountResult = {
  request: Core_ProposeIntentBody;
  response: unknown;
};

type AccountQueryParams = NonNullable<GetAccountsQueryParams>;

function buildAccountQueryParams(filters: AccountFilters): AccountQueryParams {
  const q: AccountQueryParams = {};
  if (filters.limit !== undefined) q.limit = filters.limit;
  if (filters.startingAfter) q.startingAfter = filters.startingAfter;
  if (filters.sortBy) q.sortBy = filters.sortBy as AccountQueryParams["sortBy"];
  if (filters.sortOrder) q.sortOrder = filters.sortOrder as AccountQueryParams["sortOrder"];
  if (filters.ledgerId) q.ledgerId = filters.ledgerId;
  if (filters.alias) q.alias = filters.alias;
  if (filters.vaultId) q["providerDetails.vaultId"] = filters.vaultId;
  if (filters.createdBy) q["metadata.createdBy"] = filters.createdBy;
  if (filters.lastModifiedBy) q["metadata.lastModifiedBy"] = filters.lastModifiedBy;
  if (filters.description) q["metadata.description"] = filters.description;
  if (filters.customProperties?.length)
    q["metadata.customProperties"] = filters.customProperties;
  if (filters.locks?.length) q.lock = filters.locks as AccountQueryParams["lock"];
  if (filters.processingStatus)
    q["additionalDetails.processingStatus"] =
      filters.processingStatus as AccountQueryParams["additionalDetails.processingStatus"];
  if (filters.additionalLedgerIds?.length)
    q["additionalDetails.ledgers.ledgerId"] = filters.additionalLedgerIds;
  if (filters.additionalLedgerStatuses?.length)
    q["additionalDetails.ledgers.status"] =
      filters.additionalLedgerStatuses as AccountQueryParams["additionalDetails.ledgers.status"];
  return q;
}

export async function listAccounts(
  domainId: string,
  filters: AccountFilters = {},
): Promise<Core_AccountsCollection> {
  if (!domainId) throw new Error("domainId is required");
  const sdk = getCustodySDK();
  return sdk.accounts.list({ domainId }, buildAccountQueryParams(filters));
}

export async function getAccount(
  domainId: string,
  accountId: string,
): Promise<Core_ApiAccount> {
  if (!domainId) throw new Error("domainId is required");
  if (!accountId) throw new Error("accountId is required");
  const sdk = getCustodySDK();
  return sdk.accounts.get({ domainId, accountId });
}

export async function getAccountAddresses(
  domainId: string,
  accountId: string,
): Promise<Core_AddressesCollection> {
  if (!domainId) throw new Error("domainId is required");
  if (!accountId) throw new Error("accountId is required");
  const sdk = getCustodySDK();
  return sdk.accounts.addresses({ domainId, accountId });
}

export async function getAccountBalances(
  domainId: string,
  accountId: string,
): Promise<Core_BalancesCollection> {
  if (!domainId) throw new Error("domainId is required");
  if (!accountId) throw new Error("accountId is required");
  const sdk = getCustodySDK();
  return sdk.accounts.getAccountBalances({ domainId, accountId });
}

export async function createAccount(
  input: CreateAccountInput,
): Promise<CreateAccountResult> {
  const { domainId, alias, vaultId, keyStrategy, ledgerIds, lock, description } =
    input;
  if (!domainId) throw new Error("domainId is required");
  if (!alias) throw new Error("alias is required");
  if (!vaultId) throw new Error("vaultId is required");
  if (!keyStrategy) throw new Error("keyStrategy is required");

  const currentUser = await getCurrentUser(domainId);

  const request = buildProposeIntent({
    author: { id: currentUser.userId, domainId: currentUser.domainId },
    targetDomainId: domainId,
    payload: {
      id: uuidv4(),
      alias,
      providerDetails: { vaultId, keyStrategy, type: "Vault" },
      lock: lock || "Unlocked",
      ...(description && { description }),
      ...(ledgerIds && ledgerIds.length > 0 && { ledgerIds }),
      customProperties: {},
      type: "v0_CreateAccount",
    },
    description: description || `Create account: ${alias}`,
  });

  const sdk = getCustodySDK();
  const response = await sdk.intents.propose(request);
  return { request, response };
}
