'use client';

import { useEffect, useState } from 'react';
import {
  Store,
  TrendingUp,
  TrendingDown,
  Package,
  Pencil,
  Trash2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MerchantAnalytics {
  revenue: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
  };
  topProducts: { name: string; sold: number; revenue: number }[];
  recentOrders: RecentOrder[];
}

interface RecentOrder {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  buyer: { id: string; name: string; avatarUrl?: string };
  items: { id: string; quantity: number; price: number; product: { id: string; name: string } }[];
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  isActive: boolean;
  rating: number;
  reviewCount: number;
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

function generateRevenueData(realCount: number): { day: string; revenue: number }[] {
  const days = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const today = new Date().getDay();
  // Generate mock 7-day data
  return days.map((label, i) => ({
    day: label,
    revenue: Math.floor(Math.random() * 80000 + 20000), // 200-1000 taka in paisa
  }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MerchantDashboard({ activeTab = 'Overview' }: { activeTab?: string }) {
  const [analytics, setAnalytics] = useState<MerchantAnalytics | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [analyticsRes, productsRes] = await Promise.all([
          fetch('/api/analytics/merchant'),
          fetch('/api/products'),
        ]);

        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          setAnalytics(data);
        }
        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to fetch merchant data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const revenueData = generateRevenueData(analytics?.recentOrders?.length ?? 0);

  // -------------------------------------------------------------------------
  // Skeletons
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center gap-3">
        <Store className="h-7 w-7 text-emerald-600" />
        <h2 className="text-2xl font-bold tracking-tight">Merchant Dashboard</h2>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">This Month Revenue</p>
            <p className="text-2xl font-bold mt-1">
              {formatTaka(analytics?.revenue.thisMonth ?? 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold mt-1">
              {analytics?.orders.total ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Growth</p>
            <div className="flex items-center gap-2 mt-1">
              {(analytics?.revenue.growth ?? 0) >= 0 ? (
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-500" />
              )}
              <p
                className={`text-2xl font-bold ${(analytics?.revenue.growth ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
              >
                {(analytics?.revenue?.growth ?? 0) >= 0 ? '+' : ''}
                {(analytics?.revenue?.growth ?? 0).toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className={cn(
        activeTab === 'Overview' && 'ring-2 ring-primary/20',
      )}>
        <CardHeader>
          <CardTitle className="text-lg">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <YAxis
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  tickFormatter={(v: number) => `৳${(v / 100).toFixed(0)}`}
                />
                <Tooltip
                  formatter={(value: number) => [formatTaka(value), 'Revenue']}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid hsl(var(--border))',
                    backgroundColor: 'hsl(var(--popover))',
                    color: 'hsl(var(--popover-foreground))',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#emeraldGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Product Management Table */}
      <Card className={cn(
        activeTab === 'Products' && 'ring-2 ring-primary/20',
      )}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            Product Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No products found. Add your first product!
            </p>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="hidden md:table-cell">Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="hidden sm:table-cell capitalize text-sm text-muted-foreground">
                        {product.category}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatTaka(product.price)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {product.stock}
                      </TableCell>
                      <TableCell>
                        {product.isActive ? (
                          <Badge variant="outline" className="border-emerald-300 text-emerald-600">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-red-300 text-red-600">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              toast.info(`Editing "${product.name}" — feature coming soon!`)
                            }
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() =>
                              toast.info(`Deleting "${product.name}" — feature coming soon!`)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card className={cn(
        activeTab === 'Orders' && 'ring-2 ring-primary/20',
      )}>
        <CardHeader>
          <CardTitle className="text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(!analytics?.recentOrders || analytics.recentOrders.length === 0) ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No orders received yet.
            </p>
          ) : (
            analytics.recentOrders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border p-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
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
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.buyer.name} &middot;{' '}
                      <span className="flex items-center gap-1 inline-flex">
                        <Clock className="h-3 w-3" />
                        {formatDate(order.createdAt)}
                      </span>
                    </p>
                  </div>
                </div>
                <p className="text-sm font-bold shrink-0">
                  {formatTaka(order.totalAmount)}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}