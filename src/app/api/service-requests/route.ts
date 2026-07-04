import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
    console.error('Failed to fetch service requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service requests' },
      { status: 500 }
    );
  }
}