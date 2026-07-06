import { NextRequest, NextResponse } from 'next/server';
import { db, demoState } from '@/lib/db';
import { demoData } from '@/lib/demo-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = { isActive: true };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameBn: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const products = await db.product.findMany({
      where,
      include: {
        seller: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('[products] DB error, using demo fallback:', error);
    demoState.isDemoMode = true;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    let result = demoData.products;
    if (category) {
      result = result.filter((p) => p.category === category);
    }
    return NextResponse.json(result);
  }
}