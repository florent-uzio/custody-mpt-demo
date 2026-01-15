import { RippleCustody, type Core_MeReference } from "custody";

let custodyInstance: RippleCustody | null = null;

export function getCustodySDK(): RippleCustody {
  if (!custodyInstance) {
    const authUrl = process.env.AUTH_URL;
    const apiUrl = process.env.API_URL;
    const privateKey = process.env.PRIVATE_KEY || "";
    const publicKey = process.env.PUBLIC_KEY || "";

    if (!authUrl || !apiUrl) {
      throw new Error(
        "Missing required environment variables: AUTH_URL and API_URL"
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
export async function getCurrentUser(
  targetDomainId?: string
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
          .join(", ")}`
      );
    }
  } else {
    // Use first domain (require exactly 1 for safety)
    if (meResponse.domains.length > 1) {
      throw new Error(
        `User has multiple domains (${meResponse.domains.length}). Please specify a targetDomainId.`
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
