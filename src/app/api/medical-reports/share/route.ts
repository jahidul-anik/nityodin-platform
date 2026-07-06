import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// In-memory store for active shares (since the schema only has single share fields on MedicalReport)
// This extends the schema functionality to support multiple active shares
const activeShares: Array<{
  id: string;
  reportId: string;
  doctorId: string;
  doctorName: string;
  reportTitle: string;
  sharedUntil: string;
  createdAt: string;
}> = [];

// GET /api/medical-reports/share — list active shares
export async function GET() {
  try {
    // Filter out expired shares
    const now = new Date().toISOString();
    const validShares = activeShares.filter((s) => s.sharedUntil > now);

    return NextResponse.json(validShares);
  } catch (error) {
    console.error('Failed to fetch active shares:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active shares' },
      { status: 500 }
    );
  }
}

// POST /api/medical-reports/share — share a report with a doctor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId, doctorId, expiryHours } = body;

    if (!reportId || !doctorId || !expiryHours) {
      return NextResponse.json(
        { error: 'reportId, doctorId, and expiryHours are required' },
        { status: 400 }
      );
    }

    const hours = parseInt(expiryHours, 10);
    if (isNaN(hours) || hours < 1) {
      return NextResponse.json(
        { error: 'expiryHours must be a positive number' },
        { status: 400 }
      );
    }

    // Verify report exists
    const report = await db.medicalReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Verify doctor exists
    const doctor = await db.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    // Calculate expiry
    const sharedUntil = new Date();
    sharedUntil.setHours(sharedUntil.getHours() + hours);

    // Create share entry
    const share = {
      id: `share_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      reportId,
      doctorId,
      doctorName: doctor.name,
      reportTitle: report.title,
      sharedUntil: sharedUntil.toISOString(),
      createdAt: new Date().toISOString(),
    };

    activeShares.push(share);

    // Also update the report's isShared flag
    await db.medicalReport.update({
      where: { id: reportId },
      data: {
        isShared: true,
        sharedWithId: doctorId,
        sharedUntil: sharedUntil.toISOString(),
      },
    });

    return NextResponse.json(share, { status: 201 });
  } catch (error) {
    console.error('Failed to share report:', error);
    return NextResponse.json(
      { error: 'Failed to share report' },
      { status: 500 }
    );
  }
}

// DELETE /api/medical-reports/share — revoke access
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { shareId } = body;

    if (!shareId) {
      return NextResponse.json(
        { error: 'shareId is required' },
        { status: 400 }
      );
    }

    const index = activeShares.findIndex((s) => s.id === shareId);
    if (index === -1) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    const removed = activeShares.splice(index, 1)[0];

    // If no more active shares for this report, update isShared
    const stillShared = activeShares.some((s) => s.reportId === removed.reportId);
    if (!stillShared) {
      await db.medicalReport.update({
        where: { id: removed.reportId },
        data: {
          isShared: false,
          sharedWithId: null,
          sharedUntil: null,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to revoke share:', error);
    return NextResponse.json(
      { error: 'Failed to revoke share' },
      { status: 500 }
    );
  }
}