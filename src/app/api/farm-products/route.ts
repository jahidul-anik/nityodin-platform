import { NextResponse } from 'next/server';
import { db, demoState } from '@/lib/db';
import { demoData } from '@/lib/demo-data';

export async function GET() {
  try {
    const farmProducts = await db.farmProduct.findMany({
      where: { isActive: true },
      include: {
        farmer: {
          select: { id: true, name: true, city: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(farmProducts);
  } catch (error) {
    console.error('[farm-products] DB error, using demo fallback:', error);
    demoState.isDemoMode = true;
    return NextResponse.json(demoData.farmProducts);
  }
}