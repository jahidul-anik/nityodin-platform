import { NextResponse } from 'next/server';
import { AppError } from '@/lib/errors';
import { error } from '@/lib/api-response';

/**
 * Unified error handler for API routes.
 * Catches AppError instances (including ValidationError, NotFoundError, etc.)
 * and falls back to a generic 500 for unexpected errors.
 */
export function handleApiError(err: unknown): NextResponse {
  if (err instanceof AppError) {
    return error(err.message, err.statusCode, err.code, err.details);
  }

  console.error('Unexpected API error:', err);
  return error('An unexpected error occurred');
}