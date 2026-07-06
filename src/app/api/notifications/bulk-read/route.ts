import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error } from '@/lib/api-response';
import { validateBody } from '@/lib/middleware';
import { handleApiError } from '@/lib/api-error-handler';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// PATCH /api/notifications/bulk-read — mark all notifications as read
// ---------------------------------------------------------------------------

const bulkReadSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export async function PATCH(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const { userId } = validateBody<{ userId: string }>(bulkReadSchema, body);

    const result = await db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return success({ updated: result.count }, 'All notifications marked as read');
  } catch (err) {
    return handleApiError(err);
  }
}