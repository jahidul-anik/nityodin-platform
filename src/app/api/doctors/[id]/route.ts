import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error } from '@/lib/api-response';
import { AppError, NotFoundError } from '@/lib/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const doctor = await db.doctor.findUnique({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundError('Doctor', id);
    }

    // Get appointment count
    const appointmentCount = await db.appointment.count({
      where: { doctorId: id },
    });

    return success({ ...doctor, appointmentCount });
  } catch (err) {
    if (err instanceof AppError) {
      return error(err.message, err.statusCode, err.code);
    }

    console.error('Failed to fetch doctor:', err);
    return error('Failed to fetch doctor');
  }
}