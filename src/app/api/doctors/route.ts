import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get('specialty');

    const where: Record<string, unknown> = {};
    if (specialty) {
      where.specialty = specialty;
    }

    const doctors = await db.doctor.findMany({
      where,
      orderBy: { rating: 'desc' },
    });

    return NextResponse.json(doctors);
  } catch (error) {
    console.error('Failed to fetch doctors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}