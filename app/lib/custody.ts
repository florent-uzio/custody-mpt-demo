import {
  RippleCustody,
  type Core_IntentResponse,
  type Core_MeReference,
  type Core_ProposeIntentBody,
} from "@florent-uzio/custody";
import { getConfigValue } from "./config";
import {
  buildProposeIntent,
  buildTransactionOrderPayload,
  type BuildTransactionOrderArgs,
} from "./intent-builder";

export type ProposeIntentResult = {
  request: Core_ProposeIntentBody;
  response: Core_IntentResponse;
  requestId: string;
};

export async function proposeIntent(
  request: Core_ProposeIntentBody,
): Promise<ProposeIntentResult> {
  const response = await getCustodySDK().intents.propose(request);
  return { request, response, requestId: response.requestId };
}

export type ProposeXrplTransactionArgs = {
  domainId: string;
  accountId: string;
  operation: BuildTransactionOrderArgs["operation"];
  feePriority?: BuildTransactionOrderArgs["feePriority"];
  /** Request-level description (`request.description`). */
  description?: string;
  /** Request-level custom properties (`request.customProperties`). */
  customProperties?: BuildTransactionOrderArgs["customProperties"];
  /** Payload-level description; defaults to `description`. */
  payloadDescription?: string;
  /** Payload-level custom properties; defaults to `customProperties`. */
  payloadCustomProperties?: BuildTransactionOrderArgs["customProperties"];
};

/**
 * Shared builder for XRPL `v0_CreateTransactionOrder` intents. Resolves the
 * current user + account ledger, assembles the propose envelope, and submits
 * it — collapsing the boilerplate that every XRPL operation action repeated.
 *
 * Note: `author.domainId` and `targetDomainId` both use the input `domainId`;
 * since `getCurrentUser(domainId)` returns the matching domain, that domain's
 * id always equals the input `domainId`.
 */
export async function proposeXrplTransaction(
  args: ProposeXrplTransactionArgs,
): Promise<ProposeIntentResult> {
  const { domainId, accountId, operation } = args;
  if (!domainId) throw new Error("domainId is required");
  if (!accountId) throw new Error("accountId is required");

  const [currentUser, ledgerId] = await Promise.all([
    getCurrentUser(domainId),
    getAccountLedgerId(domainId, accountId),
  ]);

  const request = buildProposeIntent({
    author: { id: currentUser.userId, domainId },
    targetDomainId: domainId,
    payload: buildTransactionOrderPayload({
      ledgerId,
      accountId,
      feePriority: args.feePriority,
      operation,
      description: args.payloadDescription ?? args.description,
      customProperties: args.payloadCustomProperties ?? args.customProperties,
    }),
    description: args.description,
    customProperties: args.customProperties,
  });

  return proposeIntent(request);
}

let custodyInstance: RippleCustody | null = null;

export function resetCustodySDK(): void {
  custodyInstance = null;
}

export function getCustodySDK(): RippleCustody {
  if (!custodyInstance) {
    const authUrl = getConfigValue("AUTH_URL");
    const apiUrl = getConfigValue("API_URL");
    const privateKey = getConfigValue("PRIVATE_KEY");
    const publicKey = getConfigValue("PUBLIC_KEY");

    if (!authUrl || !apiUrl) {
      throw new Error(
        "Missing required environment variables: AUTH_URL and API_URL",
      );
    }

    custodyInstance = new RippleCustody({
      authUrl,
      apiUrl,
      privateKey,
      publicKey,
    });

    console.log("RippleCustody SDK initialized (singleton)");
  }

  return custodyInstance;
}

/**
 * User info extracted from the custody SDK's users.me() response
 */
export interface CurrentUserInfo {
  userId: string;
  domainId: string;
  publicKey: string;
}

/**
 * Get the current authenticated user's information from the Custody SDK.
 * This uses the users.me() endpoint and extracts the user ID from the first domain.
 *
 * @param targetDomainId - Optional: If provided, looks for this domain in the user's domains.
 *                         If not provided, uses the first domain (requires exactly 1 domain).
 * @returns CurrentUserInfo with userId, domainId, and publicKey
 * @throws Error if user has no domains or domain not found
 */
/**
 * Get the ledger ID for a given account by fetching account details.
 * Falls back to the first activated ledger if data.ledgerId is not set.
 */
export async function getAccountLedgerId(
  domainId: string,
  accountId: string,
): Promise<string> {
  const custody = getCustodySDK();
  const account = await custody.accounts.get({ domainId, accountId });

  const ledgerId =
    account?.data?.ledgerId ??
    account?.additionalDetails?.ledgers?.find(
      (l: { status: string; ledgerId: string }) => l.status === "Activated",
    )?.ledgerId;

  if (!ledgerId) {
    throw new Error(
      `No ledger ID found for account ${accountId} in domain ${domainId}`,
    );
  }

  return ledgerId;
}

export async function getCurrentUser(
  targetDomainId?: string,
): Promise<CurrentUserInfo> {
  const custody = getCustodySDK();
  const meResponse: Core_MeReference = await custody.users.me();

  if (!meResponse.domains || meResponse.domains.length === 0) {
    throw new Error("Current user has no domains assigned");
  }

  let domain;

  if (targetDomainId) {
    // Find the specific domain
    domain = meResponse.domains.find((d) => d.id === targetDomainId);
    if (!domain) {
      throw new Error(
        `Domain ${targetDomainId} not found in user's domains. Available domains: ${meResponse.domains
          .map((d) => d.id)
          .join(", ")}`,
      );
    }
  } else {
    // Use first domain (require exactly 1 for safety)
    if (meResponse.domains.length > 1) {
      throw new Error(
        `User has multiple domains (${meResponse.domains.length}). Please specify a targetDomainId.`,
      );
    }
    domain = meResponse.domains[0];
  }

  if (!domain.userReference?.id) {
    throw new Error("User reference ID not found in domain");
  }

  return {
    userId: domain.userReference.id,
    domainId: domain.id,
    publicKey: meResponse.publicKey,
  };
}
