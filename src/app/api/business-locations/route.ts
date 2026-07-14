import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, paginated, created } from '@/lib/api-response';
import { handleApiError } from '@/lib/api-error-handler';
import { validateBody, paginationSchema, requireJsonContentType } from '@/lib/middleware';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Haversine distance formula (km)
// ---------------------------------------------------------------------------

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ---------------------------------------------------------------------------
// GET — list business locations with optional filtering & distance search
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || undefined;
    const category = searchParams.get('category') || undefined;
    const lat = searchParams.get('lat')
      ? parseFloat(searchParams.get('lat')!)
      : undefined;
    const lng = searchParams.get('lng')
      ? parseFloat(searchParams.get('lng')!)
      : undefined;
    const radius = searchParams.get('radius')
      ? parseFloat(searchParams.get('radius')!)
      : 50;

    const { page, limit } = paginationSchema.parse(
      Object.fromEntries(searchParams),
    );

    // Build where clause
    const where: Record<string, unknown> = {};
    if (city) where.city = city;
    if (category) where.category = category;

    // If lat/lng provided, only fetch locations that have coordinates
    if (lat !== undefined && lng !== undefined) {
      where.latitude = { not: null };
      where.longitude = { not: null };
    }

    const locations = await db.businessLocation.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, phone: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute distance when lat/lng are provided and filter by radius
    type LocationWithDistance = typeof locations[number] & { distance?: number };
    let enriched: LocationWithDistance[] = locations as LocationWithDistance[];

    if (lat !== undefined && lng !== undefined) {
      const filtered = locations
        .map((loc) => {
          if (loc.latitude === null || loc.longitude === null) return null;
          const distance = haversineKm(lat, lng, loc.latitude, loc.longitude);
          return { ...loc, distance: Math.round(distance * 10) / 10 };
        })
        .filter((loc): loc is NonNullable<typeof loc> => loc !== null)
        .filter((loc) => (loc.distance ?? 0) <= radius)
        .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
      enriched = filtered as LocationWithDistance[];
    }

    const total = enriched.length;
    const paginatedData = enriched.slice((page - 1) * limit, page * limit);

    return paginated(paginatedData, page, limit, total);
  } catch (err) {
    return handleApiError(err);
  }
}

// ---------------------------------------------------------------------------
// POST — create a new business location (merchant)
// ---------------------------------------------------------------------------

const createLocationSchema = z.object({
  businessName: z.string().min(1).max(200),
  category: z.string().min(1),
  subcategories: z.string().optional(),
  address: z.string().min(1),
  area: z.string().optional(),
  city: z.string().min(1),
  district: z.string().min(1),
  division: z.string().min(1),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ctCheck = requireJsonContentType(request);
    if (ctCheck) return ctCheck;

    const body = validateBody(createLocationSchema, await request.json());

    // Use first user as owner for demo (no real auth)
    const owner = await db.user.findFirst();
    if (!owner) {
      return { error: 'No users found', status: 400 } as any;
    }

    const location = await db.businessLocation.create({
      data: {
        ownerId: owner.id,
        businessName: body.businessName,
        category: body.category,
        subcategories: body.subcategories,
        address: body.address,
        area: body.area,
        city: body.city,
        district: body.district,
        division: body.division,
        latitude: body.latitude,
        longitude: body.longitude,
        phone: body.phone,
      },
      include: {
        owner: {
          select: { id: true, name: true, phone: true, avatarUrl: true },
        },
      },
    });

    return created(location);
  } catch (err) {
    return handleApiError(err);
  }
}