import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { created } from '@/lib/api-response';
import { validateBody } from '@/lib/middleware';
import { NotFoundError, ValidationError, WalletFrozenError, InsufficientFundsError } from '@/lib/errors';
import { handleApiError } from '@/lib/api-error-handler';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const createMedicalEscrowSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  amount: z.number().int().positive('Amount must be greater than 0').max(10000000),
  reason: z.string().max(500).optional(),
});

type CreateMedicalEscrowInput = z.infer<typeof createMedicalEscrowSchema>;

// The medical escrow payee — a known service provider user
const MEDICAL_ESCROW_PAYEE_PHONE = '+8801912345678';

// ---------------------------------------------------------------------------
// POST: Create medical escrow hold
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const data = validateBody<CreateMedicalEscrowInput>(createMedicalEscrowSchema, body);

    // Get current demo user (payer)
    const users = await db.user.findMany({ take: 1, include: { wallet: true } });
    const payer = users[0];
    if (!payer) throw new NotFoundError('User');

    // Verify doctor exists
    const doctor = await db.doctor.findUnique({ where: { id: data.doctorId } });
    if (!doctor) throw new NotFoundError('Doctor', data.doctorId);

    // Find the medical service provider (payee)
    const payee = await db.user.findUnique({
      where: { phone: MEDICAL_ESCROW_PAYEE_PHONE },
      include: { wallet: true },
    });
    if (!payee) throw new NotFoundError('Medical service account');

    if (payee.id === payer.id) {
      throw new ValidationError('Cannot create escrow with yourself');
    }

    if (!payer.wallet) throw new NotFoundError('Payer wallet');
    if (payer.wallet.isFrozen) throw new WalletFrozenError();
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

    // Atomic transaction
    const escrow = await db.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { id: payer.wallet!.id },
        data: { balance: { decrement: data.amount } },
      });

      const newEscrow = await tx.escrowHold.create({
        data: {
          payerId: payer.id,
          payeeId: payee.id,
          amount: data.amount,
          status: 'held',
          referenceType: 'appointment',
          referenceId: data.doctorId,
          reason: data.reason || `Medical appointment payment - Dr. ${doctor.name}`,
          autoReleaseAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        include: {
          payer: { select: { id: true, name: true, phone: true } },
          payee: { select: { id: true, name: true, phone: true } },
        },
      });

      await tx.transaction.create({
        data: {
          walletId: payer.wallet!.id,
          type: 'escrow_hold',
          amount: -data.amount,
          description: `Escrow hold for Dr. ${doctor.name} appointment`,
          referenceType: 'escrow',
          referenceId: newEscrow.id,
          paymentMethod: 'wallet',
          status: 'completed',
        },
      });

      return newEscrow;
    });

    // Notify payee
    try {
      await db.notification.create({
        data: {
          userId: payee.id,
          type: 'escrow_created',
          title: 'Medical Escrow Payment Received',
          message: `৳${(data.amount / 100).toLocaleString()} held in escrow by ${payer.name} for Dr. ${doctor.name} appointment.`,
          data: JSON.stringify({ escrowId: escrow.id, amount: data.amount, doctorId: data.doctorId }),
        },
      });
    } catch { /* non-blocking */ }

    return created(escrow, `Escrow payment of ৳${(data.amount / 100).toLocaleString()} created for Dr. ${doctor.name}`);
  } catch (err) {
    return handleApiError(err);
  }
}
