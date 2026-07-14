import { z, ZodSchema } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { ValidationError } from '@/lib/errors';

export function validateBody<T>(schema: ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    throw new ValidationError('Invalid request body', errors);
  }
  return result.data;
}

export function validateQuery<T>(schema: ZodSchema<T>, searchParams: URLSearchParams): T {
  const obj: Record<string, string> = {};
  searchParams.forEach((value, key) => { obj[key] = value; });
  const result = schema.safeParse(obj);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    throw new ValidationError('Invalid query parameters', errors);
  }
  return result.data;
}

// Common pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

/**
 * Rejects requests that don't declare Content-Type: application/json.
 * Returns 415 Unsupported Media Type if missing/mismatched.
 * Call this at the top of every POST/PUT/PATCH/DELETE handler that
 * parses `request.json()`.
 */
export function requireJsonContentType(request: NextRequest): NextResponse | null {
  const ct = request.headers.get('content-type');
  if (!ct || !ct.includes('application/json')) {
    return NextResponse.json(
      { error: 'Content-Type must be application/json', code: 'UNSUPPORTED_MEDIA_TYPE' },
      { status: 415 },
    );
  }
  return null;
}