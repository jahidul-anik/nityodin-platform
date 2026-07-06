'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  MapPin,
  Phone,
  Star,
  Clock,
  Store,
  Building2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
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

interface OperatingHour {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface BusinessLocation {
  id: string;
  ownerId: string;
  businessName: string;
  category: string;
  subcategories?: string | null;
  address: string;
  area?: string | null;
  city: string;
  district: string;
  division: string;
  latitude?: number | null;
  longitude?: number | null;
  rating: number;
  isOpen: boolean;
  phone?: string | null;
  createdAt: string;
  operatingHours?: OperatingHour[];
}

interface LocationFormData {
  businessName: string;
  category: string;
  subcategories: string;
  address: string;
  area: string;
  city: string;
  district: string;
  division: string;
  latitude: string;
  longitude: string;
  phone: string;
  isOpen: boolean;
  operatingHours: OperatingHour[];
}

const CATEGORIES = [
  'grocery',
  'electronics',
  'clothing',
  'restaurant',
  'pharmacy',
  'agriculture',
  'medical',
  'other',
];

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

const DAY_NAMES = [
  { key: 0, name: 'Sunday', short: 'Sun' },
  { key: 1, name: 'Monday', short: 'Mon' },
  { key: 2, name: 'Tuesday', short: 'Tue' },
  { key: 3, name: 'Wednesday', short: 'Wed' },
  { key: 4, name: 'Thursday', short: 'Thu' },
  { key: 5, name: 'Friday', short: 'Fri' },
  { key: 6, name: 'Saturday', short: 'Sat' },
];

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  grocery: { bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400' },
  electronics: { bg: 'bg-cyan-100 dark:bg-cyan-950/40', text: 'text-cyan-700 dark:text-cyan-400' },
  clothing: { bg: 'bg-fuchsia-100 dark:bg-fuchsia-950/40', text: 'text-fuchsia-700 dark:text-fuchsia-400' },
  restaurant: { bg: 'bg-orange-100 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-400' },
  pharmacy: { bg: 'bg-red-100 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-400' },
  medical: { bg: 'bg-red-100 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-400' },
  agriculture: { bg: 'bg-lime-100 dark:bg-lime-950/40', text: 'text-lime-700 dark:text-lime-400' },
};

function getCategoryStyle(category: string) {
  return CATEGORY_STYLES[category] ?? { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' };
}

const defaultOperatingHours: OperatingHour[] = DAY_NAMES.map((day) => ({
  dayOfWeek: day.key,
  openTime: '09:00',
  closeTime: '18:00',
  isClosed: day.key === 0, // Sunday closed by default
}));

const emptyForm: LocationFormData = {
  businessName: '',
  category: 'grocery',
  subcategories: '',
  address: '',
  area: '',
  city: '',
  district: '',
  division: 'Dhaka',
  latitude: '',
  longitude: '',
  phone: '',
  isOpen: true,
  operatingHours: [...defaultOperatingHours],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatOperatingHours(hours: OperatingHour[]): string {
  if (!hours || hours.length === 0) return 'No hours set';

  const groups: { days: string; open: string; close: string; isClosed: boolean }[] = [];
  let current: { days: string; open: string; close: string; isClosed: boolean } | null = null;

  const sorted = [...hours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  for (const h of sorted) {
    if (h.isClosed) {
      if (current) {
        groups.push(current);
        current = null;
      }
      const dayName = DAY_NAMES.find((d) => d.key === h.dayOfWeek)?.short ?? '';
      groups.push({ days: dayName, open: '', close: '', isClosed: true });
    } else {
      if (
        current &&
        !current.isClosed &&
        current.open === h.openTime &&
        current.close === h.closeTime
      ) {
        const lastDayKey = parseInt(current.days.split('-').pop() || '0');
        if (h.dayOfWeek === lastDayKey + 1) {
          const firstDay = current.days.split('-')[0];
          const endDay = DAY_NAMES.find((d) => d.key === h.dayOfWeek)?.short ?? '';
          current.days = `${firstDay}-${endDay}`;
          continue;
        }
      }
      if (current) groups.push(current);
      const dayName = DAY_NAMES.find((d) => d.key === h.dayOfWeek)?.short ?? '';
      current = {
        days: dayName,
        open: formatTime(h.openTime),
        close: formatTime(h.closeTime),
        isClosed: false,
      };
    }
  }
  if (current) groups.push(current);

  return groups
    .map((g) => {
      if (g.isClosed) return `${g.days}: Closed`;
      return `${g.days}: ${g.open} - ${g.close}`;
    })
    .join(', ');
}

function formatTime(time: string): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

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

export function BusinessLocationManager() {
  const [locations, setLocations] = useState<BusinessLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<BusinessLocation | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<LocationFormData>(emptyForm);

  // -- Fetch locations ------------------------------------------------------

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/business-locations/manage');
      const data = await res.json();
      if (res.ok && data.data) {
        setLocations(data.data);
      } else {
        toast.error(data.error || 'Failed to load locations');
      }
    } catch {
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // -- Form helpers ---------------------------------------------------------

  function updateForm(field: keyof LocationFormData, value: string | boolean | OperatingHour[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateOperatingHour(dayOfWeek: number, field: keyof OperatingHour, value: string | boolean) {
    setForm((prev) => ({
      ...prev,
      operatingHours: prev.operatingHours.map((h) =>
        h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h,
      ),
    }));
  }

  function openAddDialog() {
    setEditingLocation(null);
    setForm({ ...emptyForm, operatingHours: [...defaultOperatingHours] });
    setDialogOpen(true);
  }

  function openEditDialog(loc: BusinessLocation) {
    setEditingLocation(loc);
    setForm({
      businessName: loc.businessName,
      category: loc.category,
      subcategories: loc.subcategories || '',
      address: loc.address,
      area: loc.area || '',
      city: loc.city,
      district: loc.district,
      division: loc.division,
      latitude: loc.latitude?.toString() || '',
      longitude: loc.longitude?.toString() || '',
      phone: loc.phone || '',
      isOpen: loc.isOpen,
      operatingHours: loc.operatingHours?.length
        ? loc.operatingHours.map((h) => ({ ...h }))
        : [...defaultOperatingHours],
    });
    setDialogOpen(true);
  }

  // -- Save location --------------------------------------------------------

  async function handleSave() {
    if (!form.businessName.trim() || !form.address.trim() || !form.city.trim() || !form.district.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        businessName: form.businessName,
        category: form.category,
        subcategories: form.subcategories || undefined,
        address: form.address,
        area: form.area || undefined,
        city: form.city,
        district: form.district,
        division: form.division,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        phone: form.phone || undefined,
        isOpen: form.isOpen,
        operatingHours: form.operatingHours,
      };

      const url = editingLocation
        ? `/api/business-locations/manage?id=${editingLocation.id}`
        : '/api/business-locations/manage';
      const method = editingLocation ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          editingLocation ? 'Location updated successfully' : 'Location added successfully',
        );
        setDialogOpen(false);
        fetchLocations();
      } else {
        toast.error(data.error || 'Failed to save location');
      }
    } catch {
      toast.error('Failed to save location');
    } finally {
      setSaving(false);
    }
  }

  // -- Delete location ------------------------------------------------------

  function confirmDelete(id: string) {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  }

  async function handleDelete() {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/business-locations/manage?id=${deletingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Location deleted successfully');
        setDeleteDialogOpen(false);
        setDeletingId(null);
        fetchLocations();
      } else {
        toast.error(data.error || 'Failed to delete location');
      }
    } catch {
      toast.error('Failed to delete location');
    }
  }

  // -- Render: Loading ------------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
          <div className="h-9 w-36 animate-pulse rounded bg-muted" />
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="h-44 w-full animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
          <Building2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          My Locations
          <Badge variant="secondary" className="font-normal text-xs">
            {locations.length}
          </Badge>
        </h3>
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs"
          onClick={openAddDialog}
        >
          <Plus className="size-3.5 mr-1" />
          Add Location
        </Button>
      </div>

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {locations.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3 py-16 text-center"
        >
          <div className="rounded-full bg-emerald-50 dark:bg-emerald-950/30 p-5">
            <Store className="size-10 text-emerald-300 dark:text-emerald-700" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">No locations yet</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-[260px]">
              Add your first business location to start appearing in search results
            </p>
          </div>
          <Button
            size="sm"
            className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={openAddDialog}
          >
            <Plus className="size-3.5 mr-1" />
            Add First Location
          </Button>
        </motion.div>
      )}

      {/* ── Locations list ──────────────────────────────────────────────── */}
      <AnimatePresence mode="popLayout">
        {locations.map((loc, i) => {
          const style = getCategoryStyle(loc.category);
          return (
            <motion.div
              key={loc.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
            >
              <Card className="rounded-xl border border-border transition-shadow hover:shadow-md hover:border-emerald-200/60 dark:hover:border-emerald-800/50">
                <CardContent className="p-4 space-y-3">
                  {/* Top row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={`${style.bg} ${style.text} border-0 text-[11px] font-medium capitalize`}
                      >
                        {loc.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-medium ${
                          loc.isOpen
                            ? 'border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400'
                            : 'border-red-300 text-red-600 dark:border-red-700 dark:text-red-400'
                        }`}
                      >
                        {loc.isOpen ? 'Open' : 'Closed'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-[11px] text-muted-foreground hover:bg-accent px-2"
                        onClick={() => openEditDialog(loc)}
                      >
                        <Pencil className="size-3 mr-0.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-[11px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive px-2"
                        onClick={() => confirmDelete(loc.id)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Business name */}
                  <h4 className="font-semibold text-sm leading-tight">{loc.businessName}</h4>

                  {/* Address */}
                  <div className="flex items-start gap-1.5 text-muted-foreground">
                    <MapPin className="size-3.5 mt-0.5 shrink-0" />
                    <p className="text-xs leading-relaxed">
                      {loc.address}
                      {loc.area && <span className="text-muted"> · {loc.area}</span>}
                    </p>
                  </div>

                  {/* City / District / Division */}
                  <p className="text-[11px] text-muted-foreground">
                    {loc.city}, {loc.district}, {loc.division}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`size-3.5 ${
                          idx < Math.round(loc.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-muted text-muted'
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-xs font-medium text-muted-foreground">
                      {loc.rating.toFixed(1)}
                    </span>
                  </div>

                  {/* Operating Hours */}
                  {loc.operatingHours && loc.operatingHours.length > 0 && (
                    <div className="flex items-start gap-1.5 text-muted-foreground">
                      <Clock className="size-3.5 mt-0.5 shrink-0" />
                      <p className="text-[11px] leading-relaxed">
                        {formatOperatingHours(loc.operatingHours)}
                      </p>
                    </div>
                  )}

                  {/* Phone */}
                  {loc.phone && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Phone className="size-3.5 shrink-0" />
                      <a
                        href={`tel:${loc.phone}`}
                        className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        {loc.phone}
                      </a>
                    </div>
                  )}

                  {/* Subcategories */}
                  {loc.subcategories && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {loc.subcategories.split(',').map((sub) => (
                        <span
                          key={sub}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                        >
                          {sub.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* ── Add/Edit Dialog ─────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
                <Building2 className="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </DialogTitle>
            <DialogDescription>
              {editingLocation
                ? 'Update your business location details'
                : 'Add a new business location to your account'}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[65vh] pr-2">
            <div className="grid gap-4 py-2">
              {/* Business Name */}
              <div className="grid gap-2">
                <Label htmlFor="loc-name" className="text-xs font-medium">
                  Business Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="loc-name"
                  value={form.businessName}
                  onChange={(e) => updateForm('businessName', e.target.value)}
                  placeholder="e.g. Fresh Mart Dhanmondi"
                  className="h-9 text-sm"
                />
              </div>

              {/* Category */}
              <div className="grid gap-2">
                <Label htmlFor="loc-category" className="text-xs font-medium">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(val) => updateForm('category', val)}
                >
                  <SelectTrigger id="loc-category" className="h-9">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        <span className="capitalize">{cat}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subcategories */}
              <div className="grid gap-2">
                <Label htmlFor="loc-subcategories" className="text-xs font-medium">
                  Subcategories
                </Label>
                <Input
                  id="loc-subcategories"
                  value={form.subcategories}
                  onChange={(e) => updateForm('subcategories', e.target.value)}
                  placeholder="Comma-separated, e.g. fruits, vegetables, dairy"
                  className="h-9 text-sm"
                />
              </div>

              {/* Address */}
              <div className="grid gap-2">
                <Label htmlFor="loc-address" className="text-xs font-medium">
                  Full Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="loc-address"
                  value={form.address}
                  onChange={(e) => updateForm('address', e.target.value)}
                  placeholder="House no, Road, Block..."
                  className="h-9 text-sm"
                />
              </div>

              {/* Area */}
              <div className="grid gap-2">
                <Label htmlFor="loc-area" className="text-xs font-medium">
                  Area
                </Label>
                <Input
                  id="loc-area"
                  value={form.area}
                  onChange={(e) => updateForm('area', e.target.value)}
                  placeholder="e.g. Dhanmondi 27"
                  className="h-9 text-sm"
                />
              </div>

              {/* City + District row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="loc-city" className="text-xs font-medium">
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="loc-city"
                    value={form.city}
                    onChange={(e) => updateForm('city', e.target.value)}
                    placeholder="e.g. Dhaka"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="loc-district" className="text-xs font-medium">
                    District <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="loc-district"
                    value={form.district}
                    onChange={(e) => updateForm('district', e.target.value)}
                    placeholder="e.g. Dhaka"
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              {/* Division */}
              <div className="grid gap-2">
                <Label htmlFor="loc-division" className="text-xs font-medium">
                  Division
                </Label>
                <Select
                  value={form.division}
                  onValueChange={(val) => updateForm('division', val)}
                >
                  <SelectTrigger id="loc-division" className="h-9">
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

              {/* Latitude + Longitude row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="loc-lat" className="text-xs font-medium">
                    Latitude
                  </Label>
                  <Input
                    id="loc-lat"
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={(e) => updateForm('latitude', e.target.value)}
                    placeholder="23.8103"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="loc-lng" className="text-xs font-medium">
                    Longitude
                  </Label>
                  <Input
                    id="loc-lng"
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={(e) => updateForm('longitude', e.target.value)}
                    placeholder="90.4125"
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="grid gap-2">
                <Label htmlFor="loc-phone" className="text-xs font-medium">
                  Phone
                </Label>
                <Input
                  id="loc-phone"
                  value={form.phone}
                  onChange={(e) => updateForm('phone', e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="h-9 text-sm"
                />
              </div>

              {/* Is Open toggle */}
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label className="text-xs font-medium">Currently Open</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Toggle to mark your business as open or closed
                  </p>
                </div>
                <Switch
                  checked={form.isOpen}
                  onCheckedChange={(val) => updateForm('isOpen', val)}
                />
              </div>

              {/* ── Operating Hours sub-form ──────────────────────────────── */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <Label className="text-xs font-semibold">Operating Hours</Label>
                </div>

                <div className="rounded-lg border divide-y divide-border">
                  {form.operatingHours.map((hour) => {
                    const dayInfo = DAY_NAMES.find((d) => d.key === hour.dayOfWeek);
                    if (!dayInfo) return null;

                    return (
                      <div
                        key={hour.dayOfWeek}
                        className="flex items-center gap-3 px-3 py-2.5"
                      >
                        {/* Day name */}
                        <span className="text-xs font-medium w-9 shrink-0 text-foreground">
                          {dayInfo.short}
                        </span>

                        {/* Closed checkbox */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Checkbox
                            id={`closed-${hour.dayOfWeek}`}
                            checked={hour.isClosed}
                            onCheckedChange={(val) =>
                              updateOperatingHour(hour.dayOfWeek, 'isClosed', !!val)
                            }
                          />
                          <label
                            htmlFor={`closed-${hour.dayOfWeek}`}
                            className="text-[11px] text-muted-foreground cursor-pointer select-none"
                          >
                            Closed
                          </label>
                        </div>

                        {/* Time inputs - hidden when closed */}
                        {!hour.isClosed && (
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Input
                              type="time"
                              value={hour.openTime}
                              onChange={(e) =>
                                updateOperatingHour(hour.dayOfWeek, 'openTime', e.target.value)
                              }
                              className="h-8 text-xs w-full max-w-[120px]"
                            />
                            <span className="text-[11px] text-muted-foreground shrink-0">to</span>
                            <Input
                              type="time"
                              value={hour.closeTime}
                              onChange={(e) =>
                                updateOperatingHour(hour.dayOfWeek, 'closeTime', e.target.value)
                              }
                              className="h-8 text-xs w-full max-w-[120px]"
                            />
                          </div>
                        )}

                        {hour.isClosed && (
                          <span className="text-[11px] text-muted-foreground italic flex-1">
                            Closed all day
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </ScrollArea>

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
              {editingLocation ? 'Update Location' : 'Add Location'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ──────────────────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Location</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this business location? This action
              cannot be undone.
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