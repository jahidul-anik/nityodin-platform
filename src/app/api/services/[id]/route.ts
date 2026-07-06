import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error } from '@/lib/api-response';
import { validateBody } from '@/lib/middleware';
import { AppError, NotFoundError } from '@/lib/errors';
import { z } from 'zod';

const updateServiceSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  nameBn: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  category: z.string().min(1).optional(),
  subcategory: z.string().optional(),
  priceType: z.enum(['fixed', 'hourly']).optional(),
  basePrice: z.number().int().min(0).nullable().optional(),
  imageUrl: z.string().optional(),
  serviceType: z.string().optional(),
  isAvailable: z.boolean().optional(),
});

type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const service = await db.service.findUnique({
      where: { id },
      include: {
        provider: {
          select: { id: true, name: true, avatarUrl: true, city: true },
        },
      },
    });

    if (!service) {
      throw new NotFoundError('Service', id);
    }

    return success(service);
  } catch (err) {
    if (err instanceof AppError) {
      return error(err.message, err.statusCode, err.code, err.details);
    }
    console.error('Failed to fetch service:', err);
    return error('Failed to fetch service');
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();
    const data = validateBody<UpdateServiceInput>(updateServiceSchema, body);

    const existing = await db.service.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Service', id);
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.nameBn !== undefined) updateData.nameBn = data.nameBn;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.subcategory !== undefined) updateData.subcategory = data.subcategory;
    if (data.priceType !== undefined) updateData.priceType = data.priceType;
    if (data.basePrice !== undefined) updateData.basePrice = data.basePrice;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.serviceType !== undefined) updateData.serviceType = data.serviceType;
    if (data.isAvailable !== undefined) updateData.isAvailable = data.isAvailable;

    const service = await db.service.update({
      where: { id },
      data: updateData,
      include: {
        provider: {
          select: { id: true, name: true, avatarUrl: true, city: true },
        },
      },
    });

    return success(service, 'Service updated successfully');
  } catch (err) {
    if (err instanceof AppError) {
      return error(err.message, err.statusCode, err.code, err.details);
    }

    const validationErr = err as { statusCode?: number; code?: string; message?: string; details?: unknown };
    if (validationErr.statusCode === 400) {
      return error(validationErr.message ?? 'Invalid request', 400, validationErr.code, validationErr.details);
    }

    console.error('Failed to update service:', err);
    return error('Failed to update service');
  }
}