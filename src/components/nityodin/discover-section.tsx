'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Search,
  MapPin,
  Star,
  Phone,
  SearchX,
  ChevronRight,
  Sparkles,
  Store,
  ShieldCheck,
  Radio,
  TrendingUp,
  Package,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePlatformStore } from '@/store/platform-store';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BusinessOwner {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface Business {
  id: string;
  ownerId: string;
  businessName: string;
  category: string;
  subcategories?: string;
  address: string;
  area?: string;
  city: string;
  district: string;
  division: string;
  rating: number;
  isOpen: boolean;
  phone?: string;
  createdAt: string;
  owner: BusinessOwner;
  distance?: number;
  distanceText?: string;
}

interface Merchant {
  id: string;
  ownerId: string;
  name: string;
  nameBn?: string;
  slug: string;
  description?: string;
  category: string;
  isVerified: boolean;
  isLive: boolean;
  rating: number;
  totalSales: number;
  totalReviews: number;
  city?: string;
  owner: BusinessOwner;
  isOpen: boolean;
  openLocationCount: number;
  primaryLocation: string;
  itemCount: number;
  _count: {
    products: number;
    farmProducts: number;
    services: number;
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES = [
  'All',
  'Grocery',
  'Fashion',
  'Organic',
  'Domestic Services',
  'Business Services',
  'Auto Repair',
  'Photography',
];

const CATEGORY_QUERY_MAP: Record<string, string> = {
  All: '',
  Grocery: 'grocery',
  Fashion: 'fashion',
  Organic: 'organic',
  'Domestic Services': 'domestic_services',
  'Business Services': 'business_services',
  'Auto Repair': 'auto_repair',
  Photography: 'photography',
};

const MERCHANT_CATEGORIES = [
  'All',
  'Grocery',
  'Electronics',
  'Agriculture',
  'Services',
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${
            i < Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-muted text-muted'
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">({rating.toFixed(1)})</span>
    </div>
  );
}

function BusinessCard({ b, featured: isFeatured, onNavigate }: { b: Business; featured?: boolean; onNavigate?: () => void }) {
  return (
    <Card
      className={`group overflow-hidden rounded-xl transition-all hover:shadow-md ${
        isFeatured ? 'animated-border' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className={`line-clamp-1 ${isFeatured ? 'text-lg' : 'text-sm'} font-bold`}>
            {b.businessName}
          </h3>
          <div className="flex shrink-0 items-center gap-1.5">
            <span
              className={`inline-flex size-2 rounded-full ${
                b.isOpen ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
            <span className={`text-xs font-medium ${b.isOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {b.isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>

        <Badge variant="secondary" className="mt-2 text-xs">
          {b.category.replace(/_/g, ' ')}
        </Badge>

        <div className="mt-2 flex items-start gap-1.5 text-muted-foreground">
          <MapPin className="mt-0.5 size-3.5 shrink-0" />
          <span className="line-clamp-1 text-xs">{b.address}, {b.city}</span>
        </div>

        {b.distanceText && (
          <p className="mt-1 text-xs font-medium text-primary">
            {b.distanceText} away
          </p>
        )}

        <div className="mt-2">
          <Stars rating={b.rating} />
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          by <span className="font-medium text-foreground">{b.owner.name}</span>
        </p>

        <div className="mt-3 flex items-center gap-2">
          {b.phone && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
              onClick={() => toast.info(`Calling ${b.phone}`)}
            >
              <Phone className="size-3.5" />
              Call
            </Button>
          )}
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={onNavigate || (() => toast.info('Business details coming soon'))}
          >
            View Details
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MerchantCard({ m, onNavigate }: { m: Merchant; onNavigate: () => void }) {
  return (
    <Card className="group overflow-hidden rounded-xl transition-all hover:shadow-md">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Store className="size-5" />
            </div>
            <div className="min-w-0">
              <h3 className="line-clamp-1 text-sm font-bold">{m.name}</h3>
              {m.nameBn && (
                <p className="text-xs text-muted-foreground">{m.nameBn}</p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {m.isVerified && (
              <ShieldCheck className="size-4 text-emerald-500" />
            )}
            {m.isLive && (
              <Badge className="h-5 gap-1 bg-green-500 px-1.5 text-white text-[10px]">
                <Radio className="size-3" />
                Live
              </Badge>
            )}
          </div>
        </div>

        {/* Category & Rating */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs capitalize">
            {m.category}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className={`inline-flex size-2 rounded-full ${m.isOpen ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {m.isOpen ? `${m.openLocationCount} open` : 'Closed'}
          </span>
        </div>

        {/* Location */}
        <div className="mt-2 flex items-start gap-1.5 text-muted-foreground">
          <MapPin className="mt-0.5 size-3.5 shrink-0" />
          <span className="line-clamp-1 text-xs">{m.primaryLocation}</span>
        </div>

        {/* Stats Row */}
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Package className="size-3" />
            {m.itemCount} items
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="size-3" />
            {m.totalSales.toLocaleString()} sales
          </span>
          <span>({m.totalReviews})</span>
        </div>

        {/* Rating */}
        <div className="mt-2">
          <Stars rating={m.rating} />
        </div>

        {/* Owner */}
        <p className="mt-1.5 text-xs text-muted-foreground">
          by <span className="font-medium text-foreground">{m.owner.name}</span>
        </p>

        {/* Action */}
        <Button
          size="sm"
          className="mt-3 h-8 w-full gap-1.5 text-xs"
          onClick={onNavigate}
        >
          Visit Storefront
          <ChevronRight className="size-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

type DiscoverTab = 'businesses' | 'merchants';

export function DiscoverSection() {
  const [activeTab, setActiveTab] = useState<DiscoverTab>('businesses');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loadingBiz, setLoadingBiz] = useState(true);
  const [loadingMerch, setLoadingMerch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [merchantCategory, setMerchantCategory] = useState('All');
  const [merchantSort, setMerchantSort] = useState('rating');

  const { discoverCategory, setDiscoverCategory, discoverRadius, setDiscoverRadius, navigateToMerchant } =
    usePlatformStore();

  // -- Fetch businesses -----------------------------------------------------

  const fetchBusinesses = useCallback(async () => {
    try {
      setLoadingBiz(true);
      const params = new URLSearchParams();
      const cat = CATEGORY_QUERY_MAP[discoverCategory];
      if (cat) params.set('category', cat);
      const res = await fetch(`/api/discover?${params.toString()}`);
      if (!res.ok) throw new Error('Failed');
      const data: Business[] = await res.json();
      setBusinesses(data);
    } catch {
      toast.error('Failed to load businesses');
    } finally {
      setLoadingBiz(false);
    }
  }, [discoverCategory]);

  // -- Fetch merchants -----------------------------------------------------

  const fetchMerchants = useCallback(async () => {
    try {
      setLoadingMerch(true);
      const params = new URLSearchParams();
      if (merchantCategory !== 'All') params.set('category', merchantCategory.toLowerCase());
      params.set('sortBy', merchantSort);
      params.set('isLive', 'true');
      const res = await fetch(`/api/merchants?${params.toString()}`);
      if (!res.ok) throw new Error('Failed');
      const data: Merchant[] = await res.json();
      setMerchants(data);
    } catch {
      toast.error('Failed to load merchants');
    } finally {
      setLoadingMerch(false);
    }
  }, [merchantCategory, merchantSort]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  useEffect(() => {
    if (activeTab === 'merchants') fetchMerchants();
  }, [activeTab, fetchMerchants]);

  // -- Filtered results -----------------------------------------------------

  const filteredBiz = useMemo(() => {
    let results = businesses;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (b) =>
          b.businessName.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.address.toLowerCase().includes(q)
      );
    }
    return results;
  }, [businesses, searchQuery]);

  const filteredMerchants = useMemo(() => {
    if (!searchQuery.trim()) return merchants;
    const q = searchQuery.toLowerCase();
    return merchants.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.nameBn && m.nameBn.includes(q)) ||
        m.category.toLowerCase().includes(q) ||
        (m.city && m.city.toLowerCase().includes(q))
    );
  }, [merchants, searchQuery]);

  // -- Featured (top 3 by rating) -------------------------------------------

  const featured = useMemo(() => {
    return [...businesses]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  }, [businesses]);

  // -- Skeleton -----------------------------------------------------------

  if (loadingBiz && activeTab === 'businesses') {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 shrink-0 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Tab Switcher ──────────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {(['businesses', 'merchants'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="discover-tab"
                className="absolute inset-0 rounded-md bg-background shadow-sm"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">
              {tab === 'businesses' ? (
                <MapPin className="size-4" />
              ) : (
                <Store className="size-4" />
              )}
              {tab === 'businesses' ? 'Browse Businesses' : 'Browse Merchants'}
            </span>
          </button>
        ))}
      </div>

      {/* ── Search Bar ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={
              activeTab === 'merchants'
                ? 'Search merchants, stores, brands...'
                : 'Search shops, services, products near you...'
            }
            className="h-11 pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {activeTab === 'businesses' && (
          <Select
            value={String(discoverRadius)}
            onValueChange={(v) => setDiscoverRadius(Number(v))}
          >
            <SelectTrigger className="h-11 w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 km</SelectItem>
              <SelectItem value="5">5 km</SelectItem>
              <SelectItem value="10">10 km</SelectItem>
              <SelectItem value="25">25 km</SelectItem>
              <SelectItem value="100">100 km</SelectItem>
            </SelectContent>
          </Select>
        )}
        {activeTab === 'merchants' && (
          <Select
            value={merchantSort}
            onValueChange={setMerchantSort}
          >
            <SelectTrigger className="h-11 w-full sm:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="sales">Most Sales</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* ════════════════════════════════════════════════════════════════
            BUSINESSES TAB
            ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'businesses' && (
          <motion.div
            key="businesses"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setDiscoverCategory(cat)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    discoverCategory === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Featured Section */}
            {featured.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="size-5 text-amber-500" />
                  <h3 className="text-lg font-semibold">Featured Near You</h3>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none md:grid md:grid-cols-3 md:overflow-visible">
                  {featured.map((b) => (
                    <div key={b.id} className="w-72 shrink-0 md:w-auto">
                      <BusinessCard b={b} featured />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results Grid */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {discoverCategory === 'All' ? 'All Businesses' : discoverCategory}
                </h3>
                <span className="text-sm text-muted-foreground">
                  {filteredBiz.length} result{filteredBiz.length !== 1 ? 's' : ''}
                </span>
              </div>

              {filteredBiz.length === 0 ? (
                <Card className="rounded-xl">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <SearchX className="mb-4 size-12 text-muted-foreground/40" />
                    <p className="text-lg font-medium text-muted-foreground">No results found</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Try adjusting your search or filters
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredBiz.map((b) => (
                    <BusinessCard key={b.id} b={b} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            MERCHANTS TAB
            ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'merchants' && (
          <motion.div
            key="merchants"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Merchant Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {MERCHANT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setMerchantCategory(cat)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    merchantCategory === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {loadingMerch ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-xl" />
                ))}
              </div>
            ) : filteredMerchants.length === 0 ? (
              <Card className="rounded-xl">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Store className="mb-4 size-12 text-muted-foreground/40" />
                  <p className="text-lg font-medium text-muted-foreground">No merchants found</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {merchantCategory === 'All' ? 'All Merchants' : merchantCategory}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {filteredMerchants.length} merchant{filteredMerchants.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredMerchants.map((m, idx) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.25 }}
                    >
                      <MerchantCard
                        m={m}
                        onNavigate={() => navigateToMerchant(m.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}