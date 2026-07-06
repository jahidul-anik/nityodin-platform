import { NextResponse } from 'next/server';
import { db, demoState } from '@/lib/db';
import { demoData } from '@/lib/demo-data';

export async function GET() {
  try {
    const users = await db.user.findMany({ take: 1 });
    const user = users[0];
    if (!user) {
      return NextResponse.json({ error: 'No demo user found' }, { status: 404 });
    }

    const serviceRequests = await db.serviceRequest.findMany({
      where: {
        OR: [
          { customerId: user.id },
          { providerId: user.id },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch services separately to avoid include type issue
    const enriched = await Promise.all(
      serviceRequests.map(async (req) => {
        const service = await db.service.findUnique({
          where: { id: req.serviceId },
          select: { id: true, name: true, category: true, imageUrl: true },
        });
        return { ...req, service };
      })
    );

    return NextResponse.json(enriched);
  } catch (error) {
    console.error('[service-requests] DB error, using demo fallback:', error);
    demoState.isDemoMode = true;
    return NextResponse.json(demoData.serviceRequests);
  }
}