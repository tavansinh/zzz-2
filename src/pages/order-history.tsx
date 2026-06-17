import { useEffect, useState, type FC } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  ArrowRightIcon,
  ArrowsClockwiseIcon,
  ShoppingBagOpenIcon,
  ClockIcon,
} from '@phosphor-icons/react';
import ClientLayout from '@/components/layout/client-layout';
import { Button, Spinner } from '@/components/ui';
import type { Tables } from '@/lib/database.types';
import { useAuth } from '@/stores/auth';
import { formatDateFull, formatNumber } from '@/lib/format';
import {
  deliveryLabel,
  statusBadgeClass,
  statusHint,
  statusLabel,
} from '@/lib/labels';
import { routes } from '@/lib/routes';
import useMyOrders from '@/hooks/useMyOrders';
import type { OrderStatus } from '@/types/orders';
import type { DeliveryType } from '@/lib/labels';

const normalizeStatus = (status: string): OrderStatus => {
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

const OrderCard: FC<{ order: Tables<'orders'> }> = ({ order }) => {
  const status = normalizeStatus(order.status);

  return (
    <article className="group relative flex flex-col rounded-lg border border-border bg-surface-1 p-4 shadow-card transition-[box-shadow,border-color,transform] duration-200 ease-out hover:border-border/80 hover:shadow-[0_4px_16px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)] motion-safe:hover:-translate-y-0.5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-ink-muted mb-0.5 text-xs tabular-nums font-medium">
            Mã đơn <span className="font-mono">#{order.id.slice(0, 8)}</span>
          </p>
          <h3 className="text-ink truncate text-base font-bold tracking-tight text-balance">
            {order.package_name}
          </h3>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusBadgeClass[status]}`}
        >
          {statusLabel[status]}
        </span>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <span className="text-ink font-semibold tabular-nums text-sm">
          ₫{formatNumber(order.amount)}
        </span>
        <span className="text-ink-muted text-xs">·</span>
        <span className="text-ink-muted flex items-center gap-1 text-xs tabular-nums">
          <ClockIcon size={12} />
          {formatDateFull(order.created_at)}
        </span>
        <span className="text-ink-muted text-xs">·</span>
        <span className="text-ink-muted text-xs">
          {deliveryLabel[order.delivery_type as DeliveryType] ??
            order.delivery_type}
        </span>
      </div>

      <p className="text-ink-muted text-xs leading-relaxed text-pretty">
        {statusHint[status]}.
      </p>

      <Link
        to={routes.orderDetail(order.id)}
        className="text-primary hover:text-primary-hover mt-2 inline-flex items-center gap-1 self-start rounded text-xs font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
      >
        Chi tiết
        <ArrowRightIcon
          size={12}
          className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
        />
      </Link>
    </article>
  );
};

const OrderHistory: FC = () => {
  const navigate = useNavigate();
  const { user, accountType, isLoading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const { orders, loading, error, refresh } = useMyOrders(userId);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!userId) {
      navigate(routes.login, {
        replace: true,
        state: { from: routes.orderHistory },
      });
      return;
    }
    if (accountType === 'admin') {
      navigate(routes.admin, { replace: true });
    }
  }, [authLoading, accountType, navigate, userId]);

  const refreshOrders = async () => {
    if (!userId || refreshing) return;
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <ClientLayout>
        <div className="flex min-h-dvh items-center justify-center">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <section className="px-6 py-16 md:px-12">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-ink text-2xl font-bold tracking-tight text-balance">
              Lịch sử mua hàng
            </h1>
            <Button
              type="button"
              variant="outline"
              onClick={refreshOrders}
              disabled={refreshing}
              size="sm"
            >
              {refreshing ? <Spinner /> : <ArrowsClockwiseIcon size={14} />}
              Cập nhật
            </Button>
          </div>

          {error && (
            <div
              className="text-error border-error/30 bg-error/10 rounded-md border px-4 py-3 text-sm text-pretty"
              role="status"
              aria-live="polite"
            >
              {error.message}
            </div>
          )}

          {orders.length > 0 ? (
            <div className="grid gap-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="bg-surface-2 flex h-16 w-16 items-center justify-center rounded-full shadow-ring">
                <ShoppingBagOpenIcon size={28} className="text-ink-muted" />
              </div>
              <h2 className="text-ink text-2xl font-bold tracking-tight text-balance">
                Chưa có đơn hàng
              </h2>
              <p className="text-ink-muted mx-auto max-w-md text-sm leading-relaxed text-pretty">
                Khi bạn đặt mua gói dịch vụ, đơn hàng sẽ xuất hiện tại đây để
                bạn theo dõi lại bất cứ lúc nào.
              </p>
              <Link
                to={routes.home}
                className="bg-primary hover:bg-primary-hover inline-flex min-h-11 items-center justify-center rounded-md px-6 py-2 text-sm font-semibold text-white transition-[transform,background-color] duration-200 motion-safe:active:scale-[0.96] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
              >
                Xem gói đang bán
              </Link>
            </div>
          )}
        </div>
      </section>
    </ClientLayout>
  );
};

export default OrderHistory;
