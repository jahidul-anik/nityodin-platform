import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/market-prices/trends?commodity=Rice&days=30
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commodity = searchParams.get('commodity') || 'Rice';
    const days = parseInt(searchParams.get('days') || '30', 10);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    const prices = await db.marketPrice.findMany({
      where: {
        commodity: { contains: commodity },
        date: { gte: cutoffStr },
      },
      orderBy: { date: 'asc' },
    });

    if (prices.length === 0) {
      return NextResponse.json({
        commodity,
        days,
        data: [],
        avg: 0,
        min: 0,
        max: 0,
        trend: 'stable' as const,
        volatility: 0,
      });
    }

    // Convert paisa to BDT for analysis
    const bdtPrices = prices.map((p) => p.price / 100);

    const avg = bdtPrices.reduce((s, p) => s + p, 0) / bdtPrices.length;
    const min = Math.min(...bdtPrices);
    const max = Math.max(...bdtPrices);

    // Calculate standard deviation for volatility
    const variance = bdtPrices.reduce((s, p) => s + (p - avg) ** 2, 0) / bdtPrices.length;
    const stdDev = Math.sqrt(variance);
    const volatility = avg > 0 ? (stdDev / avg) * 100 : 0;

    // Determine trend by comparing first half avg vs second half avg
    const mid = Math.floor(bdtPrices.length / 2);
    const firstHalfAvg =
      bdtPrices.slice(0, mid).reduce((s, p) => s + p, 0) / Math.max(mid, 1);
    const secondHalfAvg =
      bdtPrices.slice(mid).reduce((s, p) => s + p, 0) / Math.max(bdtPrices.length - mid, 1);

    const diff = secondHalfAvg - firstHalfAvg;
    const threshold = avg * 0.02; // 2% threshold
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (diff > threshold) trend = 'up';
    else if (diff < -threshold) trend = 'down';

    // Group by date, taking the latest price per day
    const byDate = new Map<string, number>();
    for (const p of prices) {
      const bdt = p.price / 100;
      byDate.set(p.date, bdt);
    }

    const data = Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, price]) => ({ date, price }));

    return NextResponse.json({
      commodity,
      days,
      data,
      avg: Math.round(avg * 100) / 100,
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      trend,
      volatility: Math.round(volatility * 10) / 10,
    });
  } catch (error) {
    console.error('Failed to fetch price trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price trends' },
      { status: 500 }
    );
  }
}