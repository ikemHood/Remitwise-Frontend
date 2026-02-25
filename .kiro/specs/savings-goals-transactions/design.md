# Design Document: Savings Goals Transaction Builders

## Overview

This design describes the implementation of transaction builders and API endpoints for savings goals operations in the RemitWise application. The system provides a secure interface for building Stellar blockchain transactions that users can sign and submit through their wallets.

The architecture follows a layered approach:
1. **API Layer**: Next.js API routes that handle HTTP requests, authentication, and validation
2. **Transaction Builder Layer**: Functions that construct Stellar transactions using the Stellar SDK
3. **Smart Contract Layer**: Soroban smart contract that executes the actual savings goal operations

All transactions are built on the server side but signed on the client side, ensuring users maintain full control of their private keys.

## Architecture

### System Components

```
┌─────────────┐
│   Frontend  │
│   (Wallet)  │
└──────┬──────┘
       │ HTTP POST (with session)
       ▼
┌─────────────────────────────────┐
│     API Routes (Next.js)        │
│  - Authentication               │
│  - Input Validation             │
│  - Error Handling               │
└──────┬──────────────────────────┘
       │ Function Call
       ▼
┌─────────────────────────────────┐
│   Transaction Builders          │
│  - Parameter Conversion         │
│  - Transaction Construction     │
│  - XDR Generation               │
└──────┬──────────────────────────┘
       │ Returns XDR
       ▼
┌─────────────────────────────────┐
│   Frontend Signs & Submits      │
│  - User signs with wallet       │
│  - Transaction submitted        │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│   Stellar Network               │
│  - Soroban Smart Contract       │
│  - Executes Goal Operations     │
└─────────────────────────────────┘
```

### Data Flow

1. User initiates an action in the frontend (e.g., create goal)
2. Frontend sends authenticated POST request to API endpoint
3. API route validates session and extracts user's public key
4. API route validates request body parameters
5. Transaction builder constructs Stellar transaction
6. Transaction is serialized to XDR format
7. XDR is returned to frontend
8. User signs transaction with their wallet
9. Frontend submits signed transaction to Stellar network

## Components and Interfaces

### Transaction Builder Functions

Located in `lib/contracts/savings-goals.ts`:

```typescript
// Create a new savings goal
buildCreateGoalTx(
  owner: string,        // Stellar public key
  name: string,         // Goal name (1-100 chars)
  targetAmount: number, // Positive number
  targetDate: string    // ISO 8601 date string
): Promise<BuildTxResult>

// Add funds to a goal
buildAddToGoalTx(
  caller: string,  // Stellar public key
  goalId: string,  // Goal identifier
  amount: number   // Positive number
): Promise<BuildTxResult>

// Withdraw funds from a goal
buildWithdrawFromGoalTx(
  caller: string,  // Stellar public key
  goalId: string,  // Goal identifier
  amount: number   // Positive number
): Promise<BuildTxResult>

// Lock a goal
buildLockGoalTx(
  caller: string,  // Stellar public key
  goalId: string   // Goal identifier
): Promise<BuildTxResult>

// Unlock a goal
buildUnlockGoalTx(
  caller: string,  // Stellar public key
  goalId: string   // Goal identifier
): Promise<BuildTxResult>
```

### API Endpoints

All endpoints require authentication via session cookie/header.

#### POST /api/goals
Create a new savings goal.

**Request Body:**
```json
{
  "name": "Emergency Fund",
  "targetAmount": 5000,
  "targetDate": "2025-12-31T00:00:00Z"
}
```

**Response (200):**
```json
{
  "xdr": "AAAAAgAAAAC..."
}
```

#### POST /api/goals/[id]/add
Add funds to a savings goal.

**Request Body:**
```json
{
  "amount": 100
}
```

**Response (200):**
```json
{
  "xdr": "AAAAAgAAAAC..."
}
```

#### POST /api/goals/[id]/withdraw
Withdraw funds from a savings goal.

**Request Body:**
```json
{
  "amount": 50
}
```

**Response (200):**
```json
{
  "xdr": "AAAAAgAAAAC..."
}
```

#### POST /api/goals/[id]/lock
Lock a savings goal.

**Request Body:** None

**Response (200):**
```json
{
  "xdr": "AAAAAgAAAAC..."
}
```

#### POST /api/goals/[id]/unlock
Unlock a savings goal.

**Request Body:** None

**Response (200):**
```json
{
  "xdr": "AAAAAgAAAAC..."
}
```

### Validation Functions

Located in `lib/validation/savings-goals.ts`:

```typescript
validateAmount(amount: number): ValidationResult
validateFutureDate(dateString: string): ValidationResult
validateGoalId(goalId: string): ValidationResult
validateGoalName(name: string): ValidationResult
validatePublicKey(publicKey: string): ValidationResult
```

Each returns:
```typescript
{
  isValid: boolean;
  error?: string;
}
```

## Data Models

### BuildTxResult
```typescript
interface BuildTxResult {
  xdr: string;  // Base64-encoded transaction XDR
}
```

### ApiSuccessResponse
```typescript
interface ApiSuccessResponse {
  xdr: string;
  simulation?: {
    success: boolean;
    result?: any;
  };
}
```

### ApiErrorResponse
```typescript
interface ApiErrorResponse {
  error: string;
  details?: string;
}
```

### Session
```typescript
interface Session {
  publicKey: string;  // User's Stellar public key
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After reviewing all identified properties, several can be consolidated:

- Properties 1.5, 2.4, 3.4, 4.3, 5.3 all test XDR format output → Combine into Property 1
- Properties 1.3, 2.2, 3.2 all test amount validation → Combine into Property 2
- Properties 2.3, 3.3, 4.2, 5.2 all test goal ID validation → Combine into Property 3
- Properties 6.1, 6.2 both test authentication failures → Combine into Property 4
- Properties 7.1, 7.2, 7.3 all test validation error responses → Combine into Property 5

### Core Properties

Property 1: Transaction builders return valid XDR
*For any* valid input parameters to any transaction builder function, the function should return a BuildTxResult containing a non-empty XDR string.
**Validates: Requirements 1.5, 2.4, 3.4, 4.3, 5.3**

Property 2: Amount validation rejects non-positive values
*For any* amount that is zero, negative, NaN, or infinite, the validation function should return isValid: false with an appropriate error message.
**Validates: Requirements 1.3, 2.2, 3.2**

Property 3: Goal ID validation rejects empty strings
*For any* string that is empty or contains only whitespace, the goal ID validation should return isValid: false.
**Validates: Requirements 2.3, 3.3, 4.2, 5.2**

Property 4: Goal name validation enforces length constraints
*For any* string with length less than 1 or greater than 100 characters, the goal name validation should return isValid: false.
**Validates: Requirements 1.2**

Property 5: Future date validation rejects past dates
*For any* date string representing a time in the past or present, the date validation should return isValid: false.
**Validates: Requirements 1.4**

Property 6: Unauthenticated requests return 401
*For any* API endpoint, when called without a valid session, the response should have status 401 and include an authentication error message.
**Validates: Requirements 6.1, 6.2**

Property 7: Authenticated requests extract public key
*For any* API endpoint, when called with a valid session containing a public key, the system should successfully extract and use that public key for transaction building.
**Validates: Requirements 6.3, 6.4**

Property 8: Invalid input returns 400 with error details
*For any* API endpoint, when called with invalid input (missing fields, invalid JSON, or failing validation), the response should have status 400 and include a descriptive error message.
**Validates: Requirements 7.1, 7.2, 7.3, 7.4**

Property 9: Error responses have consistent structure
*For any* error response from any API endpoint, the response body should contain an "error" field with a string message.
**Validates: Requirements 8.2**

Property 10: Success responses contain XDR
*For any* successful API response, the response body should contain an "xdr" field with a non-empty string value.
**Validates: Requirements 8.3**

## Error Handling

### Error Types

1. **Authentication Errors (401)**
   - Missing session
   - Invalid session format
   - Session missing public key

2. **Validation Errors (400)**
   - Missing required fields
   - Invalid field values
   - Invalid JSON body
   - Invalid date format
   - Invalid amount (non-positive)
   - Invalid goal name (length constraints)
   - Invalid goal ID (empty)

3. **Internal Errors (500)**
   - Unexpected exceptions
   - Network failures
   - Contract configuration errors

### Error Response Format

All errors follow a consistent structure:

```typescript
{
  error: string;      // Human-readable error message
  details?: string;   // Optional additional context
}
```

### Error Handling Strategy

1. **Input Validation**: Validate all inputs before attempting to build transactions
2. **Early Returns**: Return error responses immediately upon detecting issues
3. **Try-Catch Blocks**: Wrap transaction building in try-catch to handle unexpected errors
4. **Descriptive Messages**: Provide clear, actionable error messages
5. **No Sensitive Data**: Never expose internal system details or stack traces

## Testing Strategy

### Unit Testing

Unit tests will verify:
- Individual validation functions work correctly
- Error response helpers create proper response objects
- Session extraction functions handle various input formats
- Each transaction builder function constructs valid operations

Example unit tests:
- `validateAmount` rejects zero, negative, NaN, and infinity
- `validateFutureDate` rejects past dates and accepts future dates
- `validateGoalName` enforces 1-100 character limit
- `validateGoalId` rejects empty and whitespace-only strings
- `createValidationError` returns proper 400 response structure
- `createAuthenticationError` returns proper 401 response structure

### Property-Based Testing

Property-based tests will use **fast-check** (JavaScript/TypeScript PBT library) with a minimum of 100 iterations per property.

Each property test will:
1. Generate random valid/invalid inputs
2. Execute the function under test
3. Verify the expected property holds

Property tests to implement:
- **Property 1**: Generate random valid parameters, verify XDR output
- **Property 2**: Generate random non-positive numbers, verify rejection
- **Property 3**: Generate random empty/whitespace strings, verify rejection
- **Property 4**: Generate random strings of various lengths, verify length constraints
- **Property 5**: Generate random past dates, verify rejection
- **Property 6**: Test all endpoints without sessions, verify 401 responses
- **Property 7**: Test all endpoints with valid sessions, verify public key usage
- **Property 8**: Generate various invalid inputs, verify 400 responses
- **Property 9**: Generate various error conditions, verify error structure
- **Property 10**: Generate valid inputs, verify success response structure

### Integration Testing

Integration tests will verify:
- End-to-end API request/response flow
- Authentication middleware integration
- Validation and transaction building pipeline
- Error handling across the full stack

Example integration tests:
- POST /api/goals with valid data returns XDR
- POST /api/goals without session returns 401
- POST /api/goals with invalid amount returns 400
- POST /api/goals/[id]/add with valid data returns XDR
- POST /api/goals/[id]/lock without session returns 401

### Test Organization

```
tests/
  unit/
    validation/
      savings-goals.test.ts
    contracts/
      savings-goals.test.ts
    errors/
      api-errors.test.ts
  property/
    validation-properties.test.ts
    api-properties.test.ts
    transaction-properties.test.ts
  integration/
    api/
      goals.test.ts
      goals-operations.test.ts
```

## Security Considerations

1. **Authentication Required**: All endpoints require valid session authentication
2. **Public Key Extraction**: User's public key is extracted from authenticated session, not from request body
3. **Input Validation**: All inputs are validated before processing
4. **No Private Keys**: System never handles or stores private keys
5. **Client-Side Signing**: Transactions are signed on the client side only
6. **Rate Limiting**: Consider implementing rate limiting on API endpoints (future enhancement)
7. **CORS Configuration**: Ensure proper CORS settings for production

## Configuration

### Environment Variables

Required environment variables:

```
NEXT_PUBLIC_SAVINGS_GOALS_CONTRACT_ID=<contract_id>
NEXT_PUBLIC_STELLAR_NETWORK=testnet|mainnet
NEXT_PUBLIC_STELLAR_RPC_URL=<rpc_url>
```

### Network Configuration

The system supports both testnet and mainnet:
- **Testnet**: For development and testing
- **Mainnet**: For production use

Network passphrase is automatically selected based on `NEXT_PUBLIC_STELLAR_NETWORK`.

## Performance Considerations

1. **Transaction Building**: Transaction building is fast (< 100ms typically)
2. **Account Loading**: Account loading from RPC may add latency; consider caching strategies
3. **Validation**: Validation is synchronous and fast
4. **No Database Queries**: These endpoints don't query databases, only build transactions

## Future Enhancements

1. **Transaction Simulation**: Add optional simulation before returning XDR
2. **Batch Operations**: Support building multiple operations in a single transaction
3. **Fee Estimation**: Provide fee estimates with transaction XDR
4. **Caching**: Cache account data to reduce RPC calls
5. **Rate Limiting**: Implement rate limiting per user
6. **Audit Logging**: Log all transaction building requests for audit purposes
