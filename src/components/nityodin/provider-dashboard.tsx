'use client';

import { useEffect, useState } from 'react';
import {
  Wrench,
  Star,
  Clock,
  Eye,
  CheckCircle2,
  IndianRupee,
  Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ServiceRequest {
  id: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  status: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
  address: string | null;
  notes: string | null;
  quotedPrice: number | null;
  finalPrice: number | null;
  createdAt: string;
  service: {
    id: string;
    name: string;
    category: string;
    imageUrl: string | null;
  };
}

interface Service {
  id: string;
  name: string;
  nameBn: string | null;
  category: string;
  priceType: string;
  basePrice: number | null;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTaka(amount: number): string {
  return `৳${(amount / 100).toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function statusClass(status: string): string {
  const map: Record<string, string> = {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    preparing: 'status-preparing',
    delivered: 'status-delivered',
    completed: 'status-completed',
    cancelled: 'status-cancelled',
    accepted: 'status-accepted',
    in_progress: 'status-in_progress',
    scheduled: 'status-scheduled',
  };
  return map[status] ?? 'status-pending';
}

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f${i}`} className="h-3 w-3 fill-amber-400 text-amber-400" />
      ))}
      {half === 1 && (
        <Star key="half" className="h-3 w-3 fill-amber-400/50 text-amber-400" />
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e${i}`} className="h-3 w-3 text-muted-foreground/30" />
      ))}
      <span className="ml-1">{rating.toFixed(1)}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProviderDashboard({ activeTab = 'Overview' }: { activeTab?: string }) {
  const [isAvailable, setIsAvailable] = useState(true);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [requestsRes, servicesRes] = await Promise.all([
          fetch('/api/service-requests'),
          fetch('/api/services'),
        ]);

        if (requestsRes.ok) {
          const data = await requestsRes.json();
          setRequests(Array.isArray(data) ? data : []);
        }
        if (servicesRes.ok) {
          const data = await servicesRes.json();
          setServices(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to fetch provider data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const inProgressRequests = requests.filter(
    (r) => r.status === 'accepted' || r.status === 'in_progress',
  );
  const completedRequests = requests.filter(
    (r) => r.status === 'completed' || r.status === 'delivered',
  );

  const activeJobs = inProgressRequests.length;
  const totalEarnings = completedRequests.reduce(
    (sum, r) => sum + (r.finalPrice ?? r.quotedPrice ?? 0),
    0,
  );
  const avgRating =
    services.length > 0
      ? services.reduce((sum, s) => sum + s.rating, 0) / services.length
      : 0;

  const handleToggleAvailability = (checked: boolean) => {
    setIsAvailable(checked);
    toast.success(checked ? 'You are now available for jobs' : 'You are now offline');
  };

  const handleAccept = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'accepted' } : r)),
    );
    toast.success('Service request accepted!');
  };

  const handleComplete = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'completed' } : r)),
    );
    toast.success('Service marked as completed!');
  };

  // -------------------------------------------------------------------------
  // Skeletons
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Title + Availability Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Wrench className="h-7 w-7 text-amber-600" />
          <h2 className="text-2xl font-bold tracking-tight">
            Service Provider Dashboard
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {isAvailable && (
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>
          )}
          <label
            htmlFor="availability-switch"
            className="text-sm font-medium text-muted-foreground cursor-pointer"
          >
            Available for Jobs
          </label>
          <Switch
            id="availability-switch"
            checked={isAvailable}
            onCheckedChange={handleToggleAvailability}
          />
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <IndianRupee className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-xl font-bold">{formatTaka(totalEarnings)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Jobs</p>
              <p className="text-xl font-bold">{activeJobs}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rating</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xl font-bold">{avgRating.toFixed(1)}</span>
                {renderStars(avgRating)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Requests (Tabbed) */}
      <Card className={cn(
        activeTab === 'Jobs' && 'ring-2 ring-primary/20',
      )}>
        <CardHeader>
          <CardTitle className="text-lg">Service Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="mb-4">
              <TabsTrigger value="pending" className="text-xs sm:text-sm">
                Pending ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="in_progress" className="text-xs sm:text-sm">
                In Progress ({inProgressRequests.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs sm:text-sm">
                Completed ({completedRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {pendingRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No pending requests.
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <RequestCard
                      key={req.id}
                      request={req}
                      onAccept={() => handleAccept(req.id)}
                      onComplete={() => {}}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="in_progress">
              {inProgressRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No jobs in progress.
                </p>
              ) : (
                <div className="space-y-3">
                  {inProgressRequests.map((req) => (
                    <RequestCard
                      key={req.id}
                      request={req}
                      onAccept={() => {}}
                      onComplete={() => handleComplete(req.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {completedRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No completed jobs yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {completedRequests.map((req) => (
                    <RequestCard
                      key={req.id}
                      request={req}
                      onAccept={() => {}}
                      onComplete={() => {}}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* My Services */}
      <Card className={cn(
        activeTab === 'My Services' && 'ring-2 ring-primary/20',
      )}>
        <CardHeader>
          <CardTitle className="text-lg">My Services</CardTitle>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No services listed yet.
            </p>
          ) : (
            <div className="space-y-3">
              {services.map((svc) => (
                <div
                  key={svc.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{svc.name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {svc.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {svc.priceType === 'fixed' ? 'Fixed Price' : 'Variable Price'}
                      </span>
                      {svc.basePrice && (
                        <span className="text-xs font-medium text-emerald-600">
                          from {formatTaka(svc.basePrice)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {renderStars(svc.rating)}
                    <Badge
                      variant="outline"
                      className={
                        svc.isAvailable
                          ? 'border-emerald-300 text-emerald-600'
                          : 'border-red-300 text-red-600'
                      }
                    >
                      {svc.isAvailable ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Request Card sub-component
// ---------------------------------------------------------------------------

function RequestCard({
  request,
  onAccept,
  onComplete,
}: {
  request: ServiceRequest;
  onAccept: () => void;
  onComplete: () => void;
}) {
  const price = request.finalPrice ?? request.quotedPrice;
  const isPending = request.status === 'pending';
  const isInProgress =
    request.status === 'accepted' || request.status === 'in_progress';

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-sm">{request.service.name}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusClass(request.status)}`}
            >
              {request.status.replace('_', ' ')}
            </span>
            {request.scheduledDate && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {request.scheduledDate}
                {request.scheduledTime && ` at ${request.scheduledTime}`}
              </span>
            )}
          </div>
        </div>
        {price != null && (
          <p className="text-sm font-bold text-emerald-600 shrink-0">
            {formatTaka(price)}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isPending && (
          <Button size="sm" className="h-8 text-xs" onClick={onAccept}>
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Accept
          </Button>
        )}
        {isInProgress && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs border-emerald-300 text-emerald-600 hover:bg-emerald-50"
            onClick={onComplete}
          >
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Complete
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-xs"
          onClick={() =>
            toast.info(`Viewing request details — feature coming soon!`)
          }
        >
          <Eye className="mr-1 h-3 w-3" />
          View Details
        </Button>
      </div>
    </div>
  );
}