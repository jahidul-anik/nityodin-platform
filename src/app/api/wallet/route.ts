import { NextResponse } from 'next/server';
import { db, demoState } from '@/lib/db';
import { demoData } from '@/lib/demo-data';

export async function GET() {
  try {
    const users = await db.user.findMany({
      take: 1,
      include: {
        wallet: {
          include: {
            transactions: {
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          },
        },
      },
    });

    const user = users[0];
    if (!user) {
      return NextResponse.json({ error: 'No demo user found' }, { status: 404 });
    }

    if (!user.wallet) {
      return NextResponse.json({
        balance: 0,
        isFrozen: false,
        transactions: [],
      });
    }

    return NextResponse.json({
      id: user.wallet.id,
      balance: user.wallet.balance,
      isFrozen: user.wallet.isFrozen,
      transactions: user.wallet.transactions,
    });
  } catch (error) {
    console.error('[wallet] DB error, using demo fallback:', error);
    demoState.isDemoMode = true;
    return NextResponse.json(demoData.wallet);
  }
}