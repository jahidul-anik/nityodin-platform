import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, created, noContent } from '@/lib/api-response';
import { handleApiError } from '@/lib/api-error-handler';
import { validateBody } from '@/lib/middleware';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const createAddressSchema = z.object({
  label: z.enum(['home', 'work', 'other']).default('home'),
  address: z.string().min(1, 'Address is required'),
  area: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  district: z.string().min(1, 'District is required'),
  division: z.string().min(1, 'Division is required'),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false),
});

// ---------------------------------------------------------------------------
// GET — list all delivery addresses for a user
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const user = await db.user.findFirst();
    if (!user) {
      return { error: 'No users found', status: 400 } as any;
    }

    const addresses = await db.deliveryAddress.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return success(addresses);
  } catch (err) {
    return handleApiError(err);
  }
}

// ---------------------------------------------------------------------------
// POST — create a new delivery address
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = validateBody(createAddressSchema, await request.json());

    const user = await db.user.findFirst();
    if (!user) {
      return { error: 'No users found', status: 400 } as any;
    }

    // If setting as default, unset all other defaults first
    if (body.isDefault) {
      await db.deliveryAddress.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await db.deliveryAddress.create({
      data: {
        userId: user.id,
        label: body.label,
        address: body.address,
        area: body.area,
        city: body.city,
        district: body.district,
        division: body.division,
        phone: body.phone,
        isDefault: body.isDefault,
      },
    });

    return created(address, 'Address added successfully');
  } catch (err) {
    return handleApiError(err);
  }
}

// ---------------------------------------------------------------------------
// PUT — update an existing delivery address
// ---------------------------------------------------------------------------

const updateAddressSchema = z.object({
  label: z.enum(['home', 'work', 'other']).optional(),
  address: z.string().min(1).optional(),
  area: z.string().optional().nullable(),
  city: z.string().min(1).optional(),
  district: z.string().min(1).optional(),
  division: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return { error: 'Address ID is required', status: 400 } as any;
    }

    const body = validateBody(updateAddressSchema, await request.json());

    const user = await db.user.findFirst();
    if (!user) {
      return { error: 'No users found', status: 400 } as any;
    }

    // If setting as default, unset all other defaults first
    if (body.isDefault) {
      await db.deliveryAddress.updateMany({
        where: { userId: user.id, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const address = await db.deliveryAddress.update({
      where: { id, userId: user.id },
      data: body,
    });

    return success(address, 'Address updated successfully');
  } catch (err) {
    return handleApiError(err);
  }
}

// ---------------------------------------------------------------------------
// DELETE — delete a delivery address
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return { error: 'Address ID is required', status: 400 } as any;
    }

    const user = await db.user.findFirst();
    if (!user) {
      return { error: 'No users found', status: 400 } as any;
    }

    const wasDefault = await db.deliveryAddress.findUnique({
      where: { id, userId: user.id },
      select: { isDefault: true },
    });

    await db.deliveryAddress.delete({
      where: { id, userId: user.id },
    });

    // If deleted address was default, set the most recent as default
    if (wasDefault?.isDefault) {
      const nextDefault = await db.deliveryAddress.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });
      if (nextDefault) {
        await db.deliveryAddress.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        });
      }
    }

    return success(null, 'Address deleted successfully');
  } catch (err) {
    return handleApiError(err);
  }
}