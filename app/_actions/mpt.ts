"use server";

import {
  proposeXrplTransaction,
  type ProposeIntentResult,
} from "@/app/lib/custody";

export type MptCreateInput = {
  domainId: string;
  accountId: string;
  assetScale?: number;
  transferFee?: number;
  maximumAmount?: string | number;
  flags?: string[];
  metadata?: Record<string, unknown>;
  /**
   * Reorder `flags` into {@link FLAG_WIRE_ORDER} before signing, working around
   * the backend signature bug documented there. Exposed so the UI can toggle it
   * and show the raw backend behaviour. Defaults to `true`.
   */
  sortFlags?: boolean;
};

export type MptAuthorizeInput = {
  domainId: string;
  accountId: string;
  issuanceId: string;
};

export type MptDestroyInput = {
  domainId: string;
  accountId: string;
  issuanceId: string;
};

export type MptSetInput = {
  domainId: string;
  accountId: string;
  issuanceId: string;
  /** tfMPTLock (1) or tfMPTUnlock (2). Omitted for a keys-only / flag-only set. */
  flags?: 1 | 2;
  holder?: string;
  /**
   * XLS-96 §12: enables confidential balances on the issuance. The spec calls
   * this `tmfMPTSetCanHoldConfidentialBalance`; the custody API's mutable-flag
   * enum still uses the earlier draft name `MPTSetCanConfidentialAmount`.
   */
  canHoldConfidentialBalance?: boolean;
  /** 33-byte EC-ElGamal public key, base64 (44 chars), as the accounts API returns it. */
  issuerEncryptionKey?: string;
  /** 33-byte EC-ElGamal public key, base64 (44 chars). Requires the issuer key. */
  auditorEncryptionKey?: string;
};

/** The custody API's spelling of `tmfMPTSetCanHoldConfidentialBalance`. */
const MUTABLE_FLAG_CAN_HOLD_CONFIDENTIAL = "MPTSetCanConfidentialAmount";

/**
 * Order the custody API re-emits `MPTokenIssuanceCreate.flags` in.
 *
 * The API deserializes `flags` into an unordered set and re-serializes that set
 * when it verifies the request-body signature — but the SDK signs the canonical
 * JSON of what it *sent*, and JCS canonicalization preserves array order (it
 * only sorts object keys). Up to 4 flags the set keeps insertion order, so any
 * order verifies; at 5+ it becomes hash-ordered and re-emits this fixed order,
 * so anything else fails with `401 InvalidSignatureError`.
 *
 * Sending flags pre-sorted into that order makes the signed bytes match. This
 * is a workaround for a backend bug (the signature should be verified over the
 * received bytes); it can break if the backend's set implementation changes.
 */
const FLAG_WIRE_ORDER = [
  "tfMPTCanTransfer",
  "tfMPTCanLock",
  "tfMPTRequireAuth",
  "tfMPTCanTrade",
  "tfMPTCanClawback",
  "tfMPTCanEscrow",
];

/** Sorts known flags into {@link FLAG_WIRE_ORDER}; unknown ones keep their order at the end. */
function sortFlagsForWire(flags: string[]): string[] {
  const rank = (f: string) => {
    const i = FLAG_WIRE_ORDER.indexOf(f);
    return i === -1 ? FLAG_WIRE_ORDER.length : i;
  };
  return [...flags].sort((a, b) => rank(a) - rank(b));
}

/** 33-byte compressed EC point, base64 — the form the accounts API returns. */
const ENCRYPTION_KEY_RE = /^[A-Za-z0-9+/]{44}$/;

export async function mptCreate(input: MptCreateInput): Promise<ProposeIntentResult> {
  const {
    domainId,
    accountId,
    assetScale,
    transferFee,
    maximumAmount,
    flags,
    metadata,
    sortFlags = true,
  } = input;
  if (!accountId) throw new Error("accountId is required");
  if (!domainId) throw new Error("domainId is required");

  return proposeXrplTransaction({
    domainId,
    accountId,
    // SDK's flags union is stricter than the demo's free-form input;
    // matching the original route's `body: any` posture.
    operation: {
      type: "MPTokenIssuanceCreate",
      ...(assetScale !== undefined && { assetScale }),
      ...(transferFee !== undefined && transferFee > 0 && { transferFee }),
      ...(maximumAmount && { maximumAmount: String(maximumAmount) }),
      ...(flags &&
        flags.length > 0 && {
          flags: sortFlags ? sortFlagsForWire(flags) : flags,
        }),
      ...(metadata && { metadata }),
    } as never,
    description: "Create new MPT Issuance",
    customProperties: { property1: "mpt-issuance-create" },
    payloadDescription: "MPT Issuance Create",
    payloadCustomProperties: { property1: "mpt-create" },
  });
}

export async function mptAuthorize(
  input: MptAuthorizeInput,
): Promise<ProposeIntentResult> {
  const { domainId, accountId, issuanceId } = input;
  if (!domainId) throw new Error("domainId is required");
  if (!issuanceId) throw new Error("issuanceId is required");
  if (!accountId) throw new Error("accountId is required");

  return proposeXrplTransaction({
    domainId,
    accountId,
    operation: {
      type: "MPTokenAuthorize",
      tokenIdentifier: { type: "MPTokenIssuanceId", issuanceId },
      flags: [],
    },
    description: "Transfer order creation intent",
    customProperties: { property1: "flo" },
    payloadDescription: "Test MPT Authorize",
  });
}

export async function mptDestroy(input: MptDestroyInput): Promise<ProposeIntentResult> {
  const { domainId, accountId, issuanceId } = input;
  if (!accountId) throw new Error("accountId is required");
  if (!domainId) throw new Error("domainId is required");
  if (!issuanceId) throw new Error("issuanceId is required");

  return proposeXrplTransaction({
    domainId,
    accountId,
    operation: {
      type: "MPTokenIssuanceDestroy",
      tokenIdentifier: { type: "MPTokenIssuanceId", issuanceId },
    },
    description: "Destroy MPT Issuance",
    customProperties: { property1: "mpt-issuance-destroy" },
    payloadDescription: "MPT Issuance Destroy",
    payloadCustomProperties: { property1: "mpt-destroy" },
  });
}

export async function mptSet(input: MptSetInput): Promise<ProposeIntentResult> {
  const {
    domainId,
    accountId,
    issuanceId,
    flags,
    holder,
    canHoldConfidentialBalance,
    issuerEncryptionKey,
    auditorEncryptionKey,
  } = input;
  if (!accountId) throw new Error("accountId is required");
  if (!domainId) throw new Error("domainId is required");
  if (!issuanceId) throw new Error("issuanceId is required");
  if (flags !== undefined && flags !== 1 && flags !== 2)
    throw new Error("flags must be 1 (Lock) or 2 (Unlock)");
  if (!flags && !canHoldConfidentialBalance && !issuerEncryptionKey)
    throw new Error(
      "Nothing to set: choose Lock/Unlock, enable confidential balances, or provide an issuer encryption key",
    );
  for (const [name, key] of [
    ["issuerEncryptionKey", issuerEncryptionKey],
    ["auditorEncryptionKey", auditorEncryptionKey],
  ] as const) {
    if (key && !ENCRYPTION_KEY_RE.test(key))
      throw new Error(
        `${name} must be a 33-byte base64 public key (44 characters), as returned by the accounts API`,
      );
  }
  // XLS-96 §12: an auditor key without an issuer key is temMALFORMED.
  if (auditorEncryptionKey && !issuerEncryptionKey)
    throw new Error("auditorEncryptionKey requires issuerEncryptionKey");

  const sdkFlags: ("tfMPTLock" | "tfMPTUnlock")[] =
    flags === 1 ? ["tfMPTLock"] : flags === 2 ? ["tfMPTUnlock"] : [];
  const label = flags === 1 ? "Lock" : flags === 2 ? "Unlock" : "Confidential";

  return proposeXrplTransaction({
    domainId,
    accountId,
    operation: {
      type: "MPTokenIssuanceSet",
      tokenIdentifier: { type: "MPTokenIssuanceId", issuanceId },
      flags: sdkFlags,
      ...(holder && { holder }),
      ...(canHoldConfidentialBalance && {
        mutableFlags: [MUTABLE_FLAG_CAN_HOLD_CONFIDENTIAL],
      }),
      ...(issuerEncryptionKey && { issuerEncryptionKey }),
      ...(auditorEncryptionKey && { auditorEncryptionKey }),
    } as never,
    description: `Set MPT Issuance - ${label}`,
    customProperties: { property1: "mpt-issuance-set" },
    payloadDescription: `MPT Issuance Set - ${label}`,
    payloadCustomProperties: { property1: "mpt-set" },
  });
}
