import { useCallback, useState } from 'react';
import type { FC, KeyboardEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/stores/auth';
import { routes } from '@/lib/routes';
import ClientLayout from '@/components/layout/client-layout';
import { Button, Field, Input, Spinner } from '@/components/ui';
import BrandSidebar from '@/pages/brand-sidebar';
import OtpForm from '@/pages/otp-form';
import loginBg from '@/assets/images/login-bg.png';
import { EnvelopeIcon, PaperPlaneRightIcon } from '@phosphor-icons/react';

type Step = 'email' | 'otp';

interface LocationState {
  from?: string;
}

const EmailForm = ({
  email,
  onChange,
  isLoading,
  onSendOtp,
}: Readonly<{
  email: string;
  onChange: (v: string) => void;
  isLoading: boolean;
  onSendOtp: () => void;
}>) => {
  return (
    <>
      <h2 className="text-ink mb-2 text-xl font-semibold tracking-tight text-balance">
        Đăng nhập quản trị
      </h2>
      <p className="text-ink-muted mb-8 text-sm leading-relaxed text-pretty">
        Chỉ admin hoặc sub admin đã được cấp quyền mới có thể đăng nhập.
      </p>

      <Field.Root className="mb-5">
        <Field.Label>Email</Field.Label>
        <div className="relative">
          <EnvelopeIcon
            size={18}
            className="text-ink-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
          />
          <Input
            id="email"
            type="email"
            name="admin_email"
            value={email}
            onValueChange={onChange}
            placeholder="nhập email của bạn"
            autoComplete="email"
            spellCheck={false}
            className="pl-10"
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
              e.key === 'Enter' && onSendOtp()
            }
          />
        </div>
      </Field.Root>

      <Button
        disabled={isLoading || !email.trim()}
        onClick={onSendOtp}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <Spinner />
        ) : (
          <PaperPlaneRightIcon size={18} weight="bold" />
        )}
        {isLoading ? 'Đang gửi…' : 'Gửi mã quản trị'}
      </Button>
    </>
  );
};

const AdminLogin: FC<{ redirectTo?: string }> = ({ redirectTo }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? null;
  const redirectAfterLogin = redirectTo ?? state?.from ?? null;

  const {
    isLoading: isAuthLoading,
    accountType,
    sendOtp,
    verifyOtp,
    refreshAccount,
    logout,
  } = useAuth();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    if (!email.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);

    const { error: err } = await sendOtp(email.trim());
    if (err) {
      setError(err);
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    setStep('otp');
  };

  const handleBack = () => {
    setStep('email');
    setError(null);
  };

  const handleOtpSuccess = useCallback(async () => {
    const resolved = await refreshAccount();
    if (resolved.accountType === 'admin') {
      const dest =
        redirectAfterLogin && redirectAfterLogin !== routes.adminLogin
          ? redirectAfterLogin
          : routes.admin;
      navigate(dest, { replace: true });
    } else {
      await logout();
      setError('Email này không có quyền quản trị.');
    }
  }, [redirectAfterLogin, navigate, refreshAccount, logout]);

  if (!isAuthLoading && accountType === 'admin') {
    return <Navigate to={routes.admin} replace />;
  }

  if (isAuthLoading) {
    return (
      <ClientLayout>
        <div className="flex grow items-center justify-center">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <section className="relative flex grow items-center justify-center overflow-hidden">
        <img
          src={loginBg}
          alt=""
          width={1920}
          height={1080}
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover img-outline"
        />
        <div className="pointer-events-none absolute inset-0 bg-black/50" />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-canvas via-canvas/40 to-transparent" />

        <div className="relative z-10 mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-2">
          <BrandSidebar />

          <div className="border-border/50 bg-canvas/60 rounded-lg border p-5 shadow-[0_4px_16px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-xl md:p-10">
            <div className="mb-8 md:hidden">
              <h1 className="text-ink mb-1 text-2xl font-bold tracking-tight text-balance">
                4K PREMIUM
              </h1>
            </div>

            {step === 'email' ? (
              <>
                <EmailForm
                  email={email}
                  onChange={setEmail}
                  isLoading={isLoading}
                  onSendOtp={handleSendOtp}
                />

                <p className="text-ink-muted mt-4 text-center text-xs text-pretty">
                  Mã đăng nhập sẽ được gửi tới email quản trị đã cấp quyền.
                </p>
              </>
            ) : (
              <OtpForm
                email={email}
                verifyOtp={verifyOtp}
                sendOtp={sendOtp}
                onBack={handleBack}
                onSuccess={handleOtpSuccess}
              />
            )}

            {error && (
              <p
                className="text-error mt-4 text-center text-xs text-pretty"
                role="status"
                aria-live="polite"
              >
                {error}
              </p>
            )}
          </div>
        </div>
      </section>
    </ClientLayout>
  );
};

export default AdminLogin;
