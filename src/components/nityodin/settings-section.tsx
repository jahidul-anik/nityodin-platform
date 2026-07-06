'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Bell,
  Wallet,
  Stethoscope,
  Megaphone,
  Globe,
  Eye,
  Phone,
  Mail,
  ChevronRight,
  Trash2,
  HardDrive,
  Info,
  HelpCircle,
  FileText,
  Shield,
  Headphones,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UserSettings {
  id?: string;
  notificationsOrders: boolean;
  notificationsWallet: boolean;
  notificationsMedical: boolean;
  notificationsMarketing: boolean;
  profileVisibility: string;
  showPhone: boolean;
  showEmail: boolean;
  language: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SettingsSection() {
  const [settings, setSettings] = useState<UserSettings>({
    notificationsOrders: true,
    notificationsWallet: true,
    notificationsMedical: true,
    notificationsMarketing: false,
    profileVisibility: 'public',
    showPhone: false,
    showEmail: false,
    language: 'en',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // -------------------------------------------------------------------------
  // Fetch settings
  // -------------------------------------------------------------------------
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          setSettings({
            notificationsOrders: data.notificationsOrders ?? true,
            notificationsWallet: data.notificationsWallet ?? true,
            notificationsMedical: data.notificationsMedical ?? true,
            notificationsMarketing: data.notificationsMarketing ?? false,
            profileVisibility: data.profileVisibility ?? 'public',
            showPhone: data.showPhone ?? false,
            showEmail: data.showEmail ?? false,
            language: data.language ?? 'en',
          });
        }
      }
    } catch {
      // Use defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // -------------------------------------------------------------------------
  // Save settings
  // -------------------------------------------------------------------------
  const saveSettings = useCallback(
    async (patch: Partial<UserSettings>) => {
      const updated = { ...settings, ...patch };
      setSettings(updated);
      setSaving(true);
      try {
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        });
        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error ?? 'Failed to save settings');
          setSettings({ ...settings });
          return;
        }
        toast.success('Settings saved');
      } catch {
        toast.error('Something went wrong');
        setSettings({ ...settings });
      } finally {
        setSaving(false);
      }
    },
    [settings]
  );

  // -------------------------------------------------------------------------
  // Toggle helper
  // -------------------------------------------------------------------------
  const handleToggle = (key: keyof UserSettings, value: boolean) => {
    saveSettings({ [key]: value });
  };

  // -------------------------------------------------------------------------
  // Clear cache
  // -------------------------------------------------------------------------
  const handleClearCache = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
    toast.success('Cache cleared successfully');
  };

  // -------------------------------------------------------------------------
  // Skeleton
  // -------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        {saving && <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />}
      </div>

      {/* ── Notification Preferences ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
      >
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleRow
              icon={PackageIcon}
              iconBg="bg-emerald-100 dark:bg-emerald-900/40"
              iconFg="text-emerald-600 dark:text-emerald-400"
              label="Order Updates"
              description="Get notified when your order status changes"
              checked={settings.notificationsOrders}
              onCheckedChange={(v) => handleToggle('notificationsOrders', v)}
            />
            <Separator />
            <ToggleRow
              icon={Wallet}
              iconBg="bg-teal-100 dark:bg-teal-900/40"
              iconFg="text-teal-600 dark:text-teal-400"
              label="Wallet Activity"
              description="Notifications for deposits, transfers, and payments"
              checked={settings.notificationsWallet}
              onCheckedChange={(v) => handleToggle('notificationsWallet', v)}
            />
            <Separator />
            <ToggleRow
              icon={Stethoscope}
              iconBg="bg-rose-100 dark:bg-rose-900/40"
              iconFg="text-rose-600 dark:text-rose-400"
              label="Medical Reminders"
              description="Appointment reminders and report updates"
              checked={settings.notificationsMedical}
              onCheckedChange={(v) => handleToggle('notificationsMedical', v)}
            />
            <Separator />
            <ToggleRow
              icon={Megaphone}
              iconBg="bg-amber-100 dark:bg-amber-900/40"
              iconFg="text-amber-600 dark:text-amber-400"
              label="Marketing & Promotions"
              description="Deals, offers, and promotional content"
              checked={settings.notificationsMarketing}
              onCheckedChange={(v) => handleToggle('notificationsMarketing', v)}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Privacy ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Visibility */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center rounded-full size-9 shrink-0 bg-emerald-100 dark:bg-emerald-900/40">
                  <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">Profile Visibility</p>
                  <p className="text-xs text-muted-foreground">Control who can see your profile</p>
                </div>
              </div>
              <Select
                value={settings.profileVisibility}
                onValueChange={(v) => saveSettings({ profileVisibility: v })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Show Phone */}
            <ToggleRow
              icon={Phone}
              iconBg="bg-emerald-100 dark:bg-emerald-900/40"
              iconFg="text-emerald-600 dark:text-emerald-400"
              label="Show Phone"
              description="Display your phone number on your public profile"
              checked={settings.showPhone}
              onCheckedChange={(v) => handleToggle('showPhone', v)}
            />

            <Separator />

            {/* Show Email */}
            <ToggleRow
              icon={Mail}
              iconBg="bg-emerald-100 dark:bg-emerald-900/40"
              iconFg="text-emerald-600 dark:text-emerald-400"
              label="Show Email"
              description="Display your email address on your public profile"
              checked={settings.showEmail}
              onCheckedChange={(v) => handleToggle('showEmail', v)}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Language ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Language
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Display Language</p>
                <p className="text-xs text-muted-foreground">
                  Choose your preferred language for the interface
                </p>
              </div>
              <Select
                value={settings.language}
                onValueChange={(v) => saveSettings({ language: v })}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="bn">বাংলা</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── About & Help ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              About &amp; Help
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              <InfoRow
                icon={Info}
                iconBg="bg-muted"
                iconFg="text-muted-foreground"
                label="App Version"
                value="v0.3.0"
                showChevron={false}
              />
              <InfoRow
                icon={HelpCircle}
                iconBg="bg-emerald-100 dark:bg-emerald-900/40"
                iconFg="text-emerald-600 dark:text-emerald-400"
                label="FAQ"
                value="Frequently asked questions"
                showChevron
              />
              <InfoRow
                icon={FileText}
                iconBg="bg-amber-100 dark:bg-amber-900/40"
                iconFg="text-amber-600 dark:text-amber-400"
                label="Terms of Service"
                value="Our terms and conditions"
                showChevron
              />
              <InfoRow
                icon={Shield}
                iconBg="bg-teal-100 dark:bg-teal-900/40"
                iconFg="text-teal-600 dark:text-teal-400"
                label="Privacy Policy"
                value="How we protect your data"
                showChevron
              />
              <InfoRow
                icon={Headphones}
                iconBg="bg-purple-100 dark:bg-purple-900/40"
                iconFg="text-purple-600 dark:text-purple-400"
                label="Contact Support"
                value="Get help from our team"
                showChevron
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Account Actions ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-red-200 dark:border-red-900/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
              <Shield className="h-5 w-5" />
              Account Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleClearCache}
            >
              <HardDrive className="mr-2 h-4 w-4" />
              Clear Cache
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
              disabled
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
            <p className="text-[11px] text-muted-foreground">
              Account deletion is disabled in the current version. Contact support for assistance.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Delete Account Dialog ───────────────────────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanently disabled in the current version. Please contact
              Nityodin support if you need to delete your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled className="bg-red-600 hover:bg-red-700 text-white opacity-50 cursor-not-allowed">
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ToggleRow({
  icon: Icon,
  iconBg,
  iconFg,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconFg: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn('flex items-center justify-center rounded-full size-9 shrink-0', iconBg)}>
          <Icon className={cn('h-4 w-4', iconFg)} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function InfoRow({
  icon: Icon,
  iconBg,
  iconFg,
  label,
  value,
  showChevron,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconFg: string;
  label: string;
  value: string;
  showChevron: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer">
      <div className={cn('flex items-center justify-center rounded-full size-9 shrink-0', iconBg)}>
        <Icon className={cn('h-4 w-4', iconFg)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{value}</p>
      </div>
      {showChevron && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
    </div>
  );
}

// Package icon for order updates (inline to avoid name conflict with lucide's Package)
function PackageIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}