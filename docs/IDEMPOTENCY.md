# Idempotency Keys

## Overview

Idempotency keys prevent duplicate operations from being executed when a client retries a request (e.g., due to network issues, double-clicks, or timeouts). This is critical for write operations like creating remittances or allocating funds.

**Status**: Implemented and ready for production use (with Redis migration recommended for multi-instance deployments).

## How It Works

1. Client generates a unique idempotency key (e.g., UUID)
2. Client sends the key in the `Idempotency-Key` header with the request
3. Server checks if the key has been seen before:
   - **First time**: Process the request normally and cache the response
   - **Duplicate (same body)**: Return the cached response immediately
   - **Conflict (different body)**: Return 409 Conflict error
4. Cached responses expire after 24 hours (configurable)

## Supported Endpoints

The following endpoints support idempotency keys:

- `POST /api/remittance/build` - Build a remittance transaction
- `POST /api/remittance/allocate` - Allocate funds for a transaction

## Usage

### Client-Side Example

```typescript
import { v4 as uuidv4 } from 'uuid';

async function createRemittance(data: RemittanceData) {
  const idempotencyKey = uuidv4();
  
  const response = await fetch('/api/remittance/build', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(data),
  });
  
  return response.json();
}
```

### Retry Logic Example

```typescript
async function createRemittanceWithRetry(data: RemittanceData) {
  const idempotencyKey = uuidv4();
  const maxRetries = 3;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch('/api/remittance/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey, // Same key for all retries
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        return response.json();
      }
      
      if (response.status === 409) {
        throw new Error('Idempotency key conflict - request body changed');
      }
      
      // Retry on 5xx errors
      if (response.status >= 500 && attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
      
      throw new Error(`Request failed: ${response.status}`);
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
    }
  }
}
```

## API Specification

### Request Header

```
Idempotency-Key: <unique-string>
```

- **Format**: Any string (recommended: UUID v4)
- **Length**: 1-255 characters
- **Required**: No (but recommended for write operations)

### Response Headers

When a cached response is returned, the server includes:

```
X-Idempotent-Replay: true
```

This indicates the response was served from cache, not freshly processed.

### Response Codes

| Status | Description |
|--------|-------------|
| 200 | Success (new or cached response) |
| 400 | Bad Request (invalid body) |
| 409 | Conflict (same key, different body) |
| 500 | Internal Server Error |

### Error Response (409 Conflict)

```json
{
  "error": "Idempotency Key Conflict",
  "message": "The provided idempotency key was already used with a different request body."
}
```

## Implementation Details

### Storage

Currently uses in-memory storage with automatic cleanup. For production:

- **Recommended**: Redis with TTL support
- **Alternative**: Database table with indexed key column and expiration timestamp

### TTL (Time To Live)

- **Default**: 24 hours
- **Configurable**: Modify `DEFAULT_TTL_MS` in `lib/idempotency/store.ts`

### Request Hashing

Request bodies are hashed using SHA-256 to detect changes. The hash includes:
- All request body fields
- Field order (JSON stringified)

### Cleanup

Expired records are automatically cleaned up every hour to prevent memory leaks.

## Best Practices

### Client-Side

1. **Generate unique keys**: Use UUID v4 or similar
2. **Reuse keys on retry**: Use the same key for all retry attempts of the same operation
3. **Don't reuse keys**: Never reuse a key for different operations
4. **Store keys**: Consider storing keys locally to handle page refreshes

### Server-Side

1. **Only cache successful responses**: 2xx status codes only
2. **Set appropriate TTL**: Balance between safety and storage
3. **Monitor cache size**: Track metrics for capacity planning
4. **Use distributed cache**: Redis for multi-instance deployments

## Adding Idempotency to New Endpoints

### Using the Middleware Wrapper

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withIdempotency } from '@/lib/idempotency';

export async function POST(request: NextRequest) {
  return withIdempotency(request, async (body) => {
    // Your endpoint logic here
    const result = await processOperation(body);
    return NextResponse.json(result);
  });
}
```

### Manual Implementation

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { checkIdempotency, storeIdempotentResponse } from '@/lib/idempotency';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Check for cached response
  const cachedResponse = await checkIdempotency(request, body);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Process request
  const result = await processOperation(body);
  const response = NextResponse.json(result);
  
  // Store for future requests
  storeIdempotentResponse(request, body, {
    status: 200,
    body: result,
  });
  
  return response;
}
```

## Testing

### Test Scenarios

1. **First request**: Should process normally
2. **Duplicate request**: Should return cached response with `X-Idempotent-Replay: true`
3. **Conflict**: Same key, different body should return 409
4. **Expiration**: Expired keys should be treated as new requests
5. **No key**: Requests without idempotency key should process normally

### Example Test

```typescript
describe('Idempotency', () => {
  it('should return cached response for duplicate requests', async () => {
    const key = 'test-key-123';
    const body = { amount: 100, recipient: 'test' };
    
    // First request
    const response1 = await fetch('/api/remittance/build', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': key,
      },
      body: JSON.stringify(body),
    });
    
    const data1 = await response1.json();
    
    // Duplicate request
    const response2 = await fetch('/api/remittance/build', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': key,
      },
      body: JSON.stringify(body),
    });
    
    const data2 = await response2.json();
    
    // Should return same response
    expect(data1).toEqual(data2);
    expect(response2.headers.get('X-Idempotent-Replay')).toBe('true');
  });
  
  it('should return 409 for conflicting requests', async () => {
    const key = 'test-key-456';
    
    // First request
    await fetch('/api/remittance/build', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': key,
      },
      body: JSON.stringify({ amount: 100 }),
    });
    
    // Conflicting request (different body)
    const response = await fetch('/api/remittance/build', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': key,
      },
      body: JSON.stringify({ amount: 200 }), // Different amount
    });
    
    expect(response.status).toBe(409);
  });
});
```

## OpenAPI Specification

```yaml
paths:
  /api/remittance/build:
    post:
      summary: Build a remittance transaction
      parameters:
        - in: header
          name: Idempotency-Key
          schema:
            type: string
            format: uuid
          required: false
          description: Unique key to ensure idempotent request processing
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - amount
                - recipient
                - currency
              properties:
                amount:
                  type: number
                recipient:
                  type: string
                currency:
                  type: string
      responses:
        '200':
          description: Success (new or cached response)
          headers:
            X-Idempotent-Replay:
              schema:
                type: boolean
              description: True if response was served from cache
          content:
            application/json:
              schema:
                type: object
                properties:
                  transactionId:
                    type: string
                  status:
                    type: string
        '409':
          description: Idempotency key conflict
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                  message:
                    type: string
```

## Migration to Production Storage

### Redis Implementation

```typescript
import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL,
});

export async function storeIdempotencyRecord(
  key: string,
  requestHash: string,
  response: any,
  ttlMs: number = 24 * 60 * 60 * 1000
) {
  const record = {
    requestHash,
    response,
    createdAt: Date.now(),
  };
  
  await redis.setEx(
    `idempotency:${key}`,
    Math.floor(ttlMs / 1000),
    JSON.stringify(record)
  );
}

export async function checkIdempotencyKey(
  key: string,
  requestHash: string
) {
  const data = await redis.get(`idempotency:${key}`);
  
  if (!data) {
    return { exists: false, conflict: false };
  }
  
  const record = JSON.parse(data);
  
  if (record.requestHash !== requestHash) {
    return { exists: true, record, conflict: true };
  }
  
  return { exists: true, record, conflict: false };
}
```

## Monitoring

Track these metrics:

- **Cache hit rate**: Percentage of requests served from cache
- **Conflict rate**: Percentage of 409 responses
- **Cache size**: Number of stored keys
- **Average TTL**: Time until expiration

## Security Considerations

1. **Key validation**: Validate idempotency key format and length
2. **Rate limiting**: Prevent abuse by limiting requests per key
3. **Authentication**: Always verify user identity before processing
4. **Data isolation**: Ensure keys are scoped to authenticated users
