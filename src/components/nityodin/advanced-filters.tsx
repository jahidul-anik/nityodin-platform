'use client';

import { motion } from 'framer-motion';
import {
  Star,
  ArrowUpDown,
  RotateCcw,
  SlidersHorizontal,
  PackageCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AdvancedFiltersProps {
  priceRange: [number, number]; // in BDT (not paisa)
  onPriceRangeChange: (range: [number, number]) => void;
  minRating: number;
  onMinRatingChange: (rating: number) => void;
  inStockOnly: boolean;
  onInStockOnlyChange: (value: boolean) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: () => void;
  onReset: () => void;
}

const SORT_OPTIONS = [
  { value: 'price', label: 'Price' },
  { value: 'rating', label: 'Rating' },
  { value: 'name', label: 'Name' },
  { value: 'newest', label: 'Newest' },
  { value: 'distance', label: 'Distance' },
];

const MAX_PRICE = 50000;
const PRICE_STEP = 500;

// ---------------------------------------------------------------------------
// Star Rating Selector sub-component
// ---------------------------------------------------------------------------

function StarRatingSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star === value ? 0 : star)}
          className="p-0.5 hover:scale-110 transition-transform"
          aria-label={`${star} star${star > 1 ? 's' : ''} minimum`}
        >
          <Star
            className={`size-5 transition-colors ${
              star <= value
                ? 'fill-amber-400 text-amber-400'
                : 'fill-muted text-muted-foreground/40 hover:text-amber-300'
            }`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
          {value}+ stars
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdvancedFilters({
  priceRange,
  onPriceRangeChange,
  minRating,
  onMinRatingChange,
  inStockOnly,
  onInStockOnlyChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  isOpen,
  onOpenChange,
  onApply,
  onReset,
}: AdvancedFiltersProps) {
  // -- Helpers --------------------------------------------------------------

  function handlePriceChange(values: number[]) {
    onPriceRangeChange([values[0], values[1]]);
  }

  function formatTaka(amount: number): string {
    return `৳${amount.toLocaleString()}`;
  }

  function toggleSortOrder() {
    onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc');
  }

  // -- Filter panel content (shared between Sheet on mobile & inline on desktop) --

  const filterContent = (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* ── Price Range ──────────────────────────────────────────────── */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          Price Range
        </Label>
        <div className="px-1">
          <Slider
            min={0}
            max={MAX_PRICE}
            step={PRICE_STEP}
            value={priceRange}
            onValueChange={handlePriceChange}
            className="w-full"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={priceRange[0]}
              onChange={(e) => {
                const val = Math.max(0, Math.min(Number(e.target.value), priceRange[1] - PRICE_STEP));
                onPriceRangeChange([val, priceRange[1]]);
              }}
              className="h-8 w-24 text-xs text-center tabular-nums"
              min={0}
              max={priceRange[1]}
            />
            <span className="text-xs text-muted-foreground">to</span>
            <Input
              type="number"
              value={priceRange[1]}
              onChange={(e) => {
                const val = Math.max(priceRange[0] + PRICE_STEP, Math.min(Number(e.target.value), MAX_PRICE));
                onPriceRangeChange([priceRange[0], val]);
              }}
              className="h-8 w-24 text-xs text-center tabular-nums"
              min={priceRange[0]}
              max={MAX_PRICE}
            />
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {formatTaka(priceRange[0])} — {formatTaka(priceRange[1])}
        </p>
      </div>

      <Separator />

      {/* ── Minimum Rating ───────────────────────────────────────────── */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold text-foreground">
          Minimum Rating
        </Label>
        <StarRatingSelector value={minRating} onChange={onMinRatingChange} />
        {minRating === 0 && (
          <p className="text-[11px] text-muted-foreground">All ratings</p>
        )}
      </div>

      <Separator />

      {/* ── Availability ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold text-foreground">
          Availability
        </Label>
        <div className="flex items-center gap-2.5">
          <Checkbox
            id="in-stock-only"
            checked={inStockOnly}
            onCheckedChange={(val) => onInStockOnlyChange(!!val)}
          />
          <label
            htmlFor="in-stock-only"
            className="text-sm text-foreground cursor-pointer flex items-center gap-1.5 select-none"
          >
            <PackageCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            In Stock Only
          </label>
        </div>
      </div>

      <Separator />

      {/* ── Sort Options ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <ArrowUpDown className="size-3.5" />
          Sort By
        </Label>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="h-9 text-sm flex-1">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 px-3 shrink-0"
            onClick={toggleSortOrder}
            aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortOrder === 'asc' ? (
              <span className="flex items-center gap-1 text-xs">
                <span>↑</span>
                <span className="hidden sm:inline">Asc</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs">
                <span>↓</span>
                <span className="hidden sm:inline">Desc</span>
              </span>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      {/* ── Desktop: Sheet (side panel) ────────────────────────────────── */}
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-sm overflow-y-auto">
          <SheetHeader className="pb-2">
            <SheetTitle className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
                <SlidersHorizontal className="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              Advanced Filters
            </SheetTitle>
            <SheetDescription>
              Refine your search results with detailed filters
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 py-2">
            {filterContent}
          </div>

          <SheetFooter className="flex-col gap-2 pt-2 border-t">
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              onClick={() => {
                onApply();
                onOpenChange(false);
              }}
            >
              Apply Filters
            </Button>
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => {
                onReset();
                onOpenChange(false);
              }}
            >
              <RotateCcw className="size-3.5 mr-1.5" />
              Reset All
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}