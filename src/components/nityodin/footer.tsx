'use client';

import { Leaf, Mail, Phone, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const PLATFORM_LINKS = [
  'Supply Chain',
  'Retail Commerce',
  'Business Services',
  'Domestic Services',
  'Medical Hub',
  'Digital Wallet',
] as const;

const COMPANY_LINKS = [
  'About Us',
  'Careers',
  'Blog',
  'Press',
  'Contact',
] as const;

const LEGAL_LINKS = [
  'Terms of Service',
  'Privacy Policy',
  'Refund Policy',
  'Compliance',
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Footer() {
  return (
    <footer className="mt-auto bg-gradient-to-br from-emerald-900 via-emerald-900 to-emerald-950 text-white">
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand column */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="size-6 text-emerald-400" />
              <span className="text-xl font-bold tracking-tight">Nityodin</span>
            </div>
            <p className="text-emerald-200/80 text-sm leading-relaxed max-w-xs">
              Bangladesh&apos;s first citizen-centric digital ecosystem. Single Identity, Multiple Roles.
            </p>
          </div>

          {/* Platform links */}
          <div className="sm:col-span-1 lg:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-300 mb-4">
              Platform
            </h3>
            <ul className="space-y-2.5">
              {PLATFORM_LINKS.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-emerald-200/70 hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div className="sm:col-span-1 lg:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-300 mb-4">
              Company
            </h3>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-emerald-200/70 hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div className="sm:col-span-1 lg:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-300 mb-4">
              Legal
            </h3>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-emerald-200/70 hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div className="sm:col-span-2 lg:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-300 mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Mail className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <a
                  href="mailto:support@nityodin.com"
                  className="text-sm text-emerald-200/70 hover:text-white transition-colors break-all"
                >
                  support@nityodin.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm text-emerald-200/70">+880 1XX-XXXXXXX</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm text-emerald-200/70">Dhaka, Bangladesh</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <Separator className="bg-emerald-800/50" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-emerald-300/60">
            &copy; 2025 Nityodin. All rights reserved.
          </p>
          <p className="text-xs text-emerald-300/60 flex flex-wrap items-center gap-1.5">
            <span>Powered by Bangladesh&apos;s MFS Ecosystem</span>
            <span className="mx-1 text-emerald-600">|</span>
            <span className="font-semibold text-emerald-300/80">bKash</span>
            <span className="mx-0.5 text-emerald-600">&middot;</span>
            <span className="font-semibold text-emerald-300/80">Nagad</span>
            <span className="mx-0.5 text-emerald-600">&middot;</span>
            <span className="font-semibold text-emerald-300/80">Rocket</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;