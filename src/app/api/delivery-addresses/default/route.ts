import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success } from '@/lib/api-response';
import { handleApiError } from '@/lib/api-error-handler';

// ---------------------------------------------------------------------------
// PUT — set an address as default
// ---------------------------------------------------------------------------

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return { error: 'Address ID is required', status: 400 } as any;
    }

    const user = await db.user.findFirst();
    if (!user) {
      return { error: 'No users found', status: 400 } as any;
    }

    // Unset all current defaults
    await db.deliveryAddress.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });

    // Set the target address as default
    const address = await db.deliveryAddress.update({
      where: { id, userId: user.id },
      data: { isDefault: true },
    });

    return success(address, 'Default address updated');
  } catch (err) {
    return handleApiError(err);
  }
}