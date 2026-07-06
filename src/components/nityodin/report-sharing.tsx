'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Share2,
  QrCode,
  Clock,
  Shield,
  Ban,
  Loader2,
  CalendarDays,
  Building2,
  Eye,
  XCircle,
  AlertCircle,
  Stethoscope,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MedicalReport {
  id: string;
  title: string;
  reportType: string;
  labName: string | null;
  reportDate: string | null;
  findings: string | null;
  doctorName: string | null;
  imageUrl: string | null;
  isShared: boolean;
  sharedWithId: string | null;
  sharedUntil: string | null;
  createdAt: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string | null;
  city: string | null;
}

interface ActiveShare {
  id: string;
  reportId: string;
  reportTitle: string;
  doctorName: string;
  sharedUntil: string;
  createdAt: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  status: string;
  notes: string | null;
  doctor: Doctor;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EXPIRY_OPTIONS = [
  { label: '1 hour', hours: 1 },
  { label: '6 hours', hours: 6 },
  { label: '12 hours', hours: 12 },
  { label: '24 hours', hours: 24 },
  { label: '48 hours', hours: 48 },
  { label: '7 days', hours: 168 },
];

const REPORT_TYPE_ICONS: Record<string, string> = {
  blood: '🩸',
  xray: '🫁',
  urine: '🔬',
  ecg: '❤️',
  mri: '🧠',
  ct: '🫁',
  ultrasound: '🔊',
  general: '📋',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getCountdown(expiryStr: string): string {
  const diff = new Date(expiryStr).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `${days}d ${remHours}h ${mins}m`;
  }
  if (hours > 0) {
    return `${hours}h ${mins}m ${secs}s`;
  }
  return `${mins}m ${secs}s`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReportSharing() {
  const [tab, setTab] = useState('reports');

  // Reports
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  // Doctors
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // Share dialog
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [sharingReport, setSharingReport] = useState<MedicalReport | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedExpiry, setSelectedExpiry] = useState<string>('24');
  const [sharing, setSharing] = useState(false);

  // Active shares
  const [activeShares, setActiveShares] = useState<ActiveShare[]>([]);
  const [loadingShares, setLoadingShares] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  // Countdown timer
  const [tick, setTick] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // QR
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrAppt, setQrAppt] = useState<Appointment | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loadingQr, setLoadingQr] = useState(false);

  // -------------------------------------------------------------------------
  // Fetch reports
  // -------------------------------------------------------------------------
  const fetchReports = useCallback(async () => {
    setLoadingReports(true);
    try {
      const res = await fetch('/api/medical-reports');
      if (res.ok) {
        const data = await res.json();
        setReports(Array.isArray(data) ? data : []);
      }
    } catch {
      toast.error('Failed to fetch reports');
    } finally {
      setLoadingReports(false);
    }
  }, []);

  // -------------------------------------------------------------------------
  // Fetch doctors
  // -------------------------------------------------------------------------
  const fetchDoctors = useCallback(async () => {
    try {
      const res = await fetch('/api/doctors');
      if (res.ok) {
        const data = await res.json();
        setDoctors(Array.isArray(data) ? data : []);
      }
    } catch {
      // silent
    }
  }, []);

  // -------------------------------------------------------------------------
  // Fetch active shares
  // -------------------------------------------------------------------------
  const fetchActiveShares = useCallback(async () => {
    setLoadingShares(true);
    try {
      const res = await fetch('/api/medical-reports/share');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setActiveShares(list);
      }
    } catch {
      // silent
    } finally {
      setLoadingShares(false);
    }
  }, []);

  // -------------------------------------------------------------------------
  // Fetch appointments for QR
  // -------------------------------------------------------------------------
  const fetchAppointments = useCallback(async () => {
    setLoadingAppts(true);
    try {
      const res = await fetch('/api/appointments');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setAppointments(list.filter((a: Appointment) => a.status === 'scheduled'));
      }
    } catch {
      // silent
    } finally {
      setLoadingAppts(false);
    }
  }, []);

  // -------------------------------------------------------------------------
  // Countdown timer effect
  // -------------------------------------------------------------------------
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // -------------------------------------------------------------------------
  // Effects
  // -------------------------------------------------------------------------
  useEffect(() => {
    fetchReports();
    fetchDoctors();
  }, [fetchReports, fetchDoctors]);

  useEffect(() => {
    if (tab === 'shares') {
      fetchActiveShares();
    }
  }, [tab, fetchActiveShares]);

  useEffect(() => {
    if (tab === 'qr') {
      fetchAppointments();
    }
  }, [tab, fetchAppointments]);

  // -------------------------------------------------------------------------
  // Share handler
  // -------------------------------------------------------------------------
  const openShareDialog = (report: MedicalReport) => {
    setSharingReport(report);
    setSelectedDoctor('');
    setSelectedExpiry('24');
    setShareDialogOpen(true);
  };

  const handleShare = async () => {
    if (!sharingReport || !selectedDoctor) {
      toast.error('Please select a doctor');
      return;
    }

    setSharing(true);
    try {
      const res = await fetch('/api/medical-reports/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: sharingReport.id,
          doctorId: selectedDoctor,
          expiryHours: parseInt(selectedExpiry, 10),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? 'Failed to share report');
        return;
      }
      toast.success('Report shared successfully');
      setShareDialogOpen(false);
      fetchReports();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSharing(false);
    }
  };

  // -------------------------------------------------------------------------
  // Revoke handler
  // -------------------------------------------------------------------------
  const handleRevoke = async (shareId: string) => {
    setRevoking(shareId);
    try {
      const res = await fetch('/api/medical-reports/share', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareId }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? 'Failed to revoke access');
        return;
      }
      toast.success('Access revoked');
      fetchActiveShares();
      fetchReports();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setRevoking(null);
    }
  };

  // -------------------------------------------------------------------------
  // QR handler
  // -------------------------------------------------------------------------
  const handleGenerateQr = async (appt: Appointment) => {
    setQrAppt(appt);
    setQrDataUrl('');
    setQrDialogOpen(true);
    setLoadingQr(true);
    try {
      const res = await fetch(`/api/medical-reports/qr?appointmentId=${appt.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.qrDataUrl) {
          setQrDataUrl(data.qrDataUrl);
        } else {
          toast.error('QR code generation failed');
        }
      } else {
        toast.error('Failed to generate QR code');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoadingQr(false);
    }
  };

  // -------------------------------------------------------------------------
  // Skeleton
  // -------------------------------------------------------------------------
  if (loadingReports) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-64 rounded-lg" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
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
        <Shield className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
        <h2 className="text-2xl font-bold tracking-tight">Report Sharing</h2>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="reports">My Reports</TabsTrigger>
          <TabsTrigger value="shares">
            Active Shares
            {activeShares.length > 0 && (
              <Badge className="ml-1.5 bg-emerald-600 text-white text-[10px] px-1.5 h-4">
                {activeShares.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="qr">QR Check-in</TabsTrigger>
        </TabsList>

        {/* ── My Reports Tab ────────────────────────────────────────────── */}
        <TabsContent value="reports" className="mt-4">
          {reports.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <FileText className="h-14 w-14 text-muted-foreground/25 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                No medical reports yet. Reports from your doctor will appear here.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {reports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex items-center justify-center rounded-lg size-11 shrink-0 bg-emerald-100 dark:bg-emerald-900/40 text-lg">
                            {REPORT_TYPE_ICONS[report.reportType.toLowerCase()] ?? '📋'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-semibold truncate">
                                {report.title}
                              </p>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                                {report.reportType}
                              </Badge>
                              {report.isShared && (
                                <Eye className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              {report.labName && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  {report.labName}
                                </span>
                              )}
                              {report.reportDate && (
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="h-3 w-3" />
                                  {formatDate(report.reportDate)}
                                </span>
                              )}
                              {report.doctorName && (
                                <span className="flex items-center gap-1">
                                  <Stethoscope className="h-3 w-3" />
                                  Dr. {report.doctorName}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="shrink-0 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                            onClick={() => openShareDialog(report)}
                          >
                            <Share2 className="mr-1.5 h-3.5 w-3.5" />
                            Share
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        {/* ── Active Shares Tab ─────────────────────────────────────────── */}
        <TabsContent value="shares" className="mt-4">
          {loadingShares ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : activeShares.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <Share2 className="h-14 w-14 text-muted-foreground/25 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                No active shares. Share a report with a doctor to get started.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {activeShares.map((share, index) => {
                  const isExpired = new Date(share.sharedUntil).getTime() <= Date.now();
                  return (
                    <motion.div
                      key={share.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className={cn(
                          isExpired
                            ? 'opacity-60'
                            : 'border-emerald-200 dark:border-emerald-800'
                        )}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center rounded-full size-10 shrink-0 bg-emerald-100 dark:bg-emerald-900/40">
                              <UserRound className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">
                                Dr. {share.doctorName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {share.reportTitle}
                              </p>
                              <div
                                className={cn(
                                  'flex items-center gap-1.5 mt-1.5 text-xs',
                                  isExpired
                                    ? 'text-red-500'
                                    : 'text-amber-600 dark:text-amber-400'
                                )}
                              >
                                <Clock className="h-3 w-3" />
                                {isExpired ? 'Expired' : getCountdown(share.sharedUntil)}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant={isExpired ? 'ghost' : 'outline'}
                              className={cn(
                                'shrink-0',
                                !isExpired && 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30'
                              )}
                              onClick={() => handleRevoke(share.id)}
                              disabled={revoking === share.id}
                            >
                              {revoking === share.id ? (
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Ban className="mr-1.5 h-3.5 w-3.5" />
                              )}
                              Revoke Access
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        {/* ── QR Check-in Tab ───────────────────────────────────────────── */}
        <TabsContent value="qr" className="mt-4">
          {loadingAppts ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <QrCode className="h-14 w-14 text-muted-foreground/25 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                No upcoming appointments. Book an appointment to generate a QR check-in code.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {appointments.map((appt, index) => (
                <motion.div
                  key={appt.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center rounded-lg size-11 shrink-0 bg-teal-100 dark:bg-teal-900/40">
                          <CalendarDays className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">
                            Dr. {appt.doctor.name}
                            <span className="text-muted-foreground font-normal ml-2">
                              ({appt.doctor.specialty})
                            </span>
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-0.5">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {formatDate(appt.date)}
                            </span>
                            <span>{appt.time}</span>
                            {appt.doctor.hospital && (
                              <span>{appt.doctor.hospital}</span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleGenerateQr(appt)}
                        >
                          <QrCode className="mr-1.5 h-3.5 w-3.5" />
                          Generate QR
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Share Dialog ───────────────────────────────────────────────── */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-emerald-600" />
              Share Report
            </DialogTitle>
            <DialogDescription>
              Securely share this report with a doctor. Access will expire after the selected duration.
            </DialogDescription>
          </DialogHeader>

          {sharingReport && (
            <div className="space-y-4 py-2">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium">{sharingReport.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {sharingReport.reportType}
                  {sharingReport.labName && ` · ${sharingReport.labName}`}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Doctor *</label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Dr. {doc.name}</span>
                          <span className="text-muted-foreground text-xs">
                            — {doc.specialty}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Access Duration *</label>
                <Select value={selectedExpiry} onValueChange={setSelectedExpiry}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPIRY_OPTIONS.map((opt) => (
                      <SelectItem key={String(opt.hours)} value={String(opt.hours)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              disabled={sharing || !selectedDoctor}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {sharing ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Share2 className="mr-1.5 h-4 w-4" />
              )}
              Share Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── QR Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-emerald-600" />
              Check-in QR Code
            </DialogTitle>
            <DialogDescription>
              Show this QR code at the reception for check-in.
            </DialogDescription>
          </DialogHeader>

          {qrAppt && (
            <div className="space-y-4 py-2">
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="font-medium">Dr. {qrAppt.doctor.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {qrAppt.doctor.specialty}
                  {qrAppt.doctor.hospital && ` · ${qrAppt.doctor.hospital}`}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(qrAppt.date)} at {qrAppt.time}
                </p>
              </div>

              <div className="flex items-center justify-center">
                {loadingQr ? (
                  <div className="h-48 w-48 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                  </div>
                ) : qrDataUrl ? (
                  <div className="p-4 bg-white rounded-xl shadow-inner">
                    <img
                      src={qrDataUrl}
                      alt="Check-in QR Code"
                      className="h-48 w-48"
                    />
                  </div>
                ) : (
                  <div className="h-48 w-48 flex flex-col items-center justify-center text-center">
                    <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
                    <p className="text-sm text-muted-foreground">Failed to generate QR</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setQrDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}