'use client';
import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { usePlatformStore } from '@/store/platform-store';
import { useAuthStore } from '@/store/auth-store';
import dynamic from 'next/dynamic';

const TopNav = dynamic(() => import('@/components/nityodin/top-nav').then(m => ({ default: m.TopNav })), { ssr: false });
const HeroSection = dynamic(() => import('@/components/nityodin/hero-section').then(m => ({ default: m.HeroSection })), { ssr: false });
const StatsSection = dynamic(() => import('@/components/nityodin/stats-section').then(m => ({ default: m.StatsSection })), { ssr: false });
const FeaturesSection = dynamic(() => import('@/components/nityodin/features-section').then(m => ({ default: m.FeaturesSection })), { ssr: false });
const HowItWorksSection = dynamic(() => import('@/components/nityodin/how-it-works-section').then(m => ({ default: m.HowItWorksSection })), { ssr: false });
const Footer = dynamic(() => import('@/components/nityodin/footer').then(m => ({ default: m.Footer })), { ssr: false });

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: unknown}> {
  state = { hasError: false, error: null as unknown };
  static getDerivedStateFromError(error: unknown) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      const err = this.state.error instanceof Error ? this.state.error : new Error(String(this.state.error));
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
          <h1 className="text-2xl font-bold text-destructive">Something went wrong</h1>
          <pre className="mt-4 max-w-2xl overflow-auto rounded-lg bg-muted p-4 text-sm text-muted-foreground">{err.message}</pre>
          <pre className="mt-2 max-w-2xl overflow-auto rounded-lg bg-muted p-4 text-xs text-muted-foreground">{err.stack?.toString()}</pre>
          <button className="mt-4 rounded-lg bg-primary px-6 py-2 text-primary-foreground" onClick={() => this.setState({ hasError: false, error: null })}>Try Again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Spinner() {
  return <div className="flex min-h-[50vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
}

export default function Home() {
  const activeView = usePlatformStore((s) => s.activeView);
  const setWalletBalance = usePlatformStore((s) => s.setWalletBalance);
  const setActiveRole = usePlatformStore((s) => s.setActiveRole);
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [extraLoaded, setExtraLoaded] = useState(false);
  const [DashView, setDashView] = useState<React.ComponentType | null>(null);
  const [DiscoverView, setDiscoverView] = useState<React.ComponentType | null>(null);
  const [WalletView, setWalletView] = useState<React.ComponentType | null>(null);
  const [MedicalView, setMedicalView] = useState<React.ComponentType | null>(null);
  const [ProfileView, setProfileView] = useState<React.ComponentType | null>(null);
  const [CartComp, setCartComp] = useState<React.ComponentType | null>(null);
  const [MerchantStorefrontView, setMerchantStorefrontView] = useState<React.ComponentType<{merchantId: string}> | null>(null);

  const selectedMerchantId = usePlatformStore((s) => s.selectedMerchantId);

  useEffect(() => {
    if (isAuthenticated) return;
    fetch('/api/users/me').then(r => r.json()).then(data => {
      if (data.user) {
        login({ id: data.user.id, name: data.user.name, phone: data.user.phone, email: data.user.email, city: data.user.city, roles: data.roles.map((r: { role: string }) => r.role) });
        if (data.wallet) setWalletBalance(data.wallet.balance);
        const ar = data.roles.filter((r: { isActive: boolean }) => r.isActive);
        if (ar.length > 0) setActiveRole(ar[0].role as 'consumer' | 'merchant' | 'farmer' | 'service_provider');
      }
    }).catch(() => {});
  }, []);

  const loadExtra = useCallback(() => {
    if (extraLoaded) return;
    setExtraLoaded(true);
    Promise.all([
      import('@/components/nityodin/cart-drawer').then(m => setCartComp(() => m.CartDrawer)),
      import('@/components/nityodin/merchant-storefront').then(m => setMerchantStorefrontView(() => m.MerchantStorefront)),
      import('@/components/nityodin/dashboard-shell').then(m => setDashView(() => m.DashboardShell)),
      import('@/components/nityodin/discover-section').then(m => setDiscoverView(() => m.DiscoverSection)),
      import('@/components/nityodin/wallet-section').then(m => setWalletView(() => m.WalletSection)),
      import('@/components/nityodin/medical-section').then(m => setMedicalView(() => m.MedicalSection)),
      import('@/components/nityodin/profile-section').then(m => setProfileView(() => m.ProfileSection)),
    ]).catch((err) => { console.error('Failed to load views:', err); });
  }, [extraLoaded]);

  useEffect(() => { if (activeView !== 'landing') loadExtra(); }, [activeView, loadExtra]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-background">
        <TopNav />
        {CartComp && <CartComp />}
        <main className="flex-1">
          {activeView === 'landing' && (<><HeroSection /><StatsSection /><FeaturesSection /><HowItWorksSection /></>)}
          {activeView === 'dashboard' && (DashView ? <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"><DashView /></div> : <Spinner />)}
          {activeView === 'discover' && (DiscoverView ? <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"><DiscoverView /></div> : <Spinner />)}
          {activeView === 'wallet' && (WalletView ? <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8"><WalletView /></div> : <Spinner />)}
          {activeView === 'medical' && (MedicalView ? <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"><MedicalView /></div> : <Spinner />)}
          {activeView === 'profile' && (ProfileView ? <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8"><ProfileView /></div> : <Spinner />)}
          {activeView === 'merchant-storefront' && selectedMerchantId && (MerchantStorefrontView ? <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"><MerchantStorefrontView merchantId={selectedMerchantId} /></div> : <Spinner />)}
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
