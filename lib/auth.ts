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

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

type NextHandler = (req: NextRequest, address: string) => Promise<NextResponse>;

export function withAuth(handler: NextHandler) {
  return async (req: NextRequest) => {

    const session = await getSession();
      if (!session?.address) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Not authenticated' },
          { status: 401 }
        );
      }
    
    return handler(req, session.address);
/**
 * Higher-order function that wraps a route handler with auth validation.
 * Supports both Bearer token auth and session-based auth from cookies.
 * 
 * Usage:
 *   async function handler(req: NextRequest, session: string) { ... }
 *   export const GET = withAuth(handler);
 */
export function withAuth(
  handler: (request: NextRequest, session: string) => Promise<Response> | Response,
) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      // Try Bearer token auth first
      const authHeader = request.headers.get("authorization") ?? "";
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : null;

      // Check if token is valid (either matches AUTH_SECRET or is a valid session)
      if (token && token === process.env.AUTH_SECRET) {
        return await handler(request, token);
      }

      // Check for session headers (backward compatibility)
      const sessionHeader = request.headers.get('x-user') ?? request.headers.get('x-stellar-public-key');
      if (sessionHeader) {
        return await handler(request, sessionHeader);
      }

      // Finally, try cookie-based session
      try {
        const sessionData = await getSession();
        if (sessionData?.address) {
          return await handler(request, sessionData.address);
        }
      } catch (sessionError) {
        // Session error, continue to unauthorized response
        console.debug("Session retrieval failed:", sessionError);
      }

      // No valid authentication found
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: error.status,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Log unexpected errors but don't expose details
      console.error("Route handler error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    if (!session?.address) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Not authenticated' },
        { status: 401 }
      );
    }

    return handler(req, session.address);
  };
}