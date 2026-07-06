import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success } from '@/lib/api-response';
import { validateBody } from '@/lib/middleware';
import { NotFoundError, ValidationError, EscrowError, ForbiddenError } from '@/lib/errors';
import { handleApiError } from '@/lib/api-error-handler';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const updateEscrowSchema = z.object({
  status: z.enum(['released', 'refunded', 'disputed']),
  reason: z.string().max(500).optional(),
});

type UpdateEscrowInput = z.infer<typeof updateEscrowSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function getEscrowWithUsers(id: string) {
  const escrow = await db.escrowHold.findUnique({
    where: { id },
    include: {
      payer: { select: { id: true, name: true, phone: true, wallet: true } },
      payee: { select: { id: true, name: true, phone: true, wallet: true } },
    },
  });

  if (!escrow) throw new NotFoundError('EscrowHold', id);
  return escrow;
}

// ---------------------------------------------------------------------------
// GET: Get single escrow hold details
// ---------------------------------------------------------------------------

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const escrow = await db.escrowHold.findUnique({
      where: { id },
      include: {
        payer: { select: { id: true, name: true, phone: true } },
        payee: { select: { id: true, name: true, phone: true } },
      },
    });

    if (!escrow) throw new NotFoundError('EscrowHold', id);

    return success(escrow);
  } catch (err) {
    return handleApiError(err);
  }
}

// ---------------------------------------------------------------------------
// PATCH: Update escrow status (release, refund, dispute)
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();
    const data = validateBody<UpdateEscrowInput>(updateEscrowSchema, body);

    const escrow = await getEscrowWithUsers(id);

    // Only held escrows can be updated
    if (escrow.status !== 'held') {
      throw new ValidationError(`Cannot update escrow with status "${escrow.status}". Only "held" escrows can be updated.`);
    }

    // Ensure wallets exist
    if (!escrow.payer.wallet) {
      throw new NotFoundError('Payer wallet');
    }

    let payeeWallet = escrow.payee.wallet;
    if (!payeeWallet) {
      payeeWallet = await db.wallet.create({
        data: { userId: escrow.payeeId, balance: 0 },
      });
    }

    let updatedEscrow;

    // Perform status update atomically
    if (data.status === 'released') {
      // Add amount to payee wallet, create transaction
      updatedEscrow = await db.$transaction(async (tx) => {
        // Credit payee wallet
        await tx.wallet.update({
          where: { id: payeeWallet!.id },
          data: { balance: { increment: escrow.amount } },
        });

        // Create release transaction for payee
        await tx.transaction.create({
          data: {
            walletId: payeeWallet!.id,
            type: 'escrow_release',
            amount: escrow.amount,
            description: `Escrow payment released from ${escrow.payer.name}`,
            referenceType: 'escrow',
            referenceId: escrow.id,
            paymentMethod: 'wallet',
            status: 'completed',
          },
        });

        // Update escrow status
        const updated = await tx.escrowHold.update({
          where: { id },
          data: {
            status: 'released',
            reason: data.reason || 'Payment released by payer',
          },
          include: {
            payer: { select: { id: true, name: true, phone: true } },
            payee: { select: { id: true, name: true, phone: true } },
          },
        });

        return updated;
      });

      // Notify payee
      try {
        await db.notification.create({
          data: {
            userId: escrow.payeeId,
            type: 'escrow_released',
            title: 'Escrow Payment Released',
            message: `৳${(escrow.amount / 100).toLocaleString()} has been released from escrow and added to your wallet.`,
            data: JSON.stringify({ escrowId: id, amount: escrow.amount }),
          },
        });
      } catch { /* non-blocking */ }

    } else if (data.status === 'refunded') {
      // Add amount back to payer wallet, create transaction
      updatedEscrow = await db.$transaction(async (tx) => {
        // Credit payer wallet
        await tx.wallet.update({
          where: { id: escrow.payer.wallet!.id },
          data: { balance: { increment: escrow.amount } },
        });

        // Create refund transaction for payer
        await tx.transaction.create({
          data: {
            walletId: escrow.payer.wallet!.id,
            type: 'escrow_refund',
            amount: escrow.amount,
            description: `Escrow refund from ${escrow.payee.name}`,
            referenceType: 'escrow',
            referenceId: escrow.id,
            paymentMethod: 'wallet',
            status: 'completed',
          },
        });

        // Update escrow status
        const updated = await tx.escrowHold.update({
          where: { id },
          data: {
            status: 'refunded',
            reason: data.reason || 'Refund requested by payer',
          },
          include: {
            payer: { select: { id: true, name: true, phone: true } },
            payee: { select: { id: true, name: true, phone: true } },
          },
        });

        return updated;
      });

      // Notify payer
      try {
        await db.notification.create({
          data: {
            userId: escrow.payerId,
            type: 'escrow_refunded',
            title: 'Escrow Refund Completed',
            message: `৳${(escrow.amount / 100).toLocaleString()} has been refunded to your wallet from the escrow hold.`,
            data: JSON.stringify({ escrowId: id, amount: escrow.amount }),
          },
        });
      } catch { /* non-blocking */ }

    } else if (data.status === 'disputed') {
      // Just update status — admin resolution later
      updatedEscrow = await db.escrowHold.update({
        where: { id },
        data: {
          status: 'disputed',
          reason: data.reason || 'Dispute raised',
        },
        include: {
          payer: { select: { id: true, name: true, phone: true } },
          payee: { select: { id: true, name: true, phone: true } },
        },
      });

      // Notify both parties
      try {
        await db.notification.createMany({
          data: [
            {
              userId: escrow.payerId,
              type: 'escrow_disputed',
              title: 'Escrow Dispute Raised',
              message: `A dispute has been raised for the escrow of ৳${(escrow.amount / 100).toLocaleString()}. Our team will review and resolve it shortly.`,
              data: JSON.stringify({ escrowId: id, amount: escrow.amount }),
            },
            {
              userId: escrow.payeeId,
              type: 'escrow_disputed',
              title: 'Escrow Dispute Raised',
              message: `A dispute has been raised for the escrow payment of ৳${(escrow.amount / 100).toLocaleString()}. Our team will review and resolve it shortly.`,
              data: JSON.stringify({ escrowId: id, amount: escrow.amount }),
            },
          ],
        });
      } catch { /* non-blocking */ }
    }

    // Emit WebSocket event for real-time update (Part E)
    try {
      const wsPayload = {
        event: 'escrow:status_changed',
        userId: escrow.payeeId,
        data: updatedEscrow,
      };
      // Fire and forget — don't block the response
      fetch('/api/emit?XTransformPort=3003', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wsPayload),
      }).catch(() => {
        // WebSocket service not available — silently ignore
      });
    } catch { /* non-blocking */ }

    return success(updatedEscrow, `Escrow ${data.status} successfully`);
  } catch (err) {
    return handleApiError(err);
  }
}
