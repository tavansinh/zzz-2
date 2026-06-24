import { useState, useCallback } from 'react';
import type { FC } from 'react';
import { Button, Spinner, Field } from '@/components/ui';
import { OTPFieldPreview as OTPField } from '@base-ui/react/otp-field';

const OTP_LENGTH = 8;

const otpInputClass =
  'm-0 h-11 w-8 md:h-12 md:w-10 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] text-center text-base md:text-[20px] font-medium text-ink caret-primary outline-none transition-[border-color,background-color] duration-200 hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.08)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white data-invalid:border-error data-invalid:bg-error/10 data-invalid:text-error data-invalid:caret-error data-valid:border-success data-valid:bg-success/10 data-valid:text-success data-valid:caret-success data-disabled:cursor-default [font-variant-numeric:tabular-nums] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

const OtpFieldInput = ({
  fieldInvalid,
  isValid,
  shakeKey,
  statusMsg,
  onValueComplete,
  onValueChange,
}: Readonly<{
  fieldInvalid: boolean;
  isValid: boolean;
  shakeKey: number;
  statusMsg: string;
  onValueComplete: (value: string) => void;
  onValueChange: (value: string) => void;
}>) => {
  return (
    <Field.Root invalid={fieldInvalid} disabled={isValid} className="mb-6">
      <div key={shakeKey} className={fieldInvalid ? 'animate-shake' : ''}>
        <OTPField.Root
          length={OTP_LENGTH}
          onValueComplete={onValueComplete}
          onValueChange={onValueChange}
          className="flex justify-around gap-0.5 md:gap-1.5"
          validationType="numeric"
        >
          {Array.from({ length: OTP_LENGTH }, (_, i) => (
            <OTPField.Input
              key={i}
              className={otpInputClass}
              aria-label={`Ký tự ${i + 1}`}
            />
          ))}
        </OTPField.Root>
      </div>

      {fieldInvalid && (
        <p
          className="text-error mt-2 text-center text-xs text-pretty"
          role="status"
          aria-live="polite"
        >
          {statusMsg}
        </p>
      )}
    </Field.Root>
  );
};

const useOtpForm = (
  email: string,
  verifyOtp: (
    email: string,
    token: string,
  ) => Promise<{ error: string | null }>,
  sendOtp: (email: string) => Promise<{ error: string | null }>,
  onSuccess?: () => void,
) => {
  const [otpValue, setOtpValue] = useState('');
  const [fieldInvalid, setFieldInvalid] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const isComplete = otpValue.length === OTP_LENGTH;

  const doValidate = useCallback(
    async (code: string) => {
      if (code.length !== OTP_LENGTH || isLoading) return;
      setIsLoading(true);

      const { error: err } = await verifyOtp(email, code);
      if (err) {
        setFieldInvalid(true);
        setIsValid(false);
        setStatusMsg('Mã xác thực không đúng, vui lòng thử lại');
        setIsLoading(false);
        setShakeKey((k) => k + 1);
        return;
      }
      setFieldInvalid(false);
      setIsValid(true);
      setStatusMsg('Xác thực thành công');
      setIsLoading(false);
      onSuccess?.();
    },
    [isLoading, verifyOtp, email, onSuccess],
  );

  const handleValueComplete = useCallback(
    (value: string) => {
      if (isValid || fieldInvalid) return;
      doValidate(value);
    },
    [doValidate, isValid, fieldInvalid],
  );

  const handleValueChange = useCallback(
    (value: string) => {
      setOtpValue(value);
      if (fieldInvalid) {
        setFieldInvalid(false);
        setStatusMsg('');
      }
    },
    [fieldInvalid],
  );

  const handleManualSubmit = () => {
    if (isComplete) doValidate(otpValue);
  };

  const handleResend = () => {
    setOtpValue('');
    setFieldInvalid(false);
    setIsValid(false);
    setStatusMsg('');
    setIsLoading(false);
    sendOtp(email);
  };

  return {
    otpValue,
    fieldInvalid,
    statusMsg,
    isLoading,
    isValid,
    isComplete,
    shakeKey,
    handleValueComplete,
    handleValueChange,
    handleManualSubmit,
    handleResend,
  };
};

interface OtpFormProps {
  email: string;
  onBack: () => void;
  verifyOtp: (
    email: string,
    token: string,
  ) => Promise<{ error: string | null }>;
  sendOtp: (email: string) => Promise<{ error: string | null }>;
  onSuccess?: () => void;
}

const OtpForm: FC<OtpFormProps> = ({
  email,
  onBack,
  verifyOtp,
  sendOtp,
  onSuccess,
}) => {
  const ctx = useOtpForm(email, verifyOtp, sendOtp, onSuccess);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
        ← Quay lại
      </Button>

      <h2 className="text-ink mb-2 text-xl font-semibold tracking-tight text-balance">
        Nhập mã OTP
      </h2>
      <p className="text-ink-muted mb-6 text-sm leading-relaxed text-pretty">
        Mã {OTP_LENGTH} chữ số đã gửi đến{' '}
        <span className="text-ink font-medium">{email}</span>
      </p>

      <OtpFieldInput
        fieldInvalid={ctx.fieldInvalid}
        isValid={ctx.isValid}
        shakeKey={ctx.shakeKey}
        statusMsg={ctx.statusMsg}
        onValueComplete={ctx.handleValueComplete}
        onValueChange={ctx.handleValueChange}
      />

      {ctx.isLoading ? (
        <Button disabled className="mb-6 w-full" size="lg">
          <Spinner /> Đang xác thực…
        </Button>
      ) : (
        <Button
          disabled={!ctx.isComplete || ctx.isValid}
          onClick={ctx.handleManualSubmit}
          className="mb-6 w-full"
          size="lg"
        >
          Xác nhận
        </Button>
      )}

      <p className="text-ink-muted text-center text-xs">
        Chưa nhận được mã?{' '}
        <Button
          variant="ghost"
          size="sm"
          onClick={ctx.handleResend}
          disabled={ctx.isLoading || ctx.isValid}
          className="inline text-xs font-medium"
        >
          Gửi lại
        </Button>
      </p>
    </>
  );
};

export default OtpForm;
