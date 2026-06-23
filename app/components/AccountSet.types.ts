import type { AccountSetFlag } from "../_actions/accountset";

export type { AccountSetFlag };

export interface AccountSetFlagOption {
  name: AccountSetFlag;
  label: string;
  description: string;
}

/** The `asf*` flags an AccountSet can set or clear, with human-readable copy. */
export const ACCOUNT_SET_FLAGS: AccountSetFlagOption[] = [
  {
    name: "asfRequireDest",
    label: "Require Destination Tag",
    description: "Require a destination tag on all incoming payments.",
  },
  {
    name: "asfRequireAuth",
    label: "Require Authorization",
    description:
      "Require the account to authorize others before they can hold its issued tokens (owner directory must be empty).",
  },
  {
    name: "asfDepositAuth",
    label: "Deposit Authorization",
    description:
      "Block incoming transfers unless the account itself sends or pre-authorizes them.",
  },
  {
    name: "asfDefaultRipple",
    label: "Default Rippling",
    description: "Enable rippling on this account's trust lines by default.",
  },
  {
    name: "asfGlobalFreeze",
    label: "Global Freeze",
    description: "Freeze all tokens issued by this account.",
  },
  {
    name: "asfNoFreeze",
    label: "No Freeze",
    description:
      "Permanently give up the ability to freeze trust lines. Irreversible — cannot be cleared.",
  },
  {
    name: "asfAccountTxnID",
    label: "Track Account Txn ID",
    description: "Track the ID of this account's most recent transaction.",
  },
  {
    name: "asfAllowTrustLineClawback",
    label: "Allow Trust Line Clawback",
    description:
      "Allow the account to claw back tokens it issues. Irreversible; account must own no ledger objects.",
  },
];
