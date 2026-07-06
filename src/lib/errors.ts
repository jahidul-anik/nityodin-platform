export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(404, 'NOT_FOUND', `${resource}${id ? ` with id ${id}` : ''} not found`);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, 'VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(401, 'UNAUTHORIZED', message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(403, 'FORBIDDEN', message);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, 'CONFLICT', message);
    this.name = 'ConflictError';
  }
}

// Wallet-specific errors with extra safety
export class InsufficientFundsError extends AppError {
  constructor(required: number, available: number) {
    super(422, 'INSUFFICIENT_FUNDS', `Insufficient funds. Required: ৳${required}, Available: ৳${available}`, { required, available });
    this.name = 'InsufficientFundsError';
  }
}

export class WalletFrozenError extends AppError {
  constructor() {
    super(423, 'WALLET_FROZEN', 'Wallet is frozen. Contact support for assistance.');
    this.name = 'WalletFrozenError';
  }
}

export class EscrowError extends AppError {
  constructor(message: string, details?: unknown) {
    super(500, 'ESCROW_ERROR', message, details);
    this.name = 'EscrowError';
  }
}