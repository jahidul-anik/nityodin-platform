import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateQuery } from '@/lib/middleware';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { handleApiError } from '@/lib/api-error-handler';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const exportQuerySchema = z.object({
  format: z.enum(['csv'], { message: 'Only csv format is supported' }).default('csv'),
  fromDate: z.string().min(1, 'fromDate is required (YYYY-MM-DD)'),
  toDate: z.string().min(1, 'toDate is required (YYYY-MM-DD)'),
  type: z.string().optional(),
});

// ---------------------------------------------------------------------------
// GET /api/wallet/export?format=csv&fromDate=2025-01-01&toDate=2025-12-31&type=topup
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { format, fromDate, toDate, type } = validateQuery(exportQuerySchema, searchParams);

    // Get demo user with wallet
    const users = await db.user.findMany({
      take: 1,
      include: { wallet: true },
    });
    const user = users[0];
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'No demo user found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }
    if (!user.wallet) {
      return new NextResponse(
        JSON.stringify({ error: 'No wallet found for user' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Build date range (fromDate 00:00:00 to toDate 23:59:59)
    const fromDateTime = new Date(`${fromDate}T00:00:00.000Z`);
    const toDateTime = new Date(`${toDate}T23:59:59.999Z`);

    if (fromDateTime > toDateTime) {
      throw new ValidationError('fromDate must be before or equal to toDate');
    }

    // Build where clause
    const where: Record<string, unknown> = {
      walletId: user.wallet.id,
      createdAt: { gte: fromDateTime, lte: toDateTime },
    };
    if (type) {
      where.type = type;
    }

    // Fetch transactions
    const transactions = await db.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    if (transactions.length === 0) {
      throw new NotFoundError('Transactions for the given date range');
    }

    if (format === 'csv') {
      // CSV header
      const header = 'Date,Type,Amount (BDT),Description,Status,Reference\n';

      // CSV rows
      const rows = transactions.map((t) => {
        const date = t.createdAt.toISOString().split('T')[0];
        const amount = (t.amount / 100).toFixed(2);
        const desc = (t.description || '').replace(/"/g, '""');
        const ref = t.referenceId || '';
        return `${date},"${t.type}",${amount},"${desc}","${t.status}","${ref}"`;
      });

      const csv = header + rows.join('\n') + '\n';

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="wallet-transactions-${fromDate}-to-${toDate}.csv"`,
        },
      });
    }

    // Fallback (shouldn't reach here due to zod enum)
    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
  } catch (err) {
    if (err instanceof NotFoundError || err instanceof ValidationError) {
      const body = { error: err.message };
      if (err.code) (body as Record<string, unknown>).code = err.code;
      if (err.details) (body as Record<string, unknown>).details = err.details;
      return new NextResponse(JSON.stringify(body), {
        status: err.statusCode,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return handleApiError(err);
  }
}