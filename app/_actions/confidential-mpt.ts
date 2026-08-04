"use server";

import type { Core_XrplOperation } from "@florent-uzio/custody";
import {
  proposeXrplTransaction,
  type ProposeIntentResult,
} from "@/app/lib/custody";
import { hexToBase64 } from "@/app/lib/hex";
import type { MaximumFee } from "@/app/lib/maximum-fee";

type ConvertOp = Extract<Core_XrplOperation, { type: "ConfidentialMPTConvert" }>;
type ConvertBackOp = Extract<
  Core_XrplOperation,
  { type: "ConfidentialMPTConvertBack" }
>;
type MergeInboxOp = Extract<
  Core_XrplOperation,
  { type: "ConfidentialMPTMergeInbox" }
>;
type SendOp = Extract<Core_XrplOperation, { type: "ConfidentialMPTSend" }>;

export type CmptTokenIdentifier = ConvertOp["tokenIdentifier"];
export type CmptDestination = SendOp["destination"];

/** The `Send` member of `Core_CmptCryptographicFields`, minus the discriminator
 *  and the two balance fields that the operation also carries at top level. */
type SendCryptographicFields = Extract<
  NonNullable<SendOp["cryptographicFields"]>,
  { type: "Send" }
>;

/**
 * The proof bundle as the UI collects it: **hex**, matching what the cMPT compute
 * endpoints return. `proposeConfidentialMPTSend` base64-encodes each member before
 * putting it on the operation.
 */
export type CmptSendProofsHex = Omit<
  SendCryptographicFields,
  "type" | "senderEncryptedBalance" | "senderEncryptedBalanceVersion"
>;

export type CmptConvertInput = {
  domainId: string;
  accountId: string;
  tokenIdentifier: CmptTokenIdentifier;
  amount: string;
  /** Cap on the fee this transaction may burn. Omit for the default; `null` to send no cap. */
  maximumFee?: MaximumFee;
};

export type CmptMergeInboxInput = {
  domainId: string;
  accountId: string;
  tokenIdentifier: CmptTokenIdentifier;
  /** Cap on the fee this transaction may burn. Omit for the default; `null` to send no cap. */
  maximumFee?: MaximumFee;
};

export type CmptSendInput = {
  domainId: string;
  accountId: string;
  tokenIdentifier: CmptTokenIdentifier;
  destination: CmptDestination;
  /** Plaintext amount. Omit when supplying `proofs`. */
  amount?: string;
  /** Hex — stays hex on the operation (the spec declares this field hex, not base64). */
  senderEncryptedBalance?: string;
  senderEncryptedBalanceVersion?: number;
  /** Hex proof bundle from a cMPT compute; converted to base64 here. */
  proofs?: CmptSendProofsHex;
  /** Cap on the fee this transaction may burn. Omit for the default; `null` to send no cap. */
  maximumFee?: MaximumFee;
};

function requireIds(domainId: string, accountId: string): void {
  if (!domainId) throw new Error("domainId is required");
  if (!accountId) throw new Error("accountId is required");
}

function requireTokenIdentifier(tokenIdentifier: CmptTokenIdentifier): void {
  const empty =
    "issuanceId" in tokenIdentifier
      ? !tokenIdentifier.issuanceId
      : !tokenIdentifier.tickerId;
  if (empty) throw new Error("tokenIdentifier is required");
}

export async function proposeConfidentialMPTConvert(
  input: CmptConvertInput,
): Promise<ProposeIntentResult> {
  const { domainId, accountId, tokenIdentifier, amount, maximumFee } = input;
  requireIds(domainId, accountId);
  requireTokenIdentifier(tokenIdentifier);
  if (!amount) throw new Error("amount is required");

  const operation: ConvertOp = {
    type: "ConfidentialMPTConvert",
    tokenIdentifier,
    amount,
  };

  return proposeXrplTransaction({
    domainId,
    accountId,
    maximumFee,
    operation,
    description: "Convert MPT to confidential balance",
    customProperties: { property1: "cmpt-convert" },
    payloadDescription: "ConfidentialMPT Convert",
  });
}

export async function proposeConfidentialMPTConvertBack(
  input: CmptConvertInput,
): Promise<ProposeIntentResult> {
  const { domainId, accountId, tokenIdentifier, amount, maximumFee } = input;
  requireIds(domainId, accountId);
  requireTokenIdentifier(tokenIdentifier);
  if (!amount) throw new Error("amount is required");

  const operation: ConvertBackOp = {
    type: "ConfidentialMPTConvertBack",
    tokenIdentifier,
    amount,
  };

  return proposeXrplTransaction({
    domainId,
    accountId,
    maximumFee,
    operation,
    description: "Convert confidential balance back to public MPT",
    customProperties: { property1: "cmpt-convert-back" },
    payloadDescription: "ConfidentialMPT Convert Back",
  });
}

export async function proposeConfidentialMPTMergeInbox(
  input: CmptMergeInboxInput,
): Promise<ProposeIntentResult> {
  const { domainId, accountId, tokenIdentifier, maximumFee } = input;
  requireIds(domainId, accountId);
  requireTokenIdentifier(tokenIdentifier);

  const operation: MergeInboxOp = {
    type: "ConfidentialMPTMergeInbox",
    tokenIdentifier,
  };

  return proposeXrplTransaction({
    domainId,
    accountId,
    maximumFee,
    operation,
    description: "Merge confidential MPT inbox into the spendable balance",
    customProperties: { property1: "cmpt-merge-inbox" },
    payloadDescription: "ConfidentialMPT Merge Inbox",
  });
}

export async function proposeConfidentialMPTSend(
  input: CmptSendInput,
): Promise<ProposeIntentResult> {
  const {
    domainId,
    accountId,
    tokenIdentifier,
    destination,
    amount,
    senderEncryptedBalance,
    senderEncryptedBalanceVersion,
    proofs,
    maximumFee,
  } = input;
  requireIds(domainId, accountId);
  requireTokenIdentifier(tokenIdentifier);
  if (!amount && !proofs)
    throw new Error(
      "Supply either a plaintext amount or a full cryptographic-field bundle.",
    );

  const operation: SendOp = {
    type: "ConfidentialMPTSend",
    tokenIdentifier,
    destination,
    ...(amount && { amount }),
    ...(senderEncryptedBalance && { senderEncryptedBalance }),
    ...(senderEncryptedBalanceVersion !== undefined && {
      senderEncryptedBalanceVersion,
    }),
    ...(proofs && {
      cryptographicFields: {
        type: "Send",
        senderEncryptedAmount: hexToBase64(proofs.senderEncryptedAmount),
        destinationEncryptedAmount: hexToBase64(proofs.destinationEncryptedAmount),
        issuerEncryptedAmount: hexToBase64(proofs.issuerEncryptedAmount),
        balanceCommitment: hexToBase64(proofs.balanceCommitment),
        amountCommitment: hexToBase64(proofs.amountCommitment),
        zkProof: hexToBase64(proofs.zkProof),
        ...(proofs.auditorEncryptedAmount && {
          auditorEncryptedAmount: hexToBase64(proofs.auditorEncryptedAmount),
        }),
      },
    }),
  };

  return proposeXrplTransaction({
    domainId,
    accountId,
    maximumFee,
    operation,
    description: "Confidential MPT transfer",
    customProperties: { property1: "cmpt-send" },
    payloadDescription: "ConfidentialMPT Send",
  });
}
