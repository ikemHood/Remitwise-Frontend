# RemitWise Frontend

Frontend application for the RemitWise remittance and financial planning platform.

## Overview

This is a Next.js-based frontend skeleton that provides the UI structure for all RemitWise features. The application is built with:

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

## Features (Placeholders)

The frontend includes placeholder pages and components for:

1. **Dashboard** - Overview of remittances, savings, bills, and insurance
2. **Send Money** - Remittance sending interface with automatic split preview
3. **Smart Money Split** - Configuration for automatic allocation
4. **Savings Goals** - Goal-based savings tracking and management
5. **Bill Payments** - Bill tracking, scheduling, and payment
6. **Micro-Insurance** - Policy management and premium payments
7. **Family Wallets** - Family member management with roles and spending limits

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### End-to-End Testing

To run the Playwright end-to-end tests for authentication and protected routes:

```bash
# Set required test environment variables
export TEST_WALLET_ADDRESS="GDEMOXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
export TEST_SIGNATURE="mock-signature"

# Run tests
npm run test:e2e
```


## Project Structure

```
remitwise-frontend/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx             # Home page
│   ├── globals.css          # Global styles
│   ├── dashboard/           # Dashboard page
│   ├── send/                # Send money page
│   ├── split/               # Money split configuration
│   ├── goals/               # Savings goals
│   ├── bills/               # Bill payments
│   ├── insurance/           # Insurance policies
│   └── family/              # Family wallets
├── components/              # Reusable components (to be added)
├── public/                  # Static assets
└── package.json
```

## Integration Requirements

### Stellar SDK Integration

1. **Wallet Connection**
   - Integrate Freighter wallet or similar
   - Connect to Stellar network (testnet/mainnet)
   - Handle account authentication

2. **Smart Contract Integration**
   - Connect to deployed Soroban contracts
   - Implement contract function calls
   - Handle transaction signing and submission

3. **Anchor Platform Integration**
   - Integrate with anchor platform APIs for fiat on/off-ramps
   - Handle deposit/withdrawal flows
   - Process exchange rate quotes

4. **Transaction Tracking**
   - Display on-chain transaction history
   - Show transaction status and confirmations
   - Implement real-time updates

### Key Integration Points

- **Send Money Page**: Connect to Stellar SDK for transaction creation and signing
- **Split Configuration**: Call `remittance_split` contract to initialize/update split
- **Savings Goals**: Integrate with `savings_goals` contract for goal management
- **Bills**: Connect to `bill_payments` contract for bill tracking
- **Insurance**: Integrate with `insurance` contract for policy management
- **Family Wallets**: Connect to `family_wallet` contract for member management

## Design Notes

- All forms are currently disabled (placeholders)
- UI uses a blue/indigo color scheme
- Responsive design with mobile-first approach
- Components are structured for easy integration

## Future Enhancements

- Real-time transaction updates
- Push notifications for bill reminders
- Charts and graphs for financial insights
- Multi-language support
- Dark mode
- Mobile app (React Native)

## License

MIT

**API Versioning**

- **Approach (decided):** URL prefix versioning using `/api/v{n}/...` (e.g. `/api/v1/...`). This is simple to route, cache, and reason about in the frontend and server layers.
- **Current status:** The existing API surface in this repository is labeled as **v1**. To avoid breaking existing clients, the app rewrites `/api/*` to `/api/v1/*` at the Next.js layer so existing clients can continue using `/api/...` without changes.
- **Routes:** When adding new server routes, prefer placing them under `app/api/v1/` (or `pages/api/v1/` if using pages router) so they are clearly versioned. Optionally duplicate stable v1 routes under the `v1` namespace during a migration window rather than deleting the legacy route immediately.
- **How to introduce v2:** Create a new `app/api/v2/` namespace containing the new behavior. Update platform routes or API gateway rules to expose `/api/v2/...` and leave the rewrite in place so `/api/*` stays mapped to the last published stable version (v1) until you intentionally change it.

**Deprecation Policy**

- When a new major version (e.g. v2) is released, older major versions will be supported for a minimum of **6 months** before scheduled removal. During that window:
   - Maintain security fixes and critical bug fixes for the deprecated major version.
   - Announce deprecation clearly in changelogs and developer docs with migration guides.
   - Provide automated redirects or compatibility layers where feasible.

**OpenAPI / API Documentation**

- This repository contains an OpenAPI descriptor for the current v1 API at `openapi.yaml` (root). The `servers` entry points to the `/api/v1` base path. Update `openapi.yaml` as you add endpoints.

**Non-breaking guarantee**

- To meet the repository's backward-compatibility requirement, we keep `/api/*` behavior unchanged by rewriting it to `/api/v1/*`. This preserves compatibility for existing consumers.

If you want, I can also:
- Move or duplicate any existing API route files into an explicit `app/api/v1/` folder.
- Expand `openapi.yaml` with concrete endpoint definitions from your backend contract or tests.

API Endpoints (v1)

- `POST /api/bills` — Create bill transaction XDR
   - Request headers: `x-user` (caller public key)
   - Body: `{ name, amount, dueDate, recurring, frequencyDays }`
   - Validations: `amount > 0`, `dueDate` valid ISO date, when `recurring === true` then `frequencyDays > 0`.
   - Response: `{ xdr: string }` — unsigned transaction XDR ready for the frontend to sign and submit.

- `POST /api/bills/[id]/pay` — Build pay-bill transaction XDR
   - Request headers: `x-user` (caller public key)
   - Response: `{ xdr: string }`

- `POST /api/bills/[id]/cancel` — Build cancel-bill transaction XDR
   - Request headers: `x-user` (caller public key)
   - Optional owner-only enforcement: set header `x-owner-only: 1` and `x-owner` to require the caller match the owner.
   - Response: `{ xdr: string }`

Notes:
- These endpoints return a transaction XDR composed of `manageData` operations that encode the requested action. The frontend should sign the returned XDR and submit it to Horizon (or via a backend submission endpoint) to complete the operation.
- Server builds transactions using the Horizon URL in `HORIZON_URL` and network passphrase in `NETWORK_PASSPHRASE` (defaults to testnet). Set these environment variables in production to use a different network.

Insurance endpoints (v1)

- `POST /api/insurance` — Create policy transaction XDR
   - Request headers: `x-user` (caller public key)
   - Body: `{ name, coverageType, monthlyPremium, coverageAmount }`
   - Validations: `monthlyPremium > 0`, `coverageAmount > 0`, required `name` and `coverageType`.
   - Response: `{ xdr: string }` — unsigned transaction XDR ready for the frontend to sign and submit.

- `POST /api/insurance/[id]/pay` — Build pay-premium transaction XDR
   - Request headers: `x-user` (caller public key)
   - Response: `{ xdr: string }`

- `POST /api/insurance/[id]/deactivate` — Build deactivate-policy transaction XDR
   - Request headers: `x-user` (caller public key)
   - Optional owner-only enforcement: set header `x-owner-only: 1` and `x-owner` to require the caller match the owner.
   - Response: `{ xdr: string }`

Notes:
- These endpoints return transaction XDRs composed with `manageData` operations to encode policy actions. If you prefer Soroban contract invocations, I can convert the builders to use contract calls.

