'use client';

import { useEffect, useState, useCallback, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  X,
  Loader2,
  Package,
  User,
  MapPin,
  Clock,
  CreditCard,
  ImageOff,
  Star,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePlatformStore } from '@/store/platform-store';
import { StarRating, renderStars } from '@/components/nityodin/star-rating';
import { ReviewForm } from '@/components/nityodin/review-form';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrderProduct {
  id: string;
  name: string;
  imageUrl?: string | null;
  price: number;
}

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: OrderProduct;
}

interface OrderUser {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  deliveryAddress?: string | null;
  createdAt: string;
  updatedAt: string;
  buyer: OrderUser;
  seller: OrderUser;
  items: OrderItem[];
}

interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user: { id: string; name: string; avatarUrl?: string | null };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTaka(amount: number): string {
  return `৳${(amount / 100).toLocaleString('en-BD', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function truncateId(id: string): string {
  return id.length > 12 ? `${id.slice(0, 8)}...${id.slice(-4)}` : id;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusClass(status: string): string {
  const map: Record<string, string> = {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    preparing: 'status-preparing',
    delivered: 'status-delivered',
    completed: 'status-completed',
    cancelled: 'status-cancelled',
  };
  return map[status] ?? 'status-pending';
}

function paymentStatusColor(status: string): string {
  const map: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    refunded: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  };
  return map[status] ?? '';
}

// ---------------------------------------------------------------------------
// Status timeline steps
// ---------------------------------------------------------------------------

const TIMELINE_STEPS = ['pending', 'confirmed', 'preparing', 'delivered', 'completed'] as const;

const stepLabels: Record<string, string> = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  delivered: 'Delivered',
  completed: 'Completed',
};

// ---------------------------------------------------------------------------
// ProductReview sub-component
// ---------------------------------------------------------------------------

function ProductReviews({ productId, productName }: { productId: string; productName: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(Array.isArray(data.data) ? data.data : []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <span>Reviews for {productName}</span>
        </div>
        {!showForm && reviews.length === 0 && !loading && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            onClick={() => setShowForm(true)}
          >
            <Star className="h-3 w-3" />
            Write a Review
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-12 w-3/4 rounded-lg" />
        </div>
      ) : showForm ? (
        <ReviewForm
          productId={productId}
          productName={productName}
          onSubmit={() => {
            setShowForm(false);
            fetchReviews();
          }}
          onCancel={() => setShowForm(false)}
        />
      ) : reviews.length > 0 ? (
        <div className="space-y-2">
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border p-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={review.user.avatarUrl ?? undefined} />
                    <AvatarFallback className="text-[10px]">
                      {review.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">{review.user.name}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {formatDate(review.createdAt)}
                </span>
              </div>
              <div className="mt-1.5">
                {renderStars(review.rating, 'sm')}
              </div>
              {review.comment && (
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  {review.comment}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground py-2">
          No reviews yet. Be the first to review!
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatusTimeline sub-component
// ---------------------------------------------------------------------------

function StatusTimeline({ status }: { status: string }) {
  const isCancelled = status === 'cancelled';
  const currentIdx = TIMELINE_STEPS.indexOf(status as typeof TIMELINE_STEPS[number]);

  return (
    <div className="relative">
      {/* Normal flow */}
      <div
        className={cn(
          'space-y-0 transition-opacity duration-300',
          isCancelled && 'opacity-40',
        )}
      >
        {TIMELINE_STEPS.map((step, idx) => {
          const isPast = !isCancelled && idx < currentIdx;
          const isCurrent = !isCancelled && idx === currentIdx;
          const isFuture = !isCancelled && idx > currentIdx;

          return (
            <div key={step} className="flex gap-3">
              {/* Timeline connector + dot */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.15 : 1,
                    backgroundColor: isPast
                      ? '#059669'
                      : isCurrent
                        ? '#059669'
                        : 'oklch(0.88 0.01 160)',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={cn(
                    'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2',
                    isPast && 'border-emerald-600',
                    isCurrent && 'border-emerald-600 ring-4 ring-emerald-500/20',
                    isFuture && 'border-muted-foreground/30',
                  )}
                >
                  {isPast ? (
                    <Check className="h-4 w-4 text-white" />
                  ) : isCurrent ? (
                    <Package className="h-3.5 w-3.5 text-white" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                  )}
                </motion.div>
                {idx < TIMELINE_STEPS.length - 1 && (
                  <div
                    className={cn(
                      'w-0.5 min-h-[28px] flex-1 transition-colors duration-300',
                      isPast ? 'bg-emerald-500' : 'bg-muted-foreground/20',
                    )}
                  />
                )}
              </div>

              {/* Label */}
              <div className="pb-6 pt-1">
                <p
                  className={cn(
                    'text-sm font-medium transition-colors',
                    isPast && 'text-emerald-600 dark:text-emerald-400',
                    isCurrent && 'text-emerald-600 dark:text-emerald-400',
                    isFuture && 'text-muted-foreground',
                  )}
                >
                  {stepLabels[step]}
                </p>
                {isCurrent && (
                  <motion.p
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-0.5"
                  >
                    Current status
                  </motion.p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancelled branch */}
      {isCancelled && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-3"
        >
          <div className="flex flex-col items-center">
            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-rose-500 bg-rose-500 ring-4 ring-rose-500/20">
              <X className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="pt-1">
            <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
              Order Cancelled
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              This order has been cancelled
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main OrderDetail component
// ---------------------------------------------------------------------------

export function OrderDetail() {
  const selectedOrderId = usePlatformStore((s) => s.selectedOrderId);
  const setActiveView = usePlatformStore((s) => s.setActiveView);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!selectedOrderId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${selectedOrderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.data);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Failed to load order');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedOrderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleCancel = async () => {
    if (!selectedOrderId) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (res.ok) {
        toast.success('Order cancelled successfully');
        fetchOrder();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || 'Failed to cancel order');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = order?.status === 'pending' || order?.status === 'confirmed';
  const canReview =
    order?.status === 'delivered' || order?.status === 'completed';

  // -------------------------------------------------------------------------
  // No order selected
  // -------------------------------------------------------------------------
  if (!selectedOrderId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center gap-4 py-20"
      >
        <Package className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-muted-foreground">No order selected.</p>
        <Button variant="outline" onClick={() => setActiveView('dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go to Dashboard
        </Button>
      </motion.div>
    );
  }

  // -------------------------------------------------------------------------
  // Loading
  // -------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-60 rounded-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Error
  // -------------------------------------------------------------------------
  if (error || !order) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center gap-4 py-20"
      >
        <X className="h-12 w-12 text-rose-500/60" />
        <p className="text-muted-foreground">{error || 'Order not found.'}</p>
        <Button variant="outline" onClick={() => setActiveView('dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go to Dashboard
        </Button>
      </motion.div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Back + Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          className="w-fit gap-2"
          onClick={() => setActiveView('dashboard')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium text-muted-foreground">
            #{truncateId(order.id)}
          </span>
          <Badge className={cn('capitalize text-xs', statusClass(order.status))}>
            {order.status.replace('_', ' ')}
          </Badge>
          <Badge className={cn('text-xs', paymentStatusColor(order.paymentStatus))}>
            <CreditCard className="mr-1 h-3 w-3" />
            {order.paymentStatus}
          </Badge>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — Timeline + Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order info card */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Seller info */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={order.seller.avatarUrl ?? undefined} />
                    <AvatarFallback>
                      {order.seller.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Seller</p>
                    <p className="text-sm text-muted-foreground">
                      {order.seller.name}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:block h-10 w-px bg-border" />

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(order.createdAt)}</span>
                </div>
              </div>

              {/* Delivery address */}
              {order.deliveryAddress && (
                <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
                  <MapPin className="h-4 w-4 mt-0.5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-medium">Delivery Address</p>
                    <p className="text-xs text-muted-foreground">
                      {order.deliveryAddress}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-600" />
                Order Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <StatusTimeline status={order.status} />
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-600" />
                Order Items ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    {/* Product image */}
                    <div className="h-14 w-14 shrink-0 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling
                              ?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <ImageOff className="h-5 w-5 text-muted-foreground/40" />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTaka(item.price)} × {item.quantity}
                      </p>
                    </div>

                    {/* Subtotal */}
                    <p className="text-sm font-semibold shrink-0">
                      {formatTaka(item.price * item.quantity)}
                    </p>
                  </motion.div>
                ))}

                <Separator />

                {/* Total */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {formatTaka(order.totalAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column — Actions + Reviews */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canCancel && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full gap-2"
                      disabled={cancelling}
                    >
                      {cancelling && <Loader2 className="h-4 w-4 animate-spin" />}
                      Cancel Order
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. The order{' '}
                        <span className="font-mono font-medium">
                          #{truncateId(order.id)}
                        </span>{' '}
                        will be marked as cancelled.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Order</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancel}
                        className="bg-destructive text-white hover:bg-destructive/90"
                      >
                        Yes, Cancel Order
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {!canCancel && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  {order.status === 'cancelled'
                    ? 'This order has been cancelled.'
                    : `This order is ${order.status} and cannot be cancelled.`}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Reviews per product */}
          {canReview && (
            <AnimatePresence>
              {order.items.map((item) => (
                <motion.div
                  key={`review-${item.productId}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <ProductReviews
                    productId={item.productId}
                    productName={item.product.name}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
}