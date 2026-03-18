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
}
