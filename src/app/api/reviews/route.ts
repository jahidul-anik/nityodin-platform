import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { error, created, paginated } from '@/lib/api-response';
import { validateBody, validateQuery, paginationSchema, requireJsonContentType } from '@/lib/middleware';
import { handleApiError } from '@/lib/api-error-handler';
import { NotFoundError } from '@/lib/errors';
import { z } from 'zod';

const createReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

type CreateReviewInput = z.infer<typeof createReviewSchema>;

const listReviewsQuerySchema = paginationSchema.extend({
  productId: z.string().optional(),
});

type ListReviewsQuery = z.infer<typeof listReviewsQuerySchema>;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, productId } = validateQuery<ListReviewsQuery>(listReviewsQuerySchema, searchParams);

    const where: Record<string, unknown> = {};
    if (productId) {
      where.productId = productId;
    }

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
          product: productId ? {
            select: { id: true, name: true },
          } : false,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.review.count({ where }),
    ]);

    return paginated(reviews, page, limit, total);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctCheck = requireJsonContentType(request);
    if (ctCheck) return ctCheck;

    const body: unknown = await request.json();
    const data = validateBody<CreateReviewInput>(createReviewSchema, body);

    // Get demo user
    const users = await db.user.findMany({ take: 1 });
    const currentUser = users[0];
    if (!currentUser) return error('No demo user found', 404, 'NOT_FOUND');

    // Verify product exists
    const product = await db.product.findUnique({
      where: { id: data.productId },
    });
    if (!product) {
      throw new NotFoundError('Product', data.productId);
    }

    // Create review and update product rating atomically
    const review = await db.$transaction(async (tx) => {
      // Create review
      const newReview = await tx.review.create({
        data: {
          userId: currentUser.id,
          productId: data.productId,
          rating: data.rating,
          comment: data.comment,
        },
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      });

      // Recalculate average rating and review count for the product
      const aggregate = await tx.review.aggregate({
        where: { productId: data.productId },
        _avg: { rating: true },
        _count: { id: true },
      });

      await tx.product.update({
        where: { id: data.productId },
        data: {
          rating: aggregate._avg.rating ?? 0,
          reviewCount: aggregate._count.id,
        },
      });

      return newReview;
    });

    return created(review, 'Review created successfully');
  } catch (err) {
    return handleApiError(err);
  }
}