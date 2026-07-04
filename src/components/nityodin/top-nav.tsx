'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Leaf,
  ShoppingCart,
  Store,
  Wheat,
  Wrench,
  Bell,
  Menu,
  Home,
  Compass,
  Wallet,
  HeartPulse,
  UserCircle,
  LogIn,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { usePlatformStore, type ActiveView, type ActiveRole } from '@/store/platform-store';
import { useAuthStore } from '@/store/auth-store';

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

interface NavTab {
  label: string;
  view: ActiveView;
  icon: React.ReactNode;
}

const NAV_TABS: NavTab[] = [
  { label: 'Home', view: 'landing', icon: <Home className="size-4" /> },
  { label: 'Discover', view: 'discover', icon: <Compass className="size-4" /> },
  { label: 'Wallet', view: 'wallet', icon: <Wallet className="size-4" /> },
  { label: 'Medical', view: 'medical', icon: <HeartPulse className="size-4" /> },
  { label: 'Profile', view: 'dashboard', icon: <UserCircle className="size-4" /> },
];

interface RoleConfig {
  label: string;
  icon: React.ReactNode;
  color: string; // tailwind class
  badgeClass: string;
}

const ROLES: Record<ActiveRole, RoleConfig> = {
  consumer: {
    label: 'Consumer',
    icon: <ShoppingCart className="size-3.5" />,
    color: 'text-emerald-600',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  merchant: {
    label: 'Merchant',
    icon: <Store className="size-3.5" />,
    color: 'text-amber-600',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  farmer: {
    label: 'Farmer',
    icon: <Wheat className="size-3.5" />,
    color: 'text-green-600',
    badgeClass: 'bg-green-100 text-green-700 border-green-200',
  },
  service_provider: {
    label: 'Service Provider',
    icon: <Wrench className="size-3.5" />,
    color: 'text-teal-600',
    badgeClass: 'bg-teal-100 text-teal-700 border-teal-200',
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TopNav() {
  const { activeView, activeRole, walletBalance, notificationCount, setActiveView, setActiveRole, toggleSidebar, cart } =
    usePlatformStore();
  const { isAuthenticated, currentUser } = useAuthStore();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Detect scroll for glass effect
  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 8);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // User initials helper
  const userInitials = useMemo(() => {
    if (!currentUser?.name) return 'N';
    const parts = currentUser.name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }, [currentUser]);

  // Format balance: store value is in paisa
  const formattedBalance = useMemo(() => {
    const taka = Math.floor(walletBalance / 100);
    return `৳ ${taka.toLocaleString('en-BD')}`;
  }, [walletBalance]);

  // Cart item count
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  // Navigation handler
  const handleNav = useCallback(
    (view: ActiveView) => {
      setActiveView(view);
      setMobileMenuOpen(false);
    },
    [setActiveView],
  );

  // ---- Unauthenticated nav (landing) --------------------------------------

  if (!isAuthenticated || activeView === 'landing') {
    const currentRole = ROLES[activeRole];

    return (
      <header
        className={`sticky top-0 z-50 h-16 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-background/80 backdrop-blur-xl border-b shadow-sm'
            : 'bg-background border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Leaf className="size-6 text-emerald-500" />
            <span className="text-xl font-bold tracking-tight text-foreground">Nityodin</span>
          </div>

          {/* Authenticated center nav on larger screens (only when authenticated but on landing) */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {NAV_TABS.map((tab) => {
                const isActive = activeView === tab.view;
                return (
                  <button
                    key={tab.view}
                    onClick={() => handleNav(tab.view)}
                    className={`relative px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-accent ${
                      isActive ? 'text-emerald-600' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-emerald-500 transition-all duration-300" />
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Role Switcher */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 cursor-pointer">
                      <Badge variant="outline" className={`${currentRole.badgeClass} gap-1 cursor-pointer hover:opacity-80 transition-opacity`}>
                        {currentRole.icon}
                        <span className="hidden sm:inline">{currentRole.label}</span>
                      </Badge>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {(Object.keys(ROLES) as ActiveRole[]).map((role) => {
                      const config = ROLES[role];
                      return (
                        <DropdownMenuItem
                          key={role}
                          onClick={() => setActiveRole(role)}
                          className={activeRole === role ? 'bg-accent' : ''}
                        >
                          <span className={config.color}>{config.icon}</span>
                          <span className="ml-2">{config.label}</span>
                          {activeRole === role && <span className="ml-auto text-xs text-muted-foreground">Active</span>}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Wallet pill */}
                <Badge variant="secondary" className="hidden sm:flex items-center gap-1 px-3 py-1 text-sm font-semibold">
                  {formattedBalance}
                </Badge>

                {/* Notification bell */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="relative p-2 rounded-full hover:bg-accent transition-colors">
                        <Bell className="size-5 text-muted-foreground" />
                        {notificationCount > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center size-4 rounded-full bg-destructive text-[10px] font-bold text-white">
                            {notificationCount > 9 ? '9+' : notificationCount}
                          </span>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Notifications</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Avatar */}
                <Avatar className="size-8 cursor-pointer ring-2 ring-emerald-200 ring-offset-1">
                  {currentUser?.avatarUrl && <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />}
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <LogIn className="size-4 mr-1.5" />
                  Login
                </Button>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Get Started
                  <ArrowRight className="size-4 ml-1.5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
    );
  }

  // ---- Authenticated nav ---------------------------------------------------

  const currentRole = ROLES[activeRole];

  return (
    <header
      className={`sticky top-0 z-50 h-16 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-xl border-b shadow-sm'
          : 'bg-background border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <Leaf className="size-6 text-emerald-500" />
          <span className="text-xl font-bold tracking-tight text-foreground">Nityodin</span>
        </div>

        {/* Center nav tabs - desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_TABS.map((tab) => {
            const isActive = activeView === tab.view;
            return (
              <button
                key={tab.view}
                onClick={() => handleNav(tab.view)}
                className={`relative px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-accent ${
                  isActive ? 'text-emerald-600' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-emerald-500 transition-all duration-300 animate-in slide-in-from-bottom-2" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Role Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 cursor-pointer">
                <Badge variant="outline" className={`${currentRole.badgeClass} gap-1 cursor-pointer hover:opacity-80 transition-opacity`}>
                  {currentRole.icon}
                  <span className="hidden lg:inline">{currentRole.label}</span>
                </Badge>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(ROLES) as ActiveRole[]).map((role) => {
                const config = ROLES[role];
                return (
                  <DropdownMenuItem
                    key={role}
                    onClick={() => setActiveRole(role)}
                    className={activeRole === role ? 'bg-accent' : ''}
                  >
                    <span className={config.color}>{config.icon}</span>
                    <span className="ml-2">{config.label}</span>
                    {activeRole === role && <span className="ml-auto text-xs text-muted-foreground">Active</span>}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Wallet pill */}
          <Badge variant="secondary" className="hidden sm:flex items-center gap-1 px-3 py-1 text-sm font-semibold">
            {formattedBalance}
          </Badge>

          {/* Notification bell */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="relative p-2 rounded-full hover:bg-accent transition-colors">
                  <Bell className="size-5 text-muted-foreground" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center size-4 rounded-full bg-destructive text-[10px] font-bold text-white">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Avatar */}
          <Avatar className="size-8 cursor-pointer ring-2 ring-emerald-200 ring-offset-1">
            {currentUser?.avatarUrl && <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />}
            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>

          {/* Mobile hamburger menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="size-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader className="pt-2">
                <SheetTitle className="flex items-center gap-2">
                  <Leaf className="size-5 text-emerald-500" />
                  <span>Nityodin</span>
                </SheetTitle>
              </SheetHeader>
              <Separator className="my-2" />
              <nav className="flex flex-col gap-1 px-2">
                {NAV_TABS.map((tab) => {
                  const isActive = activeView === tab.view;
                  return (
                    <button
                      key={tab.view}
                      onClick={() => handleNav(tab.view)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
              <Separator className="my-2" />
              <div className="px-4 py-2">
                <p className="text-xs text-muted-foreground mb-2">Active Role</p>
                <Badge variant="outline" className={`${currentRole.badgeClass} gap-1`}>
                  {currentRole.icon}
                  {currentRole.label}
                </Badge>
              </div>
              <div className="px-4 py-2">
                <p className="text-xs text-muted-foreground mb-1">Wallet Balance</p>
                <p className="text-lg font-bold">{formattedBalance}</p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default TopNav;