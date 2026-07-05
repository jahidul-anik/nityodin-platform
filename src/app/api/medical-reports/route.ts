import { NextResponse } from 'next/server';
import { db, demoState } from '@/lib/db';
import { demoData } from '@/lib/demo-data';

export async function GET() {
  try {
    // Get demo user
    const users = await db.user.findMany({ take: 1 });
    const user = users[0];
    if (!user) {
      return NextResponse.json({ error: 'No demo user found' }, { status: 404 });
    }

    const reports = await db.medicalReport.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reports);
  } catch (error) {
    demoState.isDemoMode = true;
    return NextResponse.json(demoData.medicalReports);
  }
}