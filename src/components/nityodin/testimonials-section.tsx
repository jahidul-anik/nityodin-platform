'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Testimonial {
  name: string;
  initials: string;
  role: string;
  rating: number;
  quote: string;
  color: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Rahim Akhter',
    initials: 'RA',
    role: 'Farmer from Rajshahi',
    rating: 5,
    quote:
      'Before Nityodin, middlemen took most of my profits. Now I sell directly to consumers in Dhaka and my income has nearly doubled. The supply chain tracking gives buyers confidence in my produce.',
    color: 'bg-emerald-500',
  },
  {
    name: 'Fatima Begum',
    initials: 'FB',
    role: 'Shop Owner from Dhaka',
    rating: 5,
    quote:
      'I was skeptical about digitizing my grocery store, but Nityodin made it so simple. My daily orders have increased by 40% and I can manage everything from my phone — inventory, payments, and deliveries.',
    color: 'bg-teal-500',
  },
  {
    name: 'Dr. Aminul Islam',
    initials: 'AI',
    role: 'Pathologist from Chittagong',
    rating: 4,
    quote:
      'Centralized medical records have been a game-changer. Patients no longer carry stacks of paper reports. I can access their history instantly and make better diagnostic decisions. This is the future of healthcare in Bangladesh.',
    color: 'bg-amber-500',
  },
  {
    name: 'Kamal Hossain',
    initials: 'KH',
    role: 'Electrician from Sylhet',
    rating: 5,
    quote:
      'I used to rely on word-of-mouth for new customers. Since joining Nityodin as a service provider, I get regular job requests and my earnings have become stable. The escrow payment system means I never worry about not getting paid.',
    color: 'bg-rose-500',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' as const },
  }),
};

export function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="bg-muted/30 py-16 sm:py-24" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center sm:mb-16">
          <motion.h2
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            What People Are Saying
          </motion.h2>
          <motion.p
            className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Real stories from real Bangladeshis transforming their lives with
            Nityodin.
          </motion.p>
        </div>

        {/* Testimonial Grid */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
            >
              <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg py-0 gap-0">
                <CardContent className="flex h-full flex-col gap-4 p-6">
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, starIdx) => (
                      <Star
                        key={starIdx}
                        className={`size-4 ${
                          starIdx < testimonial.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-muted text-muted'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 border-t pt-4">
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${testimonial.color}`}
                    >
                      {testimonial.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {testimonial.name}
                      </p>
                      <Badge
                        variant="secondary"
                        className="mt-0.5 text-[10px] font-normal text-muted-foreground"
                      >
                        {testimonial.role}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;