import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: Record<string, unknown> = {};
    if (category) {
      where.category = category;
    }

    const locations = await db.businessLocation.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { rating: 'desc' },
    });

    // Add mock distance for demo
    const locationsWithDistance = locations.map((loc, index) => ({
      ...loc,
      distance: parseFloat((0.5 + Math.random() * 4.5).toFixed(1)),
      distanceText: `${(0.5 + (index * 0.7) % 4.5).toFixed(1)} km`,
    }));

    return NextResponse.json(locationsWithDistance);
  } catch (error) {
    console.error('Failed to fetch business locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business locations' },
      { status: 500 }
    );
  }
}