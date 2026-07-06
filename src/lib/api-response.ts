import { NextResponse } from 'next/server';

type ApiSuccess<T> = { data: T; message?: string };
type ApiError = { error: string; code?: string; details?: unknown };

export function success<T>(data: T, statusOrMessage?: number | string, message?: string) {
  // Allow both patterns: success(data, 200, 'msg') and success(data, 'msg')
  let status = 200;
  let msg: string | undefined;
  if (typeof statusOrMessage === 'number') {
    status = statusOrMessage;
    msg = message;
  } else if (typeof statusOrMessage === 'string') {
    msg = statusOrMessage;
  }
  return NextResponse.json(
    msg ? { data, message: msg } : { data },
    { status }
  );
}

export function error(message: string, status = 500, code?: string, details?: unknown) {
  const body: ApiError = { error: message };
  if (code) body.code = code;
  if (details) body.details = details;
  return NextResponse.json(body, { status });
}

export function paginated<T>(data: T[], page: number, limit: number, total: number) {
  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
}

export function created<T>(data: T, message = 'Resource created successfully') {
  return success(data, 201, message);
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}