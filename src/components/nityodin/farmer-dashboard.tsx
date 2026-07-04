'use client';

import { useEffect, useState } from 'react';
import {
  Leaf,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Sprout,
  Truck,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
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
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MarketPrice {
  id: string;
  commodity: string;
  price: number;
  unit: string;
  change: number | null;
  date: string;
  market: string | null;
}

interface FarmProduct {
  id: string;
  name: string;
  nameBn: string | null;
  price: number;
  unit: string | null;
  quantity: number;
  origin: string | null;
  isOrganic: boolean;
  category: string;
  imageUrl: string | null;
  isActive: boolean;
  farmer: { id: string; name: string; city?: string };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTaka(amount: number): string {
  return `৳${(amount / 100).toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FarmerDashboard({ activeTab = 'Overview' }: { activeTab?: string }) {
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [farmProducts, setFarmProducts] = useState<FarmProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [pricesRes, productsRes] = await Promise.all([
          fetch('/api/market-prices'),
          fetch('/api/farm-products'),
        ]);

        if (pricesRes.ok) {
          const data = await pricesRes.json();
          setMarketPrices(Array.isArray(data) ? data : []);
          if (data.length > 0) {
            setLastUpdated(data[0].date);
          }
        }
        if (productsRes.ok) {
          const data = await productsRes.json();
          setFarmProducts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to fetch farmer data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // -------------------------------------------------------------------------
  // Skeletons
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-72 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-40 rounded-lg" />
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
        <Leaf className="h-7 w-7 text-emerald-600" />
        <h2 className="text-2xl font-bold tracking-tight">Farmer Dashboard</h2>
      </div>

      {/* Market Prices Panel */}
      <Card className={cn(
        activeTab === 'Market Prices' && 'ring-2 ring-primary/20',
      )}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Market Prices</CardTitle>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Last updated: {lastUpdated}
            </span>
          )}
        </CardHeader>
        <CardContent>
          {marketPrices.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No market price data available.
            </p>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Commodity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marketPrices.map((item) => {
                    const changeVal = item.change ?? 0;
                    const isSignificant = Math.abs(changeVal) > 3;
                    return (
                      <TableRow
                        key={item.id}
                        className={isSignificant ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''}
                      >
                        <TableCell className="font-medium">{item.commodity}</TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {formatTaka(item.price)}
                          <span className="text-muted-foreground text-xs ml-1">
                            /{item.unit}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`inline-flex items-center gap-1 text-sm font-medium ${changeVal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
                          >
                            {changeVal >= 0 ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4" />
                            )}
                            {changeVal >= 0 ? '+' : ''}
                            {changeVal.toFixed(1)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Farm Products */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">My Farm Products</h3>
        <Button
          size="sm"
          className="h-8 text-xs"
          onClick={() => toast.info('Add New Listing — feature coming soon!')}
        >
          <Plus className="mr-1 h-3 w-3" />
          Add New Listing
        </Button>
      </div>

      {farmProducts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Sprout className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No farm products listed yet. Add your first listing!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {farmProducts.map((product) => (
            <Card key={product.id} className="flex flex-col">
              <CardContent className="flex-1 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    {product.nameBn && (
                      <p className="text-xs text-muted-foreground">{product.nameBn}</p>
                    )}
                  </div>
                  {product.isOrganic && (
                    <Badge
                      variant="outline"
                      className="border-emerald-300 text-emerald-600 shrink-0 text-xs"
                    >
                      Organic
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-emerald-600">
                    {formatTaka(product.price)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Qty: {product.quantity} {product.unit ?? 'pcs'}
                  </span>
                </div>

                {product.origin && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    Origin: {product.origin}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Supply Chain Info */}
      <Card className={cn(
        activeTab === 'Overview' && 'ring-2 ring-primary/20',
        'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20',
      )}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-emerald-700 dark:text-emerald-400">
            <Truck className="h-5 w-5" />
            Direct Farm-to-Consumer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Skip the middlemen. With Nityodin&apos;s direct marketplace, you earn significantly more
            per sale while giving consumers fresher produce at better prices.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Traditional */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Traditional Supply Chain
                </span>
                <span className="text-sm font-bold text-red-600">27–46%</span>
              </div>
              <Progress value={36} className="h-3" />
              <p className="text-xs text-muted-foreground">
                Middlemen (wholesalers, commission agents, retailers) take the majority of your
                selling price.
              </p>
            </div>

            {/* Nityodin */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Nityodin Direct
                </span>
                <span className="text-sm font-bold text-emerald-600">70–85%</span>
              </div>
              <Progress value={78} className="h-3 [&>div]:bg-emerald-500" />
              <p className="text-xs text-muted-foreground">
                Sell directly to consumers and keep the lion&apos;s share of your hard-earned income.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}