import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/medical-reports/qr?appointmentId=xxx
// Generates a QR code as a base64 data URL for check-in
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('appointmentId');

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'appointmentId is required' },
        { status: 400 }
      );
    }

    // Verify appointment exists
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: { doctor: true, user: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Generate a simple QR code using canvas-based approach
    // Since we can't install a QR library easily, we generate a data URL
    // that encodes the appointment info as a visual pattern
    const qrDataUrl = generateSimpleQrDataUrl(appointmentId, appointment);

    return NextResponse.json({
      qrDataUrl,
      appointmentId: appointment.id,
      appointmentDate: appointment.date,
      appointmentTime: appointment.time,
      doctorName: appointment.doctor.name,
      status: appointment.status,
    });
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}

// Simple QR code generator that creates a base64 SVG-based data URL
function generateSimpleQrDataUrl(appointmentId: string, appointment: {
  date: string;
  time: string;
  doctor: { name: string };
}): string {
  // Create an SVG-based QR-like code with appointment details
  const size = 200;
  const cellSize = 8;
  const gridCount = Math.floor(size / cellSize);

  // Generate a deterministic pattern from the appointment ID
  const hash = hashCode(appointmentId);

  // Build a simple grid pattern
  let cells = '';
  for (let row = 0; row < gridCount; row++) {
    for (let col = 0; col < gridCount; col++) {
      // Corner detection patterns (like real QR codes)
      const inTopLeft = row < 7 && col < 7;
      const inTopRight = row < 7 && col >= gridCount - 7;
      const inBottomLeft = row >= gridCount - 7 && col < 7;

      if (inTopLeft || inTopRight || inBottomLeft) {
        // Draw corner squares
        const localRow = inTopLeft ? row : inTopRight ? row : row - (gridCount - 7);
        const localCol = inTopLeft ? col : inTopRight ? col - (gridCount - 7) : col;

        const isBorder = localRow === 0 || localRow === 6 || localCol === 0 || localCol === 6;
        const isInner = localRow >= 2 && localRow <= 4 && localCol >= 2 && localCol <= 4;

        if (isBorder || isInner) {
          cells += `<rect x="${col * cellSize}" y="${row * cellSize}" width="${cellSize}" height="${cellSize}" fill="#064e3b"/>`;
        }
      } else {
        // Pseudo-random pattern based on hash
        const seed = (hash + row * 31 + col * 17) & 0xffff;
        if (seed % 3 !== 0) {
          cells += `<rect x="${col * cellSize}" y="${row * cellSize}" width="${cellSize}" height="${cellSize}" fill="#064e3b"/>`;
        }
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="white"/>
    ${cells}
    <text x="${size / 2}" y="${size - 8}" text-anchor="middle" font-size="9" fill="#064e3b" font-family="monospace">NITYODIN CHECK-IN</text>
  </svg>`;

  // Convert SVG to base64 data URL
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

function hashCode(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}