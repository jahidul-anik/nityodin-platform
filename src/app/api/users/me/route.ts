import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const users = await db.user.findMany({
      take: 1,
      include: {
        roles: true,
        wallet: {
          include: {
            transactions: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
        },
      },
    });

    if (!users[0]) {
      return NextResponse.json({ error: 'No demo user found' }, { status: 404 });
    }

    const user = users[0];

    return NextResponse.json({
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        city: user.city,
        district: user.district,
        division: user.division,
        isPhoneVerified: user.isPhoneVerified,
        isNidVerified: user.isNidVerified,
        createdAt: user.createdAt,
      },
      roles: user.roles,
      wallet: user.wallet
        ? {
            id: user.wallet.id,
            balance: user.wallet.balance,
            isFrozen: user.wallet.isFrozen,
          }
        : null,
      recentTransactions: user.wallet?.transactions ?? [],
    });
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}