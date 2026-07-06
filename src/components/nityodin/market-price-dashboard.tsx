'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Activity,
  Sprout,
  ShieldCheck,
  ThermometerSun,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MarketPriceEntry {
  id: string;
  commodity: string;
  price: number;
  unit: string;
  change: number | null;
  date: string;
  market: string | null;
}

interface TrendDataPoint {
  date: string;
  price: number;
}

interface TrendsResponse {
  commodity: string;
  days: number;
  data: TrendDataPoint[];
  avg: number;
  min: number;
  max: number;
  trend: 'up' | 'down' | 'stable';
  volatility: number;
}

interface FarmProduct {
  id: string;
  name: string;
  price: number;
  unit?: string | null;
  category: string;
  isOrganic: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTaka(paisa: number): string {
  const bdt = paisa / 100;
  return `৳${bdt.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatTakaPlain(bdt: number): string {
  return `৳${bdt.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// Custom tooltip for recharts
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
        {formatTakaPlain(payload[0].value)}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MarketPriceDashboard() {
  // Current prices table
  const [prices, setPrices] = useState<MarketPriceEntry[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(true);

  // Trends
  const [commodities, setCommodities] = useState<string[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState<string>('');
  const [trends, setTrends] = useState<TrendsResponse | null>(null);
  const [loadingTrends, setLoadingTrends] = useState(false);

  // Farm products for fair price
  const [farmProducts, setFarmProducts] = useState<FarmProduct[]>([]);
  const [loadingFarm, setLoadingFarm] = useState(true);

  // -------------------------------------------------------------------------
  // Fetch current prices
  // -------------------------------------------------------------------------
  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch('/api/market-prices');
      if (res.ok) {
        const data = await res.json();
        const list: MarketPriceEntry[] = Array.isArray(data) ? data : [];
        setPrices(list);
        const uniqueCommodities = [...new Set(list.map((p) => p.commodity))];
        setCommodities(uniqueCommodities);
        if (uniqueCommodities.length > 0 && !selectedCommodity) {
          setSelectedCommodity(uniqueCommodities[0]);
        }
      }
    } catch {
      toast.error('Failed to fetch market prices');
    } finally {
      setLoadingPrices(false);
    }
  }, [selectedCommodity]);

  // -------------------------------------------------------------------------
  // Fetch trends
  // -------------------------------------------------------------------------
  const fetchTrends = useCallback(async (commodity: string) => {
    if (!commodity) return;
    setLoadingTrends(true);
    try {
      const encoded = encodeURIComponent(commodity);
      const res = await fetch(`/api/market-prices/trends?commodity=${encoded}&days=30`);
      if (res.ok) {
        const data = await res.json();
        setTrends(data);
      }
    } catch {
      toast.error('Failed to fetch price trends');
    } finally {
      setLoadingTrends(false);
    }
  }, []);

  // -------------------------------------------------------------------------
  // Fetch farm products
  // -------------------------------------------------------------------------
  const fetchFarmProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/farm-products');
      if (res.ok) {
        const data = await res.json();
        setFarmProducts(Array.isArray(data) ? data : []);
      }
    } catch {
      // silent
    } finally {
      setLoadingFarm(false);
    }
  }, []);

  // -------------------------------------------------------------------------
  // Effects
  // -------------------------------------------------------------------------
  useEffect(() => {
    fetchPrices();
    fetchFarmProducts();
  }, [fetchPrices, fetchFarmProducts]);

  useEffect(() => {
    if (selectedCommodity) {
      fetchTrends(selectedCommodity);
    }
  }, [selectedCommodity, fetchTrends]);

  // -------------------------------------------------------------------------
  // Fair price comparison for farm products
  // -------------------------------------------------------------------------
  const fairPriceComparisons = useMemo(() => {
    return farmProducts.map((fp) => {
      const farmerPrice = fp.price / 100;
      const relatedPrices = prices.filter(
        (mp) =>
          mp.commodity.toLowerCase() === fp.name.toLowerCase() ||
          mp.commodity.toLowerCase().includes(fp.category.toLowerCase())
      );
      const marketAvg =
        relatedPrices.length > 0
          ? relatedPrices.reduce((s, mp) => s + mp.price / 100, 0) / relatedPrices.length
          : 0;
      const diff = marketAvg > 0 ? ((farmerPrice - marketAvg) / marketAvg) * 100 : 0;
      let status: 'fair' | 'above' | 'below' = 'fair';
      if (diff > 10) status = 'above';
      else if (diff < -10) status = 'below';
      return { product: fp, farmerPrice, marketAvg, diff, status };
    });
  }, [farmProducts, prices]);

  // -------------------------------------------------------------------------
  // Skeleton
  // -------------------------------------------------------------------------
  if (loadingPrices || loadingFarm) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-lg" />
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
        <BarChart3 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
        <h2 className="text-2xl font-bold tracking-tight">Market Price Dashboard</h2>
      </div>

      {/* ── Analytics Cards ────────────────────────────────────────────── */}
      {trends && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Activity className="h-3.5 w-3.5" />
                  Avg Price
                </div>
                <p className="text-xl font-bold">
                  {formatTakaPlain(trends.avg)}
                  <span className="text-xs text-muted-foreground font-normal ml-1">/kg</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
                  Min Price
                </div>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatTakaPlain(trends.min)}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                  Max Price
                </div>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {formatTakaPlain(trends.max)}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <ThermometerSun className="h-3.5 w-3.5" />
                  Volatility
                </div>
                <p className="text-xl font-bold">
                  {trends.volatility.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* ── Price Trend Chart ──────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Price Trend
              </CardTitle>
              <div className="flex items-center gap-3">
                {trends && (
                  <div className="flex items-center gap-1.5">
                    {trends.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                    ) : trends.trend === 'down' ? (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    ) : (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span
                      className={cn(
                        'text-sm font-medium',
                        trends.trend === 'up'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : trends.trend === 'down'
                            ? 'text-red-500'
                            : 'text-muted-foreground'
                      )}
                    >
                      {trends.trend === 'up' ? 'Rising' : trends.trend === 'down' ? 'Falling' : 'Stable'}
                    </span>
                  </div>
                )}
                <Select value={selectedCommodity} onValueChange={setSelectedCommodity}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Commodity" />
                  </SelectTrigger>
                  <SelectContent>
                    {commodities.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingTrends ? (
              <div className="h-72 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : trends && trends.data.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends.data}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDateShort}
                      tick={{ fontSize: 11 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v: number) => `৳${v}`}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">
                No trend data available for this commodity.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Current Prices Table ───────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Current Prices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No market price data available.
              </p>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Commodity</TableHead>
                      <TableHead className="text-right">Price (BDT/kg)</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                      <TableHead className="hidden sm:table-cell">Market</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prices.map((mp) => (
                      <TableRow key={mp.id}>
                        <TableCell className="font-medium">{mp.commodity}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatTaka(mp.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {mp.change !== null && mp.change !== 0 ? (
                            <Badge
                              variant="secondary"
                              className={cn(
                                'text-xs font-medium',
                                mp.change > 0
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                              )}
                            >
                              {mp.change > 0 ? (
                                <ArrowUpRight className="mr-0.5 h-3 w-3" />
                              ) : (
                                <ArrowDownRight className="mr-0.5 h-3 w-3" />
                              )}
                              {Math.abs(mp.change).toFixed(1)}%
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              <Minus className="mr-0.5 h-3 w-3" />
                              0.0%
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                          {mp.market ?? '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Harvest Analytics / Fair Price Score ───────────────────────── */}
      {fairPriceComparisons.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Fair Price Score — Your Products vs Market
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fairPriceComparisons.every((fpc) => fpc.marketAvg === 0) ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No matching market data for your products. Market prices will appear here when available.
                </p>
              ) : (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={fairPriceComparisons.filter((fpc) => fpc.marketAvg > 0)}
                      layout="vertical"
                      margin={{ left: 0, right: 20, top: 5, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v: number) => `৳${v}`}
                      />
                      <YAxis
                        type="category"
                        dataKey="product.name"
                        tick={{ fontSize: 12 }}
                        width={120}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || payload.length === 0) return null;
                          const data = payload[0].payload as (typeof fairPriceComparisons)[number];
                          return (
                            <div className="rounded-lg border bg-background px-3 py-2 shadow-md text-sm">
                              <p className="font-medium mb-1">{data.product.name}</p>
                              <p className="text-muted-foreground">
                                Your Price: <span className="text-emerald-600 font-medium">{formatTakaPlain(data.farmerPrice)}</span>
                              </p>
                              <p className="text-muted-foreground">
                                Market Avg: <span className="font-medium">{formatTakaPlain(data.marketAvg)}</span>
                              </p>
                              <p className={cn(
                                'text-xs font-medium mt-1',
                                data.status === 'fair' ? 'text-emerald-600' : data.status === 'above' ? 'text-amber-600' : 'text-blue-600'
                              )}>
                                {data.diff > 0 ? '+' : ''}{data.diff.toFixed(1)}% vs market
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="farmerPrice" radius={[0, 4, 4, 0]} maxBarSize={24}>
                        {fairPriceComparisons
                          .filter((fpc) => fpc.marketAvg > 0)
                          .map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.status === 'fair'
                                  ? '#10b981'
                                  : entry.status === 'above'
                                    ? '#f59e0b'
                                    : '#3b82f6'
                              }
                              fillOpacity={0.85}
                            />
                          ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Fair Price (±10% of market)
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  Above Market (+10%)
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  Below Market (-10%)
                </div>
              </div>

              {/* Product-by-product breakdown */}
              <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                {fairPriceComparisons
                  .filter((fpc) => fpc.marketAvg > 0)
                  .map((fpc) => (
                    <div
                      key={fpc.product.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            'flex items-center justify-center rounded-full size-8 shrink-0',
                            fpc.status === 'fair'
                              ? 'bg-emerald-100 dark:bg-emerald-900/40'
                              : fpc.status === 'above'
                                ? 'bg-amber-100 dark:bg-amber-900/40'
                                : 'bg-blue-100 dark:bg-blue-900/40'
                          )}
                        >
                          <Sprout
                            className={cn(
                              'h-4 w-4',
                              fpc.status === 'fair'
                                ? 'text-emerald-600'
                                : fpc.status === 'above'
                                  ? 'text-amber-600'
                                  : 'text-blue-600'
                            )}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {fpc.product.name}
                            {fpc.product.isOrganic && (
                              <Badge
                                variant="outline"
                                className="border-emerald-300 text-emerald-600 text-[9px] ml-1.5 px-1 py-0"
                              >
                                Organic
                              </Badge>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            You: {formatTakaPlain(fpc.farmerPrice)} &middot; Market: {formatTakaPlain(fpc.marketAvg)}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-xs shrink-0 ml-2',
                          fpc.status === 'fair'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : fpc.status === 'above'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                        )}
                      >
                        {fpc.status === 'fair'
                          ? '✓ Fair'
                          : fpc.status === 'above'
                            ? '↑ Above'
                            : '↓ Below'}
                        {' '}
                        ({fpc.diff > 0 ? '+' : ''}{fpc.diff.toFixed(1)}%)
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}