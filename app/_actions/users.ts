"use server";

import { v4 as uuidv4 } from "uuid";
import type {
  Core_MeReference,
  Core_ProposeIntentBody,
  Core_TrustedUser,
  Core_TrustedUsersCollection,
  GetUsersQueryParams,
} from "custody";

import {
  getCurrentUser,
  getCustodySDK,
  proposeIntent,
  type ProposeIntentResult,
} from "@/app/lib/custody";
import { buildProposeIntent } from "@/app/lib/intent-builder";

type IntentPayload = Core_ProposeIntentBody["request"]["payload"];
type UpdateUserPayload = Extract<IntentPayload, { type: "v0_UpdateUser" }>;

export type UserFilters = {
  limit?: number;
  startingAfter?: string;
  sortBy?: string;
  sortOrder?: string;
  alias?: string;
  lock?: string[];
};

type UserQueryParams = NonNullable<GetUsersQueryParams>;

function buildUserQueryParams(filters: UserFilters): UserQueryParams {
  const q: UserQueryParams = {};
  if (filters.limit !== undefined) q.limit = filters.limit;
  if (filters.startingAfter) q.startingAfter = filters.startingAfter;
  if (filters.sortBy) q.sortBy = filters.sortBy as UserQueryParams["sortBy"];
  if (filters.sortOrder)
    q.sortOrder = filters.sortOrder as UserQueryParams["sortOrder"];
  if (filters.alias) q.alias = filters.alias;
  if (filters.lock?.length) q.lock = filters.lock as UserQueryParams["lock"];
  return q;
}

export async function listUsers(
  domainId: string,
  filters: UserFilters = {},
): Promise<Core_TrustedUsersCollection> {
  if (!domainId) throw new Error("domainId is required");
  const sdk = getCustodySDK();
  return sdk.users.list({ domainId }, buildUserQueryParams(filters));
}

export async function getUser(
  domainId: string,
  userId: string,
): Promise<Core_TrustedUser> {
  if (!domainId) throw new Error("domainId is required");
  if (!userId) throw new Error("userId is required");
  const sdk = getCustodySDK();
  return sdk.users.get({ domainId, userId });
}

export async function getMe(): Promise<Core_MeReference> {
  const sdk = getCustodySDK();
  return sdk.users.me();
}

export type CreateUserInput = {
  domainId: string;
  alias: string;
  publicKey: string;
  roles: string[];
  lock?: "Unlocked" | "Locked";
  description?: string;
  loginIds?: Array<{ id: string; providerId: string }>;
};

export async function createUser(
  input: CreateUserInput,
): Promise<ProposeIntentResult> {
  const { domainId, alias, publicKey, roles, lock, description, loginIds } =
    input;
  if (!domainId) throw new Error("domainId is required");
  if (!alias) throw new Error("alias is required");
  if (!publicKey) throw new Error("publicKey is required");
  if (!roles || roles.length === 0)
    throw new Error("At least one role is required");

  const currentUser = await getCurrentUser(domainId);

  const request = buildProposeIntent({
    author: { id: currentUser.userId, domainId: currentUser.domainId },
    targetDomainId: domainId,
    payload: {
      id: uuidv4(),
      alias,
      publicKey,
      roles,
      lock: lock || "Unlocked",
      ...(description && { description }),
      customProperties: {},
      ...(loginIds &&
        loginIds.length > 0 && {
          loginIds: loginIds.map((login) => ({
            id: login.id,
            providerId: login.providerId,
          })),
        }),
      type: "v0_CreateUser",
    },
    description: description || `Create user: ${alias}`,
  });

  return proposeIntent(request);
}

export type UpdateUserInput = Omit<UpdateUserPayload, "type" | "customProperties"> & {
  domainId: string;
  customProperties?: UpdateUserPayload["customProperties"];
};

export async function updateUser(
  input: UpdateUserInput,
): Promise<ProposeIntentResult> {
  const {
    domainId,
    reference,
    alias,
    roles,
    description,
    customProperties,
    loginIds,
  } = input;
  if (!domainId) throw new Error("domainId is required");
  if (!reference?.id) throw new Error("reference.id is required");
  if (typeof reference?.revision !== "number")
    throw new Error("reference.revision is required");
  if (!alias) throw new Error("alias is required");
  if (!roles || roles.length === 0)
    throw new Error("At least one role is required");

  const currentUser = await getCurrentUser(domainId);

  const payload: UpdateUserPayload = {
    reference,
    alias,
    roles,
    customProperties: customProperties ?? {},
    ...(description !== undefined && { description }),
    ...(loginIds && loginIds.length > 0 && { loginIds }),
    type: "v0_UpdateUser",
  };

  const request = buildProposeIntent({
    author: { id: currentUser.userId, domainId: currentUser.domainId },
    targetDomainId: domainId,
    payload,
    description: description || `Update user: ${alias}`,
  });

  return proposeIntent(request);
}
