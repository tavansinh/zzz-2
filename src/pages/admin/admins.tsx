import { useState, useCallback, type FC } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowsClockwiseIcon,
  PlusIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { Button, Spinner, Input } from '@/components/ui';
import {
  AdminError,
  AdminPageHeader,
  AdminTable,
  ConfirmDeleteDialog,
} from '@/components/shared/admin-page';
import useAdminsAdmin from '@/hooks/useAdminsAdmin';
import { addStaff } from '@/lib/api-admin-users';
import { useAuth } from '@/stores/auth';
import { useToast } from '@/stores/toast';
import { reportError } from '@/lib/report-error';
import { formatDateShort } from '@/lib/format';
import { roleLabel } from '@/lib/labels';
import type { AdminRole } from '@/types/admin';

const STAFF_HEADERS = ['Email', 'Quyền', 'Trạng thái', 'Ngày tạo', 'Thao tác'];

const AdminAdmins: FC = () => {
  const { staff, loading, error, refresh, setActive, remove } =
    useAdminsAdmin();
  const { user } = useAuth();
  const toast = useToast();
  const [addEmail, setAddEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = useCallback(async () => {
    const email = addEmail.trim().toLowerCase();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Email không hợp lệ');
      return;
    }
    setAdding(true);
    try {
      await addStaff(email);
      toast.success('Đã thêm nhân viên');
      setAddEmail('');
      await refresh();
    } catch (err) {
      reportError(toast, err, 'Không thể thêm');
    } finally {
      setAdding(false);
    }
  }, [addEmail, refresh, toast]);

  const handleActive = useCallback(
    async (id: string, isActive: boolean) => {
      try {
        await setActive(id, isActive);
        toast.success(isActive ? 'Đã kích hoạt' : 'Đã vô hiệu hóa');
      } catch (err) {
        reportError(toast, err, 'Không thể cập nhật');
      }
    },
    [setActive, toast],
  );

  const handleRemove = useCallback(async () => {
    if (!deleteId) return;
    try {
      await remove(deleteId);
      toast.success('Đã xóa nhân viên');
    } catch (err) {
      reportError(toast, err, 'Không thể xóa');
    } finally {
      setDeleteId(null);
    }
  }, [deleteId, remove, toast]);

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
        title="Nhân viên"
        description="Quản lý tài khoản nhân viên — thêm từ email đã đăng ký, kích hoạt hoặc vô hiệu hóa"
        action={
          <Button variant="outline" size="md" onClick={refresh}>
            <ArrowsClockwiseIcon size={16} />
            Làm mới
          </Button>
        }
      />

      <div className="mb-6 flex items-end gap-3 rounded-lg border border-border/50 bg-surface-1 p-4">
        <div className="flex-1">
          <label
            htmlFor="add-staff-email"
            className="text-ink-muted mb-1 block text-xs font-medium"
          >
            Email nhân viên
          </label>
          <Input
            id="add-staff-email"
            value={addEmail}
            onChange={(e) => setAddEmail(e.target.value)}
            placeholder="Email đã đăng ký"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
        </div>
        <Button
          disabled={adding || !addEmail.trim()}
          onClick={handleAdd}
          size="md"
        >
          <PlusIcon size={16} />
          {adding ? 'Đang thêm…' : 'Thêm nhân viên'}
        </Button>
      </div>

      <AdminError error={error} />

      <AdminTable
        headers={STAFF_HEADERS}
        empty={staff.length === 0}
        emptyText="Chưa có nhân viên nào"
      >
        {staff.map((row) => {
          const isSelf = row.id === user?.id;
          return (
            <tr
              key={row.id}
              className="text-ink hover:bg-white/3 transition-colors duration-150"
            >
              <td className="px-4 py-3">
                <div className="font-medium text-pretty">{row.email}</div>
                {isSelf && (
                  <div className="text-ink-muted mt-0.5 text-xs">(bạn)</div>
                )}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {roleLabel[row.role as AdminRole] ?? row.role}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex min-h-7 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    row.is_active
                      ? 'bg-success/10 text-success'
                      : 'bg-ink-muted/10 text-ink-muted'
                  }`}
                >
                  {row.is_active ? (
                    <>
                      <CheckCircleIcon size={12} /> Hoạt động
                    </>
                  ) : (
                    <>
                      <XCircleIcon size={12} /> Vô hiệu
                    </>
                  )}
                </span>
              </td>
              <td className="text-ink-muted px-4 py-3 text-xs whitespace-nowrap tabular-nums">
                {formatDateShort(row.created_at)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  {row.is_active ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isSelf}
                      onClick={() => handleActive(row.id, false)}
                    >
                      Vô hiệu hóa
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleActive(row.id, true)}
                    >
                      Kích hoạt
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={isSelf || row.is_protected}
                    onClick={() => setDeleteId(row.id)}
                    aria-label="Xóa nhân viên"
                  >
                    <TrashIcon size={16} />
                  </Button>
                </div>
              </td>
            </tr>
          );
        })}
      </AdminTable>

      <ConfirmDeleteDialog
        open={!!deleteId}
        title="Xóa nhân viên"
        description="Hành động này không thể hoàn tác."
        onClose={() => setDeleteId(null)}
        onConfirm={handleRemove}
      />
    </div>
  );
};

export default AdminAdmins;
