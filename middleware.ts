import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LRUCache } from "lru-cache";

// ============================================================================
// CORS & SECURITY CONFIGURATION
// ============================================================================

const CORS_ALLOWED_METHODS = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "OPTIONS",
];
const CORS_ALLOWED_HEADERS = [
  "Content-Type",
  "Authorization",
  "X-Requested-With",
];
const MAX_BODY_SIZE = parseInt(process.env.API_MAX_BODY_SIZE || "1048576", 10); // Default 1MB

// Security headers applied to all API responses
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block", // Legacy, for defense-in-depth
};

// ============================================================================
// HELPER FUNCTIONS FOR CORS, SECURITY HEADERS, AND BODY VALIDATION
// ============================================================================

/**
 * Apply CORS headers to response based on request origin.
 * CORS is applied early (before rate limiting) to allow OPTIONS preflight requests.
 */
function applyCORS(response: NextResponse, request: NextRequest): void {
  const allowedOrigin =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const requestOrigin = request.headers.get("origin");

  // For MVP: Allow if origin matches NEXT_PUBLIC_APP_URL or is same-origin
  // Future: Support comma-separated list of origins
  const isSameOrigin = !requestOrigin || requestOrigin === allowedOrigin;

  if (isSameOrigin || requestOrigin === allowedOrigin) {
    response.headers.set(
      "Access-Control-Allow-Origin",
      requestOrigin || allowedOrigin,
    );
  }

  // Allow credentials for same-origin requests
  response.headers.set("Access-Control-Allow-Credentials", "true");

  // Allowed methods and headers
  response.headers.set(
    "Access-Control-Allow-Methods",
    CORS_ALLOWED_METHODS.join(", "),
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    CORS_ALLOWED_HEADERS.join(", "),
  );

  // Inform caches that this response varies by origin
  response.headers.set("Vary", "Origin");
}

/**
 * Apply security headers to all API responses.
 * Protects against common web vulnerabilities.
 */
function applySecurityHeaders(response: NextResponse): void {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
}

/**
 * Validate request body size for POST/PUT/PATCH requests.
 * Checks Content-Length header first, falls back to reading body if header missing.
 *
 * @returns { valid: true } if valid, or { valid: false, error: NextResponse } if oversized
 */
async function validateBodySize(
  request: NextRequest,
  maxSize: number = MAX_BODY_SIZE,
): Promise<{ valid: boolean; error?: NextResponse }> {
  // Only validate request methods that have bodies
  const methodsToValidate = ["POST", "PUT", "PATCH"];
  if (!methodsToValidate.includes(request.method)) {
    return { valid: true };
  }

  // Primary check: Content-Length header
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > maxSize) {
    return {
      valid: false,
      error: new NextResponse(
        JSON.stringify({
          error: "Payload Too Large",
          message: `Request body exceeds maximum size of ${maxSize} bytes.`,
        }),
        {
          status: 413,
          headers: { "Content-Type": "application/json" },
        },
      ),
    };
  }

  // Fallback check: Read body if Content-Length missing (for streaming/chunked encoding)
  if (!contentLength) {
    try {
      const bodyBuffer = await request.arrayBuffer();
      if (bodyBuffer.byteLength > maxSize) {
        return {
          valid: false,
          error: new NextResponse(
            JSON.stringify({
              error: "Payload Too Large",
              message: `Request body exceeds maximum size of ${maxSize} bytes.`,
            }),
            {
              status: 413,
              headers: { "Content-Type": "application/json" },
            },
          ),
        };
      }
    } catch {
      // If body reading fails, allow request to proceed (handler will validate)
      return { valid: true };
    }
  }

  return { valid: true };
}

// ============================================================================
// RATE LIMITING CONFIGURATION
// ============================================================================

// Configuration for Rate Limiting Limits
const RATE_LIMITS = {
  auth: 10, // 10 req/min for /api/auth/*
  write: 50, // 50 req/min for POST/PUT/DELETE /api/*
  general: 100, // 100 req/min for GET /api/*
};

// Rate limiting cache: max 10,000 IPs, items expire in 1 minute
const rateLimitCache = new LRUCache<
  string,
  { count: number; expiresAt: number }
>({
  max: 10000,
  ttl: 60 * 1000, // 1 minute
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract IP or fallback for key
  const forwardedFor = request.headers.get("x-forwarded-for");
  let ip = "127.0.0.1";
  if (forwardedFor) {
    ip = forwardedFor.split(",")[0].trim();
  } else {
    // Fallback for local dev or when header is missing
    const remoteAddr = request.headers.get("x-real-ip");
    if (remoteAddr) {
      ip = remoteAddr;
    }
  }

  // ========================================================================
  // STEP 1: Whitelist test environments (Playwright E2E)
  // ========================================================================
  if (
    request.headers.get("x-playwright-test") === "true" &&
    process.env.NODE_ENV !== "production"
  ) {
    return NextResponse.next();
  }

  // ========================================================================
  // STEP 2: Whitelist Health Check
  // ========================================================================
  if (pathname === "/api/health" || pathname.startsWith("/api/health/")) {
    return NextResponse.next();
  }

  // ========================================================================
  // STEP 3: Create response and apply CORS + Security headers early
  // ========================================================================
  // CORS must be applied before rate limiting to allow OPTIONS preflight
  let apiResponse = NextResponse.next();
  applyCORS(apiResponse, request);
  applySecurityHeaders(apiResponse);

  // ========================================================================
  // STEP 4: Handle CORS OPTIONS preflight requests
  // ========================================================================
  if (request.method === "OPTIONS") {
    // Return 204 No Content with CORS headers (no body)
    const preflightResponse = new NextResponse(null, { status: 204 });
    applyCORS(preflightResponse, request);
    applySecurityHeaders(preflightResponse);
    return preflightResponse;
  }

  // ========================================================================
  // STEP 5: Validate request body size for POST/PUT/PATCH
  // ========================================================================
  const bodySizeValidation = await validateBodySize(request);
  if (!bodySizeValidation.valid && bodySizeValidation.error) {
    applyCORS(bodySizeValidation.error, request);
    applySecurityHeaders(bodySizeValidation.error);
    return bodySizeValidation.error;
  }

  // ========================================================================
  // STEP 6: Apply rate limiting (existing logic)
  // ========================================================================

  // STEP 6a: Determine Rate Limit based on route & method
  let limit = RATE_LIMITS.general;

  if (pathname.startsWith("/api/auth/")) {
    limit = RATE_LIMITS.auth;
  } else if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
    limit = RATE_LIMITS.write;
  }

  // Construct Cache Key
  // e.g., '127.0.0.1:/api/auth' (grouping auth limits separately if desired,
  // but let's just do by IP + limit Type to be safe, or just IP.
  // Standard is usually just "IP:auth", "IP:write", "IP:general")
  // STEP 6b: Construct cache key and check limits
  let limitType = "general";
  if (pathname.startsWith("/api/auth/")) {
    limitType = "auth";
  } else if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
    limitType = "write";
  }

  const cacheKey = `${ip}:${limitType}`;

  // Check and update cache
  const now = Date.now();
  const tokenRecord = rateLimitCache.get(cacheKey) || {
    count: 0,
    expiresAt: now + 60000,
  };

  if (now > tokenRecord.expiresAt) {
    tokenRecord.count = 0;
    tokenRecord.expiresAt = now + 60000;
  }

  tokenRecord.count += 1;
  rateLimitCache.set(cacheKey, tokenRecord);

  // STEP 6c: Check if rate limit exceeded
  if (tokenRecord.count > limit) {
    // Exceeded limit
    const retryAfter = Math.ceil(
      (tokenRecord.expiresAt - now) / 1000,
    ).toString();

    const rateLimitError = new NextResponse(
      JSON.stringify({
        error: "Too Many Requests",
        message: "Rate limit exceeded.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": retryAfter,
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": tokenRecord.expiresAt.toString(),
        },
      },
    );
    applyCORS(rateLimitError, request);
    applySecurityHeaders(rateLimitError);
    return rateLimitError;
  }

  // ========================================================================
  // STEP 7: Allow Request - add rate limit headers to response
  // ========================================================================
  apiResponse.headers.set("X-RateLimit-Limit", limit.toString());
  apiResponse.headers.set(
    "X-RateLimit-Remaining",
    (limit - tokenRecord.count).toString(),
  );
  apiResponse.headers.set(
    "X-RateLimit-Reset",
    tokenRecord.expiresAt.toString(),
  );

  return apiResponse;
}

// Config ensures middleware only runs on API routes
export const config = {
  matcher: "/api/:path*",
};
