import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, created } from '@/lib/api-response';
import { handleApiError } from '@/lib/api-error-handler';
import { validateBody } from '@/lib/middleware';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const operatingHourSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string(),
  closeTime: z.string(),
  isClosed: z.boolean(),
});

const createLocationSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  category: z.string().min(1, 'Category is required'),
  subcategories: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  area: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  district: z.string().min(1, 'District is required'),
  division: z.string().min(1, 'Division is required'),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  phone: z.string().optional(),
  isOpen: z.boolean().default(true),
  operatingHours: z.array(operatingHourSchema).optional(),
});

const updateLocationSchema = z.object({
  businessName: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  subcategories: z.string().nullable().optional(),
  address: z.string().min(1).optional(),
  area: z.string().nullable().optional(),
  city: z.string().min(1).optional(),
  district: z.string().min(1).optional(),
  division: z.string().min(1).optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  phone: z.string().nullable().optional(),
  isOpen: z.boolean().optional(),
  operatingHours: z.array(operatingHourSchema).optional(),
});

// ---------------------------------------------------------------------------
// GET — list business locations for the current user (owner)
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const user = await db.user.findFirst();
    if (!user) {
      return { error: 'No users found', status: 400 } as any;
    }

    const locations = await db.businessLocation.findMany({
      where: { ownerId: user.id },
      include: {
        operatingHours: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return success(locations);
  } catch (err) {
    return handleApiError(err);
  }
}

// ---------------------------------------------------------------------------
// POST — create a new business location
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = validateBody(createLocationSchema, await request.json());

    const user = await db.user.findFirst();
    if (!user) {
      return { error: 'No users found', status: 400 } as any;
    }

    const { operatingHours, ...locationData } = body;

    const location = await db.businessLocation.create({
      data: {
        ownerId: user.id,
        ...locationData,
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        operatingHours: operatingHours
          ? {
              create: operatingHours.map((h) => ({
                dayOfWeek: h.dayOfWeek,
                openTime: h.openTime,
                closeTime: h.closeTime,
                isClosed: h.isClosed,
              })),
            }
          : undefined,
      },
      include: {
        operatingHours: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });

    return created(location, 'Location created successfully');
  } catch (err) {
    return handleApiError(err);
  }
}

// ---------------------------------------------------------------------------
// PUT — update an existing business location
// ---------------------------------------------------------------------------

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return { error: 'Location ID is required', status: 400 } as any;
    }

    const body = validateBody(updateLocationSchema, await request.json());

    const user = await db.user.findFirst();
    if (!user) {
      return { error: 'No users found', status: 400 } as any;
    }

    // Verify ownership
    const existing = await db.businessLocation.findUnique({
      where: { id, ownerId: user.id },
    });
    if (!existing) {
      return { error: 'Location not found', status: 404 } as any;
    }

    const { operatingHours, ...locationData } = body;

    // If operating hours provided, delete old ones and create new
    if (operatingHours) {
      await db.operatingHour.deleteMany({ where: { locationId: id } });
    }

    const location = await db.businessLocation.update({
      where: { id },
      data: {
        ...locationData,
        operatingHours: operatingHours
          ? {
              create: operatingHours.map((h) => ({
                dayOfWeek: h.dayOfWeek,
                openTime: h.openTime,
                closeTime: h.closeTime,
                isClosed: h.isClosed,
              })),
            }
          : undefined,
      },
      include: {
        operatingHours: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });

    return success(location, 'Location updated successfully');
  } catch (err) {
    return handleApiError(err);
  }
}

// ---------------------------------------------------------------------------
// DELETE — delete a business location
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return { error: 'Location ID is required', status: 400 } as any;
    }

    const user = await db.user.findFirst();
    if (!user) {
      return { error: 'No users found', status: 400 } as any;
    }

    // Verify ownership
    const existing = await db.businessLocation.findUnique({
      where: { id, ownerId: user.id },
    });
    if (!existing) {
      return { error: 'Location not found', status: 404 } as any;
    }

    // Operating hours are deleted via cascade
    await db.businessLocation.delete({
      where: { id },
    });

    return success(null, 'Location deleted successfully');
  } catch (err) {
    return handleApiError(err);
  }
}