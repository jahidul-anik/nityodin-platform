'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tractor,
  Sprout,
  Scissors,
  ClipboardCheck,
  Truck,
  PackageCheck,
  MapPin,
  Thermometer,
  User,
  Calendar,
  FileText,
  Plus,
  Loader2,
  ChevronDown,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Leaf,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FarmProduct {
  id: string;
  name: string;
  nameBn?: string | null;
  price: number;
  unit?: string | null;
  quantity: number;
  origin?: string | null;
  isOrganic: boolean;
  category: string;
  imageUrl?: string | null;
  harvestDate?: string | null;
}

interface SupplyChainRecord {
  id: string;
  stage: string;
  location: string | null;
  handledBy: string | null;
  temperature: string | null;
  notes: string | null;
  fairPriceIndicator: number | null;
  certifiedBy: string | null;
  createdAt: string;
}

interface MarketPriceEntry {
  id: string;
  commodity: string;
  price: number;
  unit: string;
  change: number | null;
  market: string | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STAGES = [
  { value: 'planted', label: 'Planted', icon: Sprout, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/40' },
  { value: 'harvested', label: 'Harvested', icon: Scissors, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/40' },
  { value: 'inspected', label: 'Inspected', icon: ClipboardCheck, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/40' },
  { value: 'transported', label: 'Transported', icon: Truck, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/40' },
  { value: 'delivered', label: 'Delivered', icon: PackageCheck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/40' },
];

function getStageMeta(stage: string) {
  return STAGES.find((s) => s.value === stage) ?? STAGES[0];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTaka(paisa: number): string {
  const bdt = paisa / 100;
  return `৳${bdt.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SupplyChainTracker() {
  // Product selection
  const [farmProducts, setFarmProducts] = useState<FarmProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Supply chain
  const [records, setRecords] = useState<SupplyChainRecord[]>([]);
  const [loadingChain, setLoadingChain] = useState(false);

  // Market price comparison
  const [marketPrices, setMarketPrices] = useState<MarketPriceEntry[]>([]);
  const [loadingMarket, setLoadingMarket] = useState(false);

  // Dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    stage: 'planted',
    location: '',
    handledBy: '',
    temperature: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Selected product detail
  const selectedProduct = farmProducts.find((fp) => fp.id === selectedProductId);

  // -------------------------------------------------------------------------
  // Fetch farm products
  // -------------------------------------------------------------------------
  const fetchFarmProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/farm-products');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setFarmProducts(list);
        if (list.length > 0 && !selectedProductId) {
          setSelectedProductId(list[0].id);
        }
      }
    } catch {
      // silent
    } finally {
      setLoadingProducts(false);
    }
  }, [selectedProductId]);

  // -------------------------------------------------------------------------
  // Fetch supply chain records
  // -------------------------------------------------------------------------
  const fetchSupplyChain = useCallback(async (productId: string) => {
    if (!productId) return;
    setLoadingChain(true);
    try {
      const res = await fetch(`/api/supply-chain?farmProductId=${productId}`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setRecords(list);
      }
    } catch {
      toast.error('Failed to load supply chain records');
    } finally {
      setLoadingChain(false);
    }
  }, []);

  // -------------------------------------------------------------------------
  // Fetch market prices for comparison
  // -------------------------------------------------------------------------
  const fetchMarketPrices = useCallback(async (commodity: string) => {
    if (!commodity) return;
    setLoadingMarket(true);
    try {
      const encoded = encodeURIComponent(commodity);
      const res = await fetch(`/api/market-prices?commodity=${encoded}`);
      if (res.ok) {
        const data = await res.json();
        setMarketPrices(Array.isArray(data) ? data : []);
      }
    } catch {
      // silent
    } finally {
      setLoadingMarket(false);
    }
  }, []);

  // -------------------------------------------------------------------------
  // Effects
  // -------------------------------------------------------------------------
  useEffect(() => {
    fetchFarmProducts();
  }, [fetchFarmProducts]);

  useEffect(() => {
    if (selectedProductId) {
      fetchSupplyChain(selectedProductId);
      const product = farmProducts.find((fp) => fp.id === selectedProductId);
      if (product) {
        fetchMarketPrices(product.name);
      }
    }
  }, [selectedProductId, fetchSupplyChain, fetchMarketPrices, farmProducts]);

  // -------------------------------------------------------------------------
  // Add record
  // -------------------------------------------------------------------------
  const handleAddRecord = async () => {
    if (!selectedProductId) return;
    if (!addForm.location.trim()) {
      toast.error('Location is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/supply-chain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmProductId: selectedProductId,
          stage: addForm.stage,
          location: addForm.location.trim(),
          handledBy: addForm.handledBy.trim() || undefined,
          temperature: addForm.temperature.trim() || undefined,
          notes: addForm.notes.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? 'Failed to add supply chain record');
        return;
      }
      toast.success('Supply chain record added');
      setAddDialogOpen(false);
      setAddForm({ stage: 'planted', location: '', handledBy: '', temperature: '', notes: '' });
      fetchSupplyChain(selectedProductId);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // Fair price calculation
  // -------------------------------------------------------------------------
  const fairPriceData = (() => {
    if (!selectedProduct || marketPrices.length === 0) return null;
    const farmerPrice = selectedProduct.price / 100;
    const avgMarket =
      marketPrices.reduce((sum, mp) => sum + mp.price / 100, 0) / marketPrices.length;
    if (avgMarket === 0) return null;
    const diff = ((farmerPrice - avgMarket) / avgMarket) * 100;
    let status: 'fair' | 'above' | 'way_above' = 'fair';
    if (diff > 15) status = 'way_above';
    else if (diff > 5) status = 'above';
    return { farmerPrice, avgMarket, diff, status };
  })();

  // -------------------------------------------------------------------------
  // Chain of custody
  // -------------------------------------------------------------------------
  const handlers = records
    .filter((r) => r.handledBy)
    .map((r) => ({
      name: r.handledBy!,
      stage: r.stage,
      date: r.createdAt,
    }));

  // -------------------------------------------------------------------------
  // Skeleton
  // -------------------------------------------------------------------------
  if (loadingProducts) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-12 w-full max-w-sm rounded-lg" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
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
        <Tractor className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
        <h2 className="text-2xl font-bold tracking-tight">Supply Chain Tracker</h2>
      </div>

      {/* Product Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-full sm:w-80">
          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a farm product" />
            </SelectTrigger>
            <SelectContent>
              {farmProducts.map((fp) => (
                <SelectItem key={fp.id} value={fp.id}>
                  <div className="flex items-center gap-2">
                    <Sprout className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{fp.name}</span>
                    <span className="text-muted-foreground text-xs">
                      ({formatTaka(fp.price)}/{fp.unit ?? 'kg'})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedProduct && (
          <Badge
            variant="outline"
            className="border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400"
          >
            {selectedProduct.isOrganic ? '🌿 Organic' : selectedProduct.category}
          </Badge>
        )}
      </div>

      {!selectedProductId ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <Leaf className="h-14 w-14 text-muted-foreground/25 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">
            Select a farm product to view its supply chain journey.
          </p>
        </motion.div>
      ) : loadingChain ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedProductId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            {/* ── Timeline ─────────────────────────────────────────────── */}
            {records.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <PackageCheck className="h-12 w-12 text-muted-foreground/25 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No supply chain records yet for this product.
                  </p>
                  <Button
                    onClick={() => setAddDialogOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add First Record
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Truck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      Journey Timeline
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAddDialogOpen(true)}
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Add Stage
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative pl-8">
                    {/* Vertical line */}
                    <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-emerald-200 dark:bg-emerald-800" />

                    {records.map((record, index) => {
                      const meta = getStageMeta(record.stage);
                      const StageIcon = meta.icon;
                      const isLast = index === records.length - 1;

                      return (
                        <motion.div
                          key={record.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={cn('relative pb-8', isLast && 'pb-0')}
                        >
                          {/* Node circle */}
                          <div
                            className={cn(
                              'absolute -left-5 top-1 flex items-center justify-center rounded-full size-6',
                              meta.bg
                            )}
                          >
                            <StageIcon className={cn('h-3.5 w-3.5', meta.color)} />
                          </div>

                          {/* Content */}
                          <div className="ml-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold">{meta.label}</span>
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0"
                              >
                                {record.stage}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              {record.location && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">{record.location}</span>
                                </div>
                              )}
                              {record.handledBy && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <User className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">{record.handledBy}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5 shrink-0" />
                                <span>{formatDate(record.createdAt)}</span>
                              </div>
                              {record.temperature && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Thermometer className="h-3.5 w-3.5 shrink-0" />
                                  <span>{record.temperature}</span>
                                </div>
                              )}
                            </div>

                            {record.notes && (
                              <div className="flex items-start gap-1.5 mt-2 text-sm text-muted-foreground">
                                <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                <span>{record.notes}</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Fair Price Indicator ──────────────────────────────────── */}
            {fairPriceData && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card
                  className={cn(
                    fairPriceData.status === 'fair'
                      ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20'
                      : fairPriceData.status === 'above'
                        ? 'border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20'
                        : 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20'
                  )}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShieldCheck
                        className={cn(
                          'h-5 w-5',
                          fairPriceData.status === 'fair'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : fairPriceData.status === 'above'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-red-600 dark:text-red-400'
                        )}
                      />
                      Fair Price Indicator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Your Price</p>
                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                          {formatTaka(selectedProduct!.price)}
                          <span className="text-xs text-muted-foreground font-normal ml-1">
                            /{selectedProduct!.unit ?? 'kg'}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Market Average</p>
                        <p className="text-xl font-bold">
                          ৳{fairPriceData.avgMarket.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Difference
                        </p>
                        <div className="flex items-center gap-1.5">
                          {fairPriceData.diff > 0 ? (
                            <TrendingUp
                              className={cn(
                                'h-4 w-4',
                                fairPriceData.status === 'fair'
                                  ? 'text-emerald-600'
                                  : fairPriceData.status === 'above'
                                    ? 'text-amber-600'
                                    : 'text-red-600'
                              )}
                            />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-emerald-600" />
                          )}
                          <span
                            className={cn(
                              'text-xl font-bold',
                              fairPriceData.status === 'fair'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : fairPriceData.status === 'above'
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-red-600 dark:text-red-400'
                            )}
                          >
                            {fairPriceData.diff > 0 ? '+' : ''}
                            {fairPriceData.diff.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Visual indicator bar */}
                    <div className="relative">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                        <span>Below Market</span>
                        <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-emerald-300 via-amber-300 to-red-300 dark:from-emerald-700 dark:via-amber-700 dark:to-red-700" />
                        <span>Way Above</span>
                      </div>
                      <div
                        className="absolute top-5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"
                        style={{
                          left: `${Math.min(Math.max(50 + fairPriceData.diff, 5), 95)}%`,
                          backgroundColor:
                            fairPriceData.status === 'fair'
                              ? '#10b981'
                              : fairPriceData.status === 'above'
                                ? '#f59e0b'
                                : '#ef4444',
                        }}
                      />
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {fairPriceData.status === 'fair'
                        ? 'Your pricing is competitive and fair compared to the market average.'
                        : fairPriceData.status === 'above'
                          ? 'Your price is slightly above the market average. Consider adjusting if sales are slow.'
                          : 'Your price is significantly above the market average. This may reduce buyer interest.'}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ── Chain of Custody ──────────────────────────────────────── */}
            {handlers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      Chain of Custody
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {handlers.map((h, i) => {
                        const meta = getStageMeta(h.stage);
                        const StageIcon = meta.icon;
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                          >
                            <div
                              className={cn(
                                'flex items-center justify-center rounded-full size-8 shrink-0',
                                meta.bg
                              )}
                            >
                              <StageIcon className={cn('h-4 w-4', meta.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{h.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {meta.label} &middot; {formatDate(h.date)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ── Origin Map Placeholder ────────────────────────────────── */}
            {selectedProduct?.origin && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      Origin Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative h-48 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 overflow-hidden flex items-center justify-center">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-3">
                          <div className="relative">
                            <MapPin className="h-10 w-10 text-emerald-500" />
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-emerald-500/20 rounded-full animate-ping" />
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                          {selectedProduct.origin}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {selectedProduct.name} — Harvest Origin
                        </p>
                      </div>
                      {/* Decorative grid */}
                      <div className="absolute inset-0 opacity-[0.04]">
                        <div className="w-full h-full" style={{
                          backgroundImage: 'linear-gradient(rgba(16,185,129,1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,1) 1px, transparent 1px)',
                          backgroundSize: '24px 24px',
                        }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Add Record Dialog ────────────────────────────────────────── */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Add Supply Chain Record
            </DialogTitle>
            <DialogDescription>
              Record a new stage in the product&apos;s supply chain journey.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Stage</Label>
              <Select
                value={addForm.stage}
                onValueChange={(v) => setAddForm((prev) => ({ ...prev, stage: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Location *</Label>
              <Input
                placeholder="e.g., Rajshahi, Bangladesh"
                value={addForm.location}
                onChange={(e) =>
                  setAddForm((prev) => ({ ...prev, location: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Handled By</Label>
              <Input
                placeholder="e.g., Karim Uddin"
                value={addForm.handledBy}
                onChange={(e) =>
                  setAddForm((prev) => ({ ...prev, handledBy: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Temperature</Label>
              <Input
                placeholder="e.g., 4°C"
                value={addForm.temperature}
                onChange={(e) =>
                  setAddForm((prev) => ({ ...prev, temperature: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Any additional information..."
                value={addForm.notes}
                onChange={(e) =>
                  setAddForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddRecord}
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {submitting ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-1.5 h-4 w-4" />
              )}
              Add Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}