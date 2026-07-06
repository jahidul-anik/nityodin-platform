'use client';

import { useRef, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';

// ---------------------------------------------------------------------------
// Radius Search Control
// ---------------------------------------------------------------------------

const PRESETS = [1, 5, 10, 25, 50] as const;

interface RadiusSearchControlProps {
  value: number;
  onChange: (radius: number) => void;
}

export function RadiusSearchControl({ value, onChange }: RadiusSearchControlProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSliderChange = useCallback(
    (val: number[]) => {
      const radius = val[0];
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onChange(radius), 150);
    },
    [onChange],
  );

  return (
    <div className="space-y-2">
      {/* Preset buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground mr-1">Radius:</span>
        {PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => onChange(preset)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              value === preset
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            {preset} km
          </button>
        ))}
      </div>

      {/* Slider */}
      <div className="flex items-center gap-3">
        <Slider
          value={[value]}
          onValueChange={handleSliderChange}
          min={1}
          max={100}
          step={1}
          className="flex-1"
        />
        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 min-w-[3rem] text-right">
          {value} km
        </span>
      </div>
    </div>
  );
}