import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./session";

/**
 * Structured API error for consistent error responses.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Validates the Authorization header.
 * Expects:  Authorization: Bearer <token>
 * The token is checked against the AUTH_SECRET env variable.
 */
export function validateAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  if (!token) return false;
  return token === process.env.AUTH_SECRET;
}

export function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Higher-order function that wraps a route handler with auth validation.
 * Extracts the Bearer token and passes it to the handler as `session`.
 * Returns 401 if no valid token is present.
 *
 * Usage:
 *   async function handler(req: NextRequest, session: string) { ... }
 *   export const GET = withAuth(handler);
 */
export function withAuth(
  handler: (request: NextRequest, session: string) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authHeader = request.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (token !== process.env.AUTH_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return handler(request, token);
  };
}
 * Wrapper for protecting route handlers with session-based authentication.
 *
 * Extracts session from encrypted cookie and passes to handler.
 * Returns 401 Unauthorized if session is missing or invalid.
 *
 * @param handler - Route handler that receives (request, session)
 * @returns Route handler compatible with Next.js App Router
 *
 * @example
 * async function handler(request: NextRequest, session: string) {
 *   return NextResponse.json({ address: session });
 * }
 * export const GET = withAuth(handler);
 */
export function withAuth(
  handler: (request: NextRequest, session: string) => Promise<Response>,
) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      const sessionData = await getSession();
      if (!sessionData?.address) {
        return NextResponse.json(
          { error: "Unauthorized", message: "Not authenticated" },
          { status: 401 },
        );
      }

      return await handler(request, sessionData.address);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.status },
        );
      }

      // Log unexpected errors but don't expose details
      console.error("Route handler error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  };
}
