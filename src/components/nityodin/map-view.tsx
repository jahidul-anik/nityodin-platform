'use client';

import React, { useState, useMemo, useRef } from 'react';
import { MapPin, Phone, Star, Navigation, ExternalLink, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BusinessLocationMapItem {
  id: string;
  businessName: string;
  category: string;
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

/** Extended properties for merchant map pins */
export interface MerchantPinData {
  storeId: string;
  storeName: string;
  storeNameBn?: string;
  isVerified: boolean;
  isLive: boolean;
  totalSales: number;
}

interface MapViewProps {
  locations: BusinessLocationMapItem[];
  center: [number, number];
  radius?: number | null;
  selectedId?: string | null;
  onSelectLocation?: (id: string) => void;
  /** Extra merchant data to render richer pins */
  merchantData?: Record<string, MerchantPinData>;
  /** Whether to render the interactive pin overlay */
  showMerchantPins?: boolean;
}

// ---------------------------------------------------------------------------
// Category colour mapping
// ---------------------------------------------------------------------------

const CATEGORY_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  grocery: { color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-800' },
  electronics: { color: 'text-cyan-700 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/40', border: 'border-cyan-200 dark:border-cyan-800' },
  clothing: { color: 'text-fuchsia-700 dark:text-fuchsia-400', bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/40', border: 'border-fuchsia-200 dark:border-fuchsia-800' },
  restaurant: { color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/40', border: 'border-orange-200 dark:border-orange-800' },
  pharmacy: { color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/40', border: 'border-red-200 dark:border-red-800' },
  medical: { color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40', border: 'border-rose-200 dark:border-rose-800' },
  agriculture: { color: 'text-lime-700 dark:text-lime-400', bg: 'bg-lime-50 dark:bg-lime-950/40', border: 'border-lime-200 dark:border-lime-800' },
  services: { color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40', border: 'border-purple-200 dark:border-purple-800' },
  fashion: { color: 'text-pink-700 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-950/40', border: 'border-pink-200 dark:border-pink-800' },
};

const PIN_COLORS: Record<string, string> = {
  grocery: '#059669',
  electronics: '#0891b2',
  clothing: '#d946ef',
  restaurant: '#ea580c',
  pharmacy: '#dc2626',
  medical: '#e11d48',
  agriculture: '#65a30d',
  services: '#7c3aed',
  fashion: '#ec4899',
};

function getCatStyle(category: string) {
  return CATEGORY_STYLES[category] ?? CATEGORY_STYLES.grocery;
}

function getPinColor(category: string): string {
  return PIN_COLORS[category] ?? '#059669';
}

// ---------------------------------------------------------------------------
// Bounding box calculation
// ---------------------------------------------------------------------------

interface BBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

function computeBBox(locations: BusinessLocationMapItem[], center: [number, number], radius?: number | null): BBox {
  const validLocs = locations.filter(l => l.latitude !== null && l.longitude !== null);

  if (validLocs.length === 0) {
    const pad = radius ? radius / 111 : 0.04;
    return {
      minLat: center[0] - pad,
      maxLat: center[0] + pad,
      minLng: center[1] - pad,
      maxLng: center[1] + pad,
    };
  }

  const lats = validLocs.map(l => l.latitude!);
  const lngs = validLocs.map(l => l.longitude!);
  const pad = radius ? radius / 111 : 0.03;

  return {
    minLat: Math.min(...lats, center[0]) - pad,
    maxLat: Math.max(...lats, center[0]) + pad,
    minLng: Math.min(...lngs, center[1]) - pad,
    maxLng: Math.max(...lngs, center[1]) + pad,
  };
}

// ---------------------------------------------------------------------------
// Project lat/lng to percentage position within bbox
// ---------------------------------------------------------------------------

function projectToPercent(lat: number, lng: number, bbox: BBox): { x: number; y: number } {
  const x = ((lng - bbox.minLng) / (bbox.maxLng - bbox.minLng)) * 100;
  const y = (1 - (lat - bbox.minLat) / (bbox.maxLat - bbox.minLat)) * 100;
  return { x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) };
}

// ---------------------------------------------------------------------------
// OpenStreetMap Embed URL Builder
// ---------------------------------------------------------------------------

function buildMapUrl(center: [number, number], locations: BusinessLocationMapItem[], radius?: number | null) {
  const validLocs = locations.filter(l => l.latitude !== null && l.longitude !== null);

  if (validLocs.length === 0) {
    return `https://www.openstreetmap.org/export/embed.html?bbox=${center[1]-0.05},${center[0]-0.04},${center[1]+0.05},${center[0]+0.04}&layer=mapnik&marker=${center[0]},${center[1]}`;
  }

  const bbox = computeBBox(locations, center, radius);
  const markers = validLocs.map(l => `${l.latitude},${l.longitude}`).join('&marker=');

  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.minLng},${bbox.minLat},${bbox.maxLng},${bbox.maxLat}&layer=mapnik&marker=${markers}`;
}

// ---------------------------------------------------------------------------
// Interactive Pin Overlay Component
// ---------------------------------------------------------------------------

interface PinOverlayProps {
  locations: BusinessLocationMapItem[];
  bbox: BBox;
  selectedId: string | null;
  onSelectLocation: (id: string) => void;
  merchantData?: Record<string, MerchantPinData>;
}

function PinOverlay({ locations, bbox, selectedId, onSelectLocation, merchantData }: PinOverlayProps) {
  const validLocs = locations.filter(l => l.latitude !== null && l.longitude !== null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [popupId, setPopupId] = useState<string | null>(null);

  const activePopupId = popupId ?? selectedId;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {validLocs.map((loc) => {
        const pos = projectToPercent(loc.latitude!, loc.longitude!, bbox);
        const mData = merchantData?.[loc.id];
        const pinColor = getPinColor(loc.category);
        const isSelected = loc.id === selectedId;
        const isHovered = loc.id === hoveredId;
        const isPopupOpen = loc.id === activePopupId;
        const showLabel = isSelected || isHovered || validLocs.length <= 6;

        return (
          <div
            key={loc.id}
            className="absolute pointer-events-auto"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            {/* Pin marker */}
            <button
              className={cn(
                'relative flex flex-col items-center transition-transform duration-150',
                (isSelected || isHovered) && 'scale-110 z-20',
              )}
              onMouseEnter={() => { setHoveredId(loc.id); }}
              onMouseLeave={() => { setHoveredId(null); }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectLocation(loc.id);
                setPopupId(prev => prev === loc.id ? null : loc.id);
              }}
            >
              {/* Pin SVG */}
              <svg
                width={isSelected ? 36 : 30}
                height={isSelected ? 44 : 38}
                viewBox="0 0 30 38"
                className="drop-shadow-md"
              >
                <path
                  d="M15 0C6.716 0 0 6.716 0 15c0 10.5 15 23 15 23s15-12.5 15-23C30 6.716 23.284 0 15 0z"
                  fill={pinColor}
                  stroke="white"
                  strokeWidth="2"
                />
                {/* Inner circle */}
                <circle cx="15" cy="14" r="8" fill="white" opacity="0.9" />
                {/* Category initial or store icon */}
                {mData ? (
                  <text
                    x="15"
                    y="18"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill={pinColor}
                  >
                    {mData.storeName.charAt(0).toUpperCase()}
                  </text>
                ) : (
                  <MapPin x="10" y="8" width="10" height="12" fill={pinColor} opacity="0.8" />
                )}
              </svg>

              {/* Live pulse indicator */}
              {mData?.isLive && (
                <span className="absolute -top-1 -right-1 flex size-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full size-3 bg-emerald-500 ring-2 ring-white" />
                </span>
              )}

              {/* Verified badge */}
              {mData?.isVerified && (
                <span className="absolute -bottom-0.5 -right-1.5 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-sm">
                  <ShieldCheck className="size-3 text-emerald-500" />
                </span>
              )}

              {/* Label below pin */}
              {showLabel && (
                <div className="mt-0.5 px-1.5 py-0.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-md shadow-sm border border-border/50 max-w-[120px]">
                  <p className="text-[10px] font-semibold truncate leading-tight">
                    {mData?.storeName ?? loc.businessName}
                  </p>
                  {(mData?.storeNameBn || loc.area) && (
                    <p className="text-[9px] text-muted-foreground truncate leading-tight">
                      {mData?.storeNameBn ?? loc.area}
                    </p>
                  )}
                </div>
              )}
            </button>

            {/* Popup card on click */}
            <AnimatePresence>
              {isPopupOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-56 z-30"
                >
                  <Card className="rounded-lg shadow-lg border-border/60 overflow-hidden">
                    <CardContent className="p-3 space-y-2">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold truncate">
                            {mData?.storeName ?? loc.businessName}
                          </h4>
                          {mData?.storeNameBn && (
                            <p className="text-[10px] text-muted-foreground truncate">{mData.storeNameBn}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {mData?.isLive && (
                            <span className="flex size-2">
                              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
                            </span>
                          )}
                          {mData?.isVerified && (
                            <ShieldCheck className="size-3.5 text-emerald-500" />
                          )}
                        </div>
                      </div>

                      {/* Category + Status */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge className={cn('text-[9px] border-0 px-1.5 py-0', getCatStyle(loc.category).bg, getCatStyle(loc.category).color)}>
                          {loc.category}
                        </Badge>
                        <Badge variant="outline" className={cn(
                          'text-[9px] px-1.5 py-0',
                          loc.isOpen
                            ? 'border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400'
                            : 'border-red-300 text-red-600 dark:border-red-700 dark:text-red-400'
                        )}>
                          {loc.isOpen ? 'Open' : 'Closed'}
                        </Badge>
                      </div>

                      {/* Address */}
                      <p className="text-[10px] text-muted-foreground flex items-start gap-1 line-clamp-2 leading-relaxed">
                        <MapPin className="size-2.5 shrink-0 mt-0.5" />
                        <span>{loc.address}, {loc.city}</span>
                      </p>

                      {/* Rating + Sales */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-0.5">
                          <Star className="size-3 fill-amber-400 text-amber-400" />
                          <span className="text-[10px] font-semibold">{loc.rating.toFixed(1)}</span>
                        </div>
                        {mData && (
                          <span className="text-[10px] text-muted-foreground">
                            {mData.totalSales >= 1000 ? `${(mData.totalSales / 1000).toFixed(1)}k` : mData.totalSales} sales
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Click outside to close popup */}
      {activePopupId && (
        <div
          className="absolute inset-0 z-0"
          onClick={() => setPopupId(null)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Business Location Card
// ---------------------------------------------------------------------------

function LocationCard({ location, isSelected, onSelect }: {
  location: BusinessLocationMapItem;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const catStyle = getCatStyle(location.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          'cursor-pointer transition-all duration-200 hover:shadow-md',
          isSelected && 'ring-2 ring-emerald-500 shadow-md'
        )}
        onClick={onSelect}
      >
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm truncate">{location.businessName}</h3>
                <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 shrink-0', catStyle.color, catStyle.bg, catStyle.border)}>
                  {location.category}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{location.address}</span>
              </p>
              {location.area && (
                <p className="text-xs text-muted-foreground">
                  {location.area}, {location.city}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <Badge variant={location.isOpen ? 'default' : 'secondary'} className={cn(
                'text-[10px]',
                location.isOpen
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
              )}>
                {location.isOpen ? 'Open' : 'Closed'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                <span className="text-xs font-medium">{location.rating.toFixed(1)}</span>
              </div>
              {location.distance !== undefined && (
                <div className="flex items-center gap-1">
                  <Navigation className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    {location.distance} km
                  </span>
                </div>
              )}
            </div>
            {location.phone && (
              <a
                href={`tel:${location.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <Phone className="h-3 w-3" />
                <span>{location.phone}</span>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Exported MapView
// ---------------------------------------------------------------------------

export function MapView(props: MapViewProps) {
  const { locations, center, radius, selectedId, onSelectLocation, merchantData, showMerchantPins } = props;
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const mapUrl = useMemo(
    () => buildMapUrl(center, locations, radius),
    [center, locations, radius]
  );

  const validCount = locations.filter(l => l.latitude !== null && l.longitude !== null).length;

  const bbox = useMemo(
    () => computeBBox(locations, center, radius),
    [locations, center, radius]
  );

  return (
    <div className="space-y-4">
      {/* Map container */}
      <div
        ref={mapContainerRef}
        className="relative w-full rounded-xl overflow-hidden border border-border shadow-sm bg-muted"
      >
        {!mapLoaded && (
          <Skeleton className="absolute inset-0 z-20" />
        )}
        {validCount > 0 ? (
          <>
            <iframe
              src={mapUrl}
              className="w-full h-[300px] md:h-[450px] border-0"
              onLoad={() => setMapLoaded(true)}
              title="Business Locations Map"
              loading="lazy"
            />
            {/* Interactive pin overlay */}
            {showMerchantPins && mapLoaded && validCount > 0 && (
              <PinOverlay
                locations={locations}
                bbox={bbox}
                selectedId={selectedId ?? null}
                onSelectLocation={onSelectLocation ?? (() => {})}
                merchantData={merchantData}
              />
            )}
          </>
        ) : (
          <div className="w-full h-[300px] md:h-[450px] flex flex-col items-center justify-center text-muted-foreground gap-2">
            <MapPin className="h-10 w-10 opacity-40" />
            <p className="text-sm">No locations with coordinates found</p>
          </div>
        )}
      </div>

      {/* Location cards */}
      {locations.length > 0 && !showMerchantPins && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {validCount} {validCount === 1 ? 'business' : 'businesses'}
              {radius ? ` within ${radius}km` : ' nearby'}
            </h3>
            <a
              href={`https://www.openstreetmap.org/?mlat=${center[0]}&mlon=${center[1]}#map=13/${center[0]}/${center[1]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Open in OpenStreetMap
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2 pr-2">
              {locations.map((loc) => (
                <LocationCard
                  key={loc.id}
                  location={loc}
                  isSelected={loc.id === selectedId}
                  onSelect={() => onSelectLocation?.(loc.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}