'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Package,
  Store as StoreIcon,
  ShoppingBag,
  Sprout,
  Wrench,
  Info,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  ShieldCheck,
  Radio,
  TrendingUp,
  Eye,
  Users,
  Truck,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { usePlatformStore } from '@/store/platform-store';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StoreLocation {
  id: string;
  businessName: string;
  category: string;
  address: string;
  area?: string;
  city: string;
  district: string;
  division: string;
  rating: number;
  isOpen: boolean;
  phone?: string;
  operatingHours?: { day: string; open: string; close: string }[];
}

interface InventoryItem {
  id: string;
  entityType: string;
  entityId: string;
  sku?: string;
  stock: number;
  reserved: number;
  price: number;
  syncSource: string;
  lastSyncedAt: string;
}

interface StoreProduct {
  id: string;
  name: string;
  nameBn?: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  stock: number;
  unit?: string;
  avgRating?: number;
  reviewCount: number;
}

interface StoreFarmProduct {
  id: string;
  name: string;
  nameBn?: string;
  description?: string;
  price: number;
  unit?: string;
  category: string;
  imageUrl?: string;
  quantity: number;
  origin?: string;
  isOrganic: boolean;
  harvestDate?: string;
  farmer: { id: string; name: string; city?: string; avatarUrl?: string | null };
}

interface StoreService {
  id: string;
  name: string;
  nameBn?: string;
  description?: string;
  category: string;
  priceType: string;
  basePrice?: number;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  provider: { id: string; name: string; avatarUrl?: string | null; city?: string };
}

interface StoreOrder {
  id: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  deliveryType?: string;
  deliveryAddress?: string | null;
  createdAt: string;
  buyer: { id: string; name: string };
}

interface MerchantDetail {
  id: string;
  name: string;
  nameBn?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  category: string;
  subcategories?: string;
  tags?: string;
  isVerified: boolean;
  isLive: boolean;
  rating: number;
  totalSales: number;
  totalReviews: number;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  district?: string;
  division?: string;
  owner: { id: string; name: string; avatarUrl?: string | null };
  locations: StoreLocation[];
  inventoryItems: InventoryItem[];
  products: StoreProduct[];
  farmProducts: StoreFarmProduct[];
  services: StoreService[];
  recentOrders: StoreOrder[];
  inventorySyncPercentage: number;
  avgSyncAgeMinutes: number;
  lowStockItems: number;
  liveInventoryCount: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTaka(amount: number): string {
  return `৳${(amount / 100).toLocaleString('en-BD')}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  preparing: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

// ---------------------------------------------------------------------------
// Stars Component
// ---------------------------------------------------------------------------

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'size-3.5' : 'size-4';
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${cls} ${
            i < Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-muted text-muted'
          }`}
        />
      ))}
      <span className={`ml-1 ${size === 'sm' ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface MerchantStorefrontProps {
  merchantId: string;
}

export function MerchantStorefront({ merchantId }: MerchantStorefrontProps) {
  const [store, setStore] = useState<MerchantDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const setActiveView = usePlatformStore((s) => s.setActiveView);
  const addToCart = usePlatformStore((s) => s.addToCart);

  const fetchStore = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/merchants/${merchantId}`);
      if (!res.ok) throw new Error('Failed to load store');
      const data: MerchantDetail = await res.json();
      setStore(data);
    } catch {
      toast.error('Failed to load merchant storefront');
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  const handleAddToCart = (product: StoreProduct) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price / 100,
      quantity: 1,
      unit: product.unit,
      imageUrl: product.imageUrl,
    });
    toast.success(`${product.name} added to cart`);
  };

  // -- Loading Skeleton ---------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!store) {
    return (
      <Card className="rounded-xl">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Package className="mb-4 size-12 text-muted-foreground/40" />
          <p className="text-lg font-medium text-muted-foreground">Store not found</p>
          <Button variant="outline" className="mt-4" onClick={() => setActiveView('discover')}>
            <ArrowLeft className="mr-2 size-4" />
            Back to Discover
          </Button>
        </CardContent>
      </Card>
    );
  }

  const tags = store.tags ? store.tags.split(',') : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* ── Back Button ─────────────────────────────────────────────────── */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-muted-foreground hover:text-foreground"
        onClick={() => setActiveView('discover')}
      >
        <ArrowLeft className="size-4" />
        Back to Discover
      </Button>

      {/* ── Banner Section ──────────────────────────────────────────────── */}
      <Card className="overflow-hidden rounded-xl p-0">
        {/* Banner Image Area */}
        <div className="relative h-40 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 sm:h-56">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Badges */}
          <div className="absolute right-4 top-4 flex gap-2">
            {store.isVerified && (
              <Badge className="gap-1 bg-emerald-500 text-white hover:bg-emerald-600">
                <ShieldCheck className="size-3.5" />
                Verified
              </Badge>
            )}
            {store.isLive && (
              <Badge className="gap-1 bg-green-500 text-white hover:bg-green-600">
                <Radio className="size-3.5" />
                Live
              </Badge>
            )}
          </div>

          {/* Store Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            <div className="flex items-end gap-4">
              {/* Logo */}
              <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border-2 border-white/30 bg-white/20 backdrop-blur-sm sm:size-18">
                {store.logoUrl ? (
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="size-full rounded-[10px] object-cover"
                  />
                ) : (
                  <StoreIcon className="size-7 text-white sm:size-9" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold text-white sm:text-2xl">{store.name}</h1>
                {store.nameBn && (
                  <p className="mt-0.5 text-sm text-white/80">{store.nameBn}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/90">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {store.city}{store.district && `, ${store.district}`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="size-3.5" />
                    by {store.owner.name}
                  </span>
                  <Stars rating={store.rating} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Description */}
        {store.description && (
          <CardContent className="pt-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {store.description}
            </p>
            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* ── Inventory Sync Status Bar ───────────────────────────────────── */}
      <Card className="rounded-xl">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <RefreshCw className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">Inventory Sync</p>
                  <Badge variant="outline" className="text-xs">
                    {store.liveInventoryCount} items tracked
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Avg sync age: {Math.round(store.avgSyncAgeMinutes)} min ago
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {store.inventorySyncPercentage.toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">POS synced</p>
              </div>
              <Progress
                value={store.inventorySyncPercentage}
                className="h-2.5 w-28"
              />
            </div>
          </div>

          {store.lowStockItems > 0 && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 p-2.5 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{store.lowStockItems} item{store.lowStockItems > 1 ? 's' : ''} low on stock</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Stats Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: 'Products',
            value: store.products.length + store.farmProducts.length,
            icon: Package,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-100 dark:bg-blue-900/30',
          },
          {
            label: 'Total Sales',
            value: store.totalSales.toLocaleString(),
            icon: TrendingUp,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-100 dark:bg-emerald-900/30',
          },
          {
            label: 'Rating',
            value: store.rating.toFixed(1),
            icon: Star,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-100 dark:bg-amber-900/30',
          },
          {
            label: 'Reviews',
            value: store.totalReviews.toLocaleString(),
            icon: Eye,
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-100 dark:bg-purple-900/30',
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="rounded-xl">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`flex size-10 items-center justify-center rounded-lg ${stat.bg}`}>
                  <stat.icon className={`size-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Tabs: Products | Farm Products | Services | Info ───────────── */}
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="products" className="gap-1.5">
            <ShoppingBag className="size-4" />
            <span className="hidden sm:inline">Products</span>
            <span className="sm:hidden">Items</span>
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-xs">
              {store.products.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="farm" className="gap-1.5">
            <Sprout className="size-4" />
            <span className="hidden sm:inline">Farm Products</span>
            <span className="sm:hidden">Farm</span>
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-xs">
              {store.farmProducts.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="services" className="gap-1.5">
            <Wrench className="size-4" />
            Services
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-xs">
              {store.services.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="info" className="gap-1.5">
            <Info className="size-4" />
            Info
          </TabsTrigger>
        </TabsList>

        {/* ── Products Tab ─────────────────────────────────────────────── */}
        <TabsContent value="products">
          <AnimatePresence mode="wait">
            {store.products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="rounded-xl">
                  <CardContent className="flex flex-col items-center py-12">
                    <ShoppingBag className="mb-3 size-10 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No products listed yet</p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="products-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {store.products.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="group h-full overflow-hidden rounded-xl transition-shadow hover:shadow-md">
                      <div className="relative h-36 bg-muted">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            <Package className="size-10 text-muted-foreground/20" />
                          </div>
                        )}
                        {product.nameBn && (
                          <Badge className="absolute left-2 top-2 bg-black/50 text-white text-xs backdrop-blur-sm">
                            {product.nameBn}
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="line-clamp-1 text-sm font-semibold">{product.name}</h3>
                        {product.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {product.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          <div>
                            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                              {formatTaka(product.price)}
                            </p>
                            {product.unit && (
                              <p className="text-xs text-muted-foreground">per {product.unit}</p>
                            )}
                          </div>
                          {product.avgRating !== undefined && (
                            <Stars rating={product.avgRating} />
                          )}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              product.stock <= 5
                                ? 'border-red-300 text-red-600 dark:border-red-800 dark:text-red-400'
                                : ''
                            }`}
                          >
                            {product.stock <= 0
                              ? 'Out of stock'
                              : product.stock <= 5
                                ? `Only ${product.stock} left`
                                : `${product.stock} in stock`}
                          </Badge>
                          <Button
                            size="sm"
                            className="h-7 text-xs"
                            disabled={product.stock <= 0}
                            onClick={() => handleAddToCart(product)}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ── Farm Products Tab ────────────────────────────────────────── */}
        <TabsContent value="farm">
          <AnimatePresence mode="wait">
            {store.farmProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="rounded-xl">
                  <CardContent className="flex flex-col items-center py-12">
                    <Sprout className="mb-3 size-10 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No farm products listed yet</p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="farm-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {store.farmProducts.map((fp, idx) => (
                  <motion.div
                    key={fp.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="group h-full overflow-hidden rounded-xl transition-shadow hover:shadow-md">
                      <div className="relative h-36 bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20">
                        {fp.imageUrl ? (
                          <img
                            src={fp.imageUrl}
                            alt={fp.name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            <Sprout className="size-10 text-emerald-500/30" />
                          </div>
                        )}
                        {fp.isOrganic && (
                          <Badge className="absolute left-2 top-2 bg-emerald-600 text-white text-xs">
                            <CheckCircle2 className="mr-1 size-3" />
                            Organic
                          </Badge>
                        )}
                        {fp.origin && (
                          <Badge
                            variant="secondary"
                            className="absolute right-2 top-2 bg-white/80 text-xs backdrop-blur-sm dark:bg-black/50"
                          >
                            <MapPin className="mr-1 size-3" />
                            {fp.origin}
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="line-clamp-1 text-sm font-semibold">{fp.name}</h3>
                        {fp.nameBn && (
                          <p className="text-xs text-muted-foreground">{fp.nameBn}</p>
                        )}
                        {fp.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {fp.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          <div>
                            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                              {formatTaka(fp.price)}
                            </p>
                            {fp.unit && (
                              <p className="text-xs text-muted-foreground">per {fp.unit}</p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {fp.quantity} available
                          </Badge>
                        </div>
                        {fp.harvestDate && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            Harvested: {fp.harvestDate}
                          </div>
                        )}
                        {fp.farmer && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            by <span className="font-medium text-foreground">{fp.farmer.name}</span>
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ── Services Tab ─────────────────────────────────────────────── */}
        <TabsContent value="services">
          <AnimatePresence mode="wait">
            {store.services.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="rounded-xl">
                  <CardContent className="flex flex-col items-center py-12">
                    <Wrench className="mb-3 size-10 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No services listed yet</p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="services-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                {store.services.map((svc, idx) => (
                  <motion.div
                    key={svc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="group h-full overflow-hidden rounded-xl transition-shadow hover:shadow-md">
                      <CardContent className="flex gap-4 p-4">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-teal-50 dark:from-cyan-900/30 dark:to-teal-900/20">
                          <Wrench className="size-6 text-cyan-600/60 dark:text-cyan-400/60" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="line-clamp-1 text-sm font-semibold">{svc.name}</h3>
                            {svc.isAvailable ? (
                              <Badge className="shrink-0 bg-emerald-100 text-emerald-700 text-xs dark:bg-emerald-900/30 dark:text-emerald-400">
                                Available
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="shrink-0 text-xs">
                                Unavailable
                              </Badge>
                            )}
                          </div>
                          {svc.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                              {svc.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center justify-between">
                            <div>
                              {svc.basePrice != null ? (
                                <p className="text-base font-bold text-cyan-600 dark:text-cyan-400">
                                  {formatTaka(svc.basePrice)}
                                </p>
                              ) : (
                                <p className="text-sm font-medium text-muted-foreground">
                                  Quoted on request
                                </p>
                              )}
                              {svc.priceType === 'fixed' && (
                                <p className="text-xs text-muted-foreground">Fixed price</p>
                              )}
                            </div>
                            <Stars rating={svc.rating} />
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            ({svc.reviewCount} reviews)
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ── Info Tab ─────────────────────────────────────────────────── */}
        <TabsContent value="info">
          <div className="space-y-6">
            {/* Business Locations */}
            <Card className="rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="size-5 text-emerald-600" />
                  Business Locations
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {store.locations.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {store.locations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No locations listed</p>
                ) : (
                  store.locations.map((loc) => (
                    <div
                      key={loc.id}
                      className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold">{loc.businessName}</h4>
                          <span
                            className={`inline-flex size-2 rounded-full ${
                              loc.isOpen ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                          />
                          <span
                            className={`text-xs font-medium ${
                              loc.isOpen
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {loc.isOpen ? 'Open' : 'Closed'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {loc.address}, {loc.area && `${loc.area}, `}{loc.city}, {loc.division}
                        </p>
                        <div className="mt-1 flex items-center gap-3">
                          <Stars rating={loc.rating} />
                          {loc.phone && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="size-3" />
                              {loc.phone}
                            </span>
                          )}
                        </div>
                        {/* Operating Hours */}
                        {loc.operatingHours && loc.operatingHours.length > 0 && (
                          <div className="mt-2 rounded-md bg-muted/50 p-2">
                            <p className="mb-1 text-xs font-medium text-muted-foreground">
                              <Clock className="mr-1 inline size-3" />
                              Operating Hours
                            </p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                              {loc.operatingHours.map((oh) => (
                                <div key={oh.day} className="flex justify-between gap-2">
                                  <span>{oh.day}</span>
                                  <span className="font-medium">
                                    {oh.open} - {oh.close}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Phone className="size-5 text-emerald-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {store.phone && (
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                        <Phone className="size-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium">{store.phone}</p>
                      </div>
                    </div>
                  )}
                  {store.email && (
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Mail className="size-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium">{store.email}</p>
                      </div>
                    </div>
                  )}
                  {store.website && (
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <Globe className="size-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground">Website</p>
                        <p className="truncate text-sm font-medium">{store.website}</p>
                      </div>
                    </div>
                  )}
                  {store.address && (
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                        <MapPin className="size-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Address</p>
                        <p className="text-sm font-medium">{store.address}</p>
                        {store.city && (
                          <p className="text-xs text-muted-foreground">
                            {store.city}, {store.district}, {store.division}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Truck className="size-5 text-emerald-600" />
                  Recent Orders
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {store.recentOrders.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {store.recentOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent orders</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {store.recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">
                              Order #{order.id.slice(-6).toUpperCase()}
                            </p>
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                statusColor[order.status] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            by {order.buyer.name} &middot; {timeAgo(order.createdAt)}
                          </p>
                          {order.deliveryAddress && (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="size-3" />
                              {order.deliveryAddress}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">
                            {formatTaka(order.totalAmount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.paymentMethod || 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Inventory Sync Details */}
            <Card className="rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <RefreshCw className="size-5 text-emerald-600" />
                  Inventory Sync Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {store.inventoryItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No inventory synced yet</p>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b text-xs text-muted-foreground">
                            <th className="pb-2 pr-4 font-medium">SKU</th>
                            <th className="pb-2 pr-4 font-medium">Type</th>
                            <th className="pb-2 pr-4 font-medium">Stock</th>
                            <th className="pb-2 pr-4 font-medium">Reserved</th>
                            <th className="pb-2 pr-4 font-medium">Price</th>
                            <th className="pb-2 pr-4 font-medium">Source</th>
                            <th className="pb-2 font-medium">Last Sync</th>
                          </tr>
                        </thead>
                        <tbody>
                          {store.inventoryItems.map((inv) => (
                            <tr key={inv.id} className="border-b last:border-0">
                              <td className="py-2 pr-4 font-mono text-xs">{inv.sku || '—'}</td>
                              <td className="py-2 pr-4">
                                <Badge variant="outline" className="text-xs">
                                  {inv.entityType.replace('_', ' ')}
                                </Badge>
                              </td>
                              <td className="py-2 pr-4">
                                <span
                                  className={
                                    inv.stock - inv.reserved <= 5
                                      ? 'font-medium text-red-600 dark:text-red-400'
                                      : ''
                                  }
                                >
                                  {inv.stock}
                                </span>
                              </td>
                              <td className="py-2 pr-4 text-muted-foreground">{inv.reserved}</td>
                              <td className="py-2 pr-4 font-medium">
                                {formatTaka(inv.price)}
                              </td>
                              <td className="py-2 pr-4">
                                <Badge
                                  variant="secondary"
                                  className={`text-xs ${
                                    inv.syncSource === 'pos'
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                      : ''
                                  }`}
                                >
                                  {inv.syncSource.toUpperCase()}
                                </Badge>
                              </td>
                              <td className="py-2 text-xs text-muted-foreground">
                                {timeAgo(inv.lastSyncedAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

// Re-export for dynamic import
export default MerchantStorefront;