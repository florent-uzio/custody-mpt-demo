import { CustodyMpTokenIssuanceCreate } from "@florent-uzio/custody";
import type { MaximumFee } from "@/app/lib/maximum-fee";

export type MPTFlag = CustodyMpTokenIssuanceCreate["flags"][number];

export interface MPTFlagOption {
  name: MPTFlag;
  description: string;
}

export interface MetadataUrl {
  u: string;
  c: string;
  t: string;
}

export type MetadataMode = "structured" | "raw";

export type MPTCreatePayload = {
  accountId: string;
  domainId: string;
  /** Reorder flags into the order the backend re-serializes them in. */
  sortFlags: boolean;
  /** Cap on the fee this transaction may burn. Omit for the default; `null` to send no cap. */
  maximumFee?: MaximumFee;
} & Omit<CustodyMpTokenIssuanceCreate, "Account">;
