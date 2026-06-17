import { AdminError, AdminPageHeader } from '@/components/shared/admin-page';
import {
  BankSelect,
  Button,
  Field,
  Input,
  Select,
  Spinner,
} from '@/components/ui';
import useSettings from '@/hooks/useSettings';
import type { Tables } from '@/lib/database.types';
import { reportError } from '@/lib/report-error';
import { useToast } from '@/stores/toast';
import type { SettingsPayload } from '@/types/settings';
import { ArrowsClockwiseIcon, FloppyDiskIcon } from '@phosphor-icons/react';
import { useMemo, useState, type FC, type SubmitEvent } from 'react';

const TEMPLATE_OPTIONS = [
  { value: 'compact2', label: 'compact2' },
  { value: 'compact', label: 'compact' },
  { value: 'qr_only', label: 'qr_only' },
];

const DEFAULT_SETTINGS: Tables<'settings'> = {
  id: true,
  bank_id: '',
  account_no: '',
  account_name: '',
  template: 'compact2',
};

const SettingsForm: FC<{
  initial: Tables<'settings'>;
  onSubmit: (payload: SettingsPayload) => Promise<void>;
}> = ({ initial, onSubmit }) => {
  const toast = useToast();
  const [bankId, setBankId] = useState(initial.bank_id);
  const [accountNo, setAccountNo] = useState(initial.account_no);
  const [accountName, setAccountName] = useState(initial.account_name);
  const [template, setTemplate] = useState(initial.template);
  const [saving, setSaving] = useState(false);

  const previewUrl = useMemo(() => {
    if (!bankId.trim() || !accountNo.trim() || !accountName.trim()) return null;
    return `https://img.vietqr.io/image/${bankId.trim()}-${accountNo.trim()}-${template}.png?amount=100000&addInfo=${encodeURIComponent('PREVIEW')}&accountName=${encodeURIComponent(accountName.trim())}`;
  }, [bankId, accountNo, accountName, template]);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!bankId.trim() || !accountNo.trim() || !accountName.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin ngân hàng');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        bank_id: bankId.trim(),
        account_no: accountNo.trim(),
        account_name: accountName.trim().toUpperCase(),
        template,
      });
      toast.success('Đã lưu cài đặt', 'Thông tin thanh toán đã được cập nhật');
    } catch (err) {
      reportError(toast, err, 'Không thể lưu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form
        onSubmit={handleSubmit}
        className="border-border/50 bg-surface-1 space-y-5 rounded-lg border p-6 shadow-card"
      >
        <BankSelect
          label="Ngân hàng"
          value={bankId}
          onChange={setBankId}
          required
        />

        <Field.Root>
          <Field.Label>Số tài khoản</Field.Label>
          <Input
            value={accountNo}
            onValueChange={setAccountNo}
            placeholder="VD: 1234567890"
            inputMode="numeric"
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Chủ tài khoản (VIETNAMESE, không dấu)</Field.Label>
          <Input
            value={accountName}
            onValueChange={setAccountName}
            placeholder="VD: NGUYEN VAN A"
          />
        </Field.Root>

        <Select
          label="Mẫu QR (VietQR)"
          value={template}
          onChange={setTemplate}
          options={TEMPLATE_OPTIONS}
        />

        <div className="flex items-center justify-end gap-2 border-t border-border/50 pt-4">
          <Button type="submit" disabled={saving}>
            {saving ? <Spinner /> : <FloppyDiskIcon size={16} />}
            Lưu cài đặt
          </Button>
        </div>
      </form>

      <div className="border-border/50 bg-surface-1 rounded-lg border p-6 shadow-card">
        <h2 className="text-ink mb-4 text-base font-semibold text-balance">
          Xem trước QR
        </h2>
        {previewUrl ? (
          <div className="flex flex-col items-center gap-4">
            <div className="border-border/50 bg-canvas rounded-md border p-3">
              <img
                src={previewUrl}
                alt="QR thanh toán"
                width={224}
                height={224}
                className="img-outline h-56 w-56"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="w-full space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-ink-muted">Ngân hàng</span>
                <span className="text-ink font-medium text-pretty">
                  {bankId}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-ink-muted">Số tài khoản</span>
                <span className="text-ink font-medium tabular-nums">
                  {accountNo}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-ink-muted">Chủ tài khoản</span>
                <span className="text-ink font-medium text-pretty">
                  {accountName}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-ink-muted">Mẫu QR</span>
                <span className="text-ink font-medium">{template}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-ink-muted text-sm text-pretty">
            Nhập đầy đủ thông tin ngân hàng để xem trước QR.
          </p>
        )}
      </div>
    </div>
  );
};

const AdminSettings: FC = () => {
  const { settings, loading, error, save, refresh } = useSettings();
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = async (payload: SettingsPayload) => {
    await save(payload);
    setFormKey((k) => k + 1);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Cài đặt"
        description="Thông tin ngân hàng hiển thị trên QR chuyển khoản cho khách"
        action={
          <Button variant="outline" size="md" onClick={refresh}>
            <ArrowsClockwiseIcon size={16} />
            Làm mới
          </Button>
        }
      />

      <AdminError error={error} />

      {!settings && (
        <p className="text-ink-muted mb-4 rounded-lg border border-border/50 bg-surface-1 p-4 text-sm text-pretty">
          Chưa có thông tin thanh toán
        </p>
      )}

      <SettingsForm
        key={formKey}
        initial={settings ?? DEFAULT_SETTINGS}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default AdminSettings;
