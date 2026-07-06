import { NextRequest, NextResponse } from 'next/server';
import { db, demoState } from '@/lib/db';
import { demoData } from '@/lib/demo-data';

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
    console.error('[doctors] DB error, using demo fallback:', error);
    demoState.isDemoMode = true;
    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get('specialty');
    let result = demoData.doctors;
    if (specialty) {
      result = result.filter((d) => d.specialty === specialty);
    }
    return NextResponse.json(result);
  }
}