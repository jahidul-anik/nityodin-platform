import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, created, paginated } from '@/lib/api-response';
import { validateBody, validateQuery, paginationSchema } from '@/lib/middleware';
import {
  InsufficientFundsError,
  WalletFrozenError,
  NotFoundError,
  ValidationError,
  ForbiddenError,
  EscrowError,
} from '@/lib/errors';
import { handleApiError } from '@/lib/api-error-handler';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listEscrowQuerySchema = z.object({
  role: z.enum(['payer', 'payee', 'all']).optional().default('all'),
  status: z.enum(['held', 'released', 'refunded', 'disputed']).optional(),
  ...paginationSchema.shape,
});

type ListEscrowQuery = z.infer<typeof listEscrowQuerySchema>;

const createEscrowSchema = z.object({
  payeeId: z.string().min(1, 'Payee ID is required'),
  amount: z.number().int().positive('Amount must be greater than 0').max(10000000, 'Maximum ৳1,00,000'),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  reason: z.string().max(500).optional(),
});

type CreateEscrowInput = z.infer<typeof createEscrowSchema>;

// ---------------------------------------------------------------------------
// GET: List escrow holds for current user
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const query = validateQuery<ListEscrowQuery>(listEscrowQuerySchema, request.nextUrl.searchParams);

    // Get current demo user
    const currentUser = await db.user.findFirst({ where: { phone: '+8801712345678' } })
      ?? (await db.user.findFirst());
    if (!currentUser) throw new NotFoundError('User');

    const where: Record<string, unknown> = {};

    if (query.role === 'payer') {
      where.payerId = currentUser.id;
    } else if (query.role === 'payee') {
      where.payeeId = currentUser.id;
    } else {
      where.OR = [{ payerId: currentUser.id }, { payeeId: currentUser.id }];
    }

    if (query.status) {
      where.status = query.status;
    }

    const page = query.page;
    const limit = query.limit;

    const [escrows, total] = await Promise.all([
      db.escrowHold.findMany({
        where,
        include: {
          payer: { select: { id: true, name: true, phone: true } },
          payee: { select: { id: true, name: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.escrowHold.count({ where }),
    ]);

    return paginated(escrows, page, limit, total);
  } catch (err) {
    return handleApiError(err);
  }
}

// ---------------------------------------------------------------------------
// POST: Create escrow hold
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const data = validateBody<CreateEscrowInput>(createEscrowSchema, body);

    // Get current demo user (payer)
    const payer = await db.user.findFirst({ where: { phone: '+8801712345678' }, include: { wallet: true } })
      ?? (await db.user.findFirst({ include: { wallet: true } }));
    if (!payer) throw new NotFoundError('User');

    // Validate payee exists
    const payee = await db.user.findUnique({
      where: { id: data.payeeId },
      include: { wallet: true },
    });
    if (!payee) throw new NotFoundError('Payee', data.payeeId);

    if (payee.id === payer.id) {
      throw new ValidationError('Cannot create escrow with yourself');
    }

    // Validate payer has a wallet
    if (!payer.wallet) {
      throw new NotFoundError('Payer wallet');
    }

    if (payer.wallet.isFrozen) {
      throw new WalletFrozenError();
    }

    if (payer.wallet.balance < data.amount) {
      throw new InsufficientFundsError(data.amount, payer.wallet.balance);
    }

    // Ensure payee has a wallet
    let payeeWallet = payee.wallet;
    if (!payeeWallet) {
      payeeWallet = await db.wallet.create({
        data: { userId: payee.id, balance: 0 },
      });
    }

    // Atomic: deduct from payer wallet, create escrow hold, create transaction
    const escrow = await db.$transaction(async (tx) => {
      // Deduct from payer wallet
      await tx.wallet.update({
        where: { id: payer.wallet!.id },
        data: { balance: { decrement: data.amount } },
      });

      // Create escrow hold
      const newEscrow = await tx.escrowHold.create({
        data: {
          payerId: payer.id,
          payeeId: payee.id,
          amount: data.amount,
          status: 'held',
          referenceType: data.referenceType,
          referenceId: data.referenceId,
          reason: data.reason,
          autoReleaseAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        },
        include: {
          payer: { select: { id: true, name: true, phone: true } },
          payee: { select: { id: true, name: true, phone: true } },
        },
      });

      // Create transaction for the escrow hold
      await tx.transaction.create({
        data: {
          walletId: payer.wallet!.id,
          type: 'escrow_hold',
          amount: -data.amount,
          description: `Escrow hold for ${payee.name}`,
          referenceType: 'escrow',
          referenceId: newEscrow.id,
          paymentMethod: 'wallet',
          status: 'completed',
        },
      });

      return newEscrow;
    });

    // Create notification for payee
    try {
      await db.notification.create({
        data: {
          userId: payee.id,
          type: 'escrow_created',
          title: 'Payment Held in Escrow',
          message: `৳${(data.amount / 100).toLocaleString()} has been held in escrow by ${payer.name}. The funds will be released once the service is completed.`,
          data: JSON.stringify({ escrowId: escrow.id, amount: data.amount }),
        },
      });
    } catch {
      // Notification failure should not block the escrow creation
    }

    return created(escrow, `Escrow hold created for ৳${(data.amount / 100).toLocaleString()}`);
  } catch (err) {
    return handleApiError(err);
  }
}
