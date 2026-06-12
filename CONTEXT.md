# Context

Domain language for this codebase. Terms named here should be used consistently across code, comments, and reviews. If a term feels fuzzy during a refactor, sharpen it here rather than in a one-off discussion.

## Glossary

### Intent

A proposal submitted to the Ripple Custody system that, once approved by policy, becomes a transaction on a ledger. The custody SDK exposes proposal calls (e.g. `proposePayment`, `proposeTrustSet`) that return a `requestId` identifying the proposal's request lifecycle.

The closed set of intent types currently used in this app lives in `app/utils/intentStorage.ts` (`SubmittedIntent.type`):

`MPTAuthorize`, `MPTIssuanceCreate`, `MPTIssuanceSet`, `MPTIssuanceDestroy`, `CreateUser`, `CreateAccount`, `Payment`, `TrustSet`, `Batch`.

`Batch` records only the final `proposeBatch` intent (see [Batch](#batch-xls-56)). The intermediate per-participant raw-sign intents are *not* recorded here — they live in the workbench's own persisted session, which exposes their `requestId`s for approval but keeps them out of the global submitted-intents list.

**Submitted intent** — an intent that the UI has proposed and recorded locally (currently in `localStorage`, see `app/utils/intentStorage.ts`). The local record links a UI submission to its server-side `requestId` so the UI can later resolve it to the resulting `intentId`.

**Submission** — the act of proposing an intent. The UI verb is *submit*; the SDK verb is *propose*. They refer to the same operation from different sides of the seam: `useSubmitIntent` in the UI calls a `propose*` server action which calls the SDK.

**Proposal contract** — every server action in `app/_actions/` that proposes an intent returns `{ request, response, requestId }`. The `requestId` is always present; UI code may rely on it.

### Batch (XLS-56)

A single XRPL transaction that bundles several **inner transactions** so the ledger applies them together under one **execution mode**. Unlike every other operation in this app, a Batch is *not* a fire-and-forget [Intent](#intent): it is a client-orchestrated three-step flow exposed by the SDK as `dryRunBatch` → `signBatchPayload(AndWait)` / `getBatchSignature` → `proposeBatch`.

**Inner transaction** (a.k.a. *raw transaction*) — one of the bundled operations. Typed in the SDK as `Core_BatchInnerOperation` (Payment, TrustSet, MPToken*, OfferCreate, etc.). Each inner transaction's `Sequence` is signed over by the batch signers, so it must be fixed **before** signatures are collected.

**Submitter** — the account that pays the outer Batch fee and whose own signature authorizes the outer Batch. Its inner operations are `SubmitterOperation` entries; it does **not** appear in `batchSigners`. May use `PlatformManaged` sequencing only in a fully platform-managed, submitter-only batch (see Sequencing).

**Participant** — any account with an inner operation that is *not* the submitter. Its inner operations are `ParticipantOperation` entries and it **must** contribute a [BatchSigner](#batchsigner). In SDK 2.3.0 a participant's sequencing must be an explicit `AccountSequence` or `Ticket` value — there is **no `PlatformManaged` variant for participants** (only the submitter / outer batch have one). This is why participant sequences must be autofilled.

**Execution mode** — how the ledger handles inner-operation failures: `AllOrNothing` (atomic — the focus here), `OnlyOne`, `UntilFailure`, `Independent`. Maps to the XRPL flags `tfAllOrNothing` / `tfOnlyOne` / `tfUntilFailure` / `tfIndependent`.

**Autofill** — filling in on-ledger fields (inner `Sequence`s, outer `Sequence`/`Fee`) from an XRPL node via `xrpl.js` `Client.autofill`. Required because `dryRunBatch` does **not** resolve sequences and participants have no `PlatformManaged` variant. Must happen before signing — the inner sequences are part of what the batch signers sign over.

**Sequencing (all-or-nothing)** — the custody API rejects *mixed* sequencing. A batch is *either* **fully explicit** (the outer Batch **and** every entry carry an `AccountSequence`/`Ticket`) — required whenever there are participants, i.e. any multi-account batch — *or* a **submitter-only batch that is fully `PlatformManaged`** (outer and every entry). There is no valid "explicit inner + platform-managed outer" combination; an earlier draft of this design assumed one (see Q8) and it is wrong.

**Signing payload** — the canonical hex blob returned by `dryRunBatch` that every participant signs. Collecting signatures freezes the inner transactions: editing an entry afterwards silently invalidates the signatures.

**BatchSigner** — one participant's signature over the signing payload (`Core_BatchSigner`: `{ participant, publicKey, signature }`). One per participant, collected in step 2 and passed to `proposeBatch`.
