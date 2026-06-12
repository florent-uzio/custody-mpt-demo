# Accounts — dedicated routes (mirror Domains)

Move the Accounts list and Create Account UI off the home dashboard tabs and onto their
own routes, exactly like Domains (`/domains`, `/domains/new`). Currently only the detail
route `/accounts/[id]` exists; the list (`AccountsTab`) and create form (`AccountCreateTab`)
live as tabs on `app/page.tsx`.

## Decisions (confirmed with user)
- Full mirror: remove Accounts + Create Account from the home dashboard; delete the
  now-unused `AccountsTab` / `AccountCreateTab` components.
- Home dashboard default tab becomes **Configuration** (`config`).

## Plan
- [x] 1. `app/accounts/page.tsx` (NEW) — Domains-style list page (header w/ sidebar toggle,
      title, count, refresh, "Create account" link → `/accounts/new`) wrapping the existing
      AccountsTab query/filters/table logic.
- [x] 2. `app/accounts/new/page.tsx` (NEW) — Domains/new-style breadcrumb header + the
      existing create-account form (moved from AccountCreateTab).
- [x] 3. `app/components/AppSidebar.tsx` — route links: `accounts` → `/accounts`,
      `account-create` → `/accounts/new`; fixed `isActive` (create page vs list) +
      `handleTabClick`.
- [x] 4. `app/page.tsx` — removed AccountsTab/AccountCreateTab imports + switch cases;
      default tab → `config`; excluded `accounts`/`account-create` from `?tab=` restore.
- [x] 5. Deleted `app/components/AccountsTab.tsx` + `app/components/AccountCreateTab.tsx`.
- [x] 6. `npx tsc --noEmit` clean; `npm run build` clean.

## Review
- **`app/accounts/page.tsx`** (list) — ported the `AccountsTab` query/filter/table logic
  verbatim into a Domains-style page shell. The monolithic tab's internal `Accounts` header
  (count + refresh) was lifted into the page `<header>`, which also gained the sidebar toggle
  and the **Create account** link → `/accounts/new` (mirroring `/domains`'s "Create domain").
  Loading/table/empty containers got `bg-white shadow-sm` since they now sit on the gradient
  background instead of inside the home dashboard's white card. Detail links keep
  `?domainId=${defaultDomainId}` so `/accounts/[id]` still receives the domain.
- **`app/accounts/new/page.tsx`** (create) — ported the `AccountCreateTab` form verbatim
  (vault fetch, key-strategy/ledger/lock steps, summary, submit, JsonViewer response). The
  old indigo→purple hero card was replaced by a slim Domains/new-style breadcrumb header bar
  ("Accounts / Create account") in the same indigo→purple theme, plus a yellow "Set a Default
  Domain ID" banner for parity with `/domains/new`. Submit behavior unchanged
  (`useSubmitCreateAccount`); response still renders inline (no redirect — preserved original).
- **`AppSidebar.tsx`** — `accounts` and `account-create` are now `<Link>`s to `/accounts`
  and `/accounts/new`. `isActive` distinguishes them: `account-create` lights on
  `/accounts/new`; `accounts` lights on `/accounts` and `/accounts/[id]` but *not*
  `/accounts/new`. Both added to the `handleTabClick` early-return (consistency; never hit
  since they render as Links). `isNavMode` already covered `/accounts`.
- **`app/page.tsx`** — dropped the two imports + render branches; default tab `"accounts"`
  → `"config"` (Configuration, per user); excluded `accounts`/`account-create` from the
  `?tab=` restore so a stale URL param can't render a now-routed view as a blank tab.
- **Deleted** `app/components/AccountsTab.tsx` + `AccountCreateTab.tsx` — orphaned by the
  home-page change (recoverable via git). `grep` confirms zero remaining references.
- **Verified**: `npx tsc --noEmit` exit 0; `npm run build` exit 0 ("Compiled successfully") —
  `/accounts` and `/accounts/new` both prerender as **static (○)** routes, alongside the
  existing `/accounts/[id]*` dynamic routes, exactly mirroring `/domains` + `/domains/new`.
- **Pending (manual, needs a live tenant + browser)**: set a Default Domain ID, then confirm
  `/accounts` lists/filters/refreshes and the row → `/accounts/[id]` link works; on
  `/accounts/new` confirm vault load, submit, and the request/response JsonViewer render.

---

# User Invitation — domain dropdown + dedicated route

The invitation form (`UserCreateTab`) always used the global `defaultDomainId` from the sidebar. Add a domain **dropdown** (defaulting to the current domain) and promote the in-page tab to a real route `/users/invite`, mirroring `/domains/new`.

## Plan
- [x] `app/components/UserCreateTab.tsx` — add a "Target Domain" `<select>` (first field of User Details) populated via `useDomains({ limit: 100 })`; local `domainId` state defaulting to `defaultDomainId`; switch submit/validation/summary/disabled from `defaultDomainId` → `domainId`. Also dropped the now-redundant teal intro card (route header replaces it).
- [x] `app/users/invite/page.tsx` — new route: slim teal breadcrumb header + `<UserCreateTab />`, using existing `users` layout `SidebarContext`.
- [x] `app/page.tsx` — remove `UserCreateTab` import + render; exclude `user-invitations` from `?tab=` restore.
- [x] `app/components/AppSidebar.tsx` — `user-invitations` becomes a `<Link href="/users/invite">` (Link branch + `isActive` + `handleTabClick`).
- [x] `npx tsc --noEmit` clean; `npm run build` clean (`/users/invite` listed as a static route).

## Review
Domain items are wrapped (`{ data: { id, alias } }`) — matched `DomainsTable`'s `domains.map(({ data }) => …)`. The dropdown lists up to 100 domains (alias, falling back to id), guarantees the current selection stays present even if outside the fetched page, and defaults to the sidebar's `defaultDomainId` once it loads from localStorage. Selection is local to the form — it does not mutate the global default. The in-page tab is gone; the sidebar entry now links to `/users/invite`.

---

# Create Domain — readAccess, users, governingStrategy

`/domains/new` previously proposed `v0_CreateDomain` with only alias/description/lock; the action hardcoded empty `permissions.readAccess`, `users: []`, and never set `governingStrategy`. Add UI + backend wiring so a domain can be created already populated.

## Plan
- [x] `app/_actions/domains.ts` — extend `ProposeCreateDomainInput` with optional `governingStrategy`, `permissions`, `users` (derived from `CreateDomainPayload`); thread into the payload, keeping the empty defaults when omitted. → verify: `tsc` clean.
- [x] `app/domains/new/page.tsx` — add state (governingStrategy, perms, users), build/validation logic, and UI: governing-strategy select, collapsible **Permissions (read access)** grid, collapsible **Users** editor (full Genesis parity). Reuse types/builders from `app/genesis/defaults.ts`. → verify: route renders.
- [x] `npx tsc --noEmit` clean.
- [x] `npm run build` clean.

## Review
- **Backend** (`app/_actions/domains.ts`): `ProposeCreateDomainInput` now carries optional `governingStrategy`/`permissions`/`users`, all derived from the SDK `CreateDomainPayload` (no custom types). The payload uses `permissions ?? {empty readAccess}` and `users ?? []`, and spreads `governingStrategy` only when set — so omitting the new fields yields a byte-identical payload to before.
- **Frontend** (`app/domains/new/page.tsx`): Alias/Description/Lock unchanged; added a Governing-strategy select beside Lock, a collapsible read-access grid (8 UUID-list textareas), and a collapsible Users editor with full Genesis parity (id+regenerate, alias, publicKey, roles, lock, description, repeatable loginIds, customProperties JSON). Reuses `READ_ACCESS_KEYS`, `UserRow`, `LoginIdRow`, `buildDefaultUserRow`, `GoverningStrategy`, `LockStatus`, `ReadAccessKey` from `app/genesis/defaults.ts` — **no type duplication**. JSON/validation errors surface via the existing `validationError` block before submit. All new fields optional: an empty form submits exactly as before.
- **Tradeoff**: the presentational helpers (Section/Field/UuidField/UserRowEditor/LoginIdsEditor) are page-local copies of Genesis's (blue-themed) rather than a shared module — Genesis (emerald-themed) left untouched, matching the repo's page-local-helper convention. A future shared, theme-parameterized form kit could de-dupe both pages.
- **Verified**: `npx tsc --noEmit` clean; `npm run build` clean (Next 16 / Turbopack — `/domains/new` prerendered static, all 15 routes generated).
- **Pending (manual, needs a live tenant + browser)**: submit a populated form and confirm the resulting intent JSON shows `permissions.readAccess`, `users[]`, and `governingStrategy` correctly; confirm an invalid user (missing publicKey/roles) blocks submit with the inline error.

---

# Domains — proper /domains route page

Promote Domains from a home-page tab to a first-class route (matching channels/transfers/etc.) so the list and a visible "Create domain" button live at `/domains`, wired to the already-built `/domains/new`.

## Plan
- [ ] Create `app/domains/page.tsx` — route page modeled on `channels/page.tsx`; header has a visible **Create domain** button → `/domains/new`. Body reuses `useDomains` + `DomainsFilters` + `DomainsTable` + `JsonViewer`. → verify: `/domains` renders list + button.
- [ ] Sidebar: make "Domains" a `<Link href="/domains">`; add `/domains` to `isNavMode`, `isActive`, and the `handleTabClick` early-return. → verify: clicking Domains navigates to `/domains` and highlights.
- [ ] Home `app/page.tsx`: remove `DomainsTab` import + render branch; change default `activeTab` "domains" → "accounts" (avoids blank landing). → verify: `/` shows Accounts, no duplicate domains view.
- [ ] Delete `app/components/DomainsTab.tsx` (orphaned by the home-page change).
- [ ] `app/domains/new/page.tsx`: point breadcrumb root + Cancel at `/domains` (the new parent). → verify: Cancel returns to `/domains`.
- [ ] `npx tsc --noEmit` clean.

## Review
- Created `app/domains/page.tsx` — route page mirroring `channels/page.tsx`. Header carries the always-visible **Create domain** button (top-right action group) → `/domains/new`. Body reuses `useDomains` + `DomainsFilters` + `DomainsTable` + `JsonViewer` (logic ported verbatim from the old tab).
- Sidebar: "Domains" is now a `<Link href="/domains">`; added `/domains` to `isNavMode`, an `isActive` clause, and the `handleTabClick` early-return.
- Home `app/page.tsx`: removed the `DomainsTab` import + render branch; default tab "domains" → "accounts"; excluded `domains` from the `?tab=` restore guard (route now, not a tab).
- Deleted `app/components/DomainsTab.tsx` — orphaned by the home-page change (recoverable via git).
- `app/domains/new/page.tsx`: breadcrumb root + Cancel now point at `/domains` (its parent route); success still redirects to the created intent.
- **Verification**: `npx tsc --noEmit` clean. Dev smoke test (Next 16) — `GET /`, `/domains`, `/domains/new` all 200; `/domains` HTML contains the "Create domain" button; dev log free of compile/runtime errors. (`next lint` removed in Next 16, so lint was not run.)

---

# useSubmitIntent Seam — Candidate #1

Introduce a deep `useSubmitIntent` hook that owns the intent-submission lifecycle (mutation + localStorage recording), and converge every propose-style flow onto it. Per `CONTEXT.md`, the UI verb is *submit* and the SDK verb is *propose*; both refer to the same operation across the seam.

Decisions locked in (from grilling):
- **A** — fix the `requestId` extraction at the *root* (server-action contract), not in the UI hook.
- **B** — Variant 1: `useSubmitIntent` owns `useMutation` + `saveSubmittedIntent`. Optional `onSuccess` escape hatch for op-specific extras.
- **C** — `useSubmitIntent` is the name. Per-op hooks renamed to `useSubmit<IntentType>` for symmetry.

## Plan

### Phase 1 — Establish the proposal contract

Every propose-style server action returns `{ request, response, requestId }`. Extract `requestId` once, inside the action. No more 3-way fallback at call sites.

- [x] 1.1 `app/_actions/mpt.ts` — normalize `mptCreate`, `mptAuthorize`, `mptDestroy`, `mptSet`
- [x] 1.2 `app/_actions/intents.ts` — normalize `proposePayment` and `proposeReleaseTransfers`
- [x] 1.3 `app/_actions/trustset.ts` — normalize `trustSet`
- [x] 1.4 `app/_actions/users.ts` — normalize `createUser`
- [x] 1.5 `app/_actions/accounts.ts` — normalize `createAccount`
- [x] 1.6 `npx tsc --noEmit` clean

Helper landed in `app/lib/custody.ts`: `proposeIntent(request)` and `ProposeIntentResult` (`{ request, response, requestId }`). SDK confirms `Core_IntentResponse` is `{ requestId: string }` only — the 3-way fallback at call sites was dead code. Per-action result aliases (`MptResult`, `TrustSetResult`, `CreateUserResult`, `CreateAccountResult`, the local `ProposeIntentResult` in `intents.ts`) all replaced with the shared one. Net `−14 LOC` across 6 files.

### Phase 2 — Build `useSubmitIntent`

- [x] 2.1 New file `app/hooks/useSubmitIntent.ts`
- [x] 2.2 Generic over `<TPayload>` only — `TResponse` collapsed since the normalized contract gives one fixed `ProposeIntentResult` shape. `intentType` typed against `SubmittedIntent["type"]`.
- [x] 2.3 Optional `onSuccess(result, payload)` passthrough

### Phase 3 — Convert Pattern A hooks to one-line wrappers

- [x] 3.1 `app/hooks/useMPTokenCreate.ts` → replaced by `useSubmitMPTokenCreate.ts` (one-liner over `useSubmitIntent`)
- [x] 3.2 `app/hooks/useTrustSet.ts` → replaced by `useSubmitTrustSet.ts` (one-liner)
- [x] 3.3 `MPTCreateTab.tsx` and `TrustSetTab.tsx` imports updated. The `as Parameters<typeof X>[0]` casts turned out to be unnecessary defensive coding — the payload types are already compatible with the action input types, so they died with the old hook files.

### Phase 4 — Convert Pattern B Tabs

For each Tab that today calls a server action inline: introduce a `useSubmit<IntentType>` hook (one-liner) and remove inline `loading`/`response`/`error` `useState`s, the `try/catch`, and the inline `saveSubmittedIntent`.

- [x] 4.1 Audit: all four MPT* tabs (`MPTAuthorizeTab`, `MPTDestroyTab`, `MPTSetTab`, `MPTPaymentTab`) were Pattern B. PaymentTab and MPTPaymentTab share `useSubmitPayment` since both record intent type `"Payment"`.
- [x] 4.2 `PaymentTab.tsx` + `useSubmitPayment.ts` (modal preserved via per-call `mutate(payload, { onSuccess })`)
- [x] 4.3 `AccountCreateTab.tsx` + `useSubmitCreateAccount.ts`
- [x] 4.4 `UserCreateTab.tsx` + `useSubmitCreateUser.ts`
- [x] 4.5 `MPTAuthorizeTab.tsx` + `useSubmitMPTokenAuthorize.ts`
- [x] 4.6 `MPTDestroyTab.tsx` + `useSubmitMPTokenDestroy.ts` (also dropped unused `CURRENT_USER_ID` and unreachable `if (!confirmDestroy)` guard)
- [x] 4.7 `MPTSetTab.tsx` + `useSubmitMPTokenSet.ts` (also dropped unused `CURRENT_USER_ID` and unreachable `if (!selectedFlag)` guard)
- [x] 4.8 `MPTPaymentTab.tsx` (uses shared `useSubmitPayment`; modal preserved)

After Phase 4: `saveSubmittedIntent` is imported only by `useSubmitIntent` — nine former call sites collapsed into one. The 3-way `requestId` fallback ladder is gone everywhere.

### Phase 5 — Verify

- [x] 5.1 `npx tsc --noEmit` clean
- [x] 5.2 `npm run build` clean (Next.js 16 / Turbopack — all 10 pages generated)
- [ ] 5.3 Dev server: submit one of each intent type, confirm `localStorage["submitted_intents"]` records correctly, JsonViewer shows request/response, errors surface — **manual step, requires browser**
- [x] 5.4 Fill in the Review section below

## Out of scope (deliberately deferred)

- PaymentTab's request-modal vs. inline divergence — UX call, not depth.
- `AccountCreateTab` fetching vaults via `useEffect` — separate move ("React Query everywhere").
- `CURRENT_USER_ID` hardcode in `mpt.ts` and `trustset.ts` — flagged in candidate #2 review, still deferred.
- Testing infrastructure — separate decision.

## Review

`useSubmitIntent` is the single home for the intent-submission lifecycle: `useMutation` + `saveSubmittedIntent` recording. Every Tab that proposes an intent now plugs into it via a one-line per-operation hook (`useSubmitX`). The proposal contract was sharpened upstream: the SDK's `Core_IntentResponse` schema confirmed `requestId` is the only field, so the 3-way fallback ladder was dead code at every call site.

**Verified**:
- `npx tsc --noEmit` — clean.
- `npm run build` — clean (Next.js 16 / Turbopack, all 10 routes).
- `saveSubmittedIntent` is now imported only by `useSubmitIntent` (verified by grep). Nine former call sites collapsed into one.
- The `as Parameters<typeof X>[0]` defensive casts in the old Pattern A hooks turned out to be unnecessary — `MPTCreatePayload` and `TrustSetPayload` are already structurally compatible with the action input types.
- Diff: **+224 / −477 → net −253 LOC** across 19 tracked files (excluding the new `CONTEXT.md` and 9 new one-line hook files).

**Pending**:
- Dev-server smoke test (5.3) — manual step, browser required. Submit one of each: `MPTAuthorize`, `MPTIssuanceCreate`, `MPTIssuanceSet`, `MPTIssuanceDestroy`, `CreateUser`, `CreateAccount`, `Payment`, `TrustSet`. Confirm `localStorage["submitted_intents"]` accumulates one record per submission with the correct `type` + `requestId`, the JsonViewer renders `{ request, response, requestId }`, and a deliberate failure (e.g. blank `accountId` bypassing the disabled button via devtools) shows the error block.

**The seam (`app/hooks/useSubmitIntent.ts`)**:
- Generic over `<TPayload>`. Bound to `ProposeIntentResult` (the action contract from `app/lib/custody.ts`), so callers don't need a `<TResponse>` parameter.
- `intentType` typed against `SubmittedIntent["type"]` — the storage union is the source of truth for the closed set of intent kinds.
- Optional `onSuccess(result, payload)` passthrough. Used by `PaymentTab` and `MPTPaymentTab` per-call (`mutate(payload, { onSuccess })`) to open the request modal — Tab-specific concern stays in the Tab.

**Why this matters**:
- A new propose-style operation now requires: server action returning `proposeIntent(request)`, a one-line hook over `useSubmitIntent`, and a Tab that calls `mutate(payload)`. No more 20-line `useState` + `try/catch` + `saveSubmittedIntent` boilerplate per Tab.
- The proposal contract is enforced once: `proposeIntent` in `app/lib/custody.ts` is the only place that calls `sdk.intents.propose` and packages the result. Any change to "what does it mean to submit an intent" (cache invalidation, telemetry, retries) lives at one seam.
- Drift on the requestId-extraction shape can no longer recur — the contract is typed.

**Out-of-scope cleanups absorbed**:
- `MPTDestroyTab` and `MPTSetTab` had unused `CURRENT_USER_ID` constants — removed (different from the `mpt.ts`/`trustset.ts` deferral; these were dead code in the Tabs).
- Unreachable runtime guards in `MPTDestroyTab` (`if (!confirmDestroy)`) and `MPTSetTab` (`if (!selectedFlag)`) — removed; the submit button is already disabled when the precondition isn't met.

**Out of scope (deferred, unchanged)**:
- `MPTPaymentTab` calls `proposePayment` without setting `paymentType: "MPT"` — defaults to `"XRP"` in the action. Looks like a pre-existing bug; preserved verbatim per refactor scope. Worth a follow-up.
- PaymentTab's request-modal vs. inline rendering divergence — UX call.
- `AccountCreateTab` fetching vaults via inline `useEffect` — falls under the "React Query everywhere" follow-up.
- `CURRENT_USER_ID` hardcode in `mpt.ts` and `trustset.ts` — still candidate #3.
