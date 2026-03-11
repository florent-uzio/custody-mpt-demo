# Lessons Learned

## Component Architecture

### Build pages from small, focused components
- **Rule**: Never write a component exceeding ~80-100 lines. If it grows beyond that, split it.
- **Rule**: Each logical section of a page (header, form, results, etc.) becomes its own component file.
- **Rule**: Group sub-components in a dedicated directory named after the page (e.g. `app/components/keypair/`, `app/components/mpt-create/`).
- **Rule**: The tab/page component itself should only compose sub-components — no inline markup blocks.
- **Example**: `MPTCreateTab.tsx` delegates to `IssuerAccountSection`, `TokenPropertiesSection`, `TokenFlagsSection`, `MetadataSection`, `ConfigSummary` — follow this pattern always.

## Patterns & Conventions

### Always use TanStack Query for data fetching
- **Mistake**: Implemented `KeypairTab.tsx` with manual `useState` + `fetch` instead of a TanStack mutation
- **Rule**: All API calls go through a TanStack hook (`useMutation` for writes, `useQuery` for reads)
- **Rule**: Hooks live in `app/hooks/` — one file per resource/operation (e.g. `useKeypairGenerate.ts`)
- **Rule**: Components only call `mutate`/`isPending`/`data`/`error` from the hook — no raw fetch in components

## SDK Usage

### Always use the custody SDK types — never invent your own
- **Rule**: Import and use types directly from `custody` (e.g. `Core_TransactionDetails`, `Core_LedgerTransactionStatus`, `Core_ApiTransactionProcessingDetails`). Never define local interfaces that mirror SDK shapes.
- **Rule**: Check the actual SDK type definitions before writing UI logic. Field names and shapes often differ from intuition (e.g. `orderReference` has only `id` + `domainId`, not `requestId`/`intentId`).
- **Rule**: SDK processing statuses are: `Broadcasting`, `Completed`, `Failed`, `Interrupted`, `Pending`, `Prepared`, `Preparing`, `Reserved` — not `Submitted`/`Processing`.
- **Rule**: SDK ledger statuses are: `Detected`, `Confirmed`, `Expired`, `Replaced` — not `Success`/`Failed`.
- **Rule**: `Core_LedgerTransactionData.ledgerData` is a discriminated union (`Core_OnLedgerData`). Always narrow by `type` discriminator (e.g. `type === "Xrpl"`) before accessing variant-specific fields like `tokenData`.
- **Rule**: When in doubt, run `npx tsc --noEmit` to surface type mismatches immediately.

## Task Management

### Always write to tasks/ directory
- **Mistake**: Completed multiple tasks (colorful headers, keypair page) without writing to `tasks/todo.md` or `tasks/lessons.md`
- **Rule**: For ANY non-trivial task, write a plan to `tasks/todo.md` BEFORE starting. Update checkboxes as you go. Add a review section when done.
- **Rule**: After ANY user correction, update `tasks/lessons.md` immediately.
- **Rule**: The tasks/ directory is not optional — it is part of the definition of done.
