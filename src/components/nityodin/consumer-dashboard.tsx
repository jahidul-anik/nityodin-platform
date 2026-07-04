'use client';

import { useEffect, useState } from 'react';
import {
  Wallet,
  ShoppingCart,
  ShoppingBag,
  Star,
  MapPin,
  ChevronDown,
  ChevronUp,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlatformStore } from '@/store/platform-store';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WalletData {
  id?: string;
  balance: number;
  isFrozen: boolean;
  transactions?: unknown[];
}

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: { id: string; name: string; imageUrl?: string };
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  seller: { id: string; name: string; avatarUrl?: string };
  items: OrderItem[];
}

interface Product {
  id: string;
  name: string;
  nameBn?: string;
  price: number;
  category: string;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  unit?: string;
}

interface Service {
  id: string;
  name: string;
  category: string;
  basePrice: number | null;
  priceType: string;
  rating: number;
  reviewCount: number;
  provider: { id: string; name: string; city?: string; avatarUrl?: string };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTaka(amount: number): string {
  return `৳${(amount / 100).toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function truncateId(id: string): string {
  return id.length > 12 ? `${id.slice(0, 8)}...${id.slice(-4)}` : id;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
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
    accepted: 'status-accepted',
    in_progress: 'status-in_progress',
    scheduled: 'status-scheduled',
  };
  return map[status] ?? 'status-pending';
}

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f${i}`} className="h-3 w-3 fill-amber-400 text-amber-400" />
      ))}
      {half === 1 && (
        <Star key="half" className="h-3 w-3 fill-amber-400/50 text-amber-400" />
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e${i}`} className="h-3 w-3 text-muted-foreground/30" />
      ))}
      <span className="ml-1">{rating.toFixed(1)}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ConsumerDashboard({ activeTab = 'Overview' }: { activeTab?: string }) {
  const cart = usePlatformStore((s) => s.cart);
  const addToCart = usePlatformStore((s) => s.addToCart);

  const [userName, setUserName] = useState('User');
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [userRes, walletRes, ordersRes, productsRes, servicesRes] =
          await Promise.all([
            fetch('/api/users/me'),
            fetch('/api/wallet'),
            fetch('/api/orders'),
            fetch('/api/products?category=grocery'),
            fetch('/api/services?category=domestic'),
          ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.user?.name) setUserName(userData.user.name);
        }
        if (walletRes.ok) {
          const w = await walletRes.json();
          setWallet(w);
        }
        if (ordersRes.ok) {
          const o = await ordersRes.json();
          setOrders(Array.isArray(o) ? o.slice(0, 5) : []);
        }
        if (productsRes.ok) {
          const p = await productsRes.json();
          setProducts(Array.isArray(p) ? p.slice(0, 4) : []);
        }
        if (servicesRes.ok) {
          const s = await servicesRes.json();
          setServices(Array.isArray(s) ? s.slice(0, 3) : []);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const activeOrders = orders.filter(
    (o) => o.status !== 'cancelled' && o.status !== 'delivered' && o.status !== 'completed',
  );

  // -------------------------------------------------------------------------
  // Skeletons
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Greeting */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        {/* Main */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        </div>
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back, {userName}! 👋
        </h2>
        <Badge variant="secondary" className="w-fit capitalize">
          Consumer
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Wallet Balance</p>
              <p className="text-xl font-bold">
                {formatTaka(wallet?.balance ?? 0)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Orders</p>
              <p className="text-xl font-bold">{activeOrders.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cart Items</p>
              <p className="text-xl font-bold">
                {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className={cn(
        'grid gap-6',
        activeTab === 'Orders'
          ? 'grid-cols-1'
          : activeTab === 'Services'
            ? 'grid-cols-1'
            : 'grid-cols-1 lg:grid-cols-3',
      )}>
        {/* Left - Recent Orders */}
        <div className={cn(
          activeTab === 'Orders' ? '' : 'lg:col-span-2',
          activeTab === 'Orders' && 'ring-2 ring-primary/20 rounded-lg p-1',
        )}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No orders yet. Start shopping!
                </p>
              ) : (
                orders.map((order) => {
                  const isExpanded = expandedOrder === order.id;
                  return (
                    <div
                      key={order.id}
                      className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <button
                        className="flex w-full items-start justify-between gap-4 text-left"
                        onClick={() =>
                          setExpandedOrder(isExpanded ? null : order.id)
                        }
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm font-medium">
                              #{truncateId(order.id)}
                            </span>
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusClass(order.status)}`}
                            >
                              {order.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(order.createdAt)}
                            </span>
                            <span>{order.items.length} item(s)</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold">
                            {formatTaka(order.totalAmount)}
                          </p>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </button>

                      {/* Expanded items */}
                      {isExpanded && (
                        <div className="mt-3 border-t pt-3 space-y-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="truncate">{item.product.name}</span>
                                <span className="text-muted-foreground">
                                  x{item.quantity}
                                </span>
                              </div>
                              <span className="font-medium shrink-0">
                                {formatTaka(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right - Recommended Products */}
        <div className={cn(
          activeTab === 'Services' && 'ring-2 ring-primary/20 rounded-lg p-1',
        )}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recommended For You</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {products.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No products found.
                </p>
              ) : (
                products.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col gap-2 rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      {renderStars(product.rating)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-emerald-600">
                        {formatTaka(product.price)}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => {
                          addToCart({
                            productId: product.id,
                            name: product.name,
                            price: product.price,
                            quantity: 1,
                            unit: product.unit,
                            imageUrl: product.imageUrl,
                          });
                          toast.success(`${product.name} added to cart`);
                        }}
                      >
                        <ShoppingBag className="mr-1 h-3 w-3" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom - Popular Services */}
      <Card className={cn(
        activeTab === 'Services' && 'ring-2 ring-primary/20',
      )}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-rose-500" />
            Popular Services Near You
          </CardTitle>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No services available nearby.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="rounded-lg border p-4 flex flex-col justify-between gap-3"
                >
                  <div>
                    <p className="font-medium text-sm">{service.name}</p>
                    <p className="text-xs text-muted-foreground">
                      by {service.provider.name}
                    </p>
                    <div className="mt-1">{renderStars(service.rating)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-emerald-600">
                      {service.basePrice
                        ? formatTaka(service.basePrice)
                        : 'Varies'}
                    </span>
                    <Button
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() =>
                        toast.info(
                          `Booking "${service.name}" — feature coming soon!`,
                        )
                      }
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}