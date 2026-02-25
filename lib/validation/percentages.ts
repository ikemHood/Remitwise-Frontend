// Validation utilities for split percentages

export interface SplitPercentages {
  spending: number;
  savings: number;
  bills: number;
  insurance: number;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates that percentages are valid and sum to 100
 * @throws {ValidationError} if validation fails
 */
export function validatePercentages(percentages: SplitPercentages): void {
  const { spending, savings, bills, insurance } = percentages;

  // Check for missing fields
  if (
    spending === undefined ||
    savings === undefined ||
    bills === undefined ||
    insurance === undefined
  ) {
    throw new ValidationError(
      'Missing required fields: spending, savings, bills, insurance'
    );
  }

  // Check for negative values
  if (spending < 0 || savings < 0 || bills < 0 || insurance < 0) {
    throw new ValidationError('All percentages must be non-negative');
  }

  // Check sum equals 100
  const sum = spending + savings + bills + insurance;
  if (Math.abs(sum - 100) > 0.01) { // Allow small floating point errors
    throw new ValidationError(
      `Percentages must sum to 100. Current sum: ${sum}`
    );
  }
}

/**
 * Validates Stellar address format
 * @throws {ValidationError} if address is invalid
 */
export function validateStellarAddress(address: string): void {
  if (!address || typeof address !== 'string') {
    throw new ValidationError('Address must be a non-empty string');
  }

  // Basic Stellar address validation (starts with G and is 56 characters)
  if (!address.match(/^G[A-Z0-9]{55}$/)) {
    throw new ValidationError('Invalid Stellar address format');
  }
}
