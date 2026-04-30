# Context

Domain language for this codebase. Terms named here should be used consistently across code, comments, and reviews. If a term feels fuzzy during a refactor, sharpen it here rather than in a one-off discussion.

## Glossary

### Intent

A proposal submitted to the Ripple Custody system that, once approved by policy, becomes a transaction on a ledger. The custody SDK exposes proposal calls (e.g. `proposePayment`, `proposeTrustSet`) that return a `requestId` identifying the proposal's request lifecycle.

The closed set of intent types currently used in this app lives in `app/utils/intentStorage.ts` (`SubmittedIntent.type`):

`MPTAuthorize`, `MPTIssuanceCreate`, `MPTIssuanceSet`, `MPTIssuanceDestroy`, `CreateUser`, `CreateAccount`, `Payment`, `TrustSet`.

**Submitted intent** — an intent that the UI has proposed and recorded locally (currently in `localStorage`, see `app/utils/intentStorage.ts`). The local record links a UI submission to its server-side `requestId` so the UI can later resolve it to the resulting `intentId`.

**Submission** — the act of proposing an intent. The UI verb is *submit*; the SDK verb is *propose*. They refer to the same operation from different sides of the seam: `useSubmitIntent` in the UI calls a `propose*` server action which calls the SDK.

**Proposal contract** — every server action in `app/_actions/` that proposes an intent returns `{ request, response, requestId }`. The `requestId` is always present; UI code may rely on it.
