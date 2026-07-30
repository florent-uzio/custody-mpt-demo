# Ripple Custody MPT Demo

A beautiful Next.js + React + TypeScript + Tailwind CSS application to showcase Ripple Custody operations with Multi-Purpose Tokens (MPT).

## Features

Pages are grouped the same way as the sidebar.

**General**
- **Domains**: Browse domains and create new ones; set the default domain used across the app
- **Accounts**: Filter and inspect custody accounts, view manifests, propose new accounts

**Users**
- **Users**: List, invite and edit users and their roles
- **Me**: Inspect the currently authenticated user

**Operations**
- **Requests**: Query request state from the Custody system
- **Transfers**: Browse transfers and their detail
- **Transactions**: Browse on-ledger transactions, matched to the intent that created them
- **Channels**: List, inspect and create notification channels
- **Intents**: List intents and inspect their payloads
- **Policies**: List, create and edit approval policies

**Data**
- **Tickers**: Filter tickers by ledger, kind and validation status; create and edit them

**XRPL operations** — each proposes an intent and shows the request/response payloads
- **Payment**, **TrustSet**, **AccountSet**, **Clawback**
- **MPT Create / Authorize / Set / Destroy**
- **Tickets**: Reserve sequence numbers with `TicketCreate`
- **Batch**: Compose and submit a batch of inner transactions — typed Payment and
  ConfidentialMPT operations, or raw xrpl.js JSON

**Confidential MPT**
- **cMPT Convert / Convert Back**: Move a balance between the public and confidential sides
- **cMPT Merge Inbox**: Fold received confidential transfers into the spendable balance
- **cMPT Send**: Confidential transfer — plaintext amount, or a pre-computed proof bundle
- **cMPT Compute**: `initiateCmptCompute` / `getCmptComputeStatus`, each with an `…AndWait` variant
- **Provision ElGamal**: `v0_ProvisionElGamalKeyPair` — the per-account, per-ledger prerequisite

**Tools & setup**
- **Keypair Generator** and **JWT Token** helpers
- **Run Genesis**: Bootstrap a fresh environment
- **Configuration**: Override SDK URLs, keys and ledger settings at runtime

## Why Next.js?

This app uses Next.js instead of a pure client-side framework because:
- The Ripple Custody SDK requires Node.js crypto operations (key generation, signing)
- Server Actions handle all custody SDK operations securely
- No browser polyfills needed - everything runs natively on the server
- Better security - the configured signing key (`PRIVATE_KEY`) stays on the
  server: it is only ever read inside Server Actions, and the Configuration
  page treats it as write-only — you can set or clear it, but its current value
  is never sent to the browser. The one deliberate exception is the **Keypair
  Generator**, which exists to hand you a freshly generated private key; that
  key is not the app's credential and is never stored server-side.

## Prerequisites

- Node.js 20.9+ and npm (required by Next 16; CI runs Node 22)
- Ripple Custody API credentials

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with your Ripple Custody credentials:
```env
AUTH_URL=your_auth_url_here
API_URL=your_api_url_here
PRIVATE_KEY=your_private_key_here
PUBLIC_KEY=your_public_key_here

# Optional — see "Ledger configuration" below
XRPL_LEDGER_IDS=xrpl-testnet-august-2024,xrpl-devnet,xrpl-custody-devnet,xrpl
DEFAULT_LEDGER_ID=xrpl-testnet-august-2024
```

See `.env.example` for the full list of supported variables. Next also loads
`.env.local` (and it takes precedence over `.env`), but the rest of this README
and the Configuration page both refer to `.env` — stick to `.env` to avoid a
stale `.env.local` silently shadowing it. Both are gitignored.

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

## Ledger configuration

Which XRPL ledgers the app offers, and which one is preselected, is configurable
rather than hardcoded. Two variables control it:

| Variable | Purpose |
| --- | --- |
| `XRPL_LEDGER_IDS` | Comma-separated list of ledger IDs offered in every ledger picker |
| `DEFAULT_LEDGER_ID` | The ledger preselected in filters and forms across the app |

Both are optional. If `XRPL_LEDGER_IDS` is empty the app falls back to a built-in
list:

```
xrpl-testnet-august-2024, xrpl-devnet, xrpl-custody-devnet, xrpl
```

If `DEFAULT_LEDGER_ID` is empty the first entry of the list is used. That list is
ordered testnet-first on purpose, so an unconfigured install never defaults to
mainnet. A `DEFAULT_LEDGER_ID` that isn't in `XRPL_LEDGER_IDS` is added to the
front of the list rather than being ignored, so it still takes effect.

### Adding a ledger

Add its ID to `XRPL_LEDGER_IDS` and restart the dev server. No code change is
needed — the ID appears in every picker automatically. On the account-creation
page, ledgers the app has metadata for (a friendly name, description and network
badge) render a curated card; anything else renders a generic card labelled with
the raw ID.

### Changing it at runtime

Both values can also be set on the **Configuration** page (`/config`) without
touching `.env` or restarting. Overrides live in server memory, apply immediately
across the app, and are discarded when the server restarts. Each field shows
whether its current value comes from a runtime override, from `.env`, or isn't
set at all.

### What it affects

- `/transactions` and `/tickers` — Ledger filter options and initial selection
- `/tickers/new` — Ledger dropdown on the create-ticker form
- `/accounts` — Ledger ID filter dropdown, prefilled with the default (pick
  **All ledgers** to search across all of them)
- `/accounts/new` — one selectable card per configured ledger, with the default
  preselected
- `/payment` and `/mpt/authorize` — the ledger shown under "Fixed Configuration"

A filter the user hasn't touched keeps tracking the configured default, so
changing `DEFAULT_LEDGER_ID` updates those pages without a reload.

## Project Structure

The app uses the Next.js App Router. Every custody SDK call goes through a
Server Action in `app/_actions/` — there are no `app/api/` routes.

```
app/
  ├── _actions/                 # "use server" — the only place the custody SDK is called
  │   ├── accounts.ts           #   one module per resource (accounts, intents,
  │   ├── ledgers.ts            #   tickers, transactions, users, vaults, …)
  │   ├── config.ts             #   runtime config read/write
  │   └── …
  ├── lib/                      # Isomorphic helpers, no React
  │   ├── custody.ts            #   SDK singleton + resetCustodySDK()
  │   ├── config.ts             #   config keys, .env + in-memory overrides
  │   ├── ledgers.ts            #   ledger list / default resolution
  │   ├── batch-builder.ts
  │   ├── intent-builder.ts
  │   └── token-amount.ts
  ├── hooks/                    # react-query wrappers over the server actions
  │   ├── useConfig.ts
  │   ├── useLedgerConfig.ts
  │   └── useSubmit*.ts         #   one mutation hook per intent type
  ├── components/
  │   ├── layout/               #   Page kit: Page, PageHeader, PageHero,
  │   │                         #   PageContainer, SectionCard, SubmitButton, …
  │   ├── batch/                #   Feature-scoped component folders
  │   ├── mpt-create/
  │   ├── transaction/
  │   ├── AppSidebar.tsx
  │   ├── JsonViewer.tsx
  │   └── CopyButton.tsx
  ├── contexts/                 # DomainContext (default domain), SidebarContext
  ├── providers/                # QueryProvider — react-query client + cache seeding
  ├── utils/                    # batchSessionStorage.ts
  │
  │                             # Route groups (each a folder with page.tsx)
  ├── accounts/                 #   list, [id], [id]/manifests, new
  ├── domains/  users/          #   list, [id], new / invite, me
  ├── intents/  requests/       #   list, [id]
  ├── transactions/  transfers/ #   list, [id]
  ├── tickers/                  #   list, [id], [id]/edit, new
  ├── policies/  channels/      #   list, [id], [id]/edit, new
  ├── mpt/                      #   authorize, create, destroy, set
  ├── payment/  trustset/       #   XRPL operation forms
  ├── accountset/  clawback/    #
  ├── batch/  tickets/          #
  ├── config/                   #   runtime configuration page
  ├── genesis/  jwt-token/      #   tooling pages
  ├── keypair/                  #
  │
  ├── layout.tsx                # Root layout — resolves ledger config server-side
  ├── page.tsx                  # Dashboard
  └── globals.css               # Tailwind CSS styles
```

## Technologies

- **Next.js 16**: React framework with API routes
- **React 19**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **custody.js**: Ripple Custody SDK (server-side only)

## MPT Operations

This demo showcases how to:
- Receive MPT tokens using `MPTokenAuthorize` transaction
- Send MPT tokens using `Payment` transactions
- Query the Custody system for requests, intents, transactions, and tickers

For more information about MPTokenAuthorize, see the [XRPL Documentation](https://xrpl.org/docs/references/protocol/transactions/types/mptokenauthorize#mptokenauthorize).

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Server Actions

All custody SDK operations are handled through Next.js Server Actions in
`app/_actions/`, one module per resource (`accounts.ts`, `intents.ts`,
`tickers.ts`, `transactions.ts`, `users.ts`, …). There are no `app/api/` routes.

Client components never import the SDK. They call the exported actions directly,
usually through a react-query hook in `app/hooks/`, which keeps credentials and
key material on the server.

## License

Private project for Ripple Custody demonstration.
