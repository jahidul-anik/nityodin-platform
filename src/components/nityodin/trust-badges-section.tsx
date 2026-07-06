'use client';

import { motion } from 'framer-motion';

const partners = [
  'bKash',
  'Nagad',
  'Rocket',
  'aamra',
  'SSLCommerz',
  'Bangladesh Bank',
  'ICT Division',
  'BASIS',
];

export function TrustBadgesSection() {
  return (
    <section className="border-y bg-background py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-8 text-center sm:mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Trusted by Leading Organizations
          </p>
        </motion.div>

        {/* Scrolling row */}
        <div className="relative overflow-hidden">
          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-background to-transparent sm:w-24" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-background to-transparent sm:w-24" />

          <motion.div
            className="flex gap-8 sm:gap-12"
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              x: {
                duration: 25,
                repeat: Infinity,
                ease: 'linear',
              },
            }}
          >
            {[...partners, ...partners, ...partners, ...partners].map(
              (name, i) => (
                <motion.div
                  key={`${name}-${i}`}
                  className="flex shrink-0 items-center justify-center"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.5) }}
                >
                  <div className="flex h-12 items-center gap-2.5 rounded-lg border border-border/50 bg-muted/40 px-5 sm:h-14 sm:px-6">
                    <div className="flex size-7 items-center justify-center rounded-md bg-muted text-xs font-bold uppercase text-muted-foreground sm:size-8 sm:text-sm">
                      {name.charAt(0)}
                    </div>
                    <span className="whitespace-nowrap text-xs font-medium text-muted-foreground/80 sm:text-sm">
                      {name}
                    </span>
                  </div>
                </motion.div>
              )
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default TrustBadgesSection;