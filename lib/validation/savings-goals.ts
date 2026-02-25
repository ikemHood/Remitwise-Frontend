// Validation utilities for savings goals

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates that an amount is a positive number
 */
export function validateAmount(amount: number): ValidationResult {
  if (typeof amount !== 'number') {
    return { isValid: false, error: 'Amount must be a number' };
  }
  
  if (isNaN(amount)) {
    return { isValid: false, error: 'Amount cannot be NaN' };
  }
  
  if (!isFinite(amount)) {
    return { isValid: false, error: 'Amount must be finite' };
  }
  
  if (amount <= 0) {
    return { isValid: false, error: 'Amount must be positive' };
  }
  
  return { isValid: true };
}

/**
 * Validates that a date string is in the future
 */
export function validateFutureDate(dateString: string): ValidationResult {
  if (!dateString || typeof dateString !== 'string') {
    return { isValid: false, error: 'Date must be a non-empty string' };
  }
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }
  
  const now = new Date();
  
  if (date <= now) {
    return { isValid: false, error: 'Target date must be in the future' };
  }
  
  return { isValid: true };
}

/**
 * Validates that a goal ID is non-empty
 */
export function validateGoalId(goalId: string): ValidationResult {
  if (!goalId || typeof goalId !== 'string') {
    return { isValid: false, error: 'Goal ID must be a non-empty string' };
  }
  
  if (goalId.trim().length === 0) {
    return { isValid: false, error: 'Goal ID cannot be empty or whitespace' };
  }
  
  return { isValid: true };
}

/**
 * Validates that a goal name is valid
 */
export function validateGoalName(name: string): ValidationResult {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Goal name must be a non-empty string' };
  }
  
  if (name.trim().length === 0) {
    return { isValid: false, error: 'Goal name cannot be empty or whitespace' };
  }
  
  if (name.length > 100) {
    return { isValid: false, error: 'Goal name cannot exceed 100 characters' };
  }
  
  return { isValid: true };
}

/**
 * Validates a Stellar public key format
 */
export function validatePublicKey(publicKey: string): ValidationResult {
  if (!publicKey || typeof publicKey !== 'string') {
    return { isValid: false, error: 'Public key must be a non-empty string' };
  }
  
  // Basic validation: Stellar public keys start with 'G' and are 56 characters
  if (!publicKey.startsWith('G') || publicKey.length !== 56) {
    return { isValid: false, error: 'Invalid Stellar public key format' };
  }
  
  return { isValid: true };
}
