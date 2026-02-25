import { NextRequest, NextResponse } from 'next/server';
import { validatePaginationParams, paginateData, PaginatedResult } from '../../../lib/utils/pagination';

// ===== Imports from main branch (secure POST) =====
import { buildCreateGoalTx } from '@/lib/contracts/savings-goals';
import { getSessionFromRequest, getPublicKeyFromSession } from '@/lib/auth/session';
import {
  createValidationError,
  createAuthenticationError,
  handleUnexpectedError
} from '@/lib/errors/api-errors';
import {
  validateAmount,
  validateFutureDate,
  validateGoalName
} from '@/lib/validation/savings-goals';
import { ApiSuccessResponse } from '@/lib/types/savings-goals';

// ===== Goal Interface & Mock Data (pagination branch) =====
interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  createdAt: string;
  updatedAt: string;
}

const mockGoals: Goal[] = [
  { id: '1', title: 'Emergency Fund', targetAmount: 10000, currentAmount: 4500, deadline: '2024-12-31', createdAt: '2023-01-15', updatedAt: '2023-06-20' },
  { id: '2', title: 'Vacation Trip', targetAmount: 5000, currentAmount: 1200, deadline: '2024-08-15', createdAt: '2023-03-10', updatedAt: '2023-07-01' },
  { id: '3', title: 'New Car', targetAmount: 25000, currentAmount: 8000, deadline: '2025-06-30', createdAt: '2023-02-20', updatedAt: '2023-08-15' },
  { id: '4', title: 'Home Down Payment', targetAmount: 50000, currentAmount: 15000, deadline: '2026-12-31', createdAt: '2023-01-01', updatedAt: '2023-09-10' },
];

// ===== GET /api/goals (pagination) =====
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const cursorParam = url.searchParams.get('cursor');

    const paginationParams = {
      limit: limitParam ? parseInt(limitParam, 10) : undefined,
      cursor: cursorParam || undefined,
    };

    const { limit, cursor } = validatePaginationParams(paginationParams);

    const paginatedResult: PaginatedResult<Goal> = paginateData(
      mockGoals,
      limit,
      (item) => item.id,
      cursor
    );

    return NextResponse.json(paginatedResult);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}

// ===== POST /api/goals (secure Stellar tx builder) =====
export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return createAuthenticationError('Authentication required', 'Please provide a valid session');
    }

    let publicKey: string;
    try {
      publicKey = getPublicKeyFromSession(session);
    } catch {
      return createAuthenticationError('Invalid session', 'Session does not contain a valid public key');
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return createValidationError('Invalid request body', 'Request body must be valid JSON');
    }

    const { name, targetAmount, targetDate } = body;

    if (!name) {
      return createValidationError('Missing required field', 'Goal name is required');
    }
    const nameValidation = validateGoalName(name);
    if (!nameValidation.isValid) {
      return createValidationError('Invalid goal name', nameValidation.error);
    }

    if (targetAmount === undefined || targetAmount === null) {
      return createValidationError('Missing required field', 'Target amount is required');
    }
    const amountValidation = validateAmount(targetAmount);
    if (!amountValidation.isValid) {
      return createValidationError('Invalid target amount', amountValidation.error);
    }

    if (!targetDate) {
      return createValidationError('Missing required field', 'Target date is required');
    }
    const dateValidation = validateFutureDate(targetDate);
    if (!dateValidation.isValid) {
      return createValidationError('Invalid target date', dateValidation.error);
    }

    const result = await buildCreateGoalTx(publicKey, name, targetAmount, targetDate);

    const response: ApiSuccessResponse = {
      xdr: result.xdr
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    return handleUnexpectedError(error);
  }
}