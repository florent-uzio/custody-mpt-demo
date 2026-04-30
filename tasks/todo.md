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
