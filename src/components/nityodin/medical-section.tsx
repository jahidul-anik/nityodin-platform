'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  FileText,
  Building,
  Star,
  Stethoscope,
  Calendar,
  Upload,
  Share2,
  Eye,
  Loader2,
  Clock,
  MapPin,
  Search,
  UserCircle,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePlatformStore } from '@/store/platform-store';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MedicalReport {
  id: string;
  userId: string;
  title: string;
  reportType: string;
  labName?: string;
  reportDate?: string;
  findings?: string;
  doctorName?: string;
  imageUrl?: string;
  isShared: boolean;
  sharedWithId?: string;
  sharedUntil?: string;
  createdAt: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification?: string;
  hospital?: string;
  city?: string;
  rating: number;
  fee?: number;
  imageUrl?: string;
  availableSlots: number;
  createdAt: string;
}

interface DoctorWithAppointment extends Appointment {
  doctor: Doctor;
}

interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  date: string;
  time: string;
  status: string;
  notes?: string;
  createdAt: string;
  doctor?: Doctor;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTaka(paisa: number): string {
  const bdt = Math.abs(paisa) / 100;
  return `৳${bdt.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const REPORT_TYPE_STYLES: Record<string, string> = {
  blood_test: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  xray: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  ultrasound: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  ct_scan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  mri: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  ecg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  general: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const REPORT_TYPE_LABELS: Record<string, string> = {
  blood_test: 'Blood Test',
  xray: 'X-Ray',
  ultrasound: 'Ultrasound',
  ct_scan: 'CT Scan',
  mri: 'MRI',
  ecg: 'ECG',
  general: 'General',
};

const APPOINTMENT_STATUS_STYLES: Record<string, string> = {
  scheduled: 'status-scheduled',
  confirmed: 'status-confirmed',
  completed: 'status-completed',
  cancelled: 'status-cancelled',
};

const Stars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`size-3.5 ${
          i < Math.round(rating)
            ? 'fill-amber-400 text-amber-400'
            : 'fill-muted text-muted'
        }`}
      />
    ))}
    <span className="ml-1 text-xs text-muted-foreground">({rating.toFixed(1)})</span>
  </div>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MedicalSection() {
  const { medicalTab, setMedicalTab } = usePlatformStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Stethoscope className="size-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Medical Hub</h2>
          <p className="text-sm text-muted-foreground">
            Reports, doctors & appointments
          </p>
        </div>
      </div>

      <Tabs
        value={medicalTab}
        onValueChange={(v) => setMedicalTab(v as 'reports' | 'doctors' | 'appointments')}
      >
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="reports">My Reports</TabsTrigger>
          <TabsTrigger value="doctors">Find Doctors</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <ReportsTab />
        </TabsContent>
        <TabsContent value="doctors">
          <DoctorsTab />
        </TabsContent>
        <TabsContent value="appointments">
          <AppointmentsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 1: My Reports
// ---------------------------------------------------------------------------

function ReportsTab() {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/medical-reports');
      if (!res.ok) throw new Error('Failed');
      const data: MedicalReport[] = await res.json();
      setReports(data);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  if (loading) {
    return (
      <div className="mt-4 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="mt-4">
        <Card className="rounded-xl">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="mb-4 size-12 text-muted-foreground/40" />
            <p className="text-lg font-medium text-muted-foreground">
              No medical reports yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload your first report.
            </p>
            <Button className="mt-4" onClick={() => toast.info('Coming soon')}>
              <Upload className="mr-2 size-4" />
              Upload Report
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => toast.info('Coming soon')}>
          <Upload className="mr-2 size-4" />
          Upload Report
        </Button>
      </div>

      <ScrollArea className="max-h-[600px]">
        <div className="space-y-3 pr-2">
          {reports.map((report) => (
            <Card key={report.id} className="rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold">{report.title}</h4>
                      {report.isShared && (
                        <Badge
                          variant="outline"
                          className="border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400"
                        >
                          Shared
                        </Badge>
                      )}
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                          REPORT_TYPE_STYLES[report.reportType] || REPORT_TYPE_STYLES.general
                        }`}
                      >
                        {REPORT_TYPE_LABELS[report.reportType] || report.reportType}
                      </span>
                      {report.labName && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Building className="size-3" />
                          {report.labName}
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {report.reportDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(report.reportDate).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                      {report.doctorName && (
                        <span className="flex items-center gap-1">
                          <UserCircle className="size-3" />
                          Dr. {report.doctorName}
                        </span>
                      )}
                    </div>

                    {report.findings && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {report.findings}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => toast.info('Report shared for 7 days')}
                    >
                      <Share2 className="mr-1.5 size-3.5" />
                      Share
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => toast.info('Full report view coming soon')}
                    >
                      <Eye className="mr-1.5 size-3.5" />
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 2: Find Doctors
// ---------------------------------------------------------------------------

function DoctorsTab() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [specialtyFilter, setSpecialtyFilter] = useState('');

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (specialtyFilter) params.set('specialty', specialtyFilter);
      const res = await fetch(`/api/doctors?${params.toString()}`);
      if (!res.ok) throw new Error('Failed');
      const data: Doctor[] = await res.json();
      setDoctors(data);
    } catch {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }, [specialtyFilter]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Collect unique specialties
  const specialties = useMemo(() => {
    const set = new Set(doctors.map((d) => d.specialty));
    return Array.from(set).sort();
  }, [doctors]);

  if (loading) {
    return (
      <div className="mt-4 space-y-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-52 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Specialty filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Filter by specialty..."
          className="pl-10"
          value={specialtyFilter}
          onChange={(e) => setSpecialtyFilter(e.target.value)}
        />
      </div>

      {/* Quick specialty chips */}
      {specialties.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSpecialtyFilter('')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !specialtyFilter
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            All
          </button>
          {specialties.map((s) => (
            <button
              key={s}
              onClick={() => setSpecialtyFilter(s === specialtyFilter ? '' : s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                specialtyFilter === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {doctors.length === 0 ? (
        <Card className="rounded-xl">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Stethoscope className="mb-4 size-12 text-muted-foreground/40" />
            <p className="text-lg font-medium text-muted-foreground">No doctors found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different specialty filter
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {doctors.map((doc) => (
            <Card key={doc.id} className="rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserCircle className="size-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold">Dr. {doc.name}</h4>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {doc.specialty}
                    </Badge>
                    {doc.qualification && (
                      <p className="mt-1 text-xs text-muted-foreground">{doc.qualification}</p>
                    )}
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  {doc.hospital && (
                    <div className="flex items-center gap-1.5">
                      <Building className="size-3.5" />
                      <span>{doc.hospital}</span>
                    </div>
                  )}
                  {doc.city && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-3.5" />
                      <span>{doc.city}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <Stars rating={doc.rating} />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div>
                    {doc.fee != null && (
                      <p className="text-lg font-bold">{formatTaka(doc.fee)}</p>
                    )}
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      {doc.availableSlots} slot{doc.availableSlots !== 1 ? 's' : ''} available
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => toast.info('Appointment booking coming soon')}
                  >
                    Book Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 3: Appointments
// ---------------------------------------------------------------------------

function AppointmentsTab() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/appointments');
      if (!res.ok) throw new Error('Failed');
      const data: DoctorWithAppointment[] = await res.json();
      setAppointments(data);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  if (loading) {
    return (
      <div className="mt-4 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="mt-4">
        <Card className="rounded-xl">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="mb-4 size-12 text-muted-foreground/40" />
            <p className="text-lg font-medium text-muted-foreground">
              No appointments scheduled
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Book an appointment with a doctor.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <ScrollArea className="max-h-[600px]">
        <div className="space-y-3 pr-2">
          {appointments.map((apt) => {
            const doc = 'doctor' in apt && apt.doctor ? apt.doctor : null;
            return (
              <Card key={apt.id} className="rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold">
                          Dr. {doc?.name || 'Unknown'}
                        </h4>
                        {doc?.specialty && (
                          <Badge variant="secondary" className="text-xs">
                            {doc.specialty}
                          </Badge>
                        )}
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {doc?.hospital && (
                          <span className="flex items-center gap-1">
                            <Building className="size-3" />
                            {doc.hospital}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(apt.date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {apt.time}
                        </span>
                      </div>

                      {apt.notes && (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                          {apt.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                          APPOINTMENT_STATUS_STYLES[apt.status] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                    <div className="mt-3 flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => toast.info('Rescheduling coming soon')}
                      >
                        Reschedule
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 text-xs"
                        onClick={() => toast.info('Cancellation coming soon')}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}