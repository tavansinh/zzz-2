import { Spinner } from '@/components/ui';
import useOrdersAdmin from '@/hooks/useOrdersAdmin';
import { formatDateShortWithTime, formatVnd } from '@/lib/format';
import { roleLabel, statusDotClass, statusLabel } from '@/lib/labels';
import { routes } from '@/lib/routes';
import { useAuth } from '@/stores/auth';
import type { OrderStatus } from '@/types/orders';
import
  {
    CircleNotchIcon,
    CurrencyDollarIcon,
    ShoppingCartIcon,
    TrendUpIcon,
  } from '@phosphor-icons/react';
import { type FC, useMemo } from 'react';
import { Link } from 'react-router';

const AdminDashboard: FC = () => {
  const { user, adminRole } = useAuth();
  const { orders, loading, error } = useOrdersAdmin();

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'pending').length;
    const paid = orders.filter((o) => o.status === 'paid').length;
    const awaiting = orders.filter((o) => o.status === 'awaiting_stock').length;
    const completed = orders.filter((o) => o.status === 'completed').length;
    const revenue = orders
      .filter((o) => o.status === 'completed')
      .reduce((sum, o) => sum + o.amount, 0);
    return { total, pending, paid, awaiting, completed, revenue };
  }, [orders]);

  const recent = useMemo(() => orders.slice(0, 5), [orders]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-balance">
          Dashboard
        </h1>
        <p className="text-ink-muted mt-1 text-sm text-pretty">
          Xin chào, {user?.email} —{' '}
          <span className="text-primary font-medium">
            {adminRole ? roleLabel[adminRole] : ''}
          </span>
        </p>
      </div>

      {error && (
        <p
          className="text-error mb-4 text-sm text-pretty"
          role="status"
          aria-live="polite"
        >
          Lỗi: {error.message}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Tổng đơn"
          value={stats.total.toString()}
          icon={<ShoppingCartIcon size={20} weight="fill" />}
        />
        <StatCard
          label={statusLabel.pending}
          value={stats.pending.toString()}
          icon={<CircleNotchIcon size={20} weight="fill" />}
          accent={stats.pending > 0 ? 'warning' : 'muted'}
        />
        <StatCard
          label={statusLabel.awaiting_stock}
          value={stats.awaiting.toString()}
          icon={<TrendUpIcon size={20} weight="fill" />}
          accent={stats.awaiting > 0 ? 'info' : 'muted'}
        />
        <StatCard
          label="Doanh thu"
          value={formatVnd(stats.revenue)}
          icon={<CurrencyDollarIcon size={20} weight="fill" />}
          accent="success"
        />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-ink text-base font-semibold tracking-tight text-balance">
            Đơn gần đây
          </h2>
          <Link
            to={routes.adminOrders}
            className="text-ink-muted hover:text-ink rounded text-xs transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
          >
            Xem tất cả →
          </Link>
        </div>

        <div className="bg-surface-1 border-border/50 overflow-hidden rounded-lg border shadow-card">
          {recent.length === 0 ? (
            <div className="text-ink-muted py-12 text-center text-sm text-pretty">
              Chưa có đơn hàng nào
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {recent.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="text-ink truncate text-sm font-medium text-pretty">
                      {order.customer_email}
                    </div>
                    <div className="text-ink-muted mt-0.5 text-xs tabular-nums">
                      {order.package_name} ·{' '}
                      {formatDateShortWithTime(order.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-ink text-sm font-semibold tabular-nums">
                      {formatVnd(order.amount)}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusDotClass[order.status as OrderStatus] ?? 'bg-ink-muted/10 text-ink-muted'}`}
                    >
                      {statusLabel[order.status as OrderStatus] ?? order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard: FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: 'success' | 'warning' | 'info' | 'muted';
}> = ({ label, value, icon, accent }) => {
  const accentClass = {
    success: 'text-success',
    warning: 'text-warning',
    info: 'text-info',
    muted: 'text-ink-muted',
  }[accent ?? 'muted'];

  return (
    <div className="bg-surface-1 border-border/50 rounded-lg border p-5 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-ink-muted text-xs font-medium">{label}</p>
        <div className={accentClass}>{icon}</div>
      </div>
      <p className="text-ink text-2xl font-bold tracking-tight tabular-nums text-balance">
        {value}
      </p>
    </div>
  );
};

export default AdminDashboard;
