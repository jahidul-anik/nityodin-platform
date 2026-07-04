'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { UserPlus, Users, Search, CreditCard } from 'lucide-react';

interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

const steps: Step[] = [
  {
    number: 1,
    title: 'Create Account',
    description:
      'Register with your phone number. Verify with NID for full access.',
    icon: UserPlus,
  },
  {
    number: 2,
    title: 'Choose Your Role',
    description:
      'Switch between Consumer, Merchant, Farmer, or Service Provider anytime.',
    icon: Users,
  },
  {
    number: 3,
    title: 'Explore & Transact',
    description:
      'Discover nearby shops, book services, or list your products.',
    icon: Search,
  },
  {
    number: 4,
    title: 'Pay with Wallet',
    description:
      'Use your unified Nityodin wallet with bKash, Nagad, or Rocket.',
    icon: CreditCard,
  },
];

const stepVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: 'easeOut' as const },
  }),
};

export function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="bg-muted/50 py-16 sm:py-24" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center sm:mb-16">
          <motion.h2
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            How Nityodin Works
          </motion.h2>
          <motion.p
            className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Get started in minutes. Four simple steps to unlock the full
            ecosystem.
          </motion.p>
        </div>

        {/* Steps — vertical on mobile, horizontal on desktop */}
        <div className="relative">
          {/* Desktop connector line */}
          <div
            className="absolute top-14 right-[12%] left-[12%] hidden h-0.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 lg:block"
            aria-hidden="true"
          />

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  custom={i}
                  variants={stepVariants}
                  initial="hidden"
                  animate={inView ? 'visible' : 'hidden'}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Numbered circle with icon */}
                  <div className="relative z-10 mb-5">
                    <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg sm:size-[72px]">
                      <Icon className="size-7 text-white sm:size-8" />
                    </div>
                    <span className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-white text-xs font-bold text-emerald-700 shadow ring-2 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:ring-emerald-800 sm:size-7 sm:text-sm">
                      {step.number}
                    </span>
                  </div>

                  {/* Mobile connector line */}
                  {i < steps.length - 1 && (
                    <div
                      className="absolute top-[72px] left-1/2 h-8 w-0.5 -translate-x-1/2 bg-gradient-to-b from-emerald-400 to-transparent lg:hidden sm:top-[80px]"
                      aria-hidden="true"
                    />
                  )}

                  <h3 className="text-base font-bold text-foreground sm:text-lg">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-[240px] text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}