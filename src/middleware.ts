import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// In-memory rate limiter (per IP)
// ---------------------------------------------------------------------------
// Tracks: { ip → { counts: { windowStart, get, post } } }
// - GET routes: 60 requests / 60-second window
// - POST/PUT/PATCH/DELETE routes: 10 requests / 60-second window
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  windowStart: number;
  counts: Record<string, number>;
}

const WINDOW_MS = 60_000; // 1 minute
const GET_LIMIT = 60;
const WRITE_LIMIT = 10;

// Periodically evict stale entries to prevent unbounded memory growth
const MAX_ENTRIES = 10_000;
let lastPrune = Date.now();

const store = new Map<string, RateLimitEntry>();

function pruneIfNeeded() {
  const now = Date.now();
  if (now - lastPrune < WINDOW_MS) return;
  lastPrune = now;

  for (const [key, entry] of store) {
    if (now - entry.windowStart >= WINDOW_MS) {
      store.delete(key);
    }
  }

  // Hard cap to prevent OOM in attack scenarios
  if (store.size > MAX_ENTRIES) {
    const keysToDelete = store.size - MAX_ENTRIES;
    let deleted = 0;
    for (const key of store.keys()) {
      if (deleted >= keysToDelete) break;
      store.delete(key);
      deleted++;
    }
  }
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function getBucket(method: string): string {
  // Group mutating methods together
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return 'get';
  return 'post';
}

function getLimit(bucket: string): number {
  return bucket === 'get' ? GET_LIMIT : WRITE_LIMIT;
}

// ---------------------------------------------------------------------------
// Next.js Middleware
// ---------------------------------------------------------------------------

export function middleware(request: NextRequest) {
  // Only rate-limit API routes
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/api/')) return NextResponse.next();

  pruneIfNeeded();

  const ip = getClientIp(request);
  const method = request.method;
  const bucket = getBucket(method);
  const limit = getLimit(bucket);
  const now = Date.now();

  let entry = store.get(ip);

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    // Start a new window
    entry = { windowStart: now, counts: { get: 0, post: 0 } };
    store.set(ip, entry);
  }

  const currentCount = (entry.counts[bucket] ?? 0) + 1;
  entry.counts[bucket] = currentCount;

  if (currentCount > limit) {
    const resetSeconds = Math.ceil((entry.windowStart + WINDOW_MS - now) / 1000);
    return NextResponse.json(
      { error: 'Too many requests', code: 'RATE_LIMITED' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.max(resetSeconds, 1)),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  // Add rate-limit info headers to successful responses
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(limit));
  response.headers.set('X-RateLimit-Remaining', String(limit - currentCount));
  return response;
}

export const config = {
  matcher: '/api/:path*',
};