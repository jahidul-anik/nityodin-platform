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

const operatingHourSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:mm format'),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:mm format'),
  isClosed: z.boolean().default(false),
});

const updateLocationSchema = z.object({
  businessName: z.string().min(1).max(200).optional(),
  category: z.string().min(1).optional(),
  subcategories: z.string().optional(),
  address: z.string().min(1).optional(),
  area: z.string().optional(),
  city: z.string().min(1).optional(),
  district: z.string().min(1).optional(),
  division: z.string().min(1).optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  phone: z.string().optional(),
  isOpen: z.boolean().optional(),
  operatingHours: z.array(operatingHourSchema).optional(),
});

// ---------------------------------------------------------------------------
// PUT /api/business-locations/manage/[id]
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();
    const data = validateBody(updateLocationSchema, body);

    const users = await db.user.findMany({ take: 1 });
    const user = users[0];
    if (!user) {
      return error('No demo user found', 404, 'NOT_FOUND');
    }

    // Verify location belongs to user
    const existing = await db.businessLocation.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundError('BusinessLocation', id);
    }
    if (existing.ownerId !== user.id) {
      throw new ValidationError('You do not have permission to update this business location');
    }

    // If operatingHours provided, replace all existing hours in a transaction
    const updated = await db.$transaction(async (tx) => {
      // If operating hours are being updated, delete old ones and create new ones
      if (data.operatingHours) {
        await tx.operatingHour.deleteMany({
          where: { locationId: id },
        });

        await tx.operatingHour.createMany({
          data: data.operatingHours.map((oh) => ({
            locationId: id,
            dayOfWeek: oh.dayOfWeek,
            openTime: oh.openTime,
            closeTime: oh.closeTime,
            isClosed: oh.isClosed,
          })),
        });
      }

      // Update the location itself
      const { operatingHours: _oh, ...locationData } = data;
      return tx.businessLocation.update({
        where: { id },
        data: locationData,
        include: {
          operatingHours: {
            orderBy: { dayOfWeek: 'asc' },
          },
          owner: {
            select: { id: true, name: true, phone: true, avatarUrl: true },
          },
        },
      });
    });

    return success(updated, 'Business location updated successfully');
  } catch (err) {
    if (err instanceof NotFoundError || err instanceof ValidationError) {
      return error(err.message, err.statusCode, err.code, err.details);
    }
    return handleApiError(err);
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/business-locations/manage/[id]
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

    // Verify location belongs to user
    const existing = await db.businessLocation.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundError('BusinessLocation', id);
    }
    if (existing.ownerId !== user.id) {
      throw new ValidationError('You do not have permission to delete this business location');
    }

    // Delete in transaction: operating hours first (cascaded by DB, but explicit is safer)
    await db.$transaction(async (tx) => {
      await tx.operatingHour.deleteMany({
        where: { locationId: id },
      });
      await tx.businessLocation.delete({
        where: { id },
      });
    });

    return noContent();
  } catch (err) {
    if (err instanceof NotFoundError || err instanceof ValidationError) {
      return error(err.message, err.statusCode, err.code, err.details);
    }
    return handleApiError(err);
  }
}