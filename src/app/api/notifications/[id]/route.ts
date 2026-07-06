import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error } from '@/lib/api-response';
import { handleApiError } from '@/lib/api-error-handler';

// ---------------------------------------------------------------------------
// PATCH /api/notifications/[id] — mark a notification as read
// ---------------------------------------------------------------------------

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (id === 'bulk-read') {
      return error('Use POST /api/notifications/bulk-read instead', 400, 'BAD_REQUEST');
    }

    const body: unknown = await request.json();
    const { isRead } = body as { isRead?: boolean };

    const notification = await db.notification.update({
      where: { id },
      data: { isRead: isRead !== false }, // defaults to true if not specified
    });

    return success(notification);
  } catch (err) {
    return handleApiError(err);
  }
}