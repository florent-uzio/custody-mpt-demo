# Refactor: transaction detail page decomposition

## Goal
Split 625-line monolithic `page.tsx` into focused sub-components and a dedicated hook,
following lessons.md component architecture rules.

## Plan

- [x] Create `app/hooks/useTransaction.ts` — extract raw `useQuery` fetch logic
- [x] Create `app/components/transaction/config.ts` — ProcessingStatus type, STATUS_CONFIG, LEDGER_STATUS_STYLES, FALLBACK_CONFIG, getStatusConfig, formatDate
- [x] Create `app/components/transaction/InfoCard.tsx` — InfoRow + InfoCard
- [x] Create `app/components/transaction/LedgerStatusBadge.tsx`
- [x] Create `app/components/transaction/TransactionHeader.tsx` — gradient header w/ sidebar toggle
- [x] Create `app/components/transaction/SummaryBar.tsx` — 4-column summary strip
- [x] Create `app/components/transaction/ProcessingCard.tsx`
- [x] Create `app/components/transaction/LedgerDataCard.tsx`
- [x] Create `app/components/transaction/OrderReferenceCard.tsx`
- [x] Create `app/components/transaction/RelatedAccountsCard.tsx`
- [x] Create `app/components/transaction/LedgerTransactionCard.tsx`
- [x] Refactor `app/transactions/[id]/page.tsx` — composition only (~50 lines)
- [x] Verify: `npx tsc --noEmit` — zero errors in this file
## Review
All items complete. page.tsx reduced from 625 lines → 100 lines. 11 focused components created.
