import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { success, error } from '@/lib/api-response';

const phoneSchema = z.object({
  phone: z
    .string()
    .regex(/^\+880\d{10}$/, 'Phone must match +880XXXXXXXXXX format'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = phoneSchema.safeParse(body);

    if (!parsed.success) {
      return error(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const { phone } = parsed.data;

    // Look up user by phone
    let user = await db.user.findUnique({
      where: { phone },
    });

    // If user doesn't exist, create one
    const isNewUser = !user;
    if (!user) {
      user = await db.user.create({
        data: {
          phone,
          name: 'New User',
          isPhoneVerified: true,
        },
      });
    }

    // OTP is simulated — any 6-digit code works
    return success(
      {
        success: true,
        message: 'OTP sent',
        userId: user.id,
        isNewUser,
      },
      200,
    );
  } catch (err) {
    console.error('Auth request error:', err);
    return error('Failed to process authentication request', 500);
  }
}