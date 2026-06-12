---
status: accepted
---

# Batch inner-sequence autofill via a direct XRPL node

The Batch (XLS-56) feature must fix each inner transaction's `Sequence` *before* batch signers sign over it, but `dryRunBatch` does not resolve sequences and — in `@florent-uzio/custody@2.3.0` — participant entries have **no `PlatformManaged` sequencing variant** (only the submitter / outer batch do), so the custody backend cannot fill participant sequences either. We therefore autofill inner sequences (and the outer fee) client-side by connecting `xrpl.js` `Client.autofill` to a configured `XRPL_WSS_URL`, isolated to a single server action (`autofillBatch` in `app/_actions/batch.ts`). This is the **only** place in the app that talks to an XRPL node directly; every other operation routes through the custody SDK/backend.

## Considered options

- **A — Direct node autofill (chosen).** Add `XRPL_WSS_URL` config and use `xrpl.js` in one server action. Ships against the published SDK with no backend/SDK dependency. Faithful to the working example.
- **B — Extend the SDK + backend with `Core_ParticipantSequencing_PlatformManaged`.** Would let `dryRunBatch` resolve participant sequences, needing no node and matching the app's "backend does everything" shape. Rejected for now: backend support is unconfirmed, it blocks the UI on an SDK release, and it's reversible into later — switching from A to B is a small UI change (drop `autofillBatch`, set entries to `PlatformManaged`).

## Consequences

- The app gains a raw XRPL node dependency. `XRPL_WSS_URL` is operator-set (testnet, devnet, or a custom Batch net) and **cannot be derived from, or validated against, the custody `ledgerId`** — the workbench displays node + ledger side-by-side and the operator confirms they match.
- A Batch is single-ledger: the submitter pins the ledger and all participants must share it.
- If Option B later lands, revisit and supersede this ADR.
