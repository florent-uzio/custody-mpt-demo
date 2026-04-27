# Custody Seam Migration — Accounts (Candidate #1, first slice)

Replace REST `/api/accounts/*` route layer with Next.js Server Actions to establish the Custody seam pattern. First domain migrated: Accounts.

## Plan

- [x] 1. Map current Accounts surface (5 routes, 6 consumer sites)
- [x] 2. Write `app/_actions/accounts.ts` — domain-flavored server actions: `listAccounts`, `getAccount`, `getAccountAddresses`, `getAccountBalances`, `createAccount` + `AccountFilters` / `CreateAccountInput` / `CreateAccountResult` types
- [x] 3. Migrate consumers:
  - [x] `app/hooks/useAccounts.ts` → `listAccounts`
  - [x] `app/components/AccountsTab.tsx` → `listAccounts` with typed `AccountFilters`
  - [x] `app/components/AccountCreateTab.tsx` → `createAccount`
  - [x] `app/accounts/[id]/page.tsx` → `getAccount`, `getAccountAddresses`, `getAccountBalances`
- [x] 4. Delete `app/api/accounts/` (5 route files)
- [x] 5. Build verification — `npm run build` passes; route table confirms all 5 endpoints removed
- [ ] 6. Runtime verification — user clicks through Accounts tab + detail page + create flow in dev server

## Review

The seam is now `app/_actions/accounts.ts`. Action files take **flat, demo-flavored inputs** (e.g. `AccountFilters` with form-ready keys like `vaultId`, `processingStatus`) and own the inverse mapping to the SDK's nested keys (`providerDetails.vaultId`, `additionalDetails.processingStatus`, etc.). The 80-line filter translation that previously lived in `app/api/accounts/list/route.ts` is now centralized in `buildAccountQueryParams()`.

Return shapes are still the SDK's `Core_AccountsCollection` / `Core_ApiAccount` / `Core_AddressesCollection` / `Core_BalancesCollection` — consumers like `AccountsTab` and `AccountDetailPage` already depend on these full shapes (nested `additionalDetails.ledgers`, `data.metadata`, etc.). Aggressive flattening would have broken them; keeping SDK shapes is a deliberate non-goal for now. `useAccounts.ts` keeps its slim `Account = {id, alias, domainId}` flattening for dropdown consumers.

Build issue resolved during migration: SDK's `GetAccountsQueryParams` types `sortBy` / `sortOrder` / `lock` / `processingStatus` / `additionalLedgerStatuses` as literal unions. Cast at the seam boundary (matches the loose handling the deleted route had via `Record<string, unknown>`). Tightening these would require typing form state in `AccountsTab` more strictly — out of scope for the seam refactor.

**Pattern established for next migrations** (Tickers, Manifests, Domains, Users, Transactions, Vaults, Intents, MPT, TrustSet, Requests, Keypair, Config, Transfers, Policies):
- One `app/_actions/<entity>.ts` file per entity, `"use server"` at top.
- Async function exports take flat domain-flavored inputs.
- Return SDK types unless a flatter shape is clearly better.
- Hooks/components import the action and call it directly — no `fetch`, no JSON parsing, no error envelope unwrapping.
- Delete the matching `/api/<entity>/*` route folder when the entity is fully migrated.

Probe at `app/probe/` stays for now — delete once full migration is complete.
