'use client';

import { useState, useCallback } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Size map
// ---------------------------------------------------------------------------

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
} as const;

// ---------------------------------------------------------------------------
// renderStars — non-interactive display (used across the platform)
// ---------------------------------------------------------------------------

export function renderStars(rating: number, size: 'sm' | 'md' | 'lg' = 'sm') {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  const cls = sizeMap[size];

  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f${i}`} className={cn(cls, 'fill-amber-400 text-amber-400')} />
      ))}
      {half === 1 && (
        <Star key="half" className={cn(cls, 'fill-amber-400/50 text-amber-400')} />
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e${i}`} className={cn(cls, 'text-muted-foreground/30')} />
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// StarRating — interactive component
// ---------------------------------------------------------------------------

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}

export function StarRating({
  value,
  onChange,
  size = 'md',
  readonly = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  const handleMouseEnter = useCallback((star: number) => {
    if (!readonly) setHoverValue(star);
  }, [readonly]);

  const handleMouseLeave = useCallback(() => {
    if (!readonly) setHoverValue(0);
  }, [readonly]);

  const handleClick = useCallback(
    (star: number) => {
      if (!readonly && onChange) {
        onChange(star);
      }
    },
    [readonly, onChange],
  );

  const displayValue = hoverValue || value;

  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayValue;
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            className={cn(
              'relative p-0.5 transition-transform',
              !readonly && 'cursor-pointer hover:scale-110',
              readonly && 'cursor-default',
            )}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(star)}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              className={cn(
                sizeMap[size],
                'transition-colors',
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-muted-foreground/30',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}