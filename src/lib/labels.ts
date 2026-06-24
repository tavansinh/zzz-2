import type { AdminRole } from '@/types/admin';
import type { OrderStatus, AccountStatus } from '@/types/orders';

export type DeliveryType = 'mail' | 'zalo';

const deliveryLabel: Record<DeliveryType, string> = {
  mail: 'Giao qua mail',
  zalo: 'Giao qua Zalo',
};

const deliveryShortLabel: Record<DeliveryType, string> = {
  mail: 'Mail',
  zalo: 'Giao qua Zalo',
};

const statusLabel: Record<OrderStatus, string> = {
  pending: 'Chờ thanh toán',
  paid: 'Đã nhận tiền',
  completed: 'Hoàn thành',
  awaiting_stock: 'Chờ hàng',
  cancelled: 'Đã hủy',
};

const statusHint: Record<OrderStatus, string> = {
  pending: 'Đang chờ khách chuyển khoản',
  paid: 'Admin đang xử lý giao tài khoản',
  completed: 'Đơn hàng đã được xử lý xong',
  awaiting_stock: 'Đang chờ nhập thêm tài khoản cho gói này',
  cancelled: 'Đơn hàng đã bị hủy',
};

const statusBadgeClass: Record<OrderStatus, string> = {
  pending: 'border-warning/40 bg-warning/10 text-ink',
  paid: 'border-primary/40 bg-primary/10 text-ink',
  completed: 'border-success/40 bg-success/10 text-ink',
  awaiting_stock: 'border-info/40 bg-info/10 text-ink',
  cancelled: 'border-border bg-ink-muted/10 text-ink-muted',
};

const statusDotClass: Record<OrderStatus, string> = {
  pending: 'bg-warning/15',
  paid: 'bg-primary/15',
  completed: 'bg-success/15',
  awaiting_stock: 'bg-info/15',
  cancelled: 'bg-ink-muted/15',
};

const accountStatusLabel: Record<AccountStatus, string> = {
  available: 'Khả dụng',
  used: 'Đã dùng',
};

const roleLabel: Record<AdminRole, string> = {
  admin: 'Admin',
  staff: 'Nhân viên',
};

export {
  accountStatusLabel,
  deliveryLabel,
  deliveryShortLabel,
  roleLabel,
  statusBadgeClass,
  statusDotClass,
  statusHint,
  statusLabel,
};
