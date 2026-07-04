'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Send,
  Plus,
  Receipt,
  QrCode,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Wallet as WalletIcon,
  Loader2,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { usePlatformStore } from '@/store/platform-store';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description?: string;
  referenceType?: string;
  paymentMethod?: string;
  status: string;
  createdAt: string;
}

interface WalletData {
  id: string;
  balance: number;
  isFrozen: boolean;
  transactions: Transaction[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTaka(paisa: number): string {
  const bdt = Math.abs(paisa) / 100;
  return `৳${bdt.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const METHOD_COLORS: Record<string, string> = {
  bkash: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  nagad: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  rocket: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  wallet: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  cash: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

const METHOD_LABELS: Record<string, string> = {
  bkash: 'bKash',
  nagad: 'Nagad',
  rocket: 'Rocket',
  wallet: 'Wallet',
  cash: 'Cash',
};

// ---------------------------------------------------------------------------
// Transfer form schema
// ---------------------------------------------------------------------------

const transferSchema = z.object({
  toPhone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^01[3-9]\d{8}$/, 'Enter a valid BD number (01XXXXXXXXX)'),
  amount: z
    .number({ message: 'Enter a valid amount' })
    .positive('Amount must be greater than 0')
    .max(50000, 'Maximum transfer is ৳50,000'),
  note: z.string().max(200).optional(),
});

type TransferFormValues = z.infer<typeof transferSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WalletSection() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit' | 'transfer'>('all');

  const setWalletBalance = usePlatformStore((s) => s.setWalletBalance);

  // -- Fetch wallet ----------------------------------------------------------

  const fetchWallet = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/wallet');
      if (!res.ok) throw new Error('Failed to fetch');
      const data: WalletData = await res.json();
      setWallet(data);
      setWalletBalance(data.balance);
    } catch {
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  }, [setWalletBalance]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  // -- Transfer form ---------------------------------------------------------

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: { toPhone: '', amount: undefined, note: '' },
  });

  const onTransfer = async (values: TransferFormValues) => {
    setTransferring(true);
    try {
      const res = await fetch('/api/wallet/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toPhone: values.toPhone,
          amount: Math.round(values.amount * 100), // BDT → paisa
          note: values.note || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Transfer failed');
        return;
      }

      toast.success(data.message || 'Transfer successful!');
      setTransferOpen(false);
      form.reset();
      fetchWallet();
    } catch {
      toast.error('Transfer failed. Please try again.');
    } finally {
      setTransferring(false);
    }
  };

  // -- Filtered transactions -------------------------------------------------

  const filteredTransactions = useMemo(() => {
    if (!wallet) return [];
    if (filter === 'all') return wallet.transactions;
    if (filter === 'transfer') return wallet.transactions.filter((t) => t.referenceType === 'transfer');
    return wallet.transactions.filter((t) => t.type === filter);
  }, [wallet, filter]);

  // -- Render helpers --------------------------------------------------------

  const TxIcon = ({ type }: { type: string }) => {
    if (type === 'credit') return <ArrowDownLeft className="size-5 text-emerald-500" />;
    if (type === 'debit') return <ArrowUpRight className="size-5 text-red-500" />;
    return <ArrowLeftRight className="size-5 text-blue-500" />;
  };

  const FILTER_TABS = [
    { key: 'all' as const, label: 'All' },
    { key: 'credit' as const, label: 'Credits' },
    { key: 'debit' as const, label: 'Debits' },
    { key: 'transfer' as const, label: 'Transfers' },
  ];

  // -- Skeleton --------------------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Wallet Header Card ──────────────────────────────────────────── */}
      <Card className="overflow-hidden rounded-xl border-0 shadow-lg">
        <div className="gradient-primary p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-white/70">Available Balance</p>
              <h2 className="text-4xl font-bold tracking-tight">
                {wallet ? formatTaka(wallet.balance) : '৳0.00'}
              </h2>
              <p className="mt-1 text-sm text-white/80">Rahim Uddin</p>
              <p className="font-mono text-xs text-white/60">
                Wallet ID: {wallet?.id ? `${wallet.id.slice(0, 8)}...${wallet.id.slice(-4)}` : 'N/A'}
              </p>
            </div>
            <WalletIcon className="size-10 text-white/30" />
          </div>
          <div className="mt-6 flex gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  className="bg-white/20 text-white hover:bg-white/30 border-0"
                >
                  <Plus className="mr-2 size-4" />
                  Add Money
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Money</DialogTitle>
                  <DialogDescription>
                    Top up your Nityodin wallet via mobile banking.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-6">
                  <p className="text-muted-foreground text-sm">Coming soon</p>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-white/40 text-white bg-transparent hover:bg-white/10 hover:text-white"
                >
                  <Send className="mr-2 size-4" />
                  Transfer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Money</DialogTitle>
                  <DialogDescription>
                    Transfer funds to another Nityodin wallet.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onTransfer)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="toPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recipient Phone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="01XXXXXXXXX (+880)"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (BDT)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="500"
                              min={1}
                              max={50000}
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === '' ? undefined : Number(e.target.value)
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="note"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Note (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="What&apos;s this for?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="rounded-lg bg-muted p-3 text-sm">
                      <span className="text-muted-foreground">Available balance: </span>
                      <span className="font-semibold">
                        {wallet ? formatTaka(wallet.balance) : '৳0.00'}
                      </span>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={transferring}>
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button type="submit" disabled={transferring}>
                        {transferring && <Loader2 className="mr-2 size-4 animate-spin" />}
                        Send Money
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Card>

      {/* ── Quick Actions ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: Send, label: 'Send Money', action: () => setTransferOpen(true) },
          { icon: Plus, label: 'Add Money', action: () => toast.info('Coming soon') },
          { icon: Receipt, label: 'Pay Bill', action: () => toast.info('Coming soon') },
          { icon: QrCode, label: 'Scan QR', action: () => toast.info('Coming soon') },
        ].map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={action}
            className="flex flex-col items-center gap-2 rounded-xl border bg-card p-3 text-foreground transition-colors hover:bg-accent active:scale-95"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Transaction History ─────────────────────────────────────────── */}
      <Card className="rounded-xl">
        <CardContent className="p-4">
          <h3 className="mb-4 text-lg font-semibold">Transaction History</h3>

          {/* Filter tabs */}
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Transaction list */}
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <WalletIcon className="mb-3 size-10 opacity-40" />
              <p className="text-sm">No transactions found</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-1">
                {filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      <TxIcon type={tx.type} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{tx.description || 'Transaction'}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        {tx.paymentMethod && (
                          <span
                            className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                              METHOD_COLORS[tx.paymentMethod] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                            }`}
                          >
                            {METHOD_LABELS[tx.paymentMethod] || tx.paymentMethod}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeDate(tx.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p
                        className={`text-sm font-semibold ${
                          tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {tx.amount > 0 ? '+' : '-'}
                        {formatTaka(tx.amount)}
                      </p>
                      <Badge
                        variant="outline"
                        className={`mt-0.5 text-[10px] ${
                          tx.status === 'completed'
                            ? 'border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400'
                            : 'border-amber-300 text-amber-600 dark:border-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}