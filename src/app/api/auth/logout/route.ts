import { success } from '@/lib/api-response';

export async function POST() {
  // Session clearing is handled client-side via Zustand store.
  // This endpoint exists for API symmetry and future server-side session support.
  return success({ success: true }, 200, 'Logged out successfully');
}