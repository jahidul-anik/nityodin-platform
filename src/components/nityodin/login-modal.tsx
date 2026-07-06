'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  ShoppingCart,
  Store,
  Wheat,
  Wrench,
  ArrowLeft,
  Loader2,
  Check,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useAuthStore, type LoginStep } from '@/store/auth-store';
import { usePlatformStore, type ActiveRole } from '@/store/platform-store';

// ---------------------------------------------------------------------------
// Role card config
// ---------------------------------------------------------------------------

interface RoleCard {
  id: ActiveRole;
  icon: React.ElementType;
  label: string;
  labelBn: string;
  description: string;
}

const ROLE_CARDS: RoleCard[] = [
  {
    id: 'consumer',
    icon: ShoppingCart,
    label: 'Consumer',
    labelBn: 'খরিদার',
    description: 'Browse and buy products',
  },
  {
    id: 'merchant',
    icon: Store,
    label: 'Merchant',
    labelBn: 'ব্যবসায়ী',
    description: 'Sell products online',
  },
  {
    id: 'farmer',
    icon: Wheat,
    label: 'Farmer',
    labelBn: 'কৃষক',
    description: 'List farm produce',
  },
  {
    id: 'service_provider',
    icon: Wrench,
    label: 'Service Provider',
    labelBn: 'সেবাদাতা',
    description: 'Offer your services',
  },
];

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

// ---------------------------------------------------------------------------
// Phone Step
// ---------------------------------------------------------------------------

function PhoneStep({
  phoneInput,
  setPhoneInput,
  onContinue,
  loading,
  errorMsg,
}: {
  phoneInput: string;
  setPhoneInput: (v: string) => void;
  onContinue: () => void;
  loading: boolean;
  errorMsg: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Format display: add spaces every 4 digits
  const displayValue = phoneInput.replace(/(.{4})/g, '$1 ').trim();

  // Only allow digits
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
      setPhoneInput(raw);
    },
    [setPhoneInput],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && phoneInput.length === 10 && !loading) {
        onContinue();
      }
    },
    [phoneInput.length, loading, onContinue],
  );

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
          <Leaf className="size-8 text-white" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome to Nityodin
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your phone number to continue
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground/80">
            চালু করতে আপনার ফোন নম্বর দিন
          </p>
        </div>
      </div>

      {/* Phone input */}
      <div className="space-y-2">
        <Label htmlFor="phone-input" className="text-sm font-medium">
          Phone Number
        </Label>
        <div className="flex items-center gap-0 rounded-lg border border-input bg-background shadow-xs focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1">
          {/* Bangladesh flag + prefix */}
          <div className="flex items-center gap-1.5 rounded-l-lg bg-muted/60 px-3 py-2.5 border-r border-input">
            <span className="text-lg leading-none" role="img" aria-label="Bangladesh flag">
              🇧🇩
            </span>
            <span className="text-sm font-semibold text-foreground tabular-nums">
              +880
            </span>
          </div>
          <Input
            ref={inputRef}
            id="phone-input"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="1512 345678"
            value={displayValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="border-0 shadow-none focus-visible:ring-0 h-11 text-base tabular-nums rounded-l-none placeholder:text-muted-foreground/50"
            maxLength={13}
          />
        </div>
        {errorMsg && (
          <p className="text-xs text-destructive flex items-center gap-1">
            {errorMsg}
          </p>
        )}
      </div>

      {/* Continue button */}
      <Button
        onClick={onContinue}
        disabled={phoneInput.length !== 10 || loading}
        className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Sending OTP...
          </>
        ) : (
          'Continue'
        )}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// OTP Step
// ---------------------------------------------------------------------------

function OtpStep({
  phone,
  otp,
  setOtp,
  onVerify,
  onBack,
  loading,
  errorMsg,
}: {
  phone: string;
  otp: string;
  setOtp: (v: string) => void;
  onVerify: () => void;
  onBack: () => void;
  loading: boolean;
  errorMsg: string;
}) {
  const [countdown, setCountdown] = useState(30);
  const canResend = countdown <= 0;

  // Countdown timer — runs once, clears when countdown reaches 0
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) return 0;
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown > 0]);

  const handleResend = useCallback(() => {
    setCountdown(30);
    setOtp('');
    // Re-trigger the OTP request
    fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    }).catch(() => {});
  }, [phone, setOtp]);

  // Auto-verify when 6 digits entered
  useEffect(() => {
    if (otp.length === 6 && !loading) {
      const timer = setTimeout(() => onVerify(), 300);
      return () => clearTimeout(timer);
    }
  }, [otp.length, loading, onVerify]);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Verify your number
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code sent to
        </p>
        <p className="text-sm font-semibold text-foreground tabular-nums">
          {phone}
        </p>
      </div>

      {/* OTP Input */}
      <div className="flex justify-center py-2">
        <InputOTP
          value={otp}
          onChange={setOtp}
          maxLength={6}
          autoFocus
          containerClassName="gap-3"
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} className="size-12 text-lg" />
            <InputOTPSlot index={1} className="size-12 text-lg" />
            <InputOTPSlot index={2} className="size-12 text-lg" />
          </InputOTPGroup>
          <InputOTPGroup>
            <InputOTPSlot index={3} className="size-12 text-lg" />
            <InputOTPSlot index={4} className="size-12 text-lg" />
            <InputOTPSlot index={5} className="size-12 text-lg" />
          </InputOTPGroup>
        </InputOTP>
      </div>

      {errorMsg && (
        <p className="text-xs text-destructive text-center">{errorMsg}</p>
      )}

      {/* Verify button */}
      <Button
        onClick={onVerify}
        disabled={otp.length !== 6 || loading}
        className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Verifying...
          </>
        ) : (
          'Verify'
        )}
      </Button>

      {/* Resend OTP */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Didn&apos;t receive the code?{' '}
          {canResend ? (
            <button
              onClick={handleResend}
              className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
            >
              Resend OTP
            </button>
          ) : (
            <span className="text-muted-foreground/60">
              Resend in <span className="tabular-nums font-medium">{countdown}s</span>
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Role Step
// ---------------------------------------------------------------------------

function RoleStep({
  availableRoles,
  selectedRole,
  onSelectRole,
  onContinue,
  loading,
}: {
  availableRoles: ActiveRole[];
  selectedRole: ActiveRole | null;
  onSelectRole: (role: ActiveRole) => void;
  onContinue: () => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Choose your role
        </h2>
        <p className="text-sm text-muted-foreground">
          এক পরিচয়, একাধিক ভূমিকা
        </p>
      </div>

      {/* Role cards grid */}
      <div className="grid grid-cols-2 gap-3">
        {ROLE_CARDS.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;
          const isAvailable = availableRoles.includes(role.id);

          return (
            <motion.button
              key={role.id}
              onClick={() => isAvailable && onSelectRole(role.id)}
              disabled={!isAvailable}
              whileHover={isAvailable ? { scale: 1.02 } : undefined}
              whileTap={isAvailable ? { scale: 0.98 } : undefined}
              className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200 ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-md shadow-emerald-500/10'
                  : isAvailable
                    ? 'border-border bg-card hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-accent/50'
                    : 'border-border/50 bg-muted/30 opacity-40 cursor-not-allowed'
              }`}
            >
              {/* Checkmark for selected */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-emerald-500"
                >
                  <Check className="size-3 text-white" />
                </motion.div>
              )}

              <div
                className={`flex size-10 items-center justify-center rounded-lg ${
                  isSelected
                    ? 'bg-emerald-100 dark:bg-emerald-900/50'
                    : 'bg-muted'
                }`}
              >
                <Icon
                  className={`size-5 ${
                    isSelected
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-muted-foreground'
                  }`}
                />
              </div>
              <div>
                <p
                  className={`text-sm font-semibold ${
                    isSelected
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-foreground'
                  }`}
                >
                  {role.label}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {role.labelBn}
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                  {role.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Continue button */}
      <Button
        onClick={onContinue}
        disabled={!selectedRole || loading}
        className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Setting up...
          </>
        ) : (
          'Continue'
        )}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Login Modal
// ---------------------------------------------------------------------------

let modalKeyCounter = 0;

function LoginModalInner() {
  const {
    loginStep,
    pendingPhone,
    isLoggingIn,
    setShowLoginModal,
    setLoginStep,
    setPendingPhone,
    login,
  } = useAuthStore();

  const { setActiveRole, setActiveView, setWalletBalance } = usePlatformStore();

  // Local state (fresh on each mount via key)
  const [phoneInput, setPhoneInput] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [direction, setDirection] = useState(1);
  const [availableRoles, setAvailableRoles] = useState<ActiveRole[]>(['consumer']);
  const [selectedRole, setSelectedRole] = useState<ActiveRole | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [fullPhone, setFullPhone] = useState('');

  // Navigate steps
  const goToStep = useCallback(
    (step: LoginStep, dir: number) => {
      setDirection(dir);
      setLoginStep(step);
      setErrorMsg('');
    },
    [setLoginStep],
  );

  // Step 1: Request OTP
  const handleRequestOtp = useCallback(async () => {
    setErrorMsg('');
    const phone = `+880${phoneInput}`;

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        const msg =
          data.error || 'Failed to send OTP. Please try again.';
        setErrorMsg(msg);
        return;
      }

      const inner = data.data ?? data;
      setIsNewUser(inner.isNewUser === true);
      setFullPhone(phone);
      setPendingPhone(phone);
      goToStep('otp', 1);
    } catch {
      setErrorMsg('Network error. Please check your connection.');
    }
  }, [phoneInput, goToStep, setPendingPhone]);

  // Step 2: Verify OTP
  const handleVerifyOtp = useCallback(async () => {
    if (!pendingPhone) return;
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: pendingPhone, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Verification failed.');
        return;
      }

      const inner = data.data ?? data;
      const userRoles: ActiveRole[] = (inner.roles ?? [])
        .map((r: { role: string }) => r.role)
        .filter((r: string) =>
          ['consumer', 'merchant', 'farmer', 'service_provider'].includes(r),
        ) as ActiveRole[];

      setAvailableRoles(userRoles.length > 0 ? userRoles : ['consumer']);

      // If user has exactly 1 role and is not new, skip role step
      if (userRoles.length === 1 && !isNewUser) {
        login({
          id: inner.user.id,
          name: inner.user.name,
          phone: inner.user.phone,
          email: inner.user.email,
          avatarUrl: inner.user.avatarUrl,
          city: inner.user.city,
          roles: userRoles,
        });

        if (inner.wallet) {
          setWalletBalance(inner.wallet.balance);
        }
        setActiveRole(userRoles[0]);
        setActiveView('landing');
      } else {
        goToStep('role', 1);
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
    }
  }, [pendingPhone, otp, isNewUser, login, setWalletBalance, setActiveRole, setActiveView, goToStep]);

  // Step 3: Complete login with selected role
  const handleCompleteLogin = useCallback(async () => {
    if (!pendingPhone || !selectedRole) return;
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: pendingPhone, otp: '000000' }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Login failed.');
        return;
      }

      const inner = data.data ?? data;
      const userRoles: ActiveRole[] = (inner.roles ?? [])
        .map((r: { role: string }) => r.role)
        .filter((r: string) =>
          ['consumer', 'merchant', 'farmer', 'service_provider'].includes(r),
        ) as ActiveRole[];

      login({
        id: inner.user.id,
        name: inner.user.name,
        phone: inner.user.phone,
        email: inner.user.email,
        avatarUrl: inner.user.avatarUrl,
        city: inner.user.city,
        roles: userRoles,
      });

      if (inner.wallet) {
        setWalletBalance(inner.wallet.balance);
      }
      setActiveRole(selectedRole);
      setActiveView('landing');
    } catch {
      setErrorMsg('Network error. Please try again.');
    }
  }, [pendingPhone, selectedRole, login, setWalletBalance, setActiveRole, setActiveView]);

  return (
    <DialogContent
      showCloseButton={false}
      className="top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] max-w-[calc(100%-1rem)] sm:max-w-md p-0 overflow-hidden rounded-2xl bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl max-h-[90vh]"
    >
      <div className="px-6 pt-6 pb-6 sm:px-8 sm:pt-8 sm:pb-8 overflow-y-auto max-h-[85vh]">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {loginStep === 'phone'
              ? 'Login to Nityodin'
              : loginStep === 'otp'
                ? 'Verify OTP'
                : 'Select Role'}
          </DialogTitle>
          <DialogDescription>
            {loginStep === 'phone'
              ? 'Enter your phone number'
              : loginStep === 'otp'
                ? 'Enter your OTP code'
                : 'Choose your primary role'}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={loginStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {loginStep === 'phone' && (
              <PhoneStep
                phoneInput={phoneInput}
                setPhoneInput={setPhoneInput}
                onContinue={handleRequestOtp}
                loading={isLoggingIn}
                errorMsg={errorMsg}
              />
            )}

            {loginStep === 'otp' && (
              <OtpStep
                phone={fullPhone}
                otp={otp}
                setOtp={setOtp}
                onVerify={handleVerifyOtp}
                onBack={() => goToStep('phone', -1)}
                loading={isLoggingIn}
                errorMsg={errorMsg}
              />
            )}

            {loginStep === 'role' && (
              <RoleStep
                availableRoles={availableRoles}
                selectedRole={selectedRole}
                onSelectRole={setSelectedRole}
                onContinue={handleCompleteLogin}
                loading={isLoggingIn}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom branding bar */}
      <div className="border-t border-border/50 bg-muted/30 px-6 py-3 flex items-center justify-center gap-2">
        <Leaf className="size-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs text-muted-foreground">
          Secured by Nityodin
        </span>
      </div>
    </DialogContent>
  );
}

export function LoginModal() {
  const { showLoginModal, setShowLoginModal } = useAuthStore();
  const [key, setKey] = useState(0);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        modalKeyCounter += 1;
        setKey(modalKeyCounter);
      }
      setShowLoginModal(open);
    },
    [setShowLoginModal],
  );

  return (
    <Dialog open={showLoginModal} onOpenChange={handleOpenChange}>
      {showLoginModal && <LoginModalInner key={key} />}
    </Dialog>
  );
}

export default LoginModal;