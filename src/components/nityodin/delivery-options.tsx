'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  MapPin,
  Phone,
  Truck,
  Store,
  Plus,
  Pencil,
  Trash2,
  Star,
  Check,
  Loader2,
  Clock,
  BadgeCheck,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DeliveryAddress {
  id: string;
  userId: string;
  label: string;
  address: string;
  area?: string | null;
  city: string;
  district: string;
  division: string;
  phone?: string | null;
  isDefault: boolean;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
  updatedAt: string;
}

interface DeliveryOptionsProps {
  onSelectAddress?: (address: DeliveryAddress) => void;
  onSelectDeliveryType?: (type: 'home_delivery' | 'pickup') => void;
  selectedAddressId?: string;
  selectedDeliveryType?: string;
  mode?: 'manage' | 'checkout';
}

interface AddressFormData {
  label: string;
  address: string;
  area: string;
  city: string;
  district: string;
  division: string;
  phone: string;
  isDefault: boolean;
}

const emptyForm: AddressFormData = {
  label: 'home',
  address: '',
  area: '',
  city: '',
  district: '',
  division: 'Dhaka',
  phone: '',
  isDefault: false,
};

const DIVISIONS = [
  'Dhaka',
  'Chittagong',
  'Rajshahi',
  'Khulna',
  'Barisal',
  'Sylhet',
  'Rangpur',
  'Mymensingh',
];

const LABEL_STYLES: Record<string, { bg: string; text: string }> = {
  home: {
    bg: 'bg-emerald-100 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  work: {
    bg: 'bg-cyan-100 dark:bg-cyan-950/40',
    text: 'text-cyan-700 dark:text-cyan-400',
  },
  other: {
    bg: 'bg-amber-100 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-400',
  },
};

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: 'easeOut' as const },
  }),
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DeliveryOptions({
  onSelectAddress,
  onSelectDeliveryType,
  selectedAddressId,
  selectedDeliveryType,
  mode = 'manage',
}: DeliveryOptionsProps) {
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AddressFormData>(emptyForm);

  // -- Fetch addresses -------------------------------------------------------

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/delivery-addresses');
      const data = await res.json();
      if (res.ok && data.data) {
        setAddresses(data.data);
      } else {
        toast.error(data.error || 'Failed to load addresses');
      }
    } catch {
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // -- Form helpers ----------------------------------------------------------

  function updateForm(field: keyof AddressFormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function openAddDialog() {
    setEditingAddress(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(addr: DeliveryAddress) {
    setEditingAddress(addr);
    setForm({
      label: addr.label,
      address: addr.address,
      area: addr.area || '',
      city: addr.city,
      district: addr.district,
      division: addr.division,
      phone: addr.phone || '',
      isDefault: addr.isDefault,
    });
    setDialogOpen(true);
  }

  // -- Save address (create or update) ---------------------------------------

  async function handleSave() {
    if (!form.address.trim() || !form.city.trim() || !form.district.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const url = editingAddress
        ? `/api/delivery-addresses?id=${editingAddress.id}`
        : '/api/delivery-addresses';
      const method = editingAddress ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          editingAddress ? 'Address updated successfully' : 'Address added successfully',
        );
        setDialogOpen(false);
        fetchAddresses();
      } else {
        toast.error(data.error || 'Failed to save address');
      }
    } catch {
      toast.error('Failed to save address');
    } finally {
      setSaving(false);
    }
  }

  // -- Delete address --------------------------------------------------------

  function confirmDelete(id: string) {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  }

  async function handleDelete() {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/delivery-addresses?id=${deletingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Address deleted successfully');
        setDeleteDialogOpen(false);
        setDeletingId(null);
        fetchAddresses();
      } else {
        toast.error(data.error || 'Failed to delete address');
      }
    } catch {
      toast.error('Failed to delete address');
    }
  }

  // -- Set default address ---------------------------------------------------

  async function handleSetDefault(id: string) {
    try {
      const res = await fetch(`/api/delivery-addresses/default?id=${id}`, {
        method: 'PUT',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Default address updated');
        fetchAddresses();
      } else {
        toast.error(data.error || 'Failed to set default');
      }
    } catch {
      toast.error('Failed to set default address');
    }
  }

  // -- Render: Loading skeletons ---------------------------------------------

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-32" />
        </div>
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-36 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Saved Addresses ────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <MapPin className="size-4 text-emerald-600 dark:text-emerald-400" />
            {mode === 'checkout' ? 'Select Delivery Address' : 'Saved Addresses'}
            <Badge variant="secondary" className="font-normal text-xs">
              {addresses.length}
            </Badge>
          </h3>
          {mode === 'manage' && (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs"
              onClick={openAddDialog}
            >
              <Plus className="size-3.5 mr-1" />
              Add Address
            </Button>
          )}
        </div>

        {addresses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 py-12 text-center"
          >
            <div className="rounded-full bg-emerald-50 dark:bg-emerald-950/30 p-4">
              <MapPin className="size-8 text-emerald-300 dark:text-emerald-700" />
            </div>
            <p className="text-sm text-muted-foreground">
              No saved addresses yet
            </p>
            {mode === 'manage' && (
              <Button
                size="sm"
                variant="outline"
                className="text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-950/30"
                onClick={openAddDialog}
              >
                <Plus className="size-3.5 mr-1" />
                Add Your First Address
              </Button>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {addresses.map((addr, i) => {
              const isSelected = addr.id === selectedAddressId;
              const labelStyle = LABEL_STYLES[addr.label] || LABEL_STYLES.other;

              return (
                <motion.div
                  key={addr.id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                >
                  <Card
                    className={`cursor-pointer rounded-xl border transition-all hover:shadow-md ${
                      isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 dark:ring-emerald-500/10'
                        : 'border-border hover:border-emerald-200/60 dark:hover:border-emerald-800/50'
                    }`}
                    onClick={() => onSelectAddress?.(addr)}
                  >
                    <CardContent className="p-4 space-y-3">
                      {/* Top row: label + default badge + actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={`${labelStyle.bg} ${labelStyle.text} border-0 text-[11px] font-medium capitalize`}
                          >
                            {addr.label}
                          </Badge>
                          {addr.isDefault && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-medium border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400"
                            >
                              <BadgeCheck className="size-3 mr-0.5" />
                              Default
                            </Badge>
                          )}
                        </div>

                        {mode === 'manage' && (
                          <div className="flex items-center gap-1">
                            {!addr.isDefault && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-[11px] text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 px-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetDefault(addr.id);
                                }}
                              >
                                <Star className="size-3 mr-0.5" />
                                Default
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[11px] text-muted-foreground hover:bg-accent px-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditDialog(addr);
                              }}
                            >
                              <Pencil className="size-3 mr-0.5" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[11px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive px-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDelete(addr.id);
                              }}
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        )}

                        {mode === 'checkout' && isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex size-6 items-center justify-center rounded-full bg-emerald-600 text-white"
                          >
                            <Check className="size-3.5" />
                          </motion.div>
                        )}
                      </div>

                      {/* Address */}
                      <p className="text-sm leading-relaxed text-foreground">
                        {addr.address}
                      </p>

                      {/* City / District / Division */}
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="size-3.5 shrink-0" />
                        <p className="text-xs">
                          {[
                            addr.area,
                            addr.city,
                            addr.district,
                            addr.division,
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </div>

                      {/* Phone */}
                      {addr.phone && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="size-3.5 shrink-0" />
                          <p className="text-xs">{addr.phone}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* ── Delivery Type Selection (checkout mode) ────────────────────── */}
      {mode === 'checkout' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <Truck className="size-4 text-emerald-600 dark:text-emerald-400" />
            Delivery Method
          </h3>

          <RadioGroup
            value={selectedDeliveryType || 'home_delivery'}
            onValueChange={(val) =>
              onSelectDeliveryType?.(val as 'home_delivery' | 'pickup')
            }
            className="grid gap-3 sm:grid-cols-2"
          >
            {/* Home Delivery */}
            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }}>
              <label
                htmlFor="delivery-home"
                className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                  (selectedDeliveryType || 'home_delivery') === 'home_delivery'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 dark:ring-emerald-500/10'
                    : 'border-border hover:border-emerald-200/60 dark:hover:border-emerald-800/50 bg-card'
                }`}
              >
                <RadioGroupItem value="home_delivery" id="delivery-home" className="mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Truck className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-medium text-sm">Home Delivery</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      ৳60
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Free for orders over ৳1,000
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="size-3" />
                      2-3 business days
                    </div>
                  </div>
                </div>
              </label>
            </motion.div>

            {/* Store Pickup */}
            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }}>
              <label
                htmlFor="delivery-pickup"
                className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                  selectedDeliveryType === 'pickup'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 dark:ring-emerald-500/10'
                    : 'border-border hover:border-emerald-200/60 dark:hover:border-emerald-800/50 bg-card'
                }`}
              >
                <RadioGroupItem value="pickup" id="delivery-pickup" className="mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Store className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-medium text-sm">Store Pickup</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      Free
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Pick up from a nearby store
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="size-3" />
                      Ready in 1 hour
                    </div>
                  </div>
                </div>
              </label>
            </motion.div>
          </RadioGroup>

          {/* Nearby stores preview for pickup */}
          {selectedDeliveryType === 'pickup' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800">
                <CardContent className="p-4 space-y-2">
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    Nearby Pickup Locations
                  </p>
                  <div className="space-y-2">
                    {[
                      { name: 'Nityodin Hub — Dhanmondi', dist: '1.2 km' },
                      { name: 'Nityodin Hub — Mirpur', dist: '3.8 km' },
                      { name: 'Nityodin Hub — Gulshan', dist: '5.1 km' },
                    ].map((store) => (
                      <div
                        key={store.name}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-foreground">{store.name}</span>
                        <span className="text-muted-foreground">{store.dist}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ── Add/Edit Address Dialog ─────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
                <MapPin className="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
            <DialogDescription>
              {editingAddress
                ? 'Update your delivery address details'
                : 'Add a new delivery address to your account'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Label */}
            <div className="grid gap-2">
              <Label htmlFor="addr-label" className="text-xs font-medium">
                Label
              </Label>
              <Select
                value={form.label}
                onValueChange={(val) => updateForm('label', val)}
              >
                <SelectTrigger id="addr-label" className="h-9">
                  <SelectValue placeholder="Select label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Address */}
            <div className="grid gap-2">
              <Label htmlFor="addr-address" className="text-xs font-medium">
                Address <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="addr-address"
                value={form.address}
                onChange={(e) => updateForm('address', e.target.value)}
                placeholder="House no, Road, Block, Area..."
                rows={3}
                className="text-sm resize-none"
              />
            </div>

            {/* Area */}
            <div className="grid gap-2">
              <Label htmlFor="addr-area" className="text-xs font-medium">
                Area
              </Label>
              <Input
                id="addr-area"
                value={form.area}
                onChange={(e) => updateForm('area', e.target.value)}
                placeholder="e.g. Dhanmondi 27"
                className="h-9 text-sm"
              />
            </div>

            {/* City */}
            <div className="grid gap-2">
              <Label htmlFor="addr-city" className="text-xs font-medium">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="addr-city"
                value={form.city}
                onChange={(e) => updateForm('city', e.target.value)}
                placeholder="e.g. Dhaka"
                className="h-9 text-sm"
              />
            </div>

            {/* District */}
            <div className="grid gap-2">
              <Label htmlFor="addr-district" className="text-xs font-medium">
                District <span className="text-destructive">*</span>
              </Label>
              <Input
                id="addr-district"
                value={form.district}
                onChange={(e) => updateForm('district', e.target.value)}
                placeholder="e.g. Dhaka"
                className="h-9 text-sm"
              />
            </div>

            {/* Division */}
            <div className="grid gap-2">
              <Label htmlFor="addr-division" className="text-xs font-medium">
                Division
              </Label>
              <Select
                value={form.division}
                onValueChange={(val) => updateForm('division', val)}
              >
                <SelectTrigger id="addr-division" className="h-9">
                  <SelectValue placeholder="Select division" />
                </SelectTrigger>
                <SelectContent>
                  {DIVISIONS.map((div) => (
                    <SelectItem key={div} value={div}>
                      {div}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Phone */}
            <div className="grid gap-2">
              <Label htmlFor="addr-phone" className="text-xs font-medium">
                Phone
              </Label>
              <Input
                id="addr-phone"
                value={form.phone}
                onChange={(e) => updateForm('phone', e.target.value)}
                placeholder="01XXXXXXXXX"
                className="h-9 text-sm"
              />
            </div>

            {/* Set as Default */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-xs font-medium">Set as Default</Label>
                <p className="text-[11px] text-muted-foreground">
                  This will be your primary delivery address
                </p>
              </div>
              <Switch
                checked={form.isDefault}
                onCheckedChange={(val) => updateForm('isDefault', val)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              className="text-sm"
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="size-4 mr-1.5 animate-spin" />
              ) : null}
              {editingAddress ? 'Update Address' : 'Add Address'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ──────────────────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}