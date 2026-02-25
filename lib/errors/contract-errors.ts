/**
 * Standardized Contract Error System
 * 
 * This module provides a unified error taxonomy for all smart contract interactions.
 * All contract errors are categorized into top-level categories for consistent client-side handling.
 */

// Error categories
export enum ErrorCategory {
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  STATE = 'STATE',
  LIMIT = 'LIMIT',
  SYSTEM = 'SYSTEM',
  INTEGRATION = 'INTEGRATION',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN = 'UNKNOWN'
}

// Error code ranges
export const ERROR_CODE_RANGES = {
  AUTH: { min: 1000, max: 1999 },
  VALIDATION: { min: 2000, max: 2999 },
  STATE: { min: 3000, max: 3999 },
  LIMIT: { min: 4000, max: 4999 },
  SYSTEM: { min: 5000, max: 5999 },
  INTEGRATION: { min: 6000, max: 6999 },
  NOT_FOUND: { min: 7000, max: 7999 },
} as const;

// Specific error codes
export enum ContractErrorCode {
  // AUTH (1000-1999)
  UNAUTHORIZED = 1000,
  INVALID_SIGNATURE = 1001,
  NOT_OWNER = 1002,
  PERMISSION_DENIED = 1003,
  INVALID_CALLER = 1004,
  
  // VALIDATION (2000-2999)
  INVALID_ADDRESS = 2000,
  INVALID_AMOUNT = 2001,
  INVALID_DATE = 2002,
  INVALID_PARAMETER = 2003,
  INVALID_ACCOUNT = 2004,
  INVALID_FREQUENCY = 2005,
  INVALID_DUE_DATE = 2006,
  INVALID_BILL_ID = 2007,
  INVALID_GOAL_ID = 2008,
  INVALID_POLICY_ID = 2009,
  MISSING_PARAMETER = 2010,
  MALFORMED_DATA = 2011,
  
  // STATE (3000-3999)
  GOAL_LOCKED = 3000,
  GOAL_ALREADY_LOCKED = 3001,
  GOAL_NOT_LOCKED = 3002,
  INSUFFICIENT_BALANCE = 3003,
  POLICY_INACTIVE = 3004,
  POLICY_ALREADY_ACTIVE = 3005,
  BILL_ALREADY_PAID = 3006,
  BILL_CANCELLED = 3007,
  INVALID_STATE_TRANSITION = 3008,
  
  // LIMIT (4000-4999)
  AMOUNT_EXCEEDS_MAXIMUM = 4000,
  AMOUNT_BELOW_MINIMUM = 4001,
  TOO_MANY_POLICIES = 4002,
  TOO_MANY_GOALS = 4003,
  RATE_LIMIT_EXCEEDED = 4004,
  WITHDRAWAL_LIMIT_EXCEEDED = 4005,
  
  // SYSTEM (5000-5999)
  RPC_TIMEOUT = 5000,
  RPC_ERROR = 5001,
  NETWORK_ERROR = 5002,
  CONTRACT_NOT_CONFIGURED = 5003,
  CONTRACT_NOT_FOUND = 5004,
  SIMULATION_FAILED = 5005,
  TRANSACTION_FAILED = 5006,
  ACCOUNT_LOAD_FAILED = 5007,
  
  // INTEGRATION (6000-6999)
  ANCHOR_API_ERROR = 6000,
  WEBHOOK_VERIFICATION_FAILED = 6001,
  EXTERNAL_SERVICE_ERROR = 6002,
  
  // NOT_FOUND (7000-7999)
  GOAL_NOT_FOUND = 7000,
  POLICY_NOT_FOUND = 7001,
  BILL_NOT_FOUND = 7002,
  ACCOUNT_NOT_FOUND = 7003,
  RESOURCE_NOT_FOUND = 7004,
}

export interface ContractErrorDetails {
  originalError?: unknown;
  contractId?: string;
  method?: string;
  metadata?: Record<string, unknown>;
}

export class ContractError extends Error {
  public readonly category: ErrorCategory;
  public readonly code: ContractErrorCode;
  public readonly details?: ContractErrorDetails;
  public readonly isRetryable: boolean;
  public readonly httpStatus: number;

  constructor(
    code: ContractErrorCode,
    message: string,
    details?: ContractErrorDetails,
    isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'ContractError';
    this.code = code;
    this.category = this.categorizeError(code);
    this.details = details;
    this.isRetryable = isRetryable;
    this.httpStatus = this.getHttpStatus();
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ContractError);
    }
  }

  private categorizeError(code: ContractErrorCode): ErrorCategory {
    const numCode = Number(code);
    
    for (const [category, range] of Object.entries(ERROR_CODE_RANGES)) {
      if (numCode >= range.min && numCode <= range.max) {
        return category as ErrorCategory;
      }
    }
    
    return ErrorCategory.UNKNOWN;
  }

  private getHttpStatus(): number {
    switch (this.category) {
      case ErrorCategory.AUTH:
        return 401;
      case ErrorCategory.VALIDATION:
        return 400;
      case ErrorCategory.NOT_FOUND:
        return 404;
      case ErrorCategory.LIMIT:
        return 429;
      case ErrorCategory.STATE:
        return 409;
      case ErrorCategory.INTEGRATION:
        return 502;
      case ErrorCategory.SYSTEM:
        return 503;
      default:
        return 500;
    }
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      category: this.category,
      isRetryable: this.isRetryable,
      details: this.details?.metadata,
    };
  }
}

export function createAuthError(
  message: string,
  details?: ContractErrorDetails
): ContractError {
  return new ContractError(ContractErrorCode.UNAUTHORIZED, message, details);
}

export function createValidationError(
  code: ContractErrorCode,
  message: string,
  details?: ContractErrorDetails
): ContractError {
  return new ContractError(code, message, details);
}

export function createStateError(
  code: ContractErrorCode,
  message: string,
  details?: ContractErrorDetails
): ContractError {
  return new ContractError(code, message, details);
}

export function createSystemError(
  message: string,
  details?: ContractErrorDetails,
  isRetryable: boolean = true
): ContractError {
  return new ContractError(
    ContractErrorCode.RPC_ERROR,
    message,
    details,
    isRetryable
  );
}

export function createNotFoundError(
  code: ContractErrorCode,
  message: string,
  details?: ContractErrorDetails
): ContractError {
  return new ContractError(code, message, details);
}

export function parseContractError(
  error: unknown,
  context?: { contractId?: string; method?: string }
): ContractError {
  if (error instanceof ContractError) {
    return error;
  }

  if (error && typeof error === 'object' && 'code' in error) {
    const err = error as { code?: string | number; message?: string };
    
    if (typeof err.code === 'string') {
      return mapStringCodeToError(err.code, err.message, context);
    }
    
    if (typeof err.code === 'number') {
      return mapNumericCodeToError(err.code, err.message, context);
    }
  }

  if (error instanceof Error) {
    return mapErrorMessageToError(error, context);
  }

  return new ContractError(
    ContractErrorCode.RPC_ERROR,
    'Unknown contract error',
    { originalError: error, ...context }
  );
}

function mapStringCodeToError(
  code: string,
  message?: string,
  context?: { contractId?: string; method?: string }
): ContractError {
  const errorMap: Record<string, ContractErrorCode> = {
    'NOT_FOUND': ContractErrorCode.RESOURCE_NOT_FOUND,
    'INVALID_ADDRESS': ContractErrorCode.INVALID_ADDRESS,
    'INVALID_AMOUNT': ContractErrorCode.INVALID_AMOUNT,
    'UNAUTHORIZED': ContractErrorCode.UNAUTHORIZED,
    'NOT_OWNER': ContractErrorCode.NOT_OWNER,
    'GOAL_LOCKED': ContractErrorCode.GOAL_LOCKED,
    'INSUFFICIENT_BALANCE': ContractErrorCode.INSUFFICIENT_BALANCE,
    'POLICY_INACTIVE': ContractErrorCode.POLICY_INACTIVE,
    'invalid-account': ContractErrorCode.INVALID_ACCOUNT,
    'invalid-owner': ContractErrorCode.INVALID_ADDRESS,
    'invalid-amount': ContractErrorCode.INVALID_AMOUNT,
    'invalid-frequency': ContractErrorCode.INVALID_FREQUENCY,
    'invalid-dueDate': ContractErrorCode.INVALID_DUE_DATE,
    'invalid-caller': ContractErrorCode.INVALID_CALLER,
    'invalid-billId': ContractErrorCode.INVALID_BILL_ID,
  };

  const errorCode = errorMap[code] || ContractErrorCode.RPC_ERROR;
  const errorMessage = message || `Contract error: ${code}`;

  return new ContractError(errorCode, errorMessage, {
    originalError: code,
    ...context,
  });
}

function mapNumericCodeToError(
  code: number,
  message?: string,
  context?: { contractId?: string; method?: string }
): ContractError {
  const errorCode = Object.values(ContractErrorCode).includes(code as ContractErrorCode)
    ? (code as ContractErrorCode)
    : ContractErrorCode.RPC_ERROR;

  const errorMessage = message || `Contract error code: ${code}`;

  return new ContractError(errorCode, errorMessage, {
    originalError: code,
    ...context,
  });
}

function mapErrorMessageToError(
  error: Error,
  context?: { contractId?: string; method?: string }
): ContractError {
  const msg = error.message.toLowerCase();

  if (msg.includes('not found')) {
    return new ContractError(
      ContractErrorCode.RESOURCE_NOT_FOUND,
      error.message,
      { originalError: error, ...context }
    );
  }

  if (msg.includes('unauthorized') || msg.includes('permission')) {
    return new ContractError(
      ContractErrorCode.UNAUTHORIZED,
      error.message,
      { originalError: error, ...context }
    );
  }

  if (msg.includes('invalid') || msg.includes('malformed')) {
    return new ContractError(
      ContractErrorCode.INVALID_PARAMETER,
      error.message,
      { originalError: error, ...context }
    );
  }

  if (msg.includes('timeout') || msg.includes('timed out')) {
    return new ContractError(
      ContractErrorCode.RPC_TIMEOUT,
      error.message,
      { originalError: error, ...context },
      true
    );
  }

  if (msg.includes('network') || msg.includes('connection')) {
    return new ContractError(
      ContractErrorCode.NETWORK_ERROR,
      error.message,
      { originalError: error, ...context },
      true
    );
  }

  return new ContractError(
    ContractErrorCode.RPC_ERROR,
    error.message,
    { originalError: error, ...context }
  );
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof ContractError) {
    return error.isRetryable;
  }
  return false;
}

export function getErrorCategory(error: unknown): ErrorCategory {
  if (error instanceof ContractError) {
    return error.category;
  }
  return ErrorCategory.UNKNOWN;
}

export function isErrorCategory(error: unknown, category: ErrorCategory): boolean {
  return getErrorCategory(error) === category;
}
