import { NextRequest, NextResponse } from 'next/server';
import { db, demoState } from '@/lib/db';
import { demoData } from '@/lib/demo-data';

export async function GET(request: NextRequest) {
  try {
    // Get demo user
    const users = await db.user.findMany({ take: 1 });
    const user = users[0];
    if (!user) {
      return NextResponse.json({ error: 'No demo user found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: Record<string, unknown> = { buyerId: user.id };
    if (status) {
      where.status = status;
    }

    const orders = await db.order.findMany({
      where,
      include: {
        seller: {
          select: { id: true, name: true, avatarUrl: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, imageUrl: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    demoState.isDemoMode = true;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    let result = demoData.orders;
    if (status) {
      result = result.filter((o) => o.status === status);
    }
    return NextResponse.json(result);
  }
}