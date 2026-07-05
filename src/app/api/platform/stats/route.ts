import { NextResponse } from 'next/server';
import { db, demoState } from '@/lib/db';
import { demoData } from '@/lib/demo-data';

export async function GET() {
  try {
    const [
      totalUsers,
      merchants,
      totalProducts,
      totalOrders,
      transactionAggregate,
      activeServices,
      doctors,
      farmProducts,
      totalLocations,
    ] = await Promise.all([
      db.user.count(),
      db.userRole.count({ where: { role: 'merchant' } }),
      db.product.count({ where: { isActive: true } }),
      db.order.count(),
      db.transaction.aggregate({ _sum: { amount: true } }),
      db.service.count({ where: { isAvailable: true } }),
      db.doctor.count({ where: { availableSlots: { gt: 0 } } }),
      db.farmProduct.count({ where: { isActive: true } }),
      db.businessLocation.count(),
    ]);

    return NextResponse.json({
      totalUsers,
      totalMerchants: merchants,
      totalProducts,
      totalOrders,
      totalTransactions: totalOrders,
      walletBalance: transactionAggregate._sum.amount ?? 0,
      activeServices,
      doctorsAvailable: doctors,
      farmProducts,
      totalLocations,
    });
  } catch (error) {
    demoState.isDemoMode = true;
    return NextResponse.json(demoData.platformStats);
  }
}