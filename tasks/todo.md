# Custody Seam Migration — Complete

Replace REST `/api/*` route layer with Next.js Server Actions. The Custody seam (architecture review candidate #1) is now established.

## Plan

- [x] 1. Map current Accounts surface (proof-of-pattern)
- [x] 2. Write `app/_actions/accounts.ts` (5 actions + types)
- [x] 3. Migrate Accounts consumers (`useAccounts`, `AccountsTab`, `AccountCreateTab`, `accounts/[id]/page.tsx`)
- [x] 4. Delete `app/api/accounts/` (5 routes)
- [x] 5. Build verification — Accounts pattern locked
- [x] 6. **Batch A** — Tickers, Manifests, Domains, Vaults, Config, Keypair, Policies, Requests, Transfers, Transactions, Users (read-only)
- [x] 7. **Batch B** — Users/create, Intents (payment, release-transfers), MPT (create, authorize, destroy, set), TrustSet
- [x] 8. Delete `app/probe/` and final build verification
- [ ] 9. Runtime smoke test in dev — user verifies signing flows work end-to-end

## What's there now

```
app/_actions/                  # The Custody seam
  accounts.ts        listAccounts, getAccount, getAccountAddresses, getAccountBalances, createAccount
  config.ts          getConfig, resetConfig, updateConfig
  domains.ts         listDomains, getDomain
  intents.ts         listIntents, getIntent, proposePayment, proposeReleaseTransfers
  keypair.ts         generateKeypair
  manifests.ts       listManifests, getManifest
  mpt.ts             mptCreate, mptAuthorize, mptDestroy, mptSet
  policies.ts        listPolicies, getPolicy
  requests.ts        getRequestState, listUserRequestStates, listUserRequestStatesInDomain
  tickers.ts         listTickers, getTicker
  transactions.ts    listTransactions, getTransaction, listTransfers
  transfers.ts       getTransfer
  trustset.ts        trustSet
  users.ts           listUsers, getUser, getMe, createUser
  vaults.ts          listVaults

app/api/             # Empty — entire REST layer removed
```

## Patterns established

- **One `app/_actions/<entity>.ts` file per domain entity**, marked `"use server"` at the top.
- Actions take **flat, demo-flavored inputs** (form-ready); they own the inverse mapping to the SDK's nested keys (`metadata.customProperties`, `additionalDetails.processingStatus`, etc.).
- Actions return **SDK shapes by default**. Where consumers depend on a project-local shape (e.g. `IntentsCollection` from `app/intents/intents.types.ts`), the action imports that type and casts internally.
- Hooks consume actions as plain async functions in `useQuery`/`useMutation` — no `fetch`, no JSON envelopes, no error-property unwrapping.
- Signing flows (intent proposals) preserve the original route's intent-building logic verbatim. **Candidate #2 (IntentBuilder consolidation)** is a separate refactor that touches all proposal actions in one pass.

## Compromises taken (worth flagging)

- **SDK literal-union types** (e.g. `sortBy`/`sortOrder`/`lock`/`processingStatus` on filters; MPT operation `flags` and `holder`) are stricter than the form-state types. Casts at the seam boundary mirror what the deleted routes did silently via `Record<string, unknown>` request bodies. Tightening would require re-typing form state across multiple components — out of scope.
- **`MPTPaymentTab` does not pass `paymentType: "MPT"`**. The deleted route defaulted `paymentType` to `"XRP"` when the body lacked it, so the existing component was sending XRP-typed payments with an unused `issuanceId` field. The new action preserves the same default behavior. This looks like a pre-existing bug — the tab is named "MPT" but doesn't actually request MPT-typed payments. Flagged for follow-up; not fixed in this refactor.
- **`SubmittedIntentsTab.tsx`** still hardcodes `DEFAULT_DOMAIN_ID = "5cd224fe-…"`. Not touched here.
- **`intents.list` SDK return type is mistyped** (claims `{requestId: string}`, actually returns a collection). Cast in `app/_actions/intents.ts` to the project's `IntentsCollection`.

## What still needs to happen

- **Runtime smoke test** in dev — user clicks through:
  - All read-only flows (already half-tested via Accounts; full sweep recommended)
  - Each signing flow at least once (Payment, MPT Create/Authorize/Destroy/Set, TrustSet, User Create, Release Transfers)
- **Candidate #2 (IntentBuilder consolidation)** is now unblocked. The signing flows in `_actions/intents.ts`, `_actions/mpt.ts`, `_actions/trustset.ts`, `_actions/users.ts` (`createUser`), and `_actions/accounts.ts` (`createAccount`) all repeat the same envelope (`uuidv4`, `dayjs().add(1, "day")`, fee strategy, `Propose` envelope). Consolidating these into an `IntentBuilder` is a focused follow-up.

## Review

The Custody SDK now has exactly one named seam (`app/_actions/`) instead of being called from 31 route files + 13 hooks + 18 component sites. SDK upgrades, error normalization, response-shape changes, and any future cross-cutting logic land in one directory rather than spreading through three layers.

Net code change: ~31 routes (~1500+ LOC) replaced with 15 action files (~600 LOC). The `app/api/` directory is empty and removed. The probe at `app/probe/` is removed.

Build passes (`npm run build`). Route table confirms zero `/api/*` endpoints. Server Actions keep the SDK out of client bundles (verified earlier via the probe — `RippleCustody`, `KeypairService`, etc. absent from `.next/static/chunks/`).
