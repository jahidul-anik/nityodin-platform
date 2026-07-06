import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/settings — get current user settings
export async function GET() {
  try {
    const users = await db.user.findMany({ take: 1 });
    const user = users[0];
    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 404 });
    }

    let settings = await db.userSettings.findUnique({
      where: { userId: user.id },
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await db.userSettings.create({
        data: {
          userId: user.id,
          notificationsOrders: true,
          notificationsWallet: true,
          notificationsMedical: true,
          notificationsMarketing: false,
          profileVisibility: 'public',
          showPhone: false,
          showEmail: false,
          language: 'en',
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT /api/settings — update user settings
export async function PUT(request: NextRequest) {
  try {
    const users = await db.user.findMany({ take: 1 });
    const user = users[0];
    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 404 });
    }

    const body = await request.json();

    // Validate language
    const allowedLanguages = ['en', 'bn'];
    if (body.language && !allowedLanguages.includes(body.language)) {
      return NextResponse.json(
        { error: 'Invalid language. Must be "en" or "bn".' },
        { status: 400 }
      );
    }

    // Validate profile visibility
    const allowedVisibility = ['public', 'private'];
    if (body.profileVisibility && !allowedVisibility.includes(body.profileVisibility)) {
      return NextResponse.json(
        { error: 'Invalid profileVisibility. Must be "public" or "private".' },
        { status: 400 }
      );
    }

    const existing = await db.userSettings.findUnique({
      where: { userId: user.id },
    });

    const updateData = {
      ...(body.notificationsOrders !== undefined && { notificationsOrders: Boolean(body.notificationsOrders) }),
      ...(body.notificationsWallet !== undefined && { notificationsWallet: Boolean(body.notificationsWallet) }),
      ...(body.notificationsMedical !== undefined && { notificationsMedical: Boolean(body.notificationsMedical) }),
      ...(body.notificationsMarketing !== undefined && { notificationsMarketing: Boolean(body.notificationsMarketing) }),
      ...(body.profileVisibility !== undefined && { profileVisibility: body.profileVisibility }),
      ...(body.showPhone !== undefined && { showPhone: Boolean(body.showPhone) }),
      ...(body.showEmail !== undefined && { showEmail: Boolean(body.showEmail) }),
      ...(body.language !== undefined && { language: body.language }),
    };

    let settings;
    if (existing) {
      settings = await db.userSettings.update({
        where: { userId: user.id },
        data: updateData,
      });
    } else {
      settings = await db.userSettings.create({
        data: {
          userId: user.id,
          ...updateData,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}