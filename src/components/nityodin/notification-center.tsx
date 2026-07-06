'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BellOff,
  Package,
  CreditCard,
  CalendarCheck,
  Stethoscope,
  Settings2,
  RefreshCw,
  ArrowLeft,
  CheckCheck,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlatformStore } from '@/store/platform-store';
import { useAuthStore } from '@/store/auth-store';
import { useNotificationStore, type Notification } from '@/store/notification-store';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function notifMeta(type: string) {
  switch (type) {
    case 'order':
      return { icon: Package, bg: 'bg-emerald-100 dark:bg-emerald-950/40', fg: 'text-emerald-600 dark:text-emerald-400' };
    case 'wallet':
      return { icon: CreditCard, bg: 'bg-teal-100 dark:bg-teal-950/40', fg: 'text-teal-600 dark:text-teal-400' };
    case 'appointment':
      return { icon: CalendarCheck, bg: 'bg-rose-100 dark:bg-rose-950/40', fg: 'text-rose-600 dark:text-rose-400' };
    case 'service':
      return { icon: Stethoscope, bg: 'bg-amber-100 dark:bg-amber-950/40', fg: 'text-amber-600 dark:text-amber-400' };
    default:
      return { icon: Settings2, bg: 'bg-muted', fg: 'text-muted-foreground' };
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function navForType(type: string): 'dashboard' | 'wallet' | 'medical' | 'dashboard' {
  switch (type) {
    case 'wallet': return 'wallet';
    case 'appointment': return 'medical';
    case 'order':
    case 'service':
    default: return 'dashboard';
  }
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4">
      <Skeleton className="size-9 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Notification Card
// ---------------------------------------------------------------------------

function NotificationCard({
  notif,
  onMarkRead,
  onClick,
}: {
  notif: Notification;
  onMarkRead: (id: string) => void;
  onClick: (notif: Notification) => void;
}) {
  const meta = notifMeta(notif.type);
  const NotifIcon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      layout
      className={`group cursor-pointer transition-colors rounded-lg border ${
        notif.isRead
          ? 'border-transparent hover:bg-muted/50'
          : 'border-emerald-200/60 dark:border-emerald-800/40 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30'
      }`}
      onClick={() => {
        if (!notif.isRead) onMarkRead(notif.id);
        onClick(notif);
      }}
    >
      <CardContent className="flex items-start gap-3 p-4">
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${meta.bg}`}>
          <NotifIcon className={`size-4 ${meta.fg}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className={`text-sm truncate ${notif.isRead ? 'font-medium' : 'font-semibold'}`}>
              {notif.title}
            </p>
            {!notif.isRead && (
              <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
          <p className="text-xs text-muted-foreground/70 mt-1.5">{timeAgo(notif.createdAt)}</p>
        </div>
      </CardContent>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState({ filter }: { filter: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center px-4"
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
        <BellOff className="size-7 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        No {filter !== 'all' ? filter : ''} notifications
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        {filter === 'unread'
          ? "You're all caught up! No unread notifications."
          : filter !== 'all'
            ? `No ${filter} notifications to show right now.`
            : "We'll notify you about orders, payments, appointments, and more."}
      </p>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Notification Center
// ---------------------------------------------------------------------------

export function NotificationCenter() {
  const setActiveView = usePlatformStore((s) => s.setActiveView);
  const currentUser = useAuthStore((s) => s.currentUser);
  const {
    notifications,
    unreadCount,
    setNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      const json = await res.json();
      const list: Notification[] = (json.data ?? json).map((n: Record<string, unknown>) => ({
        id: n.id as string,
        type: (n.type as Notification['type']) ?? 'system',
        title: n.title as string,
        message: n.message as string,
        data: n.data ? (typeof n.data === 'string' ? JSON.parse(n.data) : n.data) : undefined,
        isRead: (n.isRead as boolean) ?? false,
        createdAt: n.createdAt as string,
      }));
      setNotifications(list);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [setNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark as read
  const handleMarkRead = useCallback(async (id: string) => {
    markAsRead(id);
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });
    } catch {
      // silent
    }
  }, [markAsRead]);

  // Mark all as read
  const handleMarkAllRead = useCallback(async () => {
    if (!currentUser || notifications.length === 0) return;
    markAllAsRead();
    try {
      await fetch('/api/notifications/bulk-read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      });
    } catch {
      // silent
    }
  }, [currentUser, notifications, markAllAsRead]);

  // Navigate based on notification type
  const handleNotifClick = useCallback((notif: Notification) => {
    const target = navForType(notif.type);
    setActiveView(target as 'dashboard' | 'wallet' | 'medical' | 'profile');
  }, [setActiveView]);

  // Filtered notifications
  const filtered = useMemo(() => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter((n) => !n.isRead);
      case 'orders':
        return notifications.filter((n) => n.type === 'order');
      case 'wallet':
        return notifications.filter((n) => n.type === 'wallet');
      case 'appointments':
        return notifications.filter((n) => n.type === 'appointment');
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  const tabs = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread', count: unreadCount || undefined },
    { value: 'orders', label: 'Orders' },
    { value: 'wallet', label: 'Wallet' },
    { value: 'appointments', label: 'Appointments' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveView('dashboard')}
            className="shrink-0"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Bell className="size-6 text-emerald-600 dark:text-emerald-400" />
              Notifications
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Stay updated on your orders, wallet, and appointments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="gap-1.5 text-emerald-600 hover:text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-950/40"
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto overflow-x-auto">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
              {tab.label}
              {tab.count != null && tab.count > 0 && (
                <span className="flex items-center justify-center size-5 min-w-[20px] rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                  {tab.count > 9 ? '9+' : tab.count}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <NotificationSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState filter={activeTab} />
          ) : (
            <ScrollArea className="max-h-[calc(100vh-260px)]">
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {filtered.map((notif) => (
                    <NotificationCard
                      key={notif.id}
                      notif={notif}
                      onMarkRead={handleMarkRead}
                      onClick={handleNotifClick}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default NotificationCenter;