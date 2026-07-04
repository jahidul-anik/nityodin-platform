import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];

    const marketPrices = await db.marketPrice.findMany({
      where: { date: today },
      orderBy: { commodity: 'asc' },
    });

    // If no prices for today, return the most recent data
    if (marketPrices.length === 0) {
      const latestPrices = await db.marketPrice.findMany({
        orderBy: { date: 'desc' },
        take: 50,
      });
      return NextResponse.json(latestPrices);
    }

    return NextResponse.json(marketPrices);
  } catch (error) {
    console.error('Failed to fetch market prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market prices' },
      { status: 500 }
    );
  }
}