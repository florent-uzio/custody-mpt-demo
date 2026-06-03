import type { RunGenesisBody } from "custody";

export type LockStatus = "Unlocked" | "Locked";
export type GoverningStrategy = "" | "ConsiderDescendants" | "CoerceDescendants";
export type PolicyScope = "Self" | "Descendants" | "SelfAndDescendants";
export type KeyType = "Secp256r1" | "Secp256k1" | "Ed25519";

export type ReadAccessKey = keyof NonNullable<
  RunGenesisBody["rootDomainSetup"]["permissions"]
>["readAccess"];

export const READ_ACCESS_KEYS: ReadAccessKey[] = [
  "domains",
  "users",
  "endpoints",
  "policies",
  "accounts",
  "transactions",
  "requests",
  "events",
];

export type KeyValueRow = { k: string; v: string };

export type LoginIdRow = { id: string; providerId: string };

export type UserRow = {
  id: string;
  alias: string;
  publicKey: string;
  rolesText: string;
  lock: LockStatus;
  description: string;
  loginIds: LoginIdRow[];
  customPropsJson: string;
};

export type PolicyRow = {
  id: string;
  alias: string;
  rank: string;
  scope: PolicyScope;
  scriptingEngine: "Javascript_v0";
  lock: LockStatus;
  description: string;
  intentTypesText: string;
  conditionJson: string;
  workflowJson: string;
  customPropsJson: string;
};

export const KEY_TYPES: KeyType[] = ["Secp256r1", "Secp256k1", "Ed25519"];

export const DEFAULT_ROOT_ALIAS = "Root Domain";

export function buildDefaultUserRow(): UserRow {
  return {
    id: typeof crypto !== "undefined" ? crypto.randomUUID() : "",
    alias: "Root Admin",
    publicKey: "",
    rolesText: "Admin",
    lock: "Unlocked",
    description: "",
    loginIds: [],
    customPropsJson: "",
  };
}

export function buildDefaultPolicyRow(): PolicyRow {
  return {
    id: typeof crypto !== "undefined" ? crypto.randomUUID() : "",
    alias: "Root Allow All",
    rank: "0",
    scope: "SelfAndDescendants",
    scriptingEngine: "Javascript_v0",
    lock: "Unlocked",
    description: "",
    intentTypesText: "",
    conditionJson: "",
    workflowJson: "",
    customPropsJson: "",
  };
}

export const TICKERS_PLACEHOLDER = `[
  {
    "id": "<uuid>",
    "ledgerId": "<ledgerId>",
    "kind": "Native",
    "name": "XRP",
    "symbol": "XRP",
    "decimals": 6,
    "ledgerDetails": { "type": "XRPL", "properties": {} },
    "lock": "Unlocked",
    "customProperties": {}
  }
]`;

export const SYSTEM_PROPERTIES_PLACEHOLDER = `[
  {
    "type": "StateReviewAuthorityProperty",
    "value": {
      "publicKey": { "publicKey": "<base64>" }
    }
  }
]`;

export const LEDGERS_PLACEHOLDER = `[
  {
    "id": "xrpl-mainnet",
    "alias": "XRPL Mainnet",
    "parameters": { "type": "XRPL", "properties": {} },
    "customProperties": {}
  }
]`;

export const DESCENDANTS_PLACEHOLDER = `[
  {
    "id": "<uuid>",
    "alias": "Child Domain",
    "lock": "Unlocked",
    "permissions": { "readAccess": { "domains": [], "users": [], "endpoints": [], "policies": [], "accounts": [], "transactions": [], "requests": [], "events": [] } },
    "customProperties": {},
    "users": [],
    "policies": [],
    "descendants": []
  }
]`;
