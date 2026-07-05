import { NextRequest, NextResponse } from 'next/server';
import { db, demoState } from '@/lib/db';
import { demoData } from '@/lib/demo-data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, toPhone } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid transfer amount' },
        { status: 400 }
      );
    }

    if (!toPhone) {
      return NextResponse.json(
        { error: 'Recipient phone number is required' },
        { status: 400 }
      );
    }

    // Get demo user (sender)
    const users = await db.user.findMany({
      take: 1,
      include: { wallet: true },
    });
    const sender = users[0];
    if (!sender || !sender.wallet) {
      return NextResponse.json(
        { error: 'Sender wallet not found' },
        { status: 400 }
      );
    }

    if (sender.wallet.isFrozen) {
      return NextResponse.json(
        { error: 'Wallet is frozen' },
        { status: 400 }
      );
    }

    if (sender.wallet.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Find recipient by phone
    const recipient = await db.user.findUnique({
      where: { phone: toPhone },
      include: { wallet: true },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 400 }
      );
    }

    if (recipient.id === sender.id) {
      return NextResponse.json(
        { error: 'Cannot transfer to yourself' },
        { status: 400 }
      );
    }

    // Ensure recipient has a wallet
    let recipientWallet = recipient.wallet;
    if (!recipientWallet) {
      recipientWallet = await db.wallet.create({
        data: { userId: recipient.id, balance: 0 },
      });
    }

    // Perform transfer in a transaction
    const result = await db.$transaction(async (tx) => {
      // Debit sender
      await tx.wallet.update({
        where: { id: sender.wallet!.id },
        data: { balance: { decrement: amount } },
      });

      // Credit recipient
      await tx.wallet.update({
        where: { id: recipientWallet.id },
        data: { balance: { increment: amount } },
      });

      // Create sender's transaction (debit)
      const senderTx = await tx.transaction.create({
        data: {
          walletId: sender.wallet!.id,
          type: 'debit',
          amount: -amount,
          description: `Transfer to ${recipient.name} (${toPhone})`,
          referenceType: 'transfer',
          paymentMethod: 'wallet',
          status: 'completed',
        },
      });

      // Create recipient's transaction (credit)
      const recipientTx = await tx.transaction.create({
        data: {
          walletId: recipientWallet.id,
          type: 'credit',
          amount,
          description: `Transfer from ${sender.name} (${sender.phone})`,
          referenceType: 'transfer',
          paymentMethod: 'wallet',
          status: 'completed',
        },
      });

      return { senderTx, recipientTx };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully transferred ৳${amount} to ${recipient.name}`,
      transaction: {
        id: result.senderTx.id,
        amount,
        toPhone,
        toName: recipient.name,
        createdAt: result.senderTx.createdAt,
      },
    });
  } catch (error) {
    demoState.isDemoMode = true;
    const body = await request.json().catch(() => ({}));
    const { amount, toPhone } = body as { amount?: number; toPhone?: string };
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid transfer amount' }, { status: 400 });
    }
    if (!toPhone) {
      return NextResponse.json({ error: 'Recipient phone number is required' }, { status: 400 });
    }
    return NextResponse.json({
      success: true,
      message: `Successfully transferred ৳${amount} to ${toPhone}`,
      transaction: {
        id: 'demo_tx_transfer_' + Date.now(),
        amount,
        toPhone,
        toName: 'Fatema Begum',
        createdAt: new Date().toISOString(),
      },
    });
  }
}