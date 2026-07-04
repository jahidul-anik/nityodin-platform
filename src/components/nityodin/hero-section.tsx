'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, Smartphone, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlatformStore } from '@/store/platform-store';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const glassCard = {
  hidden: { opacity: 0, x: 40, scale: 0.95 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.8, ease: 'easeOut' as const, delay: 0.6 },
  },
};

export function HeroSection() {
  const { setActiveView, setActiveRole } = usePlatformStore();

  const handleExplore = () => {
    setActiveRole('consumer');
    setActiveView('dashboard');
  };

  const handleMerchant = () => {
    setActiveRole('merchant');
    setActiveView('dashboard');
  };

  return (
    <section className="gradient-hero relative min-h-[70vh] md:min-h-[85vh] w-full overflow-hidden">
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_40%,rgba(16,185,129,0.15),transparent)]" />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-center gap-10 px-4 py-16 sm:px-6 md:flex-row md:gap-12 lg:px-8">
        {/* Left Content */}
        <motion.div
          className="flex flex-1 flex-col items-center text-center md:items-start md:text-left"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item}>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-300 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Bangladesh&apos;s Most Comprehensive Digital Ecosystem
            </span>
          </motion.div>

          <motion.h1
            className="mt-2 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
            variants={item}
          >
            Single Identity
            <br />
            <span className="shimmer-text">Multiple Roles</span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-lg text-base leading-relaxed text-emerald-100/80 sm:text-lg"
            variants={item}
          >
            One verified identity. One unified wallet. Endless possibilities
            across Bangladesh&apos;s most comprehensive digital ecosystem.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-4 md:justify-start"
            variants={item}
          >
            <Button
              onClick={handleExplore}
              size="lg"
              className="bg-white text-emerald-700 shadow-lg hover:bg-emerald-50 hover:text-emerald-800"
            >
              Explore Platform
              <ArrowRight className="ml-1 size-4" />
            </Button>
            <Button
              onClick={handleMerchant}
              variant="outline"
              size="lg"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              Join as Merchant
            </Button>
          </motion.div>

          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:justify-start"
            variants={item}
          >
            {[
              { icon: Shield, label: 'Bank-Grade Security' },
              { icon: Zap, label: 'Instant Payments' },
              { icon: Smartphone, label: 'All MFS Supported' },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 text-xs text-emerald-200/70 sm:text-sm"
              >
                <Icon className="size-3.5 text-emerald-400" />
                {label}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: Floating Glass Card (desktop only) */}
        <motion.div
          className="hidden flex-1 md:flex md:justify-end"
          variants={glassCard}
          initial="hidden"
          animate="show"
        >
          <div className="animate-float w-full max-w-xs rounded-2xl glass p-6 shadow-2xl lg:max-w-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                Dashboard Preview
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                Live
              </span>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow-md">
                <p className="text-xs text-emerald-100">Active Balance</p>
                <p className="mt-1 text-2xl font-bold tracking-tight">
                  ৳ 45,600
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-emerald-200/60 bg-white/80 px-3 py-2.5 dark:border-emerald-800/40 dark:bg-emerald-950/30">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                    <Wallet className="size-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Role</p>
                    <p className="text-sm font-semibold text-foreground">
                      Consumer
                    </p>
                  </div>
                </div>
                <span className="flex size-2 rounded-full bg-emerald-500" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Orders', value: '12' },
                  { label: 'Saved', value: '৳8.2K' },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-900/20"
                  >
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                    <p className="text-sm font-bold text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Shimmer text uses .shimmer-text from globals.css */}
    </section>
  );
}