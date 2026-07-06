import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error, noContent } from '@/lib/api-response';
import { validateBody } from '@/lib/middleware';
import { AppError, NotFoundError, ForbiddenError, ValidationError } from '@/lib/errors';
import { z } from 'zod';

const updateFarmProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  nameBn: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  price: z.number().int().min(1).optional(),
  unit: z.string().optional(),
  category: z.string().min(1).optional(),
  imageUrl: z.string().optional(),
  quantity: z.number().min(0).optional(),
  origin: z.string().optional(),
  isOrganic: z.boolean().optional(),
  harvestDate: z.string().optional(),
  isActive: z.boolean().optional(),
});

type UpdateFarmProductInput = z.infer<typeof updateFarmProductSchema>;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const farmProduct = await db.farmProduct.findUnique({
      where: { id },
      include: {
        farmer: {
          select: { id: true, name: true, city: true, avatarUrl: true },
        },
      },
    });

    if (!farmProduct) {
      throw new NotFoundError('Farm product', id);
    }

    return success(farmProduct);
  } catch (err) {
    if (err instanceof AppError) {
      return error(err.message, err.statusCode, err.code);
    }

    console.error('Failed to fetch farm product:', err);
    return error('Failed to fetch farm product');
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();
    const data = validateBody<UpdateFarmProductInput>(updateFarmProductSchema, body);

    // Get demo user
    const users = await db.user.findMany({ take: 1 });
    const currentUser = users[0];
    if (!currentUser) return error('No demo user found', 404, 'NOT_FOUND');

    // Check farm product exists and belongs to current user
    const existing = await db.farmProduct.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Farm product', id);
    }

    if (existing.farmerId !== currentUser.id) {
      throw new ForbiddenError('You can only update your own farm products');
    }

    // Filter out undefined fields
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.nameBn !== undefined) updateData.nameBn = data.nameBn;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.origin !== undefined) updateData.origin = data.origin;
    if (data.isOrganic !== undefined) updateData.isOrganic = data.isOrganic;
    if (data.harvestDate !== undefined) updateData.harvestDate = data.harvestDate;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const farmProduct = await db.farmProduct.update({
      where: { id },
      data: updateData,
      include: {
        farmer: {
          select: { id: true, name: true, city: true, avatarUrl: true },
        },
      },
    });

    return success(farmProduct, 'Farm product updated successfully');
  } catch (err) {
    if (err instanceof AppError) {
      return error(err.message, err.statusCode, err.code, err.details);
    }

    const validationErr = err as { statusCode?: number; code?: string; message?: string; details?: unknown };
    if (validationErr.statusCode === 400) {
      return error(validationErr.message ?? 'Invalid request', 400, validationErr.code, validationErr.details);
    }

    console.error('Failed to update farm product:', err);
    return error('Failed to update farm product');
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Get demo user
    const users = await db.user.findMany({ take: 1 });
    const currentUser = users[0];
    if (!currentUser) return error('No demo user found', 404, 'NOT_FOUND');

    // Check farm product exists and belongs to current user
    const existing = await db.farmProduct.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Farm product', id);
    }

    if (existing.farmerId !== currentUser.id) {
      throw new ForbiddenError('You can only delete your own farm products');
    }

    // Soft delete
    await db.farmProduct.update({
      where: { id },
      data: { isActive: false },
    });

    return success({ id, deleted: true }, 'Farm product deleted successfully');
  } catch (err) {
    if (err instanceof AppError) {
      return error(err.message, err.statusCode, err.code);
    }

    console.error('Failed to delete farm product:', err);
    return error('Failed to delete farm product');
  }
}