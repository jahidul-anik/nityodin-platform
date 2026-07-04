'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Search,
  MapPin,
  Star,
  Phone,
  SearchX,
  ChevronRight,
  Sparkles,
  Loader2,
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DiscoverSection() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const { discoverCategory, setDiscoverCategory, discoverRadius, setDiscoverRadius } =
    usePlatformStore();

  // -- Fetch businesses -----------------------------------------------------

  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  }, [discoverCategory]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  // -- Filtered results -----------------------------------------------------

  const filtered = useMemo(() => {
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

  // -- Featured (top 3 by rating) -------------------------------------------

  const featured = useMemo(() => {
    return [...businesses]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  }, [businesses]);

  // -- Star rendering -------------------------------------------------------

  const Stars = ({ rating }: { rating: number }) => (
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

  // -- Business card --------------------------------------------------------

  const BusinessCard = ({ b, featured: isFeatured }: { b: Business; featured?: boolean }) => (
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
            onClick={() => toast.info('Business details coming soon')}
          >
            View Details
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // -- Skeleton -------------------------------------------------------------

  if (loading) {
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
      {/* ── Search Bar ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search shops, services, products near you..."
            className="h-11 pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
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
      </div>

      {/* ── Category Filters ────────────────────────────────────────────── */}
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

      {/* ── Featured Section ────────────────────────────────────────────── */}
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

      {/* ── Results Grid ────────────────────────────────────────────────── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {discoverCategory === 'All' ? 'All Businesses' : discoverCategory}
          </h3>
          <span className="text-sm text-muted-foreground">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filtered.length === 0 ? (
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
            {filtered.map((b) => (
              <BusinessCard key={b.id} b={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}