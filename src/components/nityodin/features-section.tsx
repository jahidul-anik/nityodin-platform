'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Truck,
  ShoppingBag,
  Briefcase,
  Home,
  Heart,
  Wallet,
  ArrowRight,
} from 'lucide-react';
import { usePlatformStore, type ActiveView } from '@/store/platform-store';

interface Feature {
  title: string;
  bengali: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  view: ActiveView;
  role?: 'consumer' | 'merchant' | 'farmer' | 'service_provider';
}

const features: Feature[] = [
  {
    title: 'Supply Chain & Agriculture',
    bengali: 'সরবরাহ শৃঙ্খল ও কৃষি',
    description:
      'Eliminate middlemen. Direct farm-to-consumer with full traceability.',
    icon: Truck,
    gradient: 'from-green-500 to-emerald-600',
    view: 'dashboard',
    role: 'farmer',
  },
  {
    title: 'Retail & Community Commerce',
    bengali: 'খুচরা ও সম্প্রদায় বাণিজ্য',
    description:
      'Digitize your neighborhood shop. Hyper-local delivery in 30 minutes.',
    icon: ShoppingBag,
    gradient: 'from-amber-400 to-orange-500',
    view: 'dashboard',
    role: 'merchant',
  },
  {
    title: 'Business Services',
    bengali: 'ব্যবসায়িক সেবা',
    description:
      'Verified professionals. Transparent pricing. Quality assured.',
    icon: Briefcase,
    gradient: 'from-teal-500 to-cyan-600',
    view: 'dashboard',
  },
  {
    title: 'Domestic Services',
    bengali: 'গৃহস্থালী সেবা',
    description:
      'Emergency dispatch. GPS-matched providers. Instant relief.',
    icon: Home,
    gradient: 'from-rose-500 to-pink-600',
    view: 'dashboard',
  },
  {
    title: 'Diagnostic & Medical Hub',
    bengali: 'ডায়াগনস্টিক ও মেডিকেল হাব',
    description:
      'Centralized health records. Smart doctor booking. Secure sharing.',
    icon: Heart,
    gradient: 'from-violet-500 to-cyan-500',
    view: 'medical',
  },
  {
    title: 'Digital Wallet & Payments',
    bengali: 'ডিজিটাল ওয়ালেট ও পেমেন্ট',
    description:
      'bKash, Nagad, Rocket — all in one wallet. Escrow protection.',
    icon: Wallet,
    gradient: 'from-emerald-500 to-teal-600',
    view: 'wallet',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
};

export function FeaturesSection() {
  const { setActiveView, setActiveRole } = usePlatformStore();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const handleExplore = (feature: Feature) => {
    if (feature.role) setActiveRole(feature.role);
    setActiveView(feature.view);
  };

  return (
    <section className="py-16 sm:py-24" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center sm:mb-16">
          <motion.h2
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            Six Pillars of the Nityodin Ecosystem
          </motion.h2>
          <motion.p
            className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            From farm to table, from home services to healthcare — one platform
            for every citizen need.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                className="animated-border group relative min-h-[220px] cursor-pointer rounded-xl bg-background p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg sm:min-h-[240px] sm:p-8"
                onClick={() => handleExplore(feature)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleExplore(feature);
                  }
                }}
              >
                {/* Icon */}
                <div
                  className={`mb-4 flex size-[60px] items-center justify-center rounded-full bg-gradient-to-br ${feature.gradient} shadow-md`}
                >
                  <Icon className="size-7 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-foreground sm:text-lg">
                  {feature.title}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {feature.bengali}
                </p>

                {/* Description */}
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>

                {/* Explore link */}
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  Explore <ArrowRight className="size-3.5" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}