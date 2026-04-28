# IntentBuilder Consolidation — Candidate #2

Collapse the repeated Propose envelope and `v0_CreateTransactionOrder` boilerplate across 5 signing-flow action files into a single helper module.

## Plan

- [x] 1. Create `app/lib/intent-builder.ts` with two helpers:
  - `buildProposeIntent({ author, targetDomainId, payload, description, customProperties? })` → `Core_ProposeIntentBody`
  - `buildTransactionOrderPayload({ ledgerId, accountId, operation, description, customProperties?, feePriority? })` → `v0_CreateTransactionOrder` payload
- [x] 2. Refactor `accounts.ts::createAccount` (Tier 1 only)
- [x] 3. Refactor `users.ts::createUser` (Tier 1 only)
- [x] 4. Refactor `intents.ts` — `proposeReleaseTransfers` (Tier 1) + `proposePayment` (Tier 1+2)
- [x] 5. Refactor `mpt.ts` — `mptCreate`, `mptAuthorize`, `mptDestroy`, `mptSet` (all Tier 1+2)
- [x] 6. Refactor `trustset.ts::trustSet` (Tier 1+2, `feePriority: "Low"`)
- [x] 7. Verify: `npx tsc --noEmit` and `npm run build`
- [x] 8. Document review and follow-ups

## Behavior preservation rules

- Helpers take `author`, `targetDomainId`, and `feePriority` as args — per-call differences are preserved verbatim, not unified.
- `mptDestroy`/`mptSet`/`trustSet` keep their hardcoded `CURRENT_USER_ID` — flagged as candidate #3.
- `mptCreate` keeps `targetDomainId: domainId` (others use `currentUser.domainId`) — flagged.
- `trustSet` keeps `feePriority: "Low"` (others "Medium") — kept intentional.

## Review

`app/lib/intent-builder.ts` is the single home for the Propose envelope and `v0_CreateTransactionOrder` payload. Nine call sites across 5 files now stamp their unique fields (operation, payload, description, author, targetDomainId, optional feePriority) and let the helper provide the rest.

**Verified**:
- `npx tsc --noEmit` — clean.
- `npm run build` — clean (Next.js 16, Turbopack).
- `expiryAt`, `feeStrategy`, `maximumFee: "10000000"`, `memos: []`, `type: "Propose"`, `type: "v0_CreateTransactionOrder"`, `dayjs().add(1, "day")`, and the outer/inner `uuidv4()` calls now appear **only** in `intent-builder.ts`. Grepped to confirm.
- `dayjs` is no longer imported by any file under `app/_actions/`.
- `git diff --stat` for the 5 action files: **+167 / −257 → net −90 lines**. The new helper is +73 lines, so total demo code change is −17 LOC plus a sharply reduced surface area for envelope changes.

**Behavior preserved (intentionally not unified)**:
- `mptDestroy`, `mptSet`, `trustSet` still use the hardcoded `CURRENT_USER_ID = "6ac20654-…"` instead of `getCurrentUser`. Unifying could change the recorded `author.id` at runtime — punted to candidate #3.
- `mptCreate` still sets `targetDomainId: domainId` while the others use `currentUser.domainId`. Same reason.
- `trustSet` keeps `feePriority: "Low"`; everything else defaults to `"Medium"`.
- The two `as never` casts (mptCreate operation, mptSet operation) and the `@ts-expect-error` + `as string` casts in `proposePayment` are preserved verbatim — moved to inside the `buildTransactionOrderPayload({ operation: ... })` arg position.

**Why this matters**:
- Future envelope changes (expiry from 1 day to 1 hour, fee bumps, memo defaults, switching `feeStrategy.type` to `"SpecifiedAdditionalFee"`) are now one-edit changes instead of nine.
- Each call site now reads as intent-specific data (operation, description, customProperties), not envelope ceremony — easier to scan when adding a new propose flow.
- The helper signature is the contract: a new propose flow must produce a typed `Core_ProposeUserIntentPayload` and a typed `Author`/`targetDomainId` — no chance of forgetting `expiryAt` or the `Propose` discriminator.

## Out of scope (follow-ups, candidate #3)

- Replace `CURRENT_USER_ID` hardcode with `getCurrentUser` in `mpt.ts` and `trustset.ts`
- Consolidate `targetDomainId` source (input vs. `currentUser.domainId`)
- Re-evaluate `feeStrategy.priority` per flow (one project-wide default vs. per-intent override)
