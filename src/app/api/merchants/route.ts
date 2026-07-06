import { NextRequest, NextResponse } from 'next/server';
import { db, demoState } from '@/lib/db';
import { demoData } from '@/lib/demo-data';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const isLive = searchParams.get('isLive');
    const isVerified = searchParams.get('isVerified');
    const sortBy = searchParams.get('sortBy');
    const city = searchParams.get('city');

    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameBn: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    if (isLive === 'true') {
      where.isLive = true;
    }

    if (isVerified === 'true') {
      where.isVerified = true;
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' } as Prisma.StringFilter;
    }

    type OrderBy = Record<string, string>;
    let orderBy: OrderBy = { createdAt: 'desc' };

    if (sortBy === 'rating') orderBy = { rating: 'desc' };
    else if (sortBy === 'sales') orderBy = { totalSales: 'desc' };
    else if (sortBy === 'name') orderBy = { name: 'asc' };

    const stores = await db.store.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, avatarUrl: true },
        },
        locations: {
          take: 3,
        },
        _count: {
          select: {
            products: true,
            farmProducts: true,
            services: true,
            inventoryItems: true,
            locations: true,
          },
        },
      },
      orderBy,
    });

    const now = new Date();
    const hour = now.getHours();

    const enriched = stores.map((store) => {
      const openLocations = store.locations.filter((loc) => loc.isOpen);
      return {
        ...store,
        isOpen: openLocations.length > 0,
        openLocationCount: openLocations.length,
        primaryLocation: store.address || (store.locations[0] ? `${store.locations[0].address}, ${store.locations[0].city}` : store.city || 'N/A'),
        itemCount: store._count.products + store._count.farmProducts + store._count.services,
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error('[merchants] DB error, using demo fallback:', error);
    demoState.isDemoMode = true;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const isLive = searchParams.get('isLive');
    const isVerified = searchParams.get('isVerified');
    const sortBy = searchParams.get('sortBy');
    const city = searchParams.get('city');

    let result = [...demoData.merchants];

    if (category) {
      result = result.filter((m) => m.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.nameBn && m.nameBn.includes(q)) ||
          (m.description && m.description.toLowerCase().includes(q)) ||
          (m.tags && m.tags.toLowerCase().includes(q))
      );
    }
    if (isLive === 'true') {
      result = result.filter((m) => m.isLive);
    }
    if (isVerified === 'true') {
      result = result.filter((m) => m.isVerified);
    }
    if (city) {
      const q = city.toLowerCase();
      result = result.filter((m) => m.city && m.city.toLowerCase().includes(q));
    }

    if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'sales') result.sort((a, b) => b.totalSales - a.totalSales);
    else if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(result);
  }
}