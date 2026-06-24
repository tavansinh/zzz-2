import {
  AdminError,
  AdminPageHeader,
  AdminTable,
  ConfirmDeleteDialog,
} from '@/components/shared/admin-page';
import {
  Button,
  Dialog,
  Field,
  Input,
  Select,
  Spinner,
  Textarea,
} from '@/components/ui';
import usePackagesAdmin from '@/hooks/usePackagesAdmin';
import useServicesAdmin from '@/hooks/useServicesAdmin';
import { useNameById } from '@/hooks/useNameById';
import type { Tables, TablesInsert } from '@/lib/database.types';
import { formatVnd } from '@/lib/format';
import { reportError } from '@/lib/report-error';
import { useAuth } from '@/stores/auth';
import { useToast } from '@/stores/toast';
import {
  CheckCircleIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import {
  useCallback,
  useMemo,
  useState,
  type FC,
  type SubmitEvent,
} from 'react';

interface PackageFormData {
  service_id: string;
  name: string;
  description: string;
  price: string;
  duration_days: string;
  features: string;
  badge: string;
  sort_order: string;
  is_active: boolean;
}

const emptyForm: PackageFormData = {
  service_id: '',
  name: '',
  description: '',
  price: '',
  duration_days: '',
  features: '',
  badge: '',
  sort_order: '0',
  is_active: true,
};

const PACKAGE_HEADERS = [
  'Dịch vụ',
  'Tên gói',
  'Giá',
  'Thời hạn',
  'Trạng thái',
  'Thao tác',
];

const toFormData = (pkg: Tables<'packages'>): PackageFormData => ({
  service_id: pkg.service_id ?? '',
  name: pkg.name,
  description: pkg.description ?? '',
  price: pkg.price.toString(),
  duration_days: pkg.duration_days.toString(),
  features: pkg.features.join('\n'),
  badge: pkg.badge ?? '',
  sort_order: pkg.sort_order.toString(),
  is_active: pkg.is_active,
});

const PackageFormFields: FC<{
  values: PackageFormData;
  onChange: (values: PackageFormData) => void;
  serviceOptions: { value: string; label: string }[];
  canEdit: boolean;
}> = ({ values, onChange, serviceOptions, canEdit }) => {
  const update = useCallback(
    <K extends keyof PackageFormData>(key: K, value: PackageFormData[K]) => {
      onChange({ ...values, [key]: value });
    },
    [onChange, values],
  );

  return (
    <div className="space-y-4">
      <Select
        label="Loại dịch vụ"
        value={values.service_id}
        onChange={(v) => update('service_id', v)}
        options={serviceOptions}
        placeholder="Chọn loại dịch vụ…"
        disabled={!canEdit}
      />

      <Field.Root>
        <Field.Label>Tên gói</Field.Label>
        <Input
          value={values.name}
          onValueChange={(v) => update('name', v)}
          placeholder="VD: Cơ Bản"
          disabled={!canEdit}
        />
      </Field.Root>

      <Field.Root>
        <Field.Label>Mô tả</Field.Label>
        <Input
          value={values.description}
          onValueChange={(v) => update('description', v)}
          placeholder="Mô tả ngắn gọn"
          disabled={!canEdit}
        />
      </Field.Root>

      <div className="grid grid-cols-2 gap-4">
        <Field.Root>
          <Field.Label>Giá (VND)</Field.Label>
          <Input
            type="number"
            value={values.price}
            onValueChange={(v) => update('price', v)}
            placeholder="50000"
            disabled={!canEdit}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Thời hạn (ngày)</Field.Label>
          <Input
            type="number"
            value={values.duration_days}
            onValueChange={(v) => update('duration_days', v)}
            placeholder="30"
            disabled={!canEdit}
          />
        </Field.Root>
      </div>

      <Field.Root>
        <Field.Label>Tính năng</Field.Label>
        <Textarea
          value={values.features}
          onChange={(e) => update('features', e.target.value)}
          placeholder="Mỗi dòng là một tính năng"
          rows={5}
          disabled={!canEdit}
        />
      </Field.Root>

      <div className="grid grid-cols-2 gap-4">
        <Field.Root>
          <Field.Label>Badge (tuỳ chọn)</Field.Label>
          <Input
            value={values.badge}
            onValueChange={(v) => update('badge', v)}
            placeholder="VD: Phổ biến, Tiết kiệm"
            disabled={!canEdit}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Thứ tự hiển thị</Field.Label>
          <Input
            type="number"
            value={values.sort_order}
            onValueChange={(v) => update('sort_order', v)}
            placeholder="0"
            disabled={!canEdit}
          />
        </Field.Root>
      </div>

      <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={values.is_active}
          onChange={(e) => update('is_active', e.target.checked)}
          className="h-4 w-4 rounded border-border bg-surface-1 text-primary focus:ring-primary"
          disabled={!canEdit}
        />{' '}
        Đang hoạt động
      </label>
    </div>
  );
};

interface ServiceFormData {
  name: string;
  sort_order: string;
  is_active: boolean;
}

const emptyServiceForm: ServiceFormData = {
  name: '',
  sort_order: '0',
  is_active: true,
};

const toServiceFormData = (svc: Tables<'services'>): ServiceFormData => ({
  name: svc.name,
  sort_order: svc.sort_order.toString(),
  is_active: svc.is_active,
});

const ServiceDialog: FC<{
  open: boolean;
  editingId: string | null;
  initial: ServiceFormData;
  onClose: () => void;
  onSubmit: (
    payload: Omit<TablesInsert<'services'>, 'id' | 'created_at' | 'updated_at'>,
  ) => Promise<void>;
}> = ({ open, editingId, initial, onClose, onSubmit }) => {
  const toast = useToast();
  const [form, setForm] = useState<ServiceFormData>(initial);
  const [submitting, setSubmitting] = useState(false);

  const update = useCallback(
    <K extends keyof ServiceFormData>(key: K, value: ServiceFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (!form.name.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
      });
      toast.success(editingId ? 'Đã cập nhật dịch vụ' : 'Đã thêm dịch vụ');
      onClose();
    } catch (err) {
      reportError(toast, err, 'Không thể lưu dịch vụ');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title={editingId ? 'Sửa loại dịch vụ' : 'Thêm loại dịch vụ'}
      description="Nhóm dùng để phân loại các gói"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field.Root>
          <Field.Label>Tên loại dịch vụ</Field.Label>
          <Input
            value={form.name}
            onValueChange={(v) => update('name', v)}
            placeholder="VD: Netflix, YouTube Premium"
            required
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Thứ tự hiển thị</Field.Label>
          <Input
            type="number"
            value={form.sort_order}
            onValueChange={(v) => update('sort_order', v)}
            placeholder="0"
          />
        </Field.Root>

        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => update('is_active', e.target.checked)}
            className="h-4 w-4 rounded border-border bg-surface-1 text-primary focus:ring-primary"
          />{' '}
          Đang hoạt động
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={submitting || !form.name.trim()}>
            {submitting ? <Spinner /> : editingId ? 'Lưu thay đổi' : 'Tạo nhóm'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

const AdminPackages: FC = () => {
  const {
    packages,
    loading,
    error,
    addPackage,
    editPackage,
    removePackage,
    setActive,
  } = usePackagesAdmin();
  const { services, addService, editService, removeService } =
    useServicesAdmin();
  const { adminRole } = useAuth();
  const canEdit = adminRole === 'admin';
  const toast = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<PackageFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [serviceFilter, setServiceFilter] = useState<string>('all');

  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceFormInitial, setServiceFormInitial] =
    useState<ServiceFormData>(emptyServiceForm);
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);

  const serviceOptions = useMemo(
    () => services.map((s) => ({ value: s.id, label: s.name })),
    [services],
  );

  const serviceNameById = useNameById(services);

  const packageCountByService = useMemo(() => {
    const map = new Map<string, number>();
    packages.forEach((p) => {
      if (!p.service_id) return;
      map.set(p.service_id, (map.get(p.service_id) ?? 0) + 1);
    });
    return map;
  }, [packages]);

  const filteredPackages = useMemo(() => {
    if (serviceFilter === 'all') return packages;
    return packages.filter((p) => p.service_id === serviceFilter);
  }, [packages, serviceFilter]);

  const openAdd = useCallback(() => {
    setEditingId(null);
    setFormValues({ ...emptyForm, service_id: services[0]?.id ?? '' });
    setDialogOpen(true);
  }, [services]);

  const openEdit = useCallback((pkg: Tables<'packages'>) => {
    setEditingId(pkg.id);
    setFormValues(toFormData(pkg));
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingId(null);
    setFormValues(emptyForm);
  }, []);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (submitting) return;

    const price = Number(formValues.price);
    const durationDays = Number(formValues.duration_days);
    const sortOrder = Number(formValues.sort_order);

    if (!formValues.name || !price || !durationDays || !formValues.service_id)
      return;

    const features = formValues.features.split('\n').flatMap((f) => {
      const trimmed = f.trim();
      return trimmed ? [trimmed] : [];
    });

    const payload = {
      service_id: formValues.service_id,
      name: formValues.name,
      description: formValues.description || null,
      price,
      duration_days: durationDays,
      features,
      badge: formValues.badge.trim() || null,
      is_active: formValues.is_active,
      sort_order: sortOrder,
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await editPackage(editingId, payload);
      } else {
        await addPackage(payload);
      }
      closeDialog();
    } catch (err) {
      reportError(toast, err, 'Không thể lưu gói');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await removePackage(deleteId);
      toast.success('Đã xóa gói');
    } catch (err) {
      reportError(toast, err, 'Không thể xóa gói');
    } finally {
      setDeleteId(null);
    }
  };

  const openAddService = useCallback(() => {
    setEditingServiceId(null);
    setServiceFormInitial(emptyServiceForm);
    setServiceDialogOpen(true);
  }, []);

  const openEditService = useCallback((svc: Tables<'services'>) => {
    setEditingServiceId(svc.id);
    setServiceFormInitial(toServiceFormData(svc));
    setServiceDialogOpen(true);
  }, []);

  const closeServiceDialog = useCallback(() => {
    setServiceDialogOpen(false);
    setEditingServiceId(null);
    setServiceFormInitial(emptyServiceForm);
  }, []);

  const handleServiceSubmit = async (
    payload: Omit<TablesInsert<'services'>, 'id' | 'created_at' | 'updated_at'>,
  ) => {
    if (editingServiceId) {
      await editService(editingServiceId, payload);
    } else {
      await addService(payload);
    }
  };

  const handleDeleteService = async () => {
    if (!deleteServiceId) return;
    try {
      await removeService(deleteServiceId);
      toast.success('Đã xóa loại dịch vụ');
      if (serviceFilter === deleteServiceId) setServiceFilter('all');
    } catch (err) {
      reportError(toast, err, 'Không thể xóa loại dịch vụ');
    } finally {
      setDeleteServiceId(null);
    }
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
        title="Gói dịch vụ"
        description="Quản lý các gói dịch vụ"
        wrap
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-48">
              <Select
                value={serviceFilter}
                onChange={(v) => setServiceFilter(v)}
                options={[
                  { value: 'all', label: 'Tất cả dịch vụ' },
                  ...serviceOptions,
                ]}
              />
            </div>
            {canEdit && (
              <Button onClick={openAdd}>
                <PlusIcon size={18} weight="bold" />
                Thêm gói
              </Button>
            )}
          </div>
        }
      />

      <AdminError error={error} />

      <section className="mb-6 rounded-lg border border-border/50 bg-surface-1 p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-ink text-base font-semibold tracking-tight text-balance">
              Loại dịch vụ
            </h2>
            <p className="text-ink-muted mt-0.5 text-xs text-pretty">
              {services.length === 0
                ? 'Chưa có loại dịch vụ nào'
                : `${services.length} nhóm đang hoạt động`}
            </p>
          </div>
          {canEdit && (
            <Button size="sm" onClick={openAddService}>
              <PlusIcon size={14} weight="bold" />
              Thêm dv
            </Button>
          )}
        </div>

        {services.length === 0 ? (
          <p className="text-ink-muted text-sm text-pretty">
            Tạo loại dịch vụ đầu tiên trước khi thêm gói.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {services.map((svc) => {
              const isActive = serviceFilter === svc.id;
              const count = packageCountByService.get(svc.id) ?? 0;
              return (
                <div
                  key={svc.id}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                    isActive
                      ? 'border-primary/50 bg-primary/10 text-primary'
                      : 'border-border/50 bg-surface-2 text-ink-muted hover:border-border hover:text-ink'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setServiceFilter(svc.id)}
                    className="flex items-center gap-1.5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
                  >
                    <span>{svc.name}</span>
                    <span className="bg-ink-muted/15 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums text-ink-muted">
                      {count}
                    </span>
                  </button>
                  {canEdit && (
                    <>
                      <button
                        type="button"
                        onClick={() => openEditService(svc)}
                        aria-label={`Sửa ${svc.name}`}
                        className="text-ink-muted hover:text-ink ml-1 rounded p-0.5 transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
                      >
                        <PencilIcon size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteServiceId(svc.id)}
                        aria-label={`Xóa ${svc.name}`}
                        className="text-ink-muted hover:text-error rounded p-0.5 transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
                      >
                        <TrashIcon size={12} />
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <AdminTable
        headers={PACKAGE_HEADERS}
        empty={filteredPackages.length === 0}
        emptyText={
          serviceFilter === 'all'
            ? 'Chưa có gói dịch vụ nào'
            : 'Không có gói nào trong dịch vụ này'
        }
      >
        {filteredPackages.map((pkg) => (
          <tr
            key={pkg.id}
            className="text-ink hover:bg-white/3 transition-colors duration-150"
          >
            <td className="px-4 py-3 text-sm text-ink-muted">
              {pkg.service_id
                ? (serviceNameById.get(pkg.service_id) ?? '—')
                : '—'}
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="font-medium text-pretty">{pkg.name}</div>
                {pkg.badge && (
                  <span className="bg-primary/15 text-primary inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                    {pkg.badge}
                  </span>
                )}
              </div>
              {pkg.description && (
                <div className="text-ink-muted mt-0.5 line-clamp-1 text-xs text-pretty">
                  {pkg.description}
                </div>
              )}
            </td>
            <td className="px-4 py-3 tabular-nums">{formatVnd(pkg.price)}</td>
            <td className="px-4 py-3 tabular-nums">{pkg.duration_days} ngày</td>
            <td className="px-4 py-3">
              <button
                type="button"
                disabled={!canEdit}
                onClick={() => setActive(pkg.id, !pkg.is_active)}
                className={`inline-flex min-h-7 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors duration-150 ${
                  pkg.is_active
                    ? 'bg-success/10 text-success'
                    : 'bg-ink-muted/10 text-ink-muted'
                } ${canEdit ? '' : 'cursor-default'}`}
              >
                {pkg.is_active ? (
                  <>
                    <CheckCircleIcon size={12} /> Hoạt động
                  </>
                ) : (
                  <>
                    <XCircleIcon size={12} /> Ẩn
                  </>
                )}
              </button>
            </td>
            <td className="px-4 py-3">
              {canEdit ? (
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(pkg)}
                  >
                    <PencilIcon size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteId(pkg.id)}
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

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingId ? 'Chỉnh sửa gói' : 'Thêm gói mới'}
        description={
          editingId
            ? 'Cập nhật thông tin gói dịch vụ'
            : 'Tạo gói dịch vụ mới cho khách hàng'
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <PackageFormFields
            values={formValues}
            onChange={setFormValues}
            serviceOptions={serviceOptions}
            canEdit={canEdit}
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
            {canEdit && (
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <Spinner />
                ) : editingId ? (
                  'Lưu thay đổi'
                ) : (
                  'Tạo gói'
                )}
              </Button>
            )}
          </div>
        </form>
      </Dialog>

      <ServiceDialog
        key={editingServiceId ?? 'new'}
        open={serviceDialogOpen}
        editingId={editingServiceId}
        initial={serviceFormInitial}
        onClose={closeServiceDialog}
        onSubmit={handleServiceSubmit}
      />

      <ConfirmDeleteDialog
        open={!!deleteId}
        title="Xóa gói"
        description="Hành động này không thể hoàn tác. Tài khoản cũ thuộc gói này vẫn được giữ trong kho."
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />

      <ConfirmDeleteDialog
        open={!!deleteServiceId}
        title="Xóa loại dịch vụ"
        description="Các gói thuộc nhóm này sẽ chuyển sang hiển thị unknown."
        onClose={() => setDeleteServiceId(null)}
        onConfirm={handleDeleteService}
      />
    </div>
  );
};

export default AdminPackages;
