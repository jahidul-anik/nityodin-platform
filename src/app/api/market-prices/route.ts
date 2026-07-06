import { NextResponse } from 'next/server';
import { db, demoState } from '@/lib/db';
import { demoData } from '@/lib/demo-data';

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
    console.error('[market-prices] DB error, using demo fallback:', error);
    demoState.isDemoMode = true;
    return NextResponse.json(demoData.marketPrices);
  }
}