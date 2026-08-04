import type { MaximumFee } from "@/app/lib/maximum-fee";

export type TrustSetFlag = "tfSetFreeze" | "tfClearFreeze" | "tfSetfAuth";

export interface TrustSetFlagOption {
  name: TrustSetFlag;
  description: string;
  group: "freeze" | "auth";
}

export interface TrustSetPayload {
  accountId: string;
  domainId: string;
  currency: string;
  issuer: string;
  value: string;
  flags: TrustSetFlag[];
  enableRippling: boolean;
  customProperties: Record<string, string>;
  /** Cap on the fee this transaction may burn. Omit for the default; `null` to send no cap. */
  maximumFee?: MaximumFee;
}
