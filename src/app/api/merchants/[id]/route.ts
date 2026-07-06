import { NextRequest, NextResponse } from 'next/server';
import { db, demoState } from '@/lib/db';
import { demoData } from '@/lib/demo-data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const store = await db.store.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, avatarUrl: true, phone: true, email: true },
        },
        locations: true,
        inventoryItems: {
          orderBy: { lastSyncedAt: 'desc' },
        },
        products: {
          include: {
            reviews: {
              select: { rating: true },
            },
          },
          where: { isActive: true },
        },
        farmProducts: {
          where: { isActive: true },
          include: {
            farmer: {
              select: { id: true, name: true, city: true, avatarUrl: true },
            },
          },
        },
        services: {
          where: { isAvailable: true },
          include: {
            provider: {
              select: { id: true, name: true, avatarUrl: true, city: true },
            },
          },
        },
      },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Fetch recent orders for this store
    const recentOrders = await db.order.findMany({
      where: { sellerId: store.ownerId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: {
          select: { id: true, name: true },
        },
      },
    });

    // Compute product avg ratings
    const productsWithAvg = store.products.map((p) => {
      const totalRating = p.reviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = p.reviews.length > 0 ? totalRating / p.reviews.length : p.rating;
      const { reviews, ...rest } = p;
      return { ...rest, avgRating };
    });

    // Compute inventory stats
    const totalItems = store.inventoryItems.length;
    const posSynced = store.inventoryItems.filter((inv) => inv.syncSource === 'pos').length;
    const inventorySyncPercentage = totalItems > 0 ? (posSynced / totalItems) * 100 : 0;

    const now = new Date();
    const syncAges = store.inventoryItems.map(
      (inv) => (now.getTime() - new Date(inv.lastSyncedAt).getTime()) / (1000 * 60)
    );
    const avgSyncAgeMinutes =
      syncAges.length > 0 ? syncAges.reduce((a, b) => a + b, 0) / syncAges.length : 0;

    const LOW_STOCK_THRESHOLD = 5;
    const lowStockItems = store.inventoryItems.filter(
      (inv) => inv.stock - inv.reserved <= LOW_STOCK_THRESHOLD
    ).length;

    const liveInventoryCount = store.inventoryItems.filter(
      (inv) => inv.syncSource === 'pos' || inv.syncSource === 'api'
    ).length;

    return NextResponse.json({
      ...store,
      products: productsWithAvg,
      recentOrders,
      inventorySyncPercentage,
      avgSyncAgeMinutes,
      lowStockItems,
      liveInventoryCount,
    });
  } catch (error) {
    console.error('[merchants/:id] DB error, using demo fallback:', error);
    demoState.isDemoMode = true;
    return NextResponse.json(demoData.merchantDetail);
  }
}