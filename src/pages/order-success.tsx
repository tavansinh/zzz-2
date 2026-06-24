import { useEffect, useState, type FC } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import {
  CopyIcon,
  ArrowLeftIcon,
  CircleNotchIcon,
} from '@phosphor-icons/react';
import ClientLayout from '@/components/layout/client-layout';
import { Spinner } from '@/components/ui';
import { useToast } from '@/stores/toast';
import { getSettings } from '@/lib/api-settings';
import { getOrder } from '@/lib/api-orders';
import { findBank, getBanks } from '@/lib/banks';
import { toErrorMessage } from '@/lib/errors';
import { formatDateFull, formatNumber } from '@/lib/format';
import { deliveryLabel, statusLabel } from '@/lib/labels';
import { routes } from '@/lib/routes';
import type { Tables } from '@/lib/database.types';
import type { OrderStatus } from '@/types/orders';
import type { DeliveryType } from '@/lib/labels';

type OrderSummary = Omit<
  Pick<
    Tables<'orders'>,
    | 'id'
    | 'package_name'
    | 'amount'
    | 'customer_email'
    | 'status'
    | 'delivery_type'
    | 'zalo_phone'
    | 'created_at'
    | 'paid_at'
    | 'completed_at'
    | 'cancelled_at'
  >,
  'id' | 'status' | 'delivery_type'
> & {
  id: string | null;
  status: OrderStatus;
  delivery_type: DeliveryType;
};

interface OrderState {
  order?: Partial<OrderSummary> & {
    packageName: string;
    amount: number;
    email: string | null;
  };
}

const buildQrUrl = (
  settings: Tables<'settings'>,
  amount: number,
  addInfo: string,
) =>
  `https://img.vietqr.io/image/${settings.bank_id}-${settings.account_no}-${settings.template}.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(settings.account_name)}`;

const DIACRITICS = /[̀-ͯ]/g;

const sanitizeNote = (s: string) =>
  s
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 50);

const normalizeStatus = (status: string | undefined): OrderStatus => {
  if (
    status === 'paid' ||
    status === 'completed' ||
    status === 'awaiting_stock' ||
    status === 'cancelled'
  ) {
    return status;
  }
  return 'pending';
};

const toSummary = (order: Tables<'orders'>): OrderSummary => ({
  ...order,
  id: order.id,
  status: normalizeStatus(order.status),
  delivery_type: order.delivery_type as DeliveryType,
});

const fromState = (state: OrderState['order']): OrderSummary | null => {
  if (!state) return null;
  return {
    id: state.id ?? null,
    package_name: state.packageName,
    amount: state.amount,
    customer_email: state.email,
    status: normalizeStatus(state.status),
    delivery_type: (state.delivery_type as DeliveryType) ?? 'mail',
    zalo_phone: state.zalo_phone ?? null,
    created_at: state.created_at ?? null,
    paid_at: state.paid_at ?? null,
    completed_at: state.completed_at ?? null,
    cancelled_at: state.cancelled_at ?? null,
  } as OrderSummary;
};

const useOrderData = (
  trackingId: string | null,
  stateOrder: OrderState['order'] | undefined,
) => {
  const [order, setOrder] = useState<OrderSummary | null>(() =>
    fromState(stateOrder),
  );
  const [orderLoading, setOrderLoading] = useState(
    Boolean(trackingId ?? stateOrder?.id),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trackingId) return;
    let cancelled = false;
    getOrder(trackingId)
      .then((data) => {
        if (!cancelled) setOrder(toSummary(data));
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(toErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setOrderLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [trackingId]);

  return { order, setOrder, orderLoading, error, setError };
};

const usePaymentSettings = () => {
  const [settings, setSettings] = useState<Tables<'settings'> | null>(null);
  const [bankName, setBankName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getSettings();
        if (cancelled) return;
        if (!data) {
          setError('Chưa có thông tin thanh toán. Vui lòng liên hệ admin.');
          return;
        }
        setSettings(data);
        try {
          const banks = await getBanks();
          if (!cancelled) {
            setBankName(findBank(banks, data.bank_id)?.shortName ?? null);
          }
        } catch {
          if (!cancelled) setBankName(null);
        }
      } catch (err) {
        if (!cancelled) setError(toErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { settings, bankName, loading, error };
};

const useOrderPolling = (
  trackingId: string | null,
  isComplete: boolean,
  applyOrder: (next: OrderSummary) => void,
  reportError: (msg: string) => void,
) => {
  useEffect(() => {
    if (!trackingId || isComplete) return;
    let cancelled = false;
    const timer = window.setInterval(() => {
      getOrder(trackingId)
        .then((data) => {
          if (!cancelled) applyOrder(toSummary(data));
        })
        .catch((err: unknown) => {
          if (!cancelled) reportError(toErrorMessage(err));
        });
    }, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [applyOrder, isComplete, reportError, trackingId]);
};

const InfoRow: FC<{
  label: string;
  value: string;
  copyable?: boolean;
}> = ({ label, value, copyable }) => {
  const toast = useToast();
  const onCopy = () => {
    navigator.clipboard
      .writeText(value)
      .then(() => toast.success('Đã sao chép', value))
      .catch(() => toast.error('Không thể sao chép'));
  };
  return (
    <div className="min-w-0 flex items-center justify-between gap-3 border-b border-border/30 py-2 last:border-b-0">
      <span className="text-ink-muted shrink-0 text-xs">{label}</span>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <span className="text-ink min-w-0 truncate text-right text-sm font-medium tabular-nums text-pretty">
          {value}
        </span>
        {copyable && (
          <button
            type="button"
            onClick={onCopy}
            className="text-ink-muted hover:text-ink flex min-h-9 min-w-9 items-center justify-center rounded p-1.5 transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
            aria-label="Sao chép"
          >
            <CopyIcon size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

const TrackingStatus: FC<{ order: OrderSummary }> = ({ order }) => {
  const accent =
    order.status === 'completed'
      ? 'border-l-success/70'
      : order.status === 'paid'
        ? 'border-l-primary/80'
        : order.status === 'awaiting_stock'
          ? 'border-l-info/70'
          : order.status === 'cancelled'
            ? 'border-l-ink-muted/70'
            : 'border-l-warning/70';

  return (
    <div
      className={`rounded-lg border border-l-2 border-border bg-surface-1 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.4),0_2px_6px_rgba(0,0,0,0.3)] ${accent}`}
    >
      <p className="text-ink-muted mb-1 text-xs font-medium">
        Trạng thái đơn hàng
      </p>
      <h2 className="text-ink text-xl font-bold tracking-tight text-balance">
        {statusLabel[order.status]}
      </h2>
    </div>
  );
};

const paymentStatusLabel = (status: OrderStatus): string => {
  if (status === 'pending' || status === 'awaiting_stock')
    return 'Chưa nhận tiền';
  if (status === 'cancelled') return 'Đã hủy';
  return 'Đã nhận tiền';
};

const OrderInfoCard: FC<{ order: OrderSummary }> = ({ order }) => (
  <div className="rounded-lg border border-border bg-surface-1 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.4),0_2px_6px_rgba(0,0,0,0.3)]">
    <h2 className="text-ink mb-4 text-sm font-bold tracking-tight text-balance">
      Thông tin đơn hàng
    </h2>
    <InfoRow label="Gói" value={order.package_name} />
    <InfoRow
      label="Số tiền"
      value={`${formatNumber(order.amount)} ₫`}
      copyable
    />
    {order.customer_email && (
      <InfoRow
        label="Email nhận tài khoản"
        value={order.customer_email}
        copyable
      />
    )}
    <InfoRow
      label="Hình thức"
      value={deliveryLabel[order.delivery_type] ?? order.delivery_type}
    />
    {order.delivery_type === 'zalo' && order.zalo_phone && (
      <InfoRow label="Số Zalo" value={order.zalo_phone} copyable />
    )}
    <InfoRow label="Trạng thái" value={statusLabel[order.status]} />
    <InfoRow label="Thanh toán" value={paymentStatusLabel(order.status)} />
    {order.created_at && (
      <InfoRow label="Ngày tạo" value={formatDateFull(order.created_at)} />
    )}
    {order.paid_at && (
      <InfoRow label="Nhận tiền lúc" value={formatDateFull(order.paid_at)} />
    )}
    {order.completed_at && (
      <InfoRow
        label="Hoàn thành lúc"
        value={formatDateFull(order.completed_at)}
      />
    )}
    {order.cancelled_at && (
      <InfoRow label="Hủy lúc" value={formatDateFull(order.cancelled_at)} />
    )}
  </div>
);

const PaymentGuideCard: FC<{
  order: OrderSummary;
  settings: Tables<'settings'> | null;
  settingsLoading: boolean;
  settingsError: string | null;
  bankName: string | null;
  note: string;
}> = ({ order, settings, settingsLoading, settingsError, bankName, note }) => {
  const settingsReady = !settingsLoading && !settingsError && settings;

  return (
    <div className="rounded-lg border border-border bg-surface-1 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.4),0_2px_6px_rgba(0,0,0,0.3)]">
      <h2 className="text-ink mb-4 text-sm font-bold tracking-tight text-balance">
        Hướng dẫn chuyển khoản
      </h2>

      {settingsLoading && (
        <div className="flex items-center justify-center py-6">
          <Spinner className="h-5 w-5 text-primary" />
        </div>
      )}

      {settingsError && (
        <div className="text-error border-error/30 bg-error/10 rounded-md border px-4 py-3 text-sm text-pretty">
          {settingsError}
        </div>
      )}

      {settingsReady && settings && (
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-md border border-border bg-canvas p-3 shadow-[0_1px_2px_rgba(0,0,0,0.4),0_2px_6px_rgba(0,0,0,0.3)]">
            <img
              src={buildQrUrl(settings, order.amount, note)}
              alt="QR chuyển khoản"
              width={224}
              height={224}
              className="img-outline h-56 w-56"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="w-full">
            <InfoRow
              label="Ngân hàng"
              value={bankName ?? settings.bank_id.toUpperCase()}
            />
            <InfoRow
              label="Số tài khoản"
              value={settings.account_no}
              copyable
            />
            <InfoRow
              label="Chủ tài khoản"
              value={settings.account_name}
              copyable
            />
            <InfoRow label="Nội dung CK" value={note} copyable />
          </div>
        </div>
      )}
    </div>
  );
};

const OrderNotFound: FC<{
  error: string | null;
  onBack: () => void;
}> = ({ error, onBack }) => (
  <ClientLayout>
    <div className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-6xl space-y-4">
        {error && (
          <div className="text-error border-error/30 bg-error/10 rounded-md border px-4 py-3 text-sm text-pretty">
            {error}
          </div>
        )}
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-ink-muted text-pretty">
            Không tìm thấy đơn hàng. Có thể liên kết đã hết hạn hoặc đơn đã bị
            xoá.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="border-border/50 hover:border-border hover:bg-white/5 inline-flex min-h-11 items-center gap-2 rounded-md border px-5 py-2 text-sm font-medium text-ink transition-colors duration-200 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
          >
            <ArrowLeftIcon size={16} />
            Quay lại
          </button>
        </div>
      </div>
    </div>
  </ClientLayout>
);

const OrderActions: FC<{
  refreshing: boolean;
  canRefresh: boolean;
  onBack: () => void;
  onRefresh: () => void;
}> = ({ refreshing, canRefresh, onBack, onRefresh }) => (
  <div className="flex flex-wrap items-center justify-center gap-3">
    <button
      type="button"
      onClick={onBack}
      className="border-border/50 hover:border-border hover:bg-white/5 inline-flex min-h-11 items-center gap-2 rounded-md border px-5 py-2 text-sm font-medium text-ink transition-colors duration-200 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
    >
      <ArrowLeftIcon size={16} />
      Quay lại
    </button>
    <button
      type="button"
      onClick={onRefresh}
      disabled={refreshing || !canRefresh}
      className="bg-primary hover:bg-primary-hover disabled:opacity-60 inline-flex min-h-11 items-center gap-2 rounded-md px-5 py-2 text-sm font-semibold text-white transition-[transform,background-color] duration-200 motion-safe:active:scale-[0.96] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
    >
      {refreshing ? <Spinner /> : <CircleNotchIcon size={16} />}
      Cập nhật trạng thái
    </button>
  </div>
);

const OrderSuccess: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId } = useParams();
  const state = location.state as OrderState | null;
  const trackingId = orderId ?? state?.order?.id ?? null;
  const hasInitialOrder = Boolean(state?.order);

  const { order, setOrder, orderLoading, error, setError } = useOrderData(
    orderId ?? null,
    state?.order,
  );
  const {
    settings,
    bankName,
    loading: settingsLoading,
    error: settingsError,
  } = usePaymentSettings();

  useEffect(() => {
    if (!trackingId && !hasInitialOrder) {
      navigate(routes.home, { replace: true });
    }
  }, [hasInitialOrder, navigate, trackingId]);

  useOrderPolling(
    trackingId,
    order?.status === 'completed',
    setOrder,
    setError,
  );

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(routes.home);
  };

  const [refreshing, setRefreshing] = useState(false);
  const refreshOrder = async () => {
    if (!trackingId || refreshing) return;
    setRefreshing(true);
    try {
      const data = await getOrder(trackingId);
      setOrder(toSummary(data));
      setError(null);
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setRefreshing(false);
    }
  };

  if (orderLoading) {
    return (
      <ClientLayout>
        <div className="flex min-h-dvh items-center justify-center">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      </ClientLayout>
    );
  }

  if (!order) {
    return <OrderNotFound error={error} onBack={handleBack} />;
  }

  const note = sanitizeNote(
    `DH ${order.id ? order.id.slice(0, 8) : ''} ${order.package_name}`,
  );

  return (
    <ClientLayout>
      <section className="px-6 py-16 md:px-12">
        <div className="mx-auto max-w-6xl space-y-4">
          {error && (
            <div
              className="text-error border-error/30 bg-error/10 rounded-md border px-4 py-3 text-sm text-pretty"
              role="status"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          <TrackingStatus order={order} />

          <div className="grid gap-4 md:grid-cols-2">
            <OrderInfoCard order={order} />
            <PaymentGuideCard
              order={order}
              settings={settings}
              settingsLoading={settingsLoading}
              settingsError={settingsError}
              bankName={bankName}
              note={note}
            />
          </div>

          <OrderActions
            refreshing={refreshing}
            canRefresh={Boolean(trackingId)}
            onBack={handleBack}
            onRefresh={refreshOrder}
          />
        </div>
      </section>
    </ClientLayout>
  );
};

export default OrderSuccess;
