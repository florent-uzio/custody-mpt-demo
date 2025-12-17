# Ripple Custody MPT Demo

A beautiful Next.js + React + TypeScript + Tailwind CSS application to showcase Ripple Custody operations with Multi-Purpose Tokens (MPT).

## Features

- **Requests**: Query request state from the Custody system
- **Intents**: View and manage intents (coming soon)
- **Transactions**: Check transaction history (coming soon)
- **Tickers**: View ticker information (coming soon)
- **MPT Authorize**: Authorize MPT tokens (coming soon)
- **MPT Payment**: Send MPT payments (coming soon)

## Why Next.js?

This app uses Next.js instead of a pure client-side framework because:
- The Ripple Custody SDK requires Node.js crypto operations (key generation, signing)
- Server-side API routes handle all custody SDK operations securely
- No browser polyfills needed - everything runs natively on the server
- Better security - private keys never leave the server

## Prerequisites

- Node.js 18+ and npm
- Ripple Custody API credentials

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory with your Ripple Custody credentials:
```env
AUTH_URL=your_auth_url_here
API_URL=your_api_url_here
PRIVATE_KEY=your_private_key_here
PUBLIC_KEY=your_public_key_here
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

## Project Structure

```
app/
  ├── api/
  │   └── requests/
  │       └── state/
  │           └── route.ts      # API route for request state queries
  ├── components/
  │   ├── JsonViewer.tsx        # Component for displaying JSON responses
  │   └── RequestsTab.tsx       # Requests query tab
  ├── layout.tsx                 # Root layout
  ├── page.tsx                  # Main page component
  └── globals.css                # Tailwind CSS styles
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

## API Routes

All custody SDK operations are handled through Next.js API routes:
- `/api/requests/state` - Query request state (POST)

## License

Private project for Ripple Custody demonstration.
