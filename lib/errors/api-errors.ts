// API error handling utilities

import { NextResponse } from 'next/server';
import { ApiErrorResponse } from '@/lib/types/savings-goals';

/**
 * Create a 400 Bad Request error response
 */
export function createValidationError(
  error: string,
  details?: string
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error,
      details
    },
    { status: 400 }
  );
}

/**
 * Create a 401 Unauthorized error response
 */
export function createAuthenticationError(
  error: string = 'Authentication required',
  details?: string
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error,
      details
    },
    { status: 401 }
  );
}

/**
 * Create a 500 Internal Server Error response
 */
export function createServerError(
  error: string = 'Internal server error',
  details?: string
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error,
      details
    },
    { status: 500 }
  );
}

/**
 * Create a 404 Not Found error response
 */
export function createNotFoundError(
  error: string = 'Resource not found',
  details?: string
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error,
      details
    },
    { status: 404 }
  );
}

/**
 * Handle unexpected errors and return appropriate response
 */
export function handleUnexpectedError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error('Unexpected error:', error);
  
  if (error instanceof Error) {
    return createServerError('An unexpected error occurred', error.message);
  }
  
  return createServerError('An unexpected error occurred');
}
