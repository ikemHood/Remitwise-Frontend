# Emergency Transfer Backend - Design Document

## Overview

The emergency transfer backend feature provides a specialized API endpoint for building high-priority remittance transactions on the Stellar network. This feature enables users to quickly send money in urgent situations with potential fee reductions, special transaction marking, and automatic notifications to family members. The system builds upon existing remittance infrastructure while adding emergency-specific handling for analytics, notifications, and policy enforcement.

## Architecture

### High-Level Architecture

The emergency transfer feature integrates into the existing RemitWise backend architecture with the following components:

```
┌─────────────┐
│   Client    │
│ Application │
└──────┬──────┘
       │ POST /api/remittance/emergency/build
       │ (authenticated)
       ▼
┌─────────────────────────────────────┐
│     API Gateway / Auth Middleware    │
└──────────────┬──────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Emergency Transfer Controller       │
│  - Validate request                  │
│  - Check emergency limits            │
│  - Build Stellar transaction         │
└──────────┬───────────────────────────┘
           │
           ├─────────────┐
           │             │
           ▼             ▼
┌──────────────┐  ┌─────────────────┐
│  Transaction │  │  Event Storage  │
│   Builder    │  │    Service      │
│  (Stellar)   │  └────────┬────────┘
└──────┬───────┘           │
       │                   ▼
       │            ┌──────────────────┐
       │            │  Notification    │
       │            │    Service       │
       │            └──────────────────┘
       │
       ▼
┌─────────────┐
│  Return XDR │
│  to Client  │
└─────────────┘
```

### Component Responsibilities

1. **Emergency Transfer Controller**: Handles HTTP requests, validates input, enforces business rules
2. **Transaction Builder**: Creates Stellar transaction XDR with emergency-specific parameters
3. **Event Storage Service**: Persists emergency transfer events for analytics and audit
4. **Notification Service**: Sends alerts to designated family members
5. **Policy Enforcement**: Validates transfer amounts against configured limits

## Components and Interfaces

### API Endpoint

**Endpoint**: `POST /api/remittance/emergency/build`

**Authentication**: Required (JWT token, session cookie, or API key)

**Request Body**:
```typescript
interface EmergencyTransferRequest {
  amount: string;              // Amount in base units (e.g., stroops for XLM)
  recipientAddress: string;    // Stellar public key (G...)
  memo?: string;               // Optional custom memo (max 28 bytes)
  assetCode?: string;          // Optional asset code (default: XLM)
  assetIssuer?: string;        // Required if assetCode is not XLM
}
```

**Response**:
```typescript
interface EmergencyTransferResponse {
  success: boolean;
  xdr: string;                 // Unsigned transaction XDR
  transactionId: string;       // Internal tracking ID
  fee: string;                 // Calculated fee
  emergencyFeeApplied: boolean;
  estimatedTime: string;       // ISO 8601 timestamp
  limits: {
    maxAmount: string;
    remainingToday: string;
  };
}
```

**Error Response**:
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;              // ERROR_CODE constant
    message: string;           // Human-readable message
    details?: any;             // Additional context
  };
}
```

### Transaction Builder Service

```typescript
interface ITransactionBuilder {
  /**
   * Builds an emergency transfer transaction
   */
  buildEmergencyTransfer(params: {
    sourceAccount: string;
    destinationAccount: string;
    amount: string;
    assetCode: string;
    assetIssuer?: string;
    memo?: string;
    emergency: boolean;
  }): Promise<string>; // Returns XDR
  
  /**
   * Calculates fee for emergency transfer
   */
  calculateEmergencyFee(amount: string): Promise<string>;
}
```

### Event Storage Service

```typescript
interface IEventStorageService {
  /**
   * Stores emergency transfer event
   */
  storeEmergencyEvent(event: EmergencyTransferEvent): Promise<void>;
  
  /**
   * Retrieves emergency events for analytics
   */
  getEmergencyEvents(filters: EventFilters): Promise<EmergencyTransferEvent[]>;
}

interface EmergencyTransferEvent {
  id: string;
  userId: string;
  amount: string;
  assetCode: string;
  recipientAddress: string;
  transactionId: string;
  timestamp: Date;
  status: 'pending' | 'signed' | 'submitted' | 'failed';
  metadata?: Record<string, any>;
}
```

### Notification Service

```typescript
interface INotificationService {
  /**
   * Sends emergency transfer notification to family members
   */
  notifyFamilyMembers(params: {
    userId: string;
    amount: string;
    assetCode: string;
    timestamp: Date;
  }): Promise<void>;
  
  /**
   * Gets list of notification recipients for a user
   */
  getNotificationRecipients(userId: string): Promise<string[]>;
}
```

### Policy Service

```typescript
interface IPolicyService {
  /**
   * Validates emergency transfer against limits
   */
  validateEmergencyTransfer(params: {
    userId: string;
    amount: string;
    assetCode: string;
  }): Promise<ValidationResult>;
  
  /**
   * Gets emergency transfer limits for user
   */
  getEmergencyLimits(userId: string): Promise<EmergencyLimits>;
}

interface EmergencyLimits {
  maxAmountPerTransfer: string;
  maxDailyAmount: string;
  maxMonthlyCount: number;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  remainingLimits: {
    dailyAmount: string;
    monthlyCount: number;
  };
}
```

## Data Models

### Emergency Transfer Event (Database Schema)

```typescript
interface EmergencyTransferEventModel {
  id: string;                    // UUID primary key
  user_id: string;               // Foreign key to users table
  recipient_address: string;     // Stellar public key
  amount: string;                // Amount in base units
  asset_code: string;            // Asset code (XLM, USDC, etc.)
  asset_issuer: string | null;   // Asset issuer (null for XLM)
  transaction_id: string;        // Internal tracking ID
  stellar_tx_hash: string | null;// Stellar transaction hash (after submission)
  memo: string | null;           // Transaction memo
  fee: string;                   // Fee charged
  emergency_fee_applied: boolean;// Whether emergency fee was used
  status: string;                // pending, signed, submitted, failed
  created_at: Date;              // Event creation timestamp
  updated_at: Date;              // Last update timestamp
  metadata: JSON | null;         // Additional data
}
```

### Emergency Transfer Configuration

```typescript
interface EmergencyTransferConfig {
  enabled: boolean;
  max_amount_per_transfer: string;
  max_daily_amount: string;
  max_monthly_count: number;
  emergency_fee_percentage: number;  // e.g., 0.5 for 0.5%
  standard_fee_percentage: number;   // e.g., 1.0 for 1.0%
  memo_prefix: string;               // e.g., "EMERGENCY:"
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework

1.1 WHEN a user submits a POST request to the emergency transfer endpoint with valid amount and recipient address, THEN the Remittance System SHALL generate a transaction XDR with an emergency flag set to true
  Thoughts: This is about the core functionality - for any valid input, we should get back a valid XDR. We can generate random valid amounts and addresses, call the endpoint, and verify the response contains a valid XDR string and has the emergency flag.
  Testable: yes - property

1.2 WHEN building an emergency transaction, THEN the Remittance System SHALL apply the same validation rules as normal transfers for amount and recipient address
  Thoughts: This is ensuring validation consistency. We can generate random inputs (both valid and invalid) and ensure that emergency transfers reject the same invalid inputs that normal transfers reject.
  Testable: yes - property

1.3 WHEN an emergency transaction is built, THEN the Remittance System SHALL include an optional memo field that identifies the transaction as emergency type
  Thoughts: This is about memo handling. For any emergency transaction, if we decode the XDR, it should contain a memo that identifies it as emergency.
  Testable: yes - property

1.4 WHEN the emergency transaction XDR is generated, THEN the Remittance System SHALL return it to the client for wallet signing and submission
  Thoughts: This is testing that the API returns the XDR in the response. For any successful request, the response should contain a valid XDR string.
  Testable: yes - property

1.5 WHEN a user attempts to build an emergency transfer without authentication, THEN the Remittance System SHALL reject the request with an unauthorized error
  Thoughts: This is testing authentication. For any request without valid auth credentials, the system should return 401.
  Testable: yes - example

2.1 WHEN an emergency transfer is successfully built, THEN the Remittance System SHALL store an emergency transfer event record in the database
  Thoughts: For any successful emergency transfer build, there should be a corresponding record in the database with matching details.
  Testable: yes - property

2.2 WHEN storing the emergency transfer event, THEN the Remittance System SHALL capture the user identifier, amount, recipient address, timestamp, and transaction identifier
  Thoughts: For any stored event, all required fields should be present and non-null.
  Testable: yes - property

2.3 WHEN an emergency transfer event is stored, THEN the Analytics Service SHALL be able to query and aggregate emergency transfer statistics
  Thoughts: This is about query capability, not a functional requirement we can test at the unit level.
  Testable: no

2.4 WHEN an emergency transfer is initiated, THEN the Remittance System SHALL maintain data integrity while recording the event
  Thoughts: This is a general goal about data integrity, too vague to test specifically.
  Testable: no

3.1 WHEN an emergency transfer event is stored in the database, THEN the Notification Service SHALL trigger notifications to designated family members
  Thoughts: For any emergency event stored, if the user has family members configured, notifications should be sent.
  Testable: yes - property

3.2 WHEN sending emergency transfer notifications, THEN the Notification Service SHALL include the transfer amount, timestamp, and sender information
  Thoughts: For any notification sent, it should contain all required information fields.
  Testable: yes - property

3.3 WHEN a user has no designated family members, THEN the Remittance System SHALL process the emergency transfer without sending notifications
  Thoughts: This is an edge case - when family members list is empty, no notifications should be sent but transfer should succeed.
  Testable: edge-case

4.1 WHEN emergency transfer functionality is deployed, THEN the Remittance System SHALL enforce a maximum amount limit for emergency transfers
  Thoughts: For any amount exceeding the configured limit, the request should be rejected.
  Testable: yes - property

4.2 WHEN a user attempts an emergency transfer exceeding the maximum limit, THEN the Remittance System SHALL reject the request with a clear error message indicating the limit
  Thoughts: This is testing the specific error case when limit is exceeded.
  Testable: yes - example

4.3 WHEN emergency transfer limits are defined, THEN the system documentation SHALL specify the maximum amount, frequency limits, and eligibility criteria
  Thoughts: This is about documentation, not testable code behavior.
  Testable: no

4.4 WHEN emergency transfer policies are updated, THEN the Remittance System SHALL apply the new limits to all subsequent requests
  Thoughts: For any configuration change, subsequent requests should use the new limits. This is about configuration reload behavior.
  Testable: yes - property

5.1 WHERE the emergency transfer feature is enabled, THEN the Remittance System SHALL apply a reduced fee structure compared to normal transfers
  Thoughts: For any emergency transfer, the calculated fee should be less than or equal to the standard fee for the same amount.
  Testable: yes - property

5.2 WHEN calculating fees for an emergency transfer, THEN the Remittance System SHALL use the emergency fee configuration if available
  Thoughts: When emergency fee config exists, it should be used. This is about configuration precedence.
  Testable: yes - property

5.3 WHEN no emergency fee configuration exists, THEN the Remittance System SHALL apply the standard fee structure
  Thoughts: This is a fallback behavior - when emergency config is missing, use standard fees.
  Testable: edge-case

5.4 WHEN the emergency transaction is built, THEN the Remittance System SHALL include the calculated fee in the transaction details
  Thoughts: For any transaction response, the fee field should be present and match the calculated fee.
  Testable: yes - property

6.1 WHEN the emergency transfer API is deployed, THEN the API documentation SHALL describe the endpoint path, HTTP method, authentication requirements, and request body schema
  Thoughts: This is about documentation completeness, not testable code behavior.
  Testable: no

6.2 WHEN documenting the emergency transfer endpoint, THEN the documentation SHALL include example requests and responses with all required and optional fields
  Thoughts: This is about documentation quality, not testable code behavior.
  Testable: no

6.3 WHEN documenting error scenarios, THEN the documentation SHALL list all possible error codes and their meanings
  Thoughts: This is about documentation completeness, not testable code behavior.
  Testable: no

6.4 WHEN the emergency transfer feature has business rules or limits, THEN the documentation SHALL clearly explain these constraints
  Thoughts: This is about documentation clarity, not testable code behavior.
  Testable: no

### Property Reflection

After reviewing all testable properties, I've identified the following consolidations:

- Properties 1.1 and 1.4 both test that valid XDR is returned - these can be combined
- Properties 2.1 and 2.2 both test event storage - can be combined into one comprehensive property
- Properties 5.2 and 5.4 both test fee calculation and inclusion - can be combined

The edge cases (3.3, 5.3) will be handled by the property test generators to ensure comprehensive coverage.

### Property 1: Valid emergency transfer returns XDR

*For any* valid emergency transfer request (with valid amount, recipient address, and authentication), the system should return a response containing a valid Stellar transaction XDR string with emergency flag set to true.

**Validates: Requirements 1.1, 1.4**

### Property 2: Validation consistency with normal transfers

*For any* input (valid or invalid), if a normal transfer would reject the input due to validation errors, then an emergency transfer should also reject that same input with the same validation error.

**Validates: Requirements 1.2**

### Property 3: Emergency memo identification

*For any* successfully built emergency transaction, when the returned XDR is decoded, it should contain a memo field that identifies the transaction as an emergency type.

**Validates: Requirements 1.3**

### Property 4: Event storage completeness

*For any* successfully built emergency transfer, there should exist a corresponding database record containing all required fields: user_id, amount, recipient_address, transaction_id, and timestamp, with all values matching the request parameters.

**Validates: Requirements 2.1, 2.2**

### Property 5: Family notification triggering

*For any* emergency transfer event stored in the database, if the user has one or more designated family members, then a notification should be sent to each family member containing the transfer amount, timestamp, and sender information.

**Validates: Requirements 3.1, 3.2**

### Property 6: Amount limit enforcement

*For any* emergency transfer request where the amount exceeds the configured maximum limit, the system should reject the request and return an error response indicating the limit was exceeded.

**Validates: Requirements 4.1**

### Property 7: Dynamic limit updates

*For any* emergency transfer configuration change, all subsequent emergency transfer requests should be validated against the new limits, not the old limits.

**Validates: Requirements 4.4**

### Property 8: Emergency fee reduction

*For any* emergency transfer with a valid amount, the calculated fee should be less than or equal to the fee that would be calculated for a normal transfer of the same amount, and the fee should be included in the response.

**Validates: Requirements 5.1, 5.2, 5.4**

## Error Handling

### Error Codes

```typescript
enum EmergencyTransferErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // Validation errors
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_RECIPIENT = 'INVALID_RECIPIENT',
  INVALID_ASSET = 'INVALID_ASSET',
  INVALID_MEMO = 'INVALID_MEMO',
  
  // Limit errors
  AMOUNT_EXCEEDS_LIMIT = 'AMOUNT_EXCEEDS_LIMIT',
  DAILY_LIMIT_EXCEEDED = 'DAILY_LIMIT_EXCEEDED',
  MONTHLY_COUNT_EXCEEDED = 'MONTHLY_COUNT_EXCEEDED',
  
  // System errors
  TRANSACTION_BUILD_FAILED = 'TRANSACTION_BUILD_FAILED',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NOTIFICATION_FAILED = 'NOTIFICATION_FAILED',
  
  // Configuration errors
  FEATURE_DISABLED = 'FEATURE_DISABLED',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
}
```

### Error Handling Strategy

1. **Input Validation**: Validate all inputs before processing, return 400 Bad Request with specific error codes
2. **Authentication**: Check authentication before any processing, return 401 Unauthorized
3. **Business Rule Violations**: Check limits and policies, return 422 Unprocessable Entity with limit details
4. **Transaction Building Failures**: Catch Stellar SDK errors, return 500 Internal Server Error with safe error message
5. **Database Failures**: Log errors, attempt to continue with transaction building, return warning in response
6. **Notification Failures**: Log errors but don't fail the transaction, return success with notification warning

### Retry and Idempotency

- Transaction building is idempotent - same inputs produce same XDR
- Event storage should use unique transaction IDs to prevent duplicates
- Notifications should be queued for retry if initial send fails
- Client should implement retry logic with exponential backoff for 5xx errors

## Testing Strategy

### Unit Testing

The emergency transfer feature will use unit tests to verify:

1. **Request validation**: Test that invalid amounts, addresses, and memos are rejected
2. **Authentication middleware**: Test that unauthenticated requests are blocked
3. **Limit enforcement**: Test specific limit scenarios (at limit, over limit, under limit)
4. **Error responses**: Test that error codes and messages are correct for each error scenario
5. **Configuration loading**: Test that emergency fee configuration is loaded correctly

### Property-Based Testing

The emergency transfer feature will use property-based testing to verify universal correctness properties. We will use **fast-check** (for TypeScript/JavaScript) as the property-based testing library.

**Configuration**: Each property-based test will run a minimum of 100 iterations to ensure comprehensive coverage of the input space.

**Tagging**: Each property-based test will include a comment tag in the format: `**Feature: emergency-transfer-backend, Property {number}: {property_text}**`

**Implementation**: Each correctness property listed in the Correctness Properties section will be implemented as a single property-based test.

**Test Generators**: Custom generators will be created for:
- Valid Stellar addresses (G... format, 56 characters)
- Valid amounts (positive numbers within reasonable ranges)
- Valid asset codes (1-12 alphanumeric characters)
- Valid memos (up to 28 bytes)
- Authentication tokens (valid and invalid)

### Integration Testing

Integration tests will verify:

1. **End-to-end flow**: Request → validation → transaction building → event storage → notification
2. **Database persistence**: Verify events are correctly stored and retrievable
3. **Stellar SDK integration**: Verify XDR can be decoded and contains expected operations
4. **Notification service integration**: Verify notifications are sent to correct recipients

### Performance Testing

Performance tests will verify:

1. **Response time**: Emergency transfer endpoint responds within 500ms for 95th percentile
2. **Concurrent requests**: System handles 100 concurrent emergency transfer requests
3. **Database performance**: Event storage completes within 100ms

## Implementation Notes

### Stellar Transaction Building

The emergency transaction will be built using the Stellar SDK with the following structure:

```typescript
import { 
  Server, 
  TransactionBuilder, 
  Networks, 
  Operation, 
  Asset, 
  Memo 
} from '@stellar/stellar-sdk';

async function buildEmergencyTransaction(params) {
  const server = new Server(HORIZON_URL);
  const sourceAccount = await server.loadAccount(params.sourceAddress);
  
  const transaction = new TransactionBuilder(sourceAccount, {
    fee: await calculateEmergencyFee(params.amount),
    networkPassphrase: Networks.PUBLIC, // or TESTNET
  })
    .addOperation(Operation.payment({
      destination: params.recipientAddress,
      asset: params.asset || Asset.native(),
      amount: params.amount,
    }))
    .addMemo(Memo.text(`EMERGENCY:${params.memo || ''}`))
    .setTimeout(300) // 5 minutes
    .build();
  
  return transaction.toXDR();
}
```

### Database Schema Migration

```sql
CREATE TABLE emergency_transfer_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  recipient_address VARCHAR(56) NOT NULL,
  amount VARCHAR(255) NOT NULL,
  asset_code VARCHAR(12) NOT NULL,
  asset_issuer VARCHAR(56),
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  stellar_tx_hash VARCHAR(64),
  memo TEXT,
  fee VARCHAR(255) NOT NULL,
  emergency_fee_applied BOOLEAN NOT NULL DEFAULT true,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  metadata JSONB,
  
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_status (status)
);

CREATE TABLE emergency_transfer_config (
  id SERIAL PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT true,
  max_amount_per_transfer VARCHAR(255) NOT NULL,
  max_daily_amount VARCHAR(255) NOT NULL,
  max_monthly_count INTEGER NOT NULL,
  emergency_fee_percentage DECIMAL(5,2) NOT NULL,
  standard_fee_percentage DECIMAL(5,2) NOT NULL,
  memo_prefix VARCHAR(50) NOT NULL DEFAULT 'EMERGENCY:',
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Configuration Management

Emergency transfer configuration should be:
- Stored in database for runtime updates
- Cached in memory with TTL of 5 minutes
- Reloadable without service restart
- Validated on update to prevent invalid configurations

### Security Considerations

1. **Rate Limiting**: Implement rate limiting (e.g., 10 requests per minute per user) to prevent abuse
2. **Amount Validation**: Validate amounts are positive and within reasonable bounds
3. **Address Validation**: Verify recipient addresses are valid Stellar public keys
4. **Authentication**: Use secure token validation with expiration
5. **Audit Logging**: Log all emergency transfer attempts for security monitoring
6. **PII Protection**: Ensure sensitive data is encrypted at rest and in transit

### Monitoring and Observability

1. **Metrics**: Track emergency transfer count, success rate, average amount, fee revenue
2. **Alerts**: Alert on high failure rates, unusual amounts, or system errors
3. **Logging**: Log all requests with correlation IDs for tracing
4. **Dashboards**: Create dashboards for emergency transfer analytics and monitoring
