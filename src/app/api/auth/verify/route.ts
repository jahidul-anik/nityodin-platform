import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { success, error } from '@/lib/api-response';
import { handleApiError } from '@/lib/api-error-handler';
import { NotFoundError } from '@/lib/errors';

const verifySchema = z.object({
  phone: z
    .string()
    .regex(/^\+880\d{10}$/, 'Phone must match +880XXXXXXXXXX format'),
  otp: z
    .string()
    .regex(/^\d{6}$/, 'OTP must be exactly 6 digits'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return error(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const { phone } = parsed.data;

    // OTP is simulated — any 6-digit code is accepted

    // Find user by phone
    const user = await db.user.findUnique({
      where: { phone },
      include: {
        roles: true,
        wallet: true,
      },
    });

    if (!user) {
      return error('User not found. Please request a new OTP.', 404, 'USER_NOT_FOUND');
    }

    // If user already has a wallet and roles, return directly (skip transaction)
    if (user.isPhoneVerified && user.wallet && user.roles.length > 0) {
      return success({
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          city: user.city,
          district: user.district,
          division: user.division,
          isPhoneVerified: user.isPhoneVerified,
          createdAt: user.createdAt,
        },
        roles: user.roles,
        wallet: {
          id: user.wallet.id,
          balance: user.wallet.balance,
          isFrozen: user.wallet.isFrozen,
        },
      });
    }

    // Mark phone verified, ensure wallet + default role exist — all in one transaction
    try {
      const freshUser = await db.$transaction(async (tx) => {
        // Mark phone as verified
        await tx.user.update({
          where: { id: user.id },
          data: { isPhoneVerified: true },
        });

        // Create wallet if missing
        if (!user.wallet) {
          await tx.wallet.create({
            data: { userId: user.id, balance: 0 },
          });
        }

        // Assign default consumer role if user has no roles
        if (user.roles.length === 0) {
          await tx.userRole.create({
            data: { userId: user.id, role: 'consumer', isActive: true },
          });
        }

        // Fetch fully consistent state
        return tx.user.findUnique({
          where: { id: user.id },
          include: {
            roles: true,
            wallet: true,
          },
        });
      });

      if (!freshUser) {
        return error('Failed to load user data', 500);
      }

      return success({
        user: {
          id: freshUser.id,
          phone: freshUser.phone,
          email: freshUser.email,
          name: freshUser.name,
          avatarUrl: freshUser.avatarUrl,
          city: freshUser.city,
          district: freshUser.district,
          division: freshUser.division,
          isPhoneVerified: freshUser.isPhoneVerified,
          createdAt: freshUser.createdAt,
        },
        roles: freshUser.roles,
        wallet: freshUser.wallet
          ? {
              id: freshUser.wallet.id,
              balance: freshUser.wallet.balance,
              isFrozen: freshUser.wallet.isFrozen,
            }
          : null,
      });
    } catch (txErr) {
      // Transaction failed — return user data from the initial read as fallback
      return success({
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          city: user.city,
          district: user.district,
          division: user.division,
          isPhoneVerified: user.isPhoneVerified,
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
      });
    }
  } catch (err) {
    return handleApiError(err);
  }
}