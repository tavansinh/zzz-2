import { useState, useMemo, useCallback, type FC } from 'react';
import {
  CheckIcon,
  EyeIcon,
  FunnelIcon,
  ArrowsClockwiseIcon,
  ChatsCircleIcon,
  PaperPlaneIcon,
  TrashIcon,
  ArrowsCounterClockwiseIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { Button, Spinner, Dialog, Select } from '@/components/ui';
import {
  AdminError,
  AdminPageHeader,
  AdminTable,
  ConfirmDeleteDialog,
} from '@/components/shared/admin-page';
import useOrdersAdmin from '@/hooks/useOrdersAdmin';
import useAccountsAdmin from '@/hooks/useAccountsAdmin';
import { sendOrderEmail } from '@/lib/api-email';
import { useAuth } from '@/stores/auth';
import { useToast } from '@/stores/toast';
import { reportError } from '@/lib/report-error';
import { formatDateFull, formatVnd } from '@/lib/format';
import { deliveryShortLabel, statusDotClass, statusLabel } from '@/lib/labels';
import type { Tables } from '@/lib/database.types';
import type { OrderStatus } from '@/types/orders';
import type { DeliveryType } from '@/lib/labels';

type StatusFilter = 'all' | OrderStatus;

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: statusLabel.pending },
  { value: 'paid', label: statusLabel.paid },
  { value: 'completed', label: statusLabel.completed },
  { value: 'awaiting_stock', label: statusLabel.awaiting_stock },
  { value: 'cancelled', label: statusLabel.cancelled },
];

const ORDER_HEADERS = [
  'Khách hàng',
  'Gói',
  'Số tiền',
  'Trạng thái',
  'Ngày tạo',
  'Thao tác',
];

const OrderRow: FC<{
  order: Tables<'orders'>;
  onView: (order: Tables<'orders'>) => void;
  onApprove: (id: string) => void;
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  onDelete: (id: string) => void;
  busy: boolean;
  canDelete: boolean;
  canCancel: boolean;
}> = ({
  order,
  onView,
  onApprove,
  onComplete,
  onCancel,
  onRetry,
  onDelete,
  busy,
  canDelete,
  canCancel,
}) => {
  const status = order.status as OrderStatus;
  const delivery = order.delivery_type as DeliveryType;
  const isZalo = delivery === 'zalo';

  return (
    <tr className="text-ink hover:bg-white/3 transition-colors duration-150">
      <td className="px-4 py-3 align-top">
        <div className="font-medium text-pretty">
          {order.customer_email ?? (isZalo ? 'Khách Zalo' : 'Không có')}
        </div>
        {isZalo && order.zalo_phone && (
          <div className="text-ink-muted mt-0.5 flex items-start gap-1 text-xs">
            <ChatsCircleIcon
              size={12}
              weight="fill"
              aria-hidden="true"
              className="mt-0.5 shrink-0"
            />
            <span className="min-w-0 break-all text-pretty">
              <span className="font-semibold">Zalo: </span>
              {order.zalo_phone}
            </span>
          </div>
        )}
      </td>
      <td className="px-4 py-3 align-top">
        <div className="font-medium text-pretty">{order.package_name}</div>
        <div className="text-ink-muted mt-0.5 text-xs">
          {deliveryShortLabel[delivery] ?? order.delivery_type}
        </div>
      </td>
      <td className="px-4 py-3 align-top tabular-nums">
        {formatVnd(order.amount)}
      </td>
      <td className="px-4 py-3 align-top">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusDotClass[status] ?? 'bg-ink-muted/10 text-ink-muted'}`}
        >
          {statusLabel[status] ?? order.status}
        </span>
      </td>
      <td className="text-ink-muted px-4 py-3 align-top text-xs whitespace-nowrap tabular-nums">
        {formatDateFull(order.created_at)}
      </td>
      <td className="px-4 py-3 align-top">
        <div className="flex items-center justify-end gap-1">
          {status === 'pending' && (
            <Button
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => onApprove(order.id)}
            >
              <CheckIcon size={14} />
              Duyệt
            </Button>
          )}
          {status === 'paid' && (
            <Button
              size="sm"
              disabled={busy}
              onClick={() => onComplete(order.id)}
            >
              <CheckIcon size={14} />
              Hoàn thành
            </Button>
          )}
          {status === 'awaiting_stock' && (
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => onRetry(order.id)}
            >
              <ArrowsCounterClockwiseIcon size={14} />
              Giao lại
            </Button>
          )}
          {canCancel &&
            (status === 'pending' ||
              status === 'paid' ||
              status === 'awaiting_stock') && (
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => onCancel(order.id)}
                aria-label="Hủy đơn"
              >
                <XCircleIcon size={14} />
              </Button>
            )}
          <Button size="sm" variant="ghost" onClick={() => onView(order)}>
            <EyeIcon size={14} />
          </Button>
          {canDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(order.id)}
              aria-label="Xóa đơn"
            >
              <TrashIcon size={14} />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
};

const AdminOrders: FC = () => {
  const {
    orders,
    loading,
    error,
    refresh,
    approve,
    complete,
    cancel,
    retryDelivery,
    remove,
  } = useOrdersAdmin();
  const { accounts } = useAccountsAdmin();
  const { adminRole } = useAuth();
  const canDelete = adminRole === 'admin';
  const canCancel = adminRole === 'admin';
  const toast = useToast();
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [viewOrder, setViewOrder] = useState<Tables<'orders'> | null>(null);
  const [resending, setResending] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const accountsById = useMemo(() => {
    const map = new Map<string, Tables<'accounts'>>();
    accounts.forEach((a) => map.set(a.id, a));
    return map;
  }, [accounts]);

  const filteredOrders = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const activeViewOrder = useMemo(() => {
    if (!viewOrder) return null;
    return orders.find((order) => order.id === viewOrder.id) ?? viewOrder;
  }, [orders, viewOrder]);

  const runOrder = useCallback(
    async (id: string, fn: (id: string) => Promise<void>) => {
      setBusyId(id);
      try {
        await fn(id);
      } catch (err) {
        reportError(toast, err, 'Không thể thực hiện');
      } finally {
        setBusyId(null);
      }
    },
    [toast],
  );

  const handleApprove = useCallback(
    (id: string) => runOrder(id, approve),
    [approve, runOrder],
  );
  const handleComplete = useCallback(
    (id: string) => runOrder(id, complete),
    [complete, runOrder],
  );
  const handleCancel = useCallback(
    (id: string) => runOrder(id, cancel),
    [cancel, runOrder],
  );
  const handleRetry = useCallback(
    (id: string) => runOrder(id, retryDelivery),
    [retryDelivery, runOrder],
  );
  const handleResendEmail = useCallback(
    async (order: Tables<'orders'>) => {
      setResending(true);
      try {
        await sendOrderEmail(order.id, 'account_delivery');
        toast.success('Đã gửi lại email');
      } catch (err) {
        reportError(toast, err, 'Không thể gửi email');
      } finally {
        setResending(false);
      }
    },
    [toast],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteId) return;
    try {
      await remove(deleteId);
      toast.success('Đã xóa đơn hàng');
    } catch (err) {
      reportError(toast, err, 'Không thể xóa đơn');
    } finally {
      setDeleteId(null);
    }
  }, [deleteId, remove, toast]);

  const viewAccount = activeViewOrder?.account_id
    ? accountsById.get(activeViewOrder.account_id)
    : null;

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
        title="Đơn hàng"
        description="Quản lý và xử lý đơn hàng từ khách"
        wrap
        action={
          <div className="flex items-center gap-2">
            <div className="w-44">
              <Select
                value={filter}
                onChange={(v) => setFilter(v as StatusFilter)}
                options={statusOptions}
              />
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                void refresh();
              }}
            >
              <ArrowsClockwiseIcon size={16} />
              Làm mới
            </Button>
          </div>
        }
      />

      <AdminError error={error} />

      <AdminTable
        headers={ORDER_HEADERS}
        empty={filteredOrders.length === 0}
        emptyText={
          filter === 'all'
            ? 'Chưa có đơn hàng nào'
            : 'Không có đơn ở trạng thái này'
        }
        toolbar={
          <div className="flex items-center gap-2 border-b border-border/50 px-4 py-2 text-xs text-ink-muted">
            <FunnelIcon size={12} />
            {filteredOrders.length} đơn
          </div>
        }
      >
        {filteredOrders.map((order) => (
          <OrderRow
            key={order.id}
            order={order}
            onView={setViewOrder}
            onApprove={handleApprove}
            onComplete={handleComplete}
            onCancel={handleCancel}
            onRetry={handleRetry}
            onDelete={(id) => setDeleteId(id)}
            busy={busyId === order.id}
            canDelete={canDelete}
            canCancel={canCancel}
          />
        ))}
      </AdminTable>

      <Dialog
        open={!!activeViewOrder}
        onOpenChange={(o) => !o && setViewOrder(null)}
        title="Chi tiết đơn hàng"
        description="Thông tin đầy đủ và tài khoản đã gán (nếu có)"
      >
        {activeViewOrder && (
          <div className="space-y-3 text-sm">
            <Row label="Mã đơn" value={activeViewOrder.id} mono />
            <Row
              label="Khách hàng"
              value={
                activeViewOrder.customer_email ??
                (activeViewOrder.delivery_type === 'zalo'
                  ? 'Khách Zalo'
                  : 'Không có')
              }
            />
            <Row label="Gói" value={activeViewOrder.package_name} />
            <Row label="Số tiền" value={formatVnd(activeViewOrder.amount)} />
            <Row
              label="Trạng thái"
              value={
                statusLabel[activeViewOrder.status as OrderStatus] ??
                activeViewOrder.status
              }
            />
            <Row
              label="Hình thức"
              value={
                deliveryShortLabel[
                  activeViewOrder.delivery_type as DeliveryType
                ] ?? activeViewOrder.delivery_type
              }
            />
            <Row
              label="Ngày tạo"
              value={formatDateFull(activeViewOrder.created_at)}
            />
            {activeViewOrder.paid_at && (
              <Row
                label="Nhận tiền lúc"
                value={formatDateFull(activeViewOrder.paid_at)}
              />
            )}
            {activeViewOrder.completed_at && (
              <Row
                label="Hoàn thành lúc"
                value={formatDateFull(activeViewOrder.completed_at)}
              />
            )}
            {activeViewOrder.cancelled_at && (
              <Row
                label="Hủy lúc"
                value={formatDateFull(activeViewOrder.cancelled_at)}
              />
            )}
            {activeViewOrder.zalo_phone && (
              <Row label="Số Zalo" value={activeViewOrder.zalo_phone} />
            )}

            {viewAccount ? (
              <div className="border-border/50 bg-canvas mt-2 rounded-md border p-4">
                <p className="text-ink-muted mb-2 text-xs font-medium uppercase tracking-wide">
                  Tài khoản đã gán
                </p>
                <Row label="Email" value={viewAccount.email} mono />
                <Row label="Mật khẩu" value={viewAccount.password} mono />
              </div>
            ) : (
              activeViewOrder.status !== 'pending' &&
              activeViewOrder.status !== 'cancelled' && (
                <p className="text-ink-muted text-xs text-pretty">
                  Chưa gán tài khoản cho đơn này.
                </p>
              )
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex flex-wrap gap-2">
                {activeViewOrder.status === 'awaiting_stock' &&
                  activeViewOrder.delivery_type === 'mail' && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === activeViewOrder.id}
                      onClick={() => handleRetry(activeViewOrder.id)}
                    >
                      <ArrowsCounterClockwiseIcon size={14} />
                      Giao lại
                    </Button>
                  )}
                {activeViewOrder.status === 'completed' &&
                  activeViewOrder.delivery_type === 'mail' &&
                  viewAccount && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={resending}
                      onClick={() => handleResendEmail(activeViewOrder)}
                    >
                      <PaperPlaneIcon size={14} />
                      {resending ? 'Đang gửi…' : 'Gửi lại email'}
                    </Button>
                  )}
              </div>
              <Button variant="ghost" onClick={() => setViewOrder(null)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteId}
        title="Xóa đơn hàng"
        description="Hành động này không thể hoàn tác. Đơn sẽ bị xóa cứng khỏi hệ thống."
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

const Row: FC<{ label: string; value: string; mono?: boolean }> = ({
  label,
  value,
  mono,
}) => (
  <div className="flex items-center justify-between gap-3 border-b border-border/30 py-2 last:border-b-0">
    <span className="text-ink-muted text-xs">{label}</span>
    <span
      className={`text-ink text-right text-sm text-pretty ${mono ? 'font-mono tabular-nums' : 'font-medium'}`}
    >
      {value}
    </span>
  </div>
);

export default AdminOrders;
