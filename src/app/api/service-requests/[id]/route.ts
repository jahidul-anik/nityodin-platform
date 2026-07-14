import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error } from '@/lib/api-response';
import { validateBody, requireJsonContentType } from '@/lib/middleware';
import { AppError, NotFoundError } from '@/lib/errors';
import { z } from 'zod';

const updateServiceRequestSchema = z.object({
  status: z.enum(['pending', 'accepted', 'in_progress', 'completed', 'cancelled']),
  quotedPrice: z.number().int().min(0).optional(),
  finalPrice: z.number().int().min(0).optional(),
});

type UpdateServiceRequestInput = z.infer<typeof updateServiceRequestSchema>;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const ctCheck = requireJsonContentType(request);
    if (ctCheck) return ctCheck;

    const { id } = await params;
    const body: unknown = await request.json();
    const data = validateBody<UpdateServiceRequestInput>(updateServiceRequestSchema, body);

    // Check service request exists
    const existing = await db.serviceRequest.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Service request', id);
    }

    const updateData: Record<string, unknown> = { status: data.status };
    if (data.quotedPrice !== undefined) updateData.quotedPrice = data.quotedPrice;
    if (data.finalPrice !== undefined) updateData.finalPrice = data.finalPrice;

    const serviceRequest = await db.serviceRequest.update({
      where: { id },
      data: updateData,
    });

    // Enrich with service info
    const service = await db.service.findUnique({
      where: { id: serviceRequest.serviceId },
      select: { id: true, name: true, category: true, imageUrl: true },
    });

    return success({ ...serviceRequest, service }, 'Service request updated successfully');
  } catch (err) {
    if (err instanceof AppError) {
      return error(err.message, err.statusCode, err.code, err.details);
    }

    const validationErr = err as { statusCode?: number; code?: string; message?: string; details?: unknown };
    if (validationErr.statusCode === 400) {
      return error(validationErr.message ?? 'Invalid request', 400, validationErr.code, validationErr.details);
    }

    console.error('Failed to update service request:', err);
    return error('Failed to update service request');
  }
}