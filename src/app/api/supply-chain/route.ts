import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/supply-chain?farmProductId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const farmProductId = searchParams.get('farmProductId');

    if (!farmProductId) {
      return NextResponse.json({ error: 'farmProductId is required' }, { status: 400 });
    }

    const records = await db.supplyChainRecord.findMany({
      where: { farmProductId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error('Failed to fetch supply chain records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supply chain records' },
      { status: 500 }
    );
  }
}

// POST /api/supply-chain — create a new supply chain record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { farmProductId, stage, location, handledBy, temperature, notes, fairPriceIndicator, certifiedBy } = body;

    if (!farmProductId || !stage || !location) {
      return NextResponse.json(
        { error: 'farmProductId, stage, and location are required' },
        { status: 400 }
      );
    }

    const validStages = ['planted', 'harvested', 'inspected', 'transported', 'delivered'];
    if (!validStages.includes(stage)) {
      return NextResponse.json(
        { error: `Invalid stage. Must be one of: ${validStages.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify the farm product exists
    const farmProduct = await db.farmProduct.findUnique({
      where: { id: farmProductId },
    });

    if (!farmProduct) {
      return NextResponse.json({ error: 'Farm product not found' }, { status: 404 });
    }

    const record = await db.supplyChainRecord.create({
      data: {
        farmProductId,
        stage,
        location: location.trim(),
        handledBy: handledBy?.trim() || null,
        temperature: temperature?.trim() || null,
        notes: notes?.trim() || null,
        fairPriceIndicator: fairPriceIndicator ?? null,
        certifiedBy: certifiedBy?.trim() || null,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Failed to create supply chain record:', error);
    return NextResponse.json(
      { error: 'Failed to create supply chain record' },
      { status: 500 }
    );
  }
}