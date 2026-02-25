// API response types

export interface APIResponse {
  success: boolean;
  xdr?: string;
  simulate?: {
    cost: string;
    results: any[];
  };
  message?: string;
  error?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
}

export interface SuccessResponse {
  success: true;
  xdr: string;
  simulate?: {
    cost: string;
    results: any[];
  };
  message: string;
}

// Error types
export class AuthenticationError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContractError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network connection failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class SimulationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SimulationError';
  }
}
