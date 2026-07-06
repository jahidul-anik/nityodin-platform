import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error, noContent } from '@/lib/api-response';
import { validateBody } from '@/lib/middleware';
import { AppError, NotFoundError, ValidationError, ForbiddenError } from '@/lib/errors';
import { z } from 'zod';

const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  nameBn: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  price: z.number().int().min(1).optional(),
  category: z.string().min(1).optional(),
  subcategory: z.string().optional(),
  imageUrl: z.string().optional(),
  stock: z.number().int().min(0).optional(),
  unit: z.string().optional(),
  isActive: z.boolean().optional(),
});

type UpdateProductInput = z.infer<typeof updateProductSchema>;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const product = await db.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: { id: true, name: true, avatarUrl: true, city: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundError('Product', id);
    }

    return success(product);
  } catch (err) {
    if (err instanceof AppError) {
      return error(err.message, err.statusCode, err.code);
    }

    console.error('Failed to fetch product:', err);
    return error('Failed to fetch product');
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();
    const data = validateBody<UpdateProductInput>(updateProductSchema, body);

    // Get demo user
    const users = await db.user.findMany({ take: 1 });
    const currentUser = users[0];
    if (!currentUser) return error('No demo user found', 404, 'NOT_FOUND');

    // Check product exists and belongs to current user
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Product', id);
    }

    if (existing.sellerId !== currentUser.id) {
      throw new ForbiddenError('You can only update your own products');
    }

    // Filter out undefined fields for the update
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.nameBn !== undefined) updateData.nameBn = data.nameBn;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.subcategory !== undefined) updateData.subcategory = data.subcategory;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const product = await db.product.update({
      where: { id },
      data: updateData,
      include: {
        seller: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    return success(product, 'Product updated successfully');
  } catch (err) {
    if (err instanceof AppError) {
      return error(err.message, err.statusCode, err.code, err.details);
    }

    const validationErr = err as { statusCode?: number; code?: string; message?: string; details?: unknown };
    if (validationErr.statusCode === 400) {
      return error(validationErr.message ?? 'Invalid request', 400, validationErr.code, validationErr.details);
    }

    console.error('Failed to update product:', err);
    return error('Failed to update product');
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Get demo user
    const users = await db.user.findMany({ take: 1 });
    const currentUser = users[0];
    if (!currentUser) return error('No demo user found', 404, 'NOT_FOUND');

    // Check product exists and belongs to current user
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Product', id);
    }

    if (existing.sellerId !== currentUser.id) {
      throw new ForbiddenError('You can only delete your own products');
    }

    // Soft delete
    await db.product.update({
      where: { id },
      data: { isActive: false },
    });

    return success({ id, deleted: true }, 'Product deleted successfully');
  } catch (err) {
    if (err instanceof AppError) {
      return error(err.message, err.statusCode, err.code);
    }

    console.error('Failed to delete product:', err);
    return error('Failed to delete product');
  }
}