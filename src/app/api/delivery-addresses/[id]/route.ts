import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error, noContent } from '@/lib/api-response';
import { validateBody } from '@/lib/middleware';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { handleApiError } from '@/lib/api-error-handler';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const updateAddressSchema = z.object({
  label: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  area: z.string().optional(),
  city: z.string().min(1).optional(),
  district: z.string().min(1).optional(),
  division: z.string().min(1).optional(),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// PUT /api/delivery-addresses/[id]
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();
    const data = validateBody(updateAddressSchema, body);

    const users = await db.user.findMany({ take: 1 });
    const user = users[0];
    if (!user) {
      return error('No demo user found', 404, 'NOT_FOUND');
    }

    // Verify address belongs to user
    const existing = await db.deliveryAddress.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundError('DeliveryAddress', id);
    }
    if (existing.userId !== user.id) {
      throw new ValidationError('You do not have permission to update this address');
    }

    // If setting as default, unset others first
    if (data.isDefault) {
      await db.deliveryAddress.updateMany({
        where: { userId: user.id, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const updated = await db.deliveryAddress.update({
      where: { id },
      data: {
        label: data.label,
        address: data.address,
        area: data.area,
        city: data.city,
        district: data.district,
        division: data.division,
        phone: data.phone,
        isDefault: data.isDefault,
      },
    });

    return success(updated, 'Delivery address updated successfully');
  } catch (err) {
    if (err instanceof NotFoundError || err instanceof ValidationError) {
      return error(err.message, err.statusCode, err.code, err.details);
    }
    return handleApiError(err);
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/delivery-addresses/[id]
// ---------------------------------------------------------------------------

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const users = await db.user.findMany({ take: 1 });
    const user = users[0];
    if (!user) {
      return error('No demo user found', 404, 'NOT_FOUND');
    }

    // Verify address belongs to user
    const existing = await db.deliveryAddress.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundError('DeliveryAddress', id);
    }
    if (existing.userId !== user.id) {
      throw new ValidationError('You do not have permission to delete this address');
    }

    await db.deliveryAddress.delete({
      where: { id },
    });

    return noContent();
  } catch (err) {
    if (err instanceof NotFoundError || err instanceof ValidationError) {
      return error(err.message, err.statusCode, err.code, err.details);
    }
    return handleApiError(err);
  }
}