import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error, created } from '@/lib/api-response';
import { validateBody } from '@/lib/middleware';
import { handleApiError } from '@/lib/api-error-handler';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get the demo user (same as auth verify — phone-based lookup). */
async function getDemoUser() {
  return db.user.findFirst({ where: { phone: '+8801712345678' } })
    ?? db.user.findFirst();
}

/** Emit an event to the realtime service (fire-and-forget). */
function emitToRealtime(event: string, userId: string, data: Record<string, unknown>) {
  fetch(`/api/emit?XTransformPort=3003`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, userId, data }),
  }).catch(() => {
    // Fire-and-forget — never block the caller
  });
}

// ---------------------------------------------------------------------------
// GET /api/notifications — fetch notifications for the current user
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const user = await getDemoUser();
    if (!user) return error('No demo user found', 404, 'NOT_FOUND');

    const notifications = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return success(notifications);
  } catch (err) {
    return handleApiError(err);
  }
}

// ---------------------------------------------------------------------------
// POST /api/notifications — create a notification (used internally by other APIs)
// ---------------------------------------------------------------------------

const createNotificationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  type: z.enum(['order', 'wallet', 'appointment', 'service', 'system']),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  data: z.record(z.string(), z.unknown()).optional(),
});

type CreateNotificationInput = z.infer<typeof createNotificationSchema>;

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const input = validateBody<CreateNotificationInput>(createNotificationSchema, body);

    const notification = await db.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        data: input.data ? JSON.stringify(input.data) : null,
      },
    });

    // Emit via WebSocket — fire-and-forget
    emitToRealtime('notification:new', input.userId, {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: false,
      createdAt: notification.createdAt.toISOString(),
    });

    return created(notification, 'Notification created');
  } catch (err) {
    return handleApiError(err);
  }
}