'use client';

import { motion } from 'framer-motion';
import {
  Star,
  Phone,
  MapPin,
  Navigation,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BusinessLocationItem {
  id: string;
  businessName: string;
  category: string;
  subcategories?: string | null;
  address: string;
  area?: string | null;
  city: string;
  district: string;
  division: string;
  latitude: number | null;
  longitude: number | null;
  rating: number;
  isOpen: boolean;
  phone?: string | null;
  distance?: number;
  owner?: { id: string; name: string; phone?: string | null; avatarUrl?: string | null } | null;
}

interface BusinessLocationCardProps {
  location: BusinessLocationItem;
  onSelect?: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Category colour mapping
// ---------------------------------------------------------------------------

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  grocery: { bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400' },
  electronics: { bg: 'bg-cyan-100 dark:bg-cyan-950/40', text: 'text-cyan-700 dark:text-cyan-400' },
  clothing: { bg: 'bg-fuchsia-100 dark:bg-fuchsia-950/40', text: 'text-fuchsia-700 dark:text-fuchsia-400' },
  restaurant: { bg: 'bg-orange-100 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-400' },
  pharmacy: { bg: 'bg-red-100 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-400' },
  medical: { bg: 'bg-red-100 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-400' },
  agriculture: { bg: 'bg-lime-100 dark:bg-lime-950/40', text: 'text-lime-700 dark:text-lime-400' },
};

function getCategoryStyle(category: string) {
  return CATEGORY_STYLES[category] ?? { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' };
}

// ---------------------------------------------------------------------------
// Stars component
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
      <span className="ml-1 text-xs font-medium text-muted-foreground">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BusinessLocationCard
// ---------------------------------------------------------------------------

export function BusinessLocationCard({ location, onSelect }: BusinessLocationCardProps) {
  const style = getCategoryStyle(location.category);

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Card
        className="group cursor-pointer overflow-hidden rounded-xl border border-border transition-shadow hover:shadow-md hover:border-emerald-200/60 dark:hover:border-emerald-800/50"
        onClick={() => onSelect?.(location.id)}
      >
        <CardContent className="p-4 space-y-3">
          {/* Top row: category badge + open/closed + distance */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={`${style.bg} ${style.text} border-0 text-[11px] font-medium capitalize`}
              >
                {location.category}
              </Badge>
              <Badge
                variant="outline"
                className={`text-[10px] font-medium ${
                  location.isOpen
                    ? 'border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400'
                    : 'border-red-300 text-red-600 dark:border-red-700 dark:text-red-400'
                }`}
              >
                {location.isOpen ? 'Open' : 'Closed'}
              </Badge>
            </div>
            {location.distance !== undefined && (
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Navigation className="size-3" />
                <span className="text-xs font-semibold">{location.distance} km</span>
              </div>
            )}
          </div>

          {/* Business name */}
          <h4 className="font-semibold text-sm leading-tight">{location.businessName}</h4>

          {/* Address */}
          <div className="flex items-start gap-1.5 text-muted-foreground">
            <MapPin className="size-3.5 mt-0.5 shrink-0" />
            <p className="text-xs leading-relaxed">
              {location.address}
              {location.area && <span className="text-muted"> · {location.area}</span>}
            </p>
          </div>

          {/* City */}
          <p className="text-[11px] text-muted-foreground">
            {location.city}, {location.district}, {location.division}
          </p>

          {/* Rating */}
          <Stars rating={location.rating} />

          {/* Bottom: Phone + View Details */}
          <div className="flex items-center justify-between pt-1">
            {location.phone ? (
              <a
                href={`tel:${location.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <Phone className="size-3" />
                {location.phone}
              </a>
            ) : (
              <span />
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 px-2"
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(location.id);
              }}
            >
              <ExternalLink className="mr-1 size-3" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}