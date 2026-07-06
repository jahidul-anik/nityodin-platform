'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlatformStore } from '@/store/platform-store';

export function CtaBanner() {
  const { setActiveView, setActiveRole } = usePlatformStore();

  const handleGetStarted = () => {
    setActiveRole('consumer');
    setActiveView('dashboard');
  };

  const handleLearnMore = () => {
    setActiveView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500">
      {/* Decorative floating shapes */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-16 -top-16 size-64 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-20 -right-20 size-80 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/4 size-40 -translate-x-1/2 rounded-full bg-emerald-300/10 blur-2xl" />

        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <motion.h2
            className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
          >
            Ready to Transform Your Daily Life?
          </motion.h2>

          <motion.p
            className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-emerald-50/90 sm:text-base lg:text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            Join millions of Bangladeshis already using Nityodin. One account.
            One wallet. Unlimited possibilities.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:mt-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-white text-emerald-700 shadow-lg hover:bg-emerald-50 hover:text-emerald-800"
            >
              Get Started Free
              <ArrowRight className="ml-1.5 size-4" />
            </Button>
            <Button
              onClick={handleLearnMore}
              variant="outline"
              size="lg"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              Learn More
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default CtaBanner;