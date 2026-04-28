import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import type { Core_ProposeIntentBody } from "custody";

type ProposeRequest = Core_ProposeIntentBody["request"];
type Author = ProposeRequest["author"];
type Payload = ProposeRequest["payload"];
type StringsMap = ProposeRequest["customProperties"];
type FeePriority = "High" | "Medium" | "Low";

type TransactionOrderPayload = Extract<
  Payload,
  { type: "v0_CreateTransactionOrder" }
>;
type XrplParameters = Extract<
  TransactionOrderPayload["parameters"],
  { type: "XRPL" }
>;
type XrplOperation = NonNullable<XrplParameters["operation"]>;

export type BuildProposeIntentArgs = {
  author: Author;
  targetDomainId: string;
  payload: Payload;
  description?: string;
  customProperties?: StringsMap;
};

export function buildProposeIntent(
  args: BuildProposeIntentArgs,
): Core_ProposeIntentBody {
  return {
    request: {
      author: args.author,
      expiryAt: dayjs().add(1, "day").toISOString(),
      targetDomainId: args.targetDomainId,
      id: uuidv4(),
      payload: args.payload,
      ...(args.description !== undefined && { description: args.description }),
      customProperties: args.customProperties ?? {},
      type: "Propose",
    },
  } as Core_ProposeIntentBody;
}

export type BuildTransactionOrderArgs = {
  ledgerId: string;
  accountId: string;
  operation: XrplOperation;
  description?: string;
  customProperties?: StringsMap;
  feePriority?: FeePriority;
};

export function buildTransactionOrderPayload(
  args: BuildTransactionOrderArgs,
): TransactionOrderPayload {
  return {
    id: uuidv4(),
    ledgerId: args.ledgerId,
    accountId: args.accountId,
    parameters: {
      type: "XRPL",
      feeStrategy: { priority: args.feePriority ?? "Medium", type: "Priority" },
      maximumFee: "10000000",
      memos: [],
      operation: args.operation,
    },
    ...(args.description !== undefined && { description: args.description }),
    customProperties: args.customProperties ?? {},
    type: "v0_CreateTransactionOrder",
  };
}
