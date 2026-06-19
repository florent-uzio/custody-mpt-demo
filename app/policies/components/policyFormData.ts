// Static reference data for the policy create/update form.
// Sourced from the Ripple Custody policy design docs and examples.

/** All intent types a policy can target, grouped by entity for the picker. */
export const INTENT_TYPE_GROUPS: { label: string; types: string[] }[] = [
  {
    label: "Domain",
    types: [
      "v0_CreateDomain",
      "v0_UpdateDomain",
      "v0_UpdateDomainPermissions",
      "v0_LockDomain",
      "v0_UnlockDomain",
    ],
  },
  {
    label: "User",
    types: ["v0_CreateUser", "v0_UpdateUser", "v0_LockUser", "v0_UnlockUser"],
  },
  {
    label: "Policy",
    types: [
      "v0_CreatePolicy",
      "v0_UpdatePolicy",
      "v0_LockPolicy",
      "v0_UnlockPolicy",
    ],
  },
  {
    label: "Account",
    types: [
      "v0_CreateAccount",
      "v0_UpdateAccount",
      "v0_LockAccount",
      "v0_UnlockAccount",
      "v0_AddAccountLedgers",
      "v0_MigrateSilo3AccountBatch",
    ],
  },
  {
    label: "Endpoint",
    types: [
      "v0_CreateEndpoint",
      "v0_UpdateEndpoint",
      "v0_LockEndpoint",
      "v0_UnlockEndpoint",
    ],
  },
  {
    label: "Transaction",
    types: [
      "v0_CreateTransactionOrder",
      "v0_AttemptTransactionOrderCancellation",
      "v0_ReleaseQuarantinedTransfers",
      "v0_CreateTransferOrder",
    ],
  },
  {
    label: "Vault",
    types: [
      "v0_CreateVault",
      "v0_UpdateVault",
      "v0_LockVault",
      "v0_UnlockVault",
      "v0_RewrapVaultKeyMaterial",
    ],
  },
  {
    label: "Ticker",
    types: [
      "v0_CreateTicker",
      "v0_UpdateTicker",
      "v0_LockTicker",
      "v0_UnlockTicker",
      "v0_ValidateTickers",
    ],
  },
  {
    label: "Ledger",
    types: ["v0_CreateLedger", "v0_UpdateLedger"],
  },
  {
    label: "Other",
    types: [
      "v0_NotarizeData",
      "v0_ExecuteExtension",
      "v0_SignManifest",
      "v0_SetSystemProperty",
      "v0_AddTrustedPublicKeysForMigration",
      "v0_CreateBackup",
      "v0_AcknowledgeBackup",
    ],
  },
];

/** One-click intent-type bundles matching the documented business policies. */
export const INTENT_TYPE_PRESETS: { label: string; types: string[] }[] = [
  {
    label: "User management",
    types: ["v0_CreateUser", "v0_UpdateUser", "v0_LockUser", "v0_UnlockUser"],
  },
  {
    label: "Account management",
    types: [
      "v0_CreateAccount",
      "v0_UpdateAccount",
      "v0_LockAccount",
      "v0_UnlockAccount",
    ],
  },
  {
    label: "Endpoint management",
    types: [
      "v0_CreateEndpoint",
      "v0_UpdateEndpoint",
      "v0_LockEndpoint",
      "v0_UnlockEndpoint",
    ],
  },
  {
    label: "Policy management",
    types: [
      "v0_CreatePolicy",
      "v0_UpdatePolicy",
      "v0_LockPolicy",
      "v0_UnlockPolicy",
    ],
  },
  { label: "Transaction order", types: ["v0_CreateTransactionOrder"] },
];

/**
 * Re-usable JavaScript condition expressions. A policy condition is evaluated
 * against a `context` object and must return a boolean.
 */
export const EXPRESSION_SNIPPETS: { label: string; expression: string }[] = [
  {
    label: "Author has a role",
    expression:
      "context.references.users[context.request.author.id].roles.includes('system-operator')",
  },
  {
    label: "Author has either of two roles",
    expression:
      "context.references.users[context.request.author.id].roles.includes('transaction-operator') ||\ncontext.references.users[context.request.author.id].roles.includes('transaction-operator-bot')",
  },
  {
    label: "Destination is a raw address",
    expression:
      "context.request.payload.parameters.hasOwnProperty('destination') &&\ncontext.request.payload.parameters.destination.type == 'Address'",
  },
  {
    label: "Destination is a trusted endpoint (trustScore ≥ 75)",
    expression:
      "context.request.payload.parameters.hasOwnProperty('destination') &&\ncontext.request.payload.parameters.destination.type == 'Endpoint' &&\ncontext.references.endpoints[context.request.payload.parameters.destination.endpointId].trustScore >= 75",
  },
  {
    label: "Source account on a specific ledger",
    expression:
      "context.references.accounts[context.request.payload.accountId].ledgerId == 'ethereum-testnet'",
  },
  {
    label: "Amount ≥ 5 ETH (uses BigInt)",
    expression:
      "context.request.payload.parameters.amount >= BigInt(5000000000000000000)",
  },
  {
    label: "Endpoint is a smart contract (has ABI parameters)",
    expression:
      "context.request.payload.hasOwnProperty('parameters') &&\ncontext.request.payload.parameters != null",
  },
];

/** Approval-workflow JSON templates (an array of WorkflowCondition steps). */
export const WORKFLOW_TEMPLATES: { label: string; workflow: unknown }[] = [
  {
    label: "Single role quorum (2 of a role)",
    workflow: [{ role: "system-operator", quorum: 2, type: "RoleQuorum" }],
  },
  {
    label: "Maker AND compliance",
    workflow: [
      {
        left: { role: "system-operator", quorum: 2, type: "RoleQuorum" },
        right: { role: "compliance", quorum: 1, type: "RoleQuorum" },
        type: "And",
      },
    ],
  },
  {
    label: "Either role (Or)",
    workflow: [
      {
        left: { role: "transaction-operator", quorum: 1, type: "RoleQuorum" },
        right: {
          role: "transaction-operator-bot",
          quorum: 1,
          type: "RoleQuorum",
        },
        type: "Or",
      },
    ],
  },
  {
    label: "Two steps: makers, then compliance",
    workflow: [
      { role: "system-operator", quorum: 1, type: "RoleQuorum" },
      { role: "compliance", quorum: 1, type: "RoleQuorum" },
    ],
  },
  {
    label: "Catch-all (any maker → 2 compliance)",
    workflow: [
      {
        left: {
          left: { role: "system-operator", quorum: 1, type: "RoleQuorum" },
          right: { role: "policy-operator", quorum: 1, type: "RoleQuorum" },
          type: "Or",
        },
        right: { role: "transaction-operator", quorum: 1, type: "RoleQuorum" },
        type: "Or",
      },
      { role: "compliance", quorum: 2, type: "RoleQuorum" },
    ],
  },
];

export type ExamplePolicy = {
  label: string;
  alias: string;
  rank: number;
  intentTypes: string[];
  expression: string;
  workflow: unknown;
};

/** Full pre-filled policies, lifted from the documented examples. */
export const EXAMPLE_POLICIES: ExamplePolicy[] = [
  {
    label: "User management",
    alias: "user-management",
    rank: 100,
    intentTypes: [
      "v0_CreateUser",
      "v0_UpdateUser",
      "v0_LockUser",
      "v0_UnlockUser",
    ],
    expression:
      "context.references.users[context.request.author.id].roles.includes('system-operator')",
    workflow: [{ role: "system-operator", quorum: 2, type: "RoleQuorum" }],
  },
  {
    label: "Account management",
    alias: "account-management",
    rank: 100,
    intentTypes: [
      "v0_CreateAccount",
      "v0_UpdateAccount",
      "v0_LockAccount",
      "v0_UnlockAccount",
    ],
    expression:
      "context.references.users[context.request.author.id].roles.includes('system-operator')",
    workflow: [
      {
        left: { role: "system-operator", quorum: 2, type: "RoleQuorum" },
        right: { role: "compliance", quorum: 1, type: "RoleQuorum" },
        type: "And",
      },
    ],
  },
  {
    label: "Policy management",
    alias: "policy-management",
    rank: 1000,
    intentTypes: [
      "v0_CreatePolicy",
      "v0_UpdatePolicy",
      "v0_LockPolicy",
      "v0_UnlockPolicy",
    ],
    expression:
      "context.references.users[context.request.author.id].roles.includes('policy-operator')",
    workflow: [
      {
        left: { role: "policy-operator", quorum: 2, type: "RoleQuorum" },
        right: { role: "compliance", quorum: 2, type: "RoleQuorum" },
        type: "And",
      },
    ],
  },
  {
    label: "Transfer out to an unknown address",
    alias: "transfer-out-unknown-address",
    rank: 50,
    intentTypes: ["v0_CreateTransactionOrder"],
    expression:
      "context.references.users[context.request.author.id].roles.includes('transaction-operator') &&\ncontext.request.payload.parameters.hasOwnProperty('destination') &&\ncontext.request.payload.parameters.destination.type == 'Address'",
    workflow: [
      {
        left: { role: "transaction-operator", quorum: 2, type: "RoleQuorum" },
        right: { role: "compliance", quorum: 2, type: "RoleQuorum" },
        type: "And",
      },
    ],
  },
  {
    label: "Transfer out of ETH with a large amount",
    alias: "transfer-out-eth-large-amount",
    rank: 40,
    intentTypes: ["v0_CreateTransactionOrder"],
    expression:
      "context.references.users[context.request.author.id].roles.includes('transaction-operator') &&\ncontext.references.accounts[context.request.payload.accountId].ledgerId == 'ethereum-testnet' &&\ncontext.request.payload.parameters.amount >= BigInt(5000000000000000000)",
    workflow: [
      {
        left: { role: "transaction-operator", quorum: 1, type: "RoleQuorum" },
        right: { role: "compliance", quorum: 2, type: "RoleQuorum" },
        type: "And",
      },
    ],
  },
  {
    label: "Transfer in (quarantine release)",
    alias: "transfer-in-quarantine-release",
    rank: 100,
    intentTypes: ["v0_ReleaseQuarantinedTransfers"],
    expression:
      "context.references.users[context.request.author.id].roles.includes('system-operator')",
    workflow: [
      {
        left: { role: "system-operator", quorum: 1, type: "RoleQuorum" },
        right: { role: "compliance", quorum: 1, type: "RoleQuorum" },
        type: "And",
      },
    ],
  },
  {
    label: "Catch-all",
    alias: "catch-all",
    rank: 1,
    intentTypes: [],
    expression:
      "context.references.users[context.request.author.id].roles.includes('system-operator') ||\ncontext.references.users[context.request.author.id].roles.includes('policy-operator') ||\ncontext.references.users[context.request.author.id].roles.includes('transaction-operator')",
    workflow: [
      {
        left: {
          left: { role: "system-operator", quorum: 1, type: "RoleQuorum" },
          right: { role: "policy-operator", quorum: 1, type: "RoleQuorum" },
          type: "Or",
        },
        right: { role: "transaction-operator", quorum: 1, type: "RoleQuorum" },
        type: "Or",
      },
      { role: "compliance", quorum: 2, type: "RoleQuorum" },
    ],
  },
];

/** Short reference for the `context` object available inside expressions. */
export const CONTEXT_HELP: { path: string; description: string }[] = [
  {
    path: "context.request.author.id",
    description: "UUID of the user proposing the intent.",
  },
  {
    path: "context.request.payload",
    description: "The intent payload. `.type` is the intent type.",
  },
  {
    path: "context.request.payload.accountId",
    description: "Source account UUID (transaction intents).",
  },
  {
    path: "context.request.payload.parameters",
    description: "Ledger-specific parameters (destination, amount, outputs…).",
  },
  {
    path: "context.references.users[id].roles",
    description: "Array of role strings for a referenced user.",
  },
  {
    path: "context.references.accounts[id].ledgerId",
    description: "Ledger of a referenced account (e.g. 'ethereum-testnet').",
  },
  {
    path: "context.references.endpoints[id].trustScore",
    description: "Trust score (0–100) of a referenced endpoint.",
  },
];
