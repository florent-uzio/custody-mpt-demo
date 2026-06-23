# UI Consistency + Tabs → Routes (design-system kit)

Branch: `feat/ui-consistency`. Bring uniform headers + widths to every page and convert the
remaining home-page tabs into real routes.

## Decisions (confirmed with user via AskUserQuestion)
- **Header system:** persistent slim **white top bar** on every page (`PageHeader`) + a themed
  **gradient hero card** inside content (`PageHero`). Tickets-inspired, generalized into a kit.
- **Width tiers:** forms/actions `max-w-3xl` · detail/profile `max-w-5xl` · lists/tables `max-w-7xl`.
- **Tabs:** convert ALL functional tabs to real routes; delete dead duplicates; sidebar = all real
  `<Link>`s; clean up home into a light dashboard.

## Phase 1 — Shared kit (`app/components/layout/`)
- [ ] `pageTheme.ts` — theme registry (hero gradient / step badge / focus ring / button gradient per color)
- [ ] `Page.tsx` (outer flex column) · `PageHeader.tsx` (white bar) · `PageHero.tsx` (gradient card)
- [ ] `PageContainer.tsx` (scroll + width tier) · `SectionCard.tsx` (numbered step card)
- [ ] `SubmitButton.tsx` · `ErrorBanner.tsx` · `DomainWarning.tsx`
- [ ] `AppShell.tsx` — SidebarContext provider + AppSidebar + gradient bg wrapper

## Phase 2 — Shell + sidebar
- [ ] Hoist `AppShell` into root `app/layout.tsx`; delete all 15 per-route `layout.tsx`
- [ ] Rewrite `AppSidebar` to all real `<Link>`s (href per item); drop `activeTab`/`onTabChange`
      + the giant if-chain; pathname-based `isActive`

## Phase 3 — Convert tabs → routes (kit-based)
- [ ] `/payment` `/mpt/create` `/mpt/authorize` `/mpt/set` `/mpt/destroy` `/config` `/keypair`
      `/jwt-token` `/submitted-intents`
- [ ] Delete dead tab components incl. legacy RequestsTab/TransfersTab/TransactionsTab
- [ ] Home `/` → light dashboard/landing + relocated Notes

## Phase 4 — Retrofit existing pages to the kit (correct width tier each)
- [ ] Forms (3xl) · Detail (5xl) · Lists (7xl)

## Phase 5 — Verify
- [x] `npx tsc --noEmit` clean · `npm run build` clean (34 routes generated) · all 46 page.tsx use the kit

## Review
- **Kit** (`app/components/layout/`): `pageTheme.ts` (9 named themes, full literal Tailwind strings
  for JIT), `Page`, `PageHeader` (white bar, owns the sidebar toggle, breadcrumbs + actions slot),
  `PageHero` (themed gradient card), `PageContainer` (width tiers form/detail/list = 3xl/5xl/7xl),
  `SectionCard`, `SubmitButton`, `ErrorBanner`, `DomainWarning`, `AppShell`, `index.ts` barrel.
- **Shell**: `AppShell` hoisted into root `app/layout.tsx`; deleted all 15 byte-identical per-route
  `layout.tsx`. Sidebar state is now app-wide (persists across navigation).
- **Sidebar**: rewrote `AppSidebar` to all real `<Link>`s driven by one `NAV_ITEMS` table + a
  longest-prefix `activeNavId(pathname)`; dropped `activeTab`/`onTabChange` + the ~250-line if-chain +
  `?tab=` nav mode. Header links to `/`.
- **Tabs → routes** (9 new): `/payment` `/mpt/{create,authorize,set,destroy}` `/config` `/keypair`
  `/jwt-token` `/submitted-intents`. Home `/` is now a dashboard (themed hero + relocated Notes +
  quick-link grid from NAV_ITEMS).
- **Deleted**: 13 tab components (the 9 converted + legacy RequestsTab/TransfersTab/TransactionsTab,
  + pre-existing-dead MPTPaymentTab). Detail-page migration orphaned `DomainHeader`/`TransactionHeader`
  → deleted (orphaned BY this change).
- **Retrofit**: every page → white-bar + themed hero + width tier. 12 forms (3xl), 12 detail (5xl,
  incl. users/me which was the 7xl outlier), 11 lists (7xl, refresh/create moved into PageHeader
  `actions`), batch (5xl).
- **Verified**: `next build` ✓ (34 routes), `tsc --noEmit` ✓, no unused imports (heuristic), every
  page.tsx imports the kit, `useSidebarContext` now used only by `PageHeader`.
- **Left as-is**: `IntentsTab.tsx` — pre-existing dead code (orphaned before this task, unrelated);
  flagged, not deleted.
- **Tradeoff**: detail `[id]` pages narrowed 7xl→5xl per the chosen 3-tier scheme; a few data-dense
  ones (transaction ledger data) are tighter than before. Per-page width tuning is a follow-up.
- **Pending (manual, needs live tenant + browser)**: click through routes to confirm heroes/forms/
  tables render and submit, and sidebar active-highlight is correct per route.

---

# Tickers: tab → route + create/update intents

Convert `TickersTab` into a full `/tickers` route (list table, detail, create, update),
using **only** `@florent-uzio/custody` SDK types.

## Decisions (resolved via grilling)
- **Create scope:** XRPL only, all 3 property variants (Native / FungibleToken / MultiPurposeToken).
  Property-type `<select>` swaps fields; `kind` derived (Native→`Native`, others→`Token`).
- **Filters:** refactor `listTickers` to take `GetTickersQueryParams` directly; delete the custom
  `TickerFilters` + `buildTickerQueryParams` (only `TickersTab` consumed them).
- **domainId source:** `useDefaultDomain()` context for create + update (reads are not domain-scoped);
  guard + warning when unset, mirroring `domains/new`.
- **Update UX:** separate `/tickers/[id]/edit` route with an edit-only form
  (name, decimals, symbol, description, customProperties). "Edit" button on detail. Mirrors policies.
- **Ledger select options:** `["xrpl", "xrpl-testnet-august-2024", "xrpl-devnet"]` (from transactions).
- Component location: `app/tickers/components/` (co-located, like transactions/policies).

## Plan

### 1. Server actions — `app/_actions/tickers.ts` (modify)
- [ ] Delete `TickerFilters`, `buildTickerQueryParams`, `TickerQueryParams`.
- [ ] `listTickers(params: GetTickersQueryParams = {})` → `sdk.tickers.list(params)`.
- [ ] Keep `getTicker(tickerId)`.
- [ ] Add `ProposeCreateTickerInput = Omit<Core_v0_CreateTicker,"type"> & { domainId }`.
- [ ] Add `ProposeUpdateTickerInput = Omit<Core_v0_UpdateTicker,"type"> & { domainId }`.
- [ ] Add `proposeCreateTicker` / `proposeUpdateTicker` → `getCurrentUser(domainId)` +
      `buildProposeIntent` + `proposeIntent` (policies pattern). verify: tsc clean.

### 2. Hooks — `app/hooks/useTickers.ts` (modify)
- [ ] Add `useTickersList(params: GetTickersQueryParams)` (queryKey `["tickers-list", params]`).
- [ ] Leave existing `useTickers(ids)` (used by accounts/[id]) and `useTicker(id)` untouched.

### 3. Routes — `app/tickers/`
- [ ] `layout.tsx` (copy `domains/layout.tsx`).
- [ ] `page.tsx` — header + "New ticker" button + `TickersFilters` + `TickersTable` + `JsonViewer`.
- [ ] `new/page.tsx` — create form (XRPL, 3 variants), `useMutation(proposeCreateTicker)`,
      success → `/intents/{requestId}`, default-domain guard.
- [ ] `[id]/page.tsx` — detail cards (`useTicker`) + "Edit" link + MPT explorer link + `JsonViewer`.
- [ ] `[id]/edit/page.tsx` — edit-only form, revision from `data.metadata.revision`,
      `useMutation(proposeUpdateTicker)`, success → `/intents/{requestId}`.

### 4. Components — `app/tickers/components/`
- [ ] `TickersFilters.tsx` — ledgerId select, kind select, validationStatus (Validated/NonValidated),
      lock toggles (Unlocked/Locked/Archived), name/symbol text, sortBy/sortOrder/limit. Controlled.
- [ ] `TickersTable.tsx` — Name, Symbol, Kind, Decimals, Lock, Ledger, Ticker ID(+copy), arrow→detail.
- [ ] `TickerCreateForm.tsx` — builds `Core_TickerLedgerDetails_XRPL` from property-type select.
- [ ] `TickerEditForm.tsx` — name/decimals/symbol/description/customProperties.

### 5. Sidebar — `app/components/AppSidebar.tsx` (modify)
- [ ] Add `<Link href="/tickers">` handler for `tab.id === "tickers"` (mirror domains).
- [ ] Add `isActive`: `pathname.startsWith("/tickers")`; add `/tickers` to nav-mode + handleTabClick.

### 6. Cleanup
- [ ] `app/page.tsx`: remove `TickersTab` import + `{activeTab === "tickers" && <TickersTab />}`.
- [ ] Delete `app/components/TickersTab.tsx`.

### 7. Verify
- [x] `npx tsc --noEmit` clean (exit 0).
- [x] `npm run build` clean ("Compiled successfully"; `/tickers` + `/tickers/new` static ○,
      `/tickers/[id]` + `/tickers/[id]/edit` dynamic ƒ).
- [ ] Runtime list/create/edit against a live tenant — manual (needs API creds + browser).

## Review
Branch: `feat/tickers-route` (main untouched).

- **`app/_actions/tickers.ts`** — dropped the custom `TickerFilters`/`buildTickerQueryParams`;
  `listTickers(params: GetTickersQueryParams)` now passes straight through to `sdk.tickers.list`.
  Added `proposeCreateTicker`/`proposeUpdateTicker` following the policies pattern
  (`getCurrentUser(domainId)` → `buildProposeIntent` → `proposeIntent`). Input types derived
  via `Omit<Extract<…payload,{type}>, "type"> & { domainId }` — no hand-rolled SDK shapes.
- **`app/hooks/useTickers.ts`** — added `useTickersList`; `useTickers(ids)` (used by
  `accounts/[id]`) and `useTicker(id)` left untouched. Distinct query key `["tickers-list"]`.
- **Routes** `app/tickers/{layout,page,new,[id],[id]/edit}` — list mirrors `domains/page`
  (header + "New ticker" button + filters + table + JsonViewer); new/edit mirror
  `domains/new` + `policies/[id]/edit` (mutation → `/intents/{requestId}`, default-domain guard).
- **Components** `app/tickers/components/` — `TickersFilters` (ledger select w/ xrpl-devnet, kind,
  validation Validated/NonValidated, lock toggles, name/symbol, sort, limit — all typed off
  `GetTickersQueryParams`), `TickersTable` (row→detail arrow, sortable headers, kind/lock badges),
  `TickerCreateForm` (XRPL Native/FungibleToken/MPT — property-type select swaps fields, `kind`
  derived), `TickerEditForm` (name/decimals/symbol/description/customProperties).
- **Sidebar** — `tickers` now a `<Link href="/tickers">` with `isActive`/`isNavMode`/`handleTabClick`
  wiring (mirrors domains).
- **Cleanup** — removed `TickersTab` import + render from `app/page.tsx`, excluded `tickers` from
  the `?tab=` restore, deleted `app/components/TickersTab.tsx` (grep-confirmed orphan).
- **Corrected legacy bugs** in the old tab's enums: sortOrder is `ASC|DESC` (was Ascending/
  Descending), validationStatus is `Validated|NonValidated` (was All/Validated/Unvalidated).
- **Verified**: `tsc --noEmit` exit 0; `npm run build` exit 0.
- **Pending (manual, live tenant + browser)**: load `/tickers` & filter; create a ticker (each of
  the 3 XRPL variants) and confirm the proposed intent JSON; edit a ticker and confirm revision +
  fields in the update intent.

---

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

---

## TrustSet — human-friendly value scaling (× 10⁸¹)

**Problem**: Ripple Custody multiplies a TrustSet limit value by 10⁻⁸¹ before submitting to the XRPL. To create a trustline of `100`, the user must currently type `100` followed by 81 zeros. Painful and error-prone.

**Goal**: Let the user type a human-readable value (`100`) and auto-scale it by 10⁸¹ to cancel the backend's 10⁻⁸¹. Toggle is ON by default; OFF sends the raw value (backward compatible). Add an inline explanation linking the XRPL token-precision docs.

**Design decisions**:
- Scale with **string math, not `Number`** — `Number("100") * 1e81` stringifies to `"1e+83"` (scientific notation) and loses precision. A decimal-point shift on the string is exact and handles decimals.
- Scale **client-side** so the UI can show a live preview of the exact value submitted; the server action stays untouched (surgical).
- Fixed `× 10⁸¹` toggle (not an editable exponent) — matches "enabled by default" and avoids unrequested config. Exponent kept as a named constant.

**Steps**:
1. [x] `app/lib/token-amount.ts` — `CUSTODY_VALUE_SCALE_EXPONENT`, `isDecimalString`, `scaleByPowerOfTen` (pure, string-based) → verify: unit-trace 100/1.5/0.001/0
2. [x] `app/components/trustset/TrustLimitValueField.tsx` — value input + scale toggle + explanation + live preview → verify: 86 lines
3. [x] `app/components/trustset/LimitAmountSection.tsx` — delegate value to new field, accept scale props → verify: 84 lines
4. [x] `app/trustset/page.tsx` — `scaleValue` state (default true), scale on submit → verify: passes raw when off
5. [x] `npx tsc --noEmit` → verify: clean

**Review**:
- `scaleByPowerOfTen("100", 81)` reproduces the user's hand-typed 84-digit number exactly (`"100"` + 81 zeros). Decimals verified: `1.5 → 1.5e81`, `0.001 → 1e78`, `0 → 0`.
- String-based shift confirmed necessary: `Number` path would have emitted `"1e+83"`.
- Toggle ON by default; OFF sends the raw value unchanged (server action `trustset.ts` untouched).
- Live preview box shows the exact submitted value, matching the server-built Request Payload.
- Both touched components remain within the ~100-line convention.

---

## TrustSet — issuer as free address OR custody-account dropdown

**Problem**: The issuer was a free-text r-address only. The user wants to also pick a Ripple Custody account (like `batch` inner ops / `clawback` holder), resolving to its r-address.

**Design decisions**:
- The `trustset` server action takes `issuer` as a plain address string, so resolve the picked account → r-address **client-side** and feed it into the existing `issuer` state. No server-action change; `page.tsx` unchanged.
- Used the existing `useAccountsWithAddresses` hook (already powering `clawback`) — accounts come enriched with their preferred r-address, so the dropdown sets the issuer **synchronously**. This avoids the batch's async `resolveAddress` round-trip and its per-ledger `ledgerId` ambiguity.
- Default mode = free address → preserves prior behavior.
- Split out `CustodyAccountSelect` because `IssuerField` crossed the ~100-line rule (108 → 71); the new widget is a focused, reusable "pick account → emit r-address" dropdown.

**Steps**:
1. [x] `app/components/trustset/CustodyAccountSelect.tsx` — accounts-with-addresses dropdown emitting the r-address; no-address accounts disabled → verify: 57 lines
2. [x] `app/components/trustset/IssuerField.tsx` — address/account mode toggle + free input + dropdown → verify: 71 lines
3. [x] `app/components/trustset/LimitAmountSection.tsx` — currency on its own row, delegate issuer to `IssuerField` → verify: 67 lines
4. [x] `npx tsc --noEmit` → verify: clean

**Review**:
- `page.tsx` untouched — the feature is fully contained in the Limit Amount components.
- Account mode resolves to the account's preferred r-address (shown under the dropdown for transparency); accounts lacking an activated address are listed but disabled.
- Switching account → address mode keeps the resolved address pre-filled and editable.
- Not yet exercised in a running browser (needs a configured domain + custody backend) — logic mirrors the proven `clawback` holder pattern.
