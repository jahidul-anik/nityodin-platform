import { NextRequest, NextResponse } from 'next/server';
import { db, demoState } from '@/lib/db';
import { demoData } from '@/lib/demo-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: Record<string, unknown> = { isAvailable: true };

    if (category) {
      where.category = category;
    }

    const services = await db.service.findMany({
      where,
      include: {
        provider: {
          select: { id: true, name: true, avatarUrl: true, city: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('[services] DB error, using demo fallback:', error);
    demoState.isDemoMode = true;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    let result = demoData.services;
    if (category) {
      result = result.filter((s) => s.category === category);
    }
    return NextResponse.json(result);
  }
}