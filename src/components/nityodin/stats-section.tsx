'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Store,
  Package,
  ShoppingCart,
  Wallet,
  Wrench,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { PlatformStats } from '@/store/platform-store';

interface StatItem {
  key: keyof PlatformStats;
  label: string;
  icon: React.ElementType;
  bg: string;
  iconColor: string;
  prefix?: string;
}

const statItems: StatItem[] = [
  {
    key: 'totalUsers',
    label: 'Total Users',
    icon: Users,
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    key: 'totalMerchants',
    label: 'Active Merchants',
    icon: Store,
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    key: 'totalProducts',
    label: 'Products Listed',
    icon: Package,
    bg: 'bg-teal-50 dark:bg-teal-900/30',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
  {
    key: 'totalOrders',
    label: 'Monthly Orders',
    icon: ShoppingCart,
    bg: 'bg-rose-50 dark:bg-rose-900/30',
    iconColor: 'text-rose-500 dark:text-rose-400',
  },
  {
    key: 'walletBalance',
    label: 'Wallet Balance',
    icon: Wallet,
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-700 dark:text-emerald-500',
    prefix: '৳',
  },
  {
    key: 'activeServices',
    label: 'Service Providers',
    icon: Wrench,
    bg: 'bg-cyan-50 dark:bg-cyan-900/30',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
];

function formatNumber(value: number, prefix?: string): string {
  const formatted = value.toLocaleString('en-US');
  return prefix ? `${prefix} ${formatted}` : formatted;
}

export function StatsSection() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/platform/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        // Use fallback if API fails
        setStats({
          totalUsers: 124500,
          totalMerchants: 8720,
          totalProducts: 45200,
          totalOrders: 38900,
          totalTransactions: 156000,
          walletBalance: 28500000,
          activeServices: 3200,
          doctorsAvailable: 450,
          farmProducts: 12400,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <section className="bg-muted/50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-14">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Trusted by Thousands Across Bangladesh
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Growing every day with real users, real merchants, and real impact.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-3 rounded-xl bg-background p-5 shadow-sm"
                >
                  <Skeleton className="size-12 rounded-full" />
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))
            : stats &&
              statItems.map(({ key, label, icon: Icon, bg, iconColor, prefix }) => (
                <div
                  key={key}
                  className="group flex flex-col items-center gap-3 rounded-xl bg-background p-4 shadow-sm transition-transform duration-200 hover:scale-105 sm:p-5"
                >
                  <div
                    className={`flex size-12 items-center justify-center rounded-full ${bg}`}
                  >
                    <Icon className={`size-5 ${iconColor}`} />
                  </div>
                  <span className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {formatNumber(stats[key], prefix)}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                    {label}
                  </span>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}