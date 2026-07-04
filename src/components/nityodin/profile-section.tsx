'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  ShieldCheck,
  Pencil,
  Download,
  Lock,
  HelpCircle,
  LogOut,
  Bell,
  Globe,
  Moon,
  Sun,
  UserPlus,
  Loader2,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from 'next-themes';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UserData {
  id: string;
  phone: string;
  email?: string;
  name: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  city?: string;
  district?: string;
  division?: string;
  isPhoneVerified: boolean;
  isNidVerified: boolean;
  createdAt: string;
}

interface UserRole {
  id: string;
  userId: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface ProfileResponse {
  user: UserData;
  roles: UserRole[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  consumer: { label: 'Consumer', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', icon: '🛒' },
  merchant: { label: 'Merchant', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: '🏪' },
  farmer: { label: 'Farmer', color: 'bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300', icon: '🌾' },
  service_provider: { label: 'Service Provider', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300', icon: '🔧' },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProfileSection() {
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();

  // Notification & settings state
  const [notifOrders, setNotifOrders] = useState(true);
  const [notifPromo, setNotifPromo] = useState(true);
  const [notifMedical, setNotifMedical] = useState(false);
  const [language, setLanguage] = useState<'en' | 'bn'>('en');

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users/me');
      if (!res.ok) throw new Error('Failed');
      const data: ProfileResponse = await res.json();
      setProfileData(data);
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // -- Skeleton -------------------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-52 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-60 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  const user = profileData?.user;
  const roles = profileData?.roles ?? [];

  return (
    <div className="space-y-6">
      {/* ── Profile Card ────────────────────────────────────────────────── */}
      <Card className="rounded-xl">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              {user ? getInitials(user.name) : '?'}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col items-center gap-2 sm:flex-row">
                <h2 className="text-xl font-bold">{user?.name}</h2>
                <Badge
                  variant="outline"
                  className={
                    user?.isNidVerified
                      ? 'border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400'
                      : 'border-amber-300 text-amber-600 dark:border-amber-700 dark:text-amber-400'
                  }
                >
                  {user?.isNidVerified ? (
                    <>
                      <ShieldCheck className="mr-1 size-3.5" />
                      NID Verified
                    </>
                  ) : (
                    <>
                      <Shield className="mr-1 size-3.5" />
                      Not Verified
                    </>
                  )}
                </Badge>
              </div>

              <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <Phone className="size-4" />
                  <span>{user?.phone}</span>
                  {user?.isPhoneVerified && (
                    <Badge variant="outline" className="h-5 text-[10px] border-emerald-300 text-emerald-600">
                      Verified
                    </Badge>
                  )}
                </div>
                {user?.email && (
                  <div className="flex items-center justify-center gap-2 sm:justify-start">
                    <Mail className="size-4" />
                    <span>{user.email}</span>
                  </div>
                )}
                {(user?.city || user?.division) && (
                  <div className="flex items-center justify-center gap-2 sm:justify-start">
                    <MapPin className="size-4" />
                    <span>
                      {[user?.city, user?.division].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => toast.info('Profile editing coming soon')}
              >
                <Pencil className="mr-2 size-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── My Roles ────────────────────────────────────────────────────── */}
      <Card className="rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">My Roles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {roles.map((r) => {
            const config = ROLE_CONFIG[r.role] || {
              label: r.role,
              color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
              icon: '👤',
            };
            return (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{config.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{config.label}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {r.role.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    r.isActive
                      ? 'border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400'
                      : 'border-muted text-muted-foreground'
                  }
                >
                  {r.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            );
          })}
          <Button
            variant="outline"
            className="mt-2 w-full"
            onClick={() => toast.info('Role activation coming soon')}
          >
            <UserPlus className="mr-2 size-4" />
            Activate New Role
          </Button>
        </CardContent>
      </Card>

      {/* ── Quick Settings ──────────────────────────────────────────────── */}
      <Card className="rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Notifications */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Notifications</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-muted-foreground" />
                <span className="text-sm">Order Updates</span>
              </div>
              <Switch checked={notifOrders} onCheckedChange={setNotifOrders} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-muted-foreground" />
                <span className="text-sm">Promotions</span>
              </div>
              <Switch checked={notifPromo} onCheckedChange={setNotifPromo} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-muted-foreground" />
                <span className="text-sm">Medical Reminders</span>
              </div>
              <Switch checked={notifMedical} onCheckedChange={setNotifMedical} />
            </div>
          </div>

          <Separator />

          {/* Language */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="size-4 text-muted-foreground" />
              <span className="text-sm">Language</span>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
              <button
                onClick={() => setLanguage('en')}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  language === 'en'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('bn')}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  language === 'bn'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                বাংলা
              </button>
            </div>
          </div>

          <Separator />

          {/* Theme */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="size-4 text-muted-foreground" />
              ) : (
                <Sun className="size-4 text-muted-foreground" />
              )}
              <span className="text-sm">Theme</span>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  theme === 'light'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sun className="size-3.5" />
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Moon className="size-3.5" />
                Dark
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Account Actions ─────────────────────────────────────────────── */}
      <Card className="rounded-xl">
        <CardContent className="p-4">
          <div className="space-y-1">
            <button
              onClick={() => toast.info('Statement download coming soon')}
              className="flex w-full items-center gap-3 rounded-lg p-3 text-left text-sm transition-colors hover:bg-muted/50"
            >
              <Download className="size-4 text-muted-foreground" />
              <span>Download Statement</span>
            </button>
            <button
              onClick={() => toast.info('Privacy settings coming soon')}
              className="flex w-full items-center gap-3 rounded-lg p-3 text-left text-sm transition-colors hover:bg-muted/50"
            >
              <Lock className="size-4 text-muted-foreground" />
              <span>Privacy Settings</span>
            </button>
            <button
              onClick={() => toast.info('Help & support coming soon')}
              className="flex w-full items-center gap-3 rounded-lg p-3 text-left text-sm transition-colors hover:bg-muted/50"
            >
              <HelpCircle className="size-4 text-muted-foreground" />
              <span>Help & Support</span>
            </button>

            <Separator className="my-2" />

            <button
              onClick={() => toast.info('Signed out (demo)')}
              className="flex w-full items-center gap-3 rounded-lg p-3 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}