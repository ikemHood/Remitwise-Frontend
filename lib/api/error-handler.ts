import { NextResponse } from 'next/server';
import { ValidationError } from '@/utils/validation/preferences-validation';
import type { ApiErrorCode } from '@/lib/api/types';

type KnownCode = Extract<ApiErrorCode, 'UNAUTHORIZED' | 'VALIDATION_ERROR' | 'NOT_FOUND' | 'INTERNAL_ERROR'>;

export class ApiRouteError extends Error {
  readonly status: number;
  readonly code: KnownCode;

  constructor(status: number, code: KnownCode, message: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'ApiRouteError';
  }
}

type Handler<TContext = unknown> = (
  request: Request,
  context: TContext
) => Promise<Response> | Response;

function getRequestId(request: Request): string {
  return request.headers.get('x-request-id') ?? crypto.randomUUID();
}

function mapError(error: unknown): ApiRouteError {
  if (error instanceof ApiRouteError) {
    return error;
  }

  if (error instanceof Response) {
    if (error.status === 400) return new ApiRouteError(400, 'VALIDATION_ERROR', 'Invalid request');
    if (error.status === 401) return new ApiRouteError(401, 'UNAUTHORIZED', 'Unauthorized');
    if (error.status === 404) return new ApiRouteError(404, 'NOT_FOUND', 'Resource not found');
    return new ApiRouteError(error.status || 500, 'INTERNAL_ERROR', 'Internal server error');
  }

  if (error instanceof ValidationError) {
    return new ApiRouteError(400, 'VALIDATION_ERROR', error.message);
  }

  if (
    error &&
    typeof error === 'object' &&
    'name' in error &&
    (error as { name?: string }).name === 'ApiError' &&
    'status' in error &&
    typeof (error as { status?: unknown }).status === 'number'
  ) {
    const status = (error as { status: number }).status;
    const message =
      'message' in error && typeof (error as { message?: unknown }).message === 'string'
        ? (error as { message: string }).message
        : 'Request failed';

    if (status === 400) return new ApiRouteError(400, 'VALIDATION_ERROR', message);
    if (status === 401) return new ApiRouteError(401, 'UNAUTHORIZED', message);
    if (status === 404) return new ApiRouteError(404, 'NOT_FOUND', message);
    return new ApiRouteError(status, 'INTERNAL_ERROR', 'Internal server error');
  }

  return new ApiRouteError(500, 'INTERNAL_ERROR', 'Internal server error');
}

export function withApiErrorHandler<TContext = unknown>(handler: Handler<TContext>) {
  return async function wrappedHandler(request: Request, context: TContext): Promise<Response> {
    const requestId = getRequestId(request);
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      const response = await handler(request, context);
      response.headers.set('x-request-id', requestId);
      return response;
    } catch (error) {
      const mapped = mapError(error);

      if (mapped.code === 'INTERNAL_ERROR') {
        console.error('[api-error]', { requestId, path, method, error });
      } else {
        console.warn('[api-error]', {
          requestId,
          path,
          method,
          status: mapped.status,
          code: mapped.code,
          message: mapped.message,
        });
      }

      return NextResponse.json(
        {
          success: false as const,
          error: {
            code: mapped.code,
            message: mapped.message,
          },
          requestId,
        },
        {
          status: mapped.status,
          headers: {
            'x-request-id': requestId,
          },
        }
      );
    }
  };
}
