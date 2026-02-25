# API Routes Documentation

## Authentication

All API routes use cookie-based session authentication. The session cookie is set after successful login and verified on protected routes.

### Auth Middleware

The `withAuth` helper in `/lib/auth.ts` protects routes by:
1. Checking for a valid session cookie
2. Returning 401 if no session exists
3. Passing the session to the route handler

Usage:
```typescript
import { withAuth } from '@/lib/auth';

async function handler(request: NextRequest, session: string) {
  // Your logic here - session is guaranteed to exist
  return NextResponse.json({ data: 'protected' });
}

export const GET = withAuth(handler);
```

## Route Classification

### Public Routes (No Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/nonce` | Generate nonce for wallet signature |
| POST | `/api/auth/login` | Login with signed nonce |
| POST | `/api/auth/logout` | Clear session |

### Protected Routes (Authentication Required)

All protected routes return `401 Unauthorized` if no valid session exists.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile |
| GET | `/api/split` | Get current split configuration |
| GET | `/api/split/calculate?amount=100` | Calculate split amounts for given amount |
| POST | `/api/split` | Configure money split |
| GET | `/api/goals` | List savings goals |
| POST | `/api/goals` | Create savings goal |
| GET | `/api/bills` | List bills |
| POST | `/api/bills` | Create/pay bill |
| GET | `/api/insurance` | List insurance policies |
| POST | `/api/insurance` | Create insurance policy |
| GET | `/api/family` | List family members |
| POST | `/api/family` | Add family member |
| POST | `/api/send` | Send money transaction |
| POST | `/api/anchor/deposit` | Start anchor deposit flow (fiat -> USDC) |
| POST | `/api/anchor/withdraw` | Start anchor withdrawal flow (USDC -> fiat) |

### Admin/Internal Routes

All `/api/admin/*` routes require admin authentication and return `401` when unauthorized.

Authentication:
- Header: `X-Admin-Key: <ADMIN_SECRET>`
- Cookie: `admin_key=<ADMIN_SECRET>` (or `admin_secret=<ADMIN_SECRET>`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/cache/clear` | Clear in-memory caches |
| GET | `/api/admin/users?limit=20` | List recent users (support/ops) |
| GET | `/api/admin/audit?limit=50` | List latest audit events |

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Authentication Flow

1. **Request Nonce**: `POST /api/auth/nonce` with `{ publicKey }`
2. **Sign Nonce**: User signs nonce with wallet
3. **Login**: `POST /api/auth/login` with `{ publicKey, signature }`
4. **Session Cookie**: Server sets httpOnly session cookie
5. **Protected Requests**: Cookie automatically sent with requests
6. **Logout**: `POST /api/auth/logout` clears session

## Implementation Notes

- Session stored as httpOnly cookie for security
- Session value currently stores publicKey (TODO: use proper session ID)
- All protected routes use `withAuth` wrapper
- Signature verification not yet implemented (TODO)
- Session storage in database not yet implemented (TODO)

## Contract Integration

### Environment Variables

The following environment variables must be configured:

- `STELLAR_NETWORK`: Network to use (`testnet` or `mainnet`, defaults to `testnet`)
- `REMITTANCE_SPLIT_CONTRACT_ID`: Deployed remittance split contract address
- `ANCHOR_API_BASE_URL`: Base URL for anchor API
- `ANCHOR_API_KEY`: Optional bearer token for anchor API
- `ANCHOR_DEPOSIT_PATH`: Deposit interactive endpoint path
- `ANCHOR_WITHDRAW_PATH`: Withdraw interactive endpoint path
- `ADMIN_SECRET`: Shared secret for `/api/admin/*` authorization
- `SHUTDOWN_TIMEOUT_MS`: Graceful shutdown timeout for in-process jobs

Anchor routes return `501 Not Implemented` when `ANCHOR_API_BASE_URL` is not configured.

**Important**: The remittance_split contract must be deployed on the specified network before the split API endpoints will work.

### Split API Responses

**GET /api/split**
```json
{
  "percentages": {
    "savings": 30,
    "bills": 25,
    "insurance": 10,
    "family": 20
  }
}
```

**GET /api/split/calculate?amount=1000**
```json
{
  "amounts": {
    "savings": "300",
    "bills": "250",
    "insurance": "100",
    "family": "200",
    "remainder": "150"
  }
}
```

### Error Handling

- `404 Not Found`: Contract not deployed or split not configured
- `500 Internal Server Error`: RPC connection error or contract read failure
- `400 Bad Request`: Invalid parameters (calculate endpoint)
