import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
    console.error('Failed to fetch farm products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch farm products' },
      { status: 500 }
    );
  }
}