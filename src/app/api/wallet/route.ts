import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
    console.error('Failed to fetch wallet:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet details' },
      { status: 500 }
    );
  }
}