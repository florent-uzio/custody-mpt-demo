import { CustodyMpTokenIssuanceCreate } from "custody";

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
} & Omit<CustodyMpTokenIssuanceCreate, "Account">;
