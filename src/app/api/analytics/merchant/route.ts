import { NextResponse } from 'next/server';
import { db, demoState } from '@/lib/db';
import { demoData } from '@/lib/demo-data';

export async function GET() {
  try {
    // Get demo user (should be a merchant)
    const users = await db.user.findMany({
      take: 1,
      include: { roles: true },
    });
    const user = users[0];

    // Get all orders where this user is the seller
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [
      thisMonthOrders,
      lastMonthOrders,
      allSellerOrders,
      pendingOrders,
      completedOrders,
      sellerProducts,
    ] = await Promise.all([
      // This month's orders
      user
        ? db.order.count({
            where: {
              sellerId: user.id,
              createdAt: { gte: thisMonthStart },
              status: { in: ['completed', 'delivered'] },
            },
          })
        : Promise.resolve(0),
      // Last month's orders
      user
        ? db.order.count({
            where: {
              sellerId: user.id,
              createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
              status: { in: ['completed', 'delivered'] },
            },
          })
        : Promise.resolve(0),
      // Total seller orders
      user
        ? db.order.findMany({
            where: { sellerId: user.id },
            include: {
              items: { include: { product: true } },
              buyer: { select: { id: true, name: true, avatarUrl: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          })
        : Promise.resolve([]),
      // Pending orders
      user
        ? db.order.count({
            where: { sellerId: user.id, status: 'pending' },
          })
        : Promise.resolve(0),
      // Completed orders
      user
        ? db.order.count({
            where: {
              sellerId: user.id,
              status: { in: ['completed', 'delivered'] },
            },
          })
        : Promise.resolve(0),
      // Seller's products with order item counts
      user
        ? db.product.findMany({
            where: { sellerId: user.id },
            include: {
              orders: {
                include: { product: true },
              },
            },
          })
        : Promise.resolve([]),
    ]);

    // Calculate revenue (mock enhanced with real data)
    const thisMonthRevenue = thisMonthOrders * 1250;
    const lastMonthRevenue = lastMonthOrders * 1100;
    const revenueGrowth =
      lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : thisMonthRevenue > 0
          ? 100
          : 0;

    // Top products by sold count
    const topProducts = sellerProducts
      .map((p) => ({
        name: p.name,
        sold: p.orders.reduce((sum, item) => sum + item.quantity, 0),
        revenue: p.orders.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return NextResponse.json({
      revenue: {
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
        growth: parseFloat(revenueGrowth.toFixed(1)),
      },
      orders: {
        total: pendingOrders + completedOrders,
        pending: pendingOrders,
        completed: completedOrders,
      },
      topProducts,
      recentOrders: allSellerOrders,
    });
  } catch (error) {
    demoState.isDemoMode = true;
    return NextResponse.json(demoData.merchantAnalytics);
  }
}