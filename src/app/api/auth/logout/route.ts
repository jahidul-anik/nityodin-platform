import { NextRequest } from 'next/server';
import { success } from '@/lib/api-response';
import { requireJsonContentType } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  const ctCheck = requireJsonContentType(request);
  if (ctCheck) return ctCheck;

  // Session clearing is handled client-side via Zustand store.
  // This endpoint exists for API symmetry and future server-side session support.
  return success({ success: true }, 200, 'Logged out successfully');
}