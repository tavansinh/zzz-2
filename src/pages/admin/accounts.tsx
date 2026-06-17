import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type FC,
  type SubmitEvent,
} from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  UploadSimpleIcon,
} from '@phosphor-icons/react';
import { Button, Input, Field, Spinner, Dialog, Select } from '@/components/ui';
import {
  AdminError,
  AdminPageHeader,
  AdminTable,
  ConfirmDeleteDialog,
} from '@/components/shared/admin-page';
import useAccountsAdmin from '@/hooks/useAccountsAdmin';
import usePackagesAdmin from '@/hooks/usePackagesAdmin';
import useServicesAdmin from '@/hooks/useServicesAdmin';
import { useNameById } from '@/hooks/useNameById';
import { useAuth } from '@/stores/auth';
import { useToast } from '@/stores/toast';
import { reportError } from '@/lib/report-error';
import { accountStatusLabel } from '@/lib/labels';
import type { Tables } from '@/lib/database.types';
import type { AccountStatus } from '@/types/orders';

interface AccountFormData {
  service_id: string;
  package_id: string;
  email: string;
  password: string;
  status: AccountStatus;
}

const emptyForm: AccountFormData = {
  service_id: '',
  package_id: '',
  email: '',
  password: '',
  status: 'available',
};

const ACCOUNT_HEADERS = ['Email', 'Dịch vụ', 'Gói', 'Trạng thái', 'Thao tác'];

const AccountFormFields: FC<{
  values: AccountFormData;
  onChange: (v: AccountFormData) => void;
  serviceOptions: { value: string; label: string }[];
  packageOptions: { value: string; label: string }[];
}> = ({ values, onChange, serviceOptions, packageOptions }) => {
  const update = useCallback(
    <K extends keyof AccountFormData>(key: K, value: AccountFormData[K]) => {
      onChange({ ...values, [key]: value });
    },
    [onChange, values],
  );

  return (
    <div className="space-y-4">
      <Select
        label="Dịch vụ"
        value={values.service_id}
        onChange={(v) => update('service_id', v)}
        options={serviceOptions}
        placeholder="Chọn dịch vụ…"
      />
      <Select
        label="Gói"
        value={values.package_id}
        onChange={(v) => update('package_id', v)}
        options={packageOptions}
        placeholder="Chọn gói…"
      />
      <Field.Root>
        <Field.Label>Email tài khoản</Field.Label>
        <Input
          type="email"
          value={values.email}
          onValueChange={(v) => update('email', v)}
          placeholder="Tài khoản"
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>Mật khẩu</Field.Label>
        <Input
          value={values.password}
          onValueChange={(v) => update('password', v)}
          placeholder="Mật khẩu"
        />
      </Field.Root>
      <Select
        label="Trạng thái"
        value={values.status}
        onChange={(v) => update('status', v as AccountStatus)}
        options={[
          { value: 'available', label: accountStatusLabel.available },
          { value: 'used', label: accountStatusLabel.used },
        ]}
      />
    </div>
  );
};

const ImportDialog: FC<{
  open: boolean;
  onClose: () => void;
  serviceOptions: { value: string; label: string }[];
  packages: Tables<'packages'>[];
  onImport: (
    serviceId: string,
    packageId: string,
    content: string,
  ) => Promise<{
    total: number;
    imported: number;
    skipped: number;
    errors: Array<{ line: number; reason: string }>;
  }>;
}> = ({ open, onClose, serviceOptions, packages, onImport }) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title="Import tài khoản từ TXT"
      description="Mỗi dòng theo định dạng email|password"
    >
      {open && (
        <ImportForm
          key={serviceOptions[0]?.value ?? 'empty'}
          serviceOptions={serviceOptions}
          packages={packages}
          onImport={onImport}
          onClose={onClose}
        />
      )}
    </Dialog>
  );
};

const ImportForm: FC<{
  serviceOptions: { value: string; label: string }[];
  packages: Tables<'packages'>[];
  onImport: (
    serviceId: string,
    packageId: string,
    content: string,
  ) => Promise<{
    total: number;
    imported: number;
    skipped: number;
    errors: Array<{ line: number; reason: string }>;
  }>;
  onClose: () => void;
}> = ({ serviceOptions, packages, onImport, onClose }) => {
  const toast = useToast();
  const [serviceId, setServiceId] = useState(serviceOptions[0]?.value ?? '');
  const [packageId, setPackageId] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredPackageOptions = useMemo(() => {
    if (!serviceId) return packages;
    return packages.filter((p) => p.service_id === serviceId);
  }, [packages, serviceId]);

  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      setContent(text);
      toast.success('Đã tải file', `${file.name}`);
    } catch {
      toast.error('Không đọc được file');
    }
  };

  const handleSubmit = async () => {
    if (!serviceId || !packageId || !content.trim() || submitting) return;
    setSubmitting(true);
    try {
      const result = await onImport(serviceId, packageId, content);
      toast.success(
        `Import ${result.imported}/${result.total} tài khoản`,
        result.skipped > 0
          ? `Bỏ qua ${result.skipped} dòng lỗi`
          : 'Tất cả tài khoản đã được thêm',
      );
      onClose();
    } catch (err) {
      reportError(toast, err, 'Không thể import');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Select
        label="Dịch vụ"
        value={serviceId}
        onChange={(v) => {
          setServiceId(v);
          setPackageId('');
        }}
        options={serviceOptions}
        placeholder="Chọn dịch vụ…"
      />
      <Select
        label="Gói"
        value={packageId}
        onChange={setPackageId}
        options={filteredPackageOptions.map((p) => ({
          value: p.id,
          label: p.name,
        }))}
        placeholder="Chọn gói…"
        disabled={!serviceId}
      />

      <Field.Root>
        <Field.Label>Hoặc tải file .txt</Field.Label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,text/plain"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
          className="border-border bg-surface-1 text-ink-muted w-full rounded-md border p-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
        />
      </Field.Root>

      <Field.Root>
        <Field.Label>Nội dung (mỗi dòng: email|password)</Field.Label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          placeholder={'abc@gmail.com|123456\nxyz@gmail.com|abcdef'}
          className="border-border bg-surface-1 min-h-32 w-full resize-y rounded-md border px-3 py-2.5 font-mono text-xs text-ink placeholder:text-ink-muted/60 outline-none focus:border-primary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
        />
      </Field.Root>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={submitting}
        >
          Hủy
        </Button>
        <Button
          type="button"
          disabled={submitting || !serviceId || !packageId || !content.trim()}
          onClick={handleSubmit}
        >
          {submitting ? <Spinner /> : <UploadSimpleIcon size={16} />}
          Import
        </Button>
      </div>
    </div>
  );
};

const AdminAccounts: FC = () => {
  const {
    accounts,
    loading,
    error,
    addAccount,
    editAccount,
    removeAccount,
    importText,
    availableCountByPackage,
  } = useAccountsAdmin();
  const { packages } = usePackagesAdmin();
  const { services } = useServicesAdmin();
  const { adminRole } = useAuth();
  const canEdit = adminRole === 'admin';
  const toast = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AccountFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [packageFilter, setPackageFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stockByPkg, setStockByPkg] = useState<Record<string, number>>({});

  useEffect(() => {
    availableCountByPackage()
      .then(setStockByPkg)
      .catch(() => setStockByPkg({}));
  }, [accounts, availableCountByPackage]);

  const serviceOptions = useMemo(
    () => services.map((s) => ({ value: s.id, label: s.name })),
    [services],
  );

  const packageOptions = useMemo(() => {
    const filtered =
      serviceFilter === 'all'
        ? packages
        : packages.filter((p) => p.service_id === serviceFilter);
    return filtered.map((p) => ({ value: p.id, label: p.name }));
  }, [packages, serviceFilter]);

  const serviceNameById = useNameById(services);

  const packageNameById = useMemo(() => {
    const map = new Map<string, string>();
    packages.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [packages]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      if (serviceFilter !== 'all') {
        const pkg = packages.find((p) => p.id === acc.package_id);
        if (pkg?.service_id !== serviceFilter) return false;
      }
      if (packageFilter !== 'all' && acc.package_id !== packageFilter)
        return false;
      if (statusFilter !== 'all' && acc.status !== statusFilter) return false;
      return true;
    });
  }, [accounts, packageFilter, packages, serviceFilter, statusFilter]);

  const totals = useMemo(() => {
    let available = 0;
    let used = 0;
    accounts.forEach((a) => {
      if (a.status === 'available') available += 1;
      if (a.status === 'used') used += 1;
    });
    return { available, used, total: accounts.length };
  }, [accounts]);

  const openAdd = useCallback(() => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      service_id: services[0]?.id ?? '',
      package_id: packages[0]?.id ?? '',
    });
    setDialogOpen(true);
  }, [packages, services]);

  const openEdit = useCallback((acc: Tables<'accounts'>) => {
    setEditingId(acc.id);
    setForm({
      service_id: acc.service_id ?? '',
      package_id: acc.package_id ?? '',
      email: acc.email,
      password: acc.password,
      status: acc.status as AccountStatus,
    });
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }, []);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (
      submitting ||
      !form.email ||
      !form.password ||
      !form.service_id ||
      !form.package_id
    )
      return;
    setSubmitting(true);
    try {
      if (editingId) {
        await editAccount(editingId, {
          service_id: form.service_id,
          package_id: form.package_id,
          email: form.email,
          password: form.password,
          status: form.status,
        });
        toast.success('Đã cập nhật', 'Tài khoản đã được lưu');
      } else {
        await addAccount({
          service_id: form.service_id,
          package_id: form.package_id,
          email: form.email,
          password: form.password,
          status: form.status,
        });
        toast.success('Đã thêm tài khoản', 'Tài khoản đã được thêm vào kho');
      }
      closeDialog();
    } catch (err) {
      reportError(toast, err, 'Không thể lưu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await removeAccount(deleteId);
      toast.success('Đã xóa tài khoản');
    } catch (err) {
      reportError(toast, err, 'Không thể xóa');
    } finally {
      setDeleteId(null);
    }
  };

  const handleImport = async (
    serviceId: string,
    packageId: string,
    content: string,
  ) => {
    return importText(serviceId, packageId, content);
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
        title="Kho tài khoản"
        description="Quản lý tài khoản trong kho dùng để giao tự động cho khách"
        wrap
        action={
          <div className="flex flex-wrap items-center gap-2">
            {canEdit && (
              <Button
                variant="outline"
                size="md"
                onClick={() => setImportOpen(true)}
              >
                <UploadSimpleIcon size={16} />
                Import TXT
              </Button>
            )}
            {canEdit && (
              <Button onClick={openAdd}>
                <PlusIcon size={18} weight="bold" />
                Thêm tài khoản
              </Button>
            )}
          </div>
        }
      />

      <AdminError error={error} />

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <div className="border-border/50 bg-surface-1 rounded-lg border p-4">
          <p className="text-ink-muted text-xs">Tổng tài khoản</p>
          <p className="text-ink mt-1 text-2xl font-bold tabular-nums">
            {totals.total}
          </p>
        </div>
        <div className="border-border/50 bg-surface-1 rounded-lg border p-4">
          <p className="text-ink-muted text-xs">Khả dụng</p>
          <p className="text-success mt-1 text-2xl font-bold tabular-nums">
            {totals.available}
          </p>
        </div>
        <div className="border-border/50 bg-surface-1 rounded-lg border p-4">
          <p className="text-ink-muted text-xs">Đã dùng</p>
          <p className="text-ink-muted mt-1 text-2xl font-bold tabular-nums">
            {totals.used}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="w-48">
          <Select
            value={serviceFilter}
            onChange={setServiceFilter}
            options={[
              { value: 'all', label: 'Tất cả dịch vụ' },
              ...serviceOptions,
            ]}
          />
        </div>
        <div className="w-48">
          <Select
            value={packageFilter}
            onChange={setPackageFilter}
            options={[{ value: 'all', label: 'Tất cả gói' }, ...packageOptions]}
          />
        </div>
        <div className="w-40">
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'Tất cả trạng thái' },
              { value: 'available', label: accountStatusLabel.available },
              { value: 'used', label: accountStatusLabel.used },
            ]}
          />
        </div>
      </div>

      <AdminTable
        headers={ACCOUNT_HEADERS}
        empty={filteredAccounts.length === 0}
        emptyText="Kho tài khoản đang trống"
      >
        {filteredAccounts.map((acc) => (
          <tr
            key={acc.id}
            className="text-ink hover:bg-white/3 transition-colors duration-150"
          >
            <td className="px-4 py-3 font-mono text-xs tabular-nums">
              {acc.email}
            </td>
            <td className="px-4 py-3 text-sm text-ink-muted">
              {acc.service_id
                ? (serviceNameById.get(acc.service_id) ?? '—')
                : '—'}
            </td>
            <td className="px-4 py-3">
              {acc.package_id
                ? (packageNameById.get(acc.package_id) ?? '—')
                : '—'}
            </td>
            <td className="px-4 py-3">
              <span
                className={`inline-flex min-h-7 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  acc.status === 'used'
                    ? 'bg-ink-muted/10 text-ink-muted'
                    : 'bg-success/10 text-success'
                }`}
              >
                {acc.status === 'used' ? (
                  <>
                    <XCircleIcon size={12} /> {accountStatusLabel.used}
                  </>
                ) : (
                  <>
                    <CheckCircleIcon size={12} /> {accountStatusLabel.available}
                  </>
                )}
              </span>
            </td>
            <td className="px-4 py-3">
              {canEdit ? (
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(acc)}
                  >
                    <PencilIcon size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteId(acc.id)}
                  >
                    <TrashIcon size={16} />
                  </Button>
                </div>
              ) : (
                <span className="text-ink-muted text-xs">Chỉ xem</span>
              )}
            </td>
          </tr>
        ))}
      </AdminTable>

      <p className="text-ink-muted mt-3 text-xs text-pretty">
        Tổng khả dụng:{' '}
        {Object.entries(stockByPkg)
          .map(([pid, count]) => `${packageNameById.get(pid) ?? '—'}: ${count}`)
          .join(' · ')}
      </p>

      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => !o && closeDialog()}
        title={editingId ? 'Sửa tài khoản' : 'Thêm tài khoản'}
        description="Tài khoản dùng để giao cho đơn hàng có gói tự động"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <AccountFormFields
            values={form}
            onChange={setForm}
            serviceOptions={serviceOptions}
            packageOptions={packageOptions}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={closeDialog}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={submitting}>
              {(() => {
                if (submitting) return <Spinner />;
                return editingId ? 'Lưu thay đổi' : 'Thêm';
              })()}
            </Button>
          </div>
        </form>
      </Dialog>

      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        serviceOptions={serviceOptions}
        packages={packages}
        onImport={handleImport}
      />

      <ConfirmDeleteDialog
        open={!!deleteId}
        title="Xóa tài khoản"
        description="Hành động này không thể hoàn tác."
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default AdminAccounts;
