import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error } from '@/lib/api-response';
import { validateBody, requireJsonContentType } from '@/lib/middleware';
import { AppError, NotFoundError } from '@/lib/errors';
import { z } from 'zod';

const updateOrderSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'delivered', 'completed', 'cancelled']),
  paymentStatus: z.enum(['pending', 'paid', 'refunded']).optional(),
});

type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id },
      include: {
        buyer: {
          select: { id: true, name: true, avatarUrl: true },
        },
        seller: {
          select: { id: true, name: true, avatarUrl: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, imageUrl: true, price: true },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError('Order', id);
    }

    return success(order);
  } catch (err) {
    if (err instanceof AppError) {
      return error(err.message, err.statusCode, err.code);
    }

    console.error('Failed to fetch order:', err);
    return error('Failed to fetch order');
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const ctCheck = requireJsonContentType(request);
    if (ctCheck) return ctCheck;

    const { id } = await params;
    const body: unknown = await request.json();
    const data = validateBody<UpdateOrderInput>(updateOrderSchema, body);

    // Check order exists
    const existing = await db.order.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Order', id);
    }

    const updateData: Record<string, unknown> = { status: data.status };
    if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus;

    const order = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        buyer: {
          select: { id: true, name: true, avatarUrl: true },
        },
        seller: {
          select: { id: true, name: true, avatarUrl: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, imageUrl: true, price: true },
            },
          },
        },
      },
    });

    return success(order, 'Order updated successfully');
  } catch (err) {
    if (err instanceof AppError) {
      return error(err.message, err.statusCode, err.code, err.details);
    }

    const validationErr = err as { statusCode?: number; code?: string; message?: string; details?: unknown };
    if (validationErr.statusCode === 400) {
      return error(validationErr.message ?? 'Invalid request', 400, validationErr.code, validationErr.details);
    }

    console.error('Failed to update order:', err);
    return error('Failed to update order');
  }
}