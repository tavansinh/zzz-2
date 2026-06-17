import type { AdminRole } from '@/types/admin';
import type { OrderStatus, AccountStatus } from '@/types/orders';

export type DeliveryType = 'auto' | 'zalo';

const deliveryLabel: Record<DeliveryType, string> = {
  auto: 'Tự động qua email',
  zalo: 'Giao qua Zalo',
};

const deliveryShortLabel: Record<DeliveryType, string> = {
  auto: 'Tự động',
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
  pending: 'border-warning/40 text-warning bg-warning/10',
  paid: 'border-primary/40 text-primary bg-primary/10',
  completed: 'border-success/40 text-success bg-success/10',
  awaiting_stock: 'border-info/40 text-info bg-info/10',
  cancelled: 'border-border text-ink-muted bg-ink-muted/10',
};

const statusDotClass: Record<OrderStatus, string> = {
  pending: 'bg-warning/10 text-warning',
  paid: 'bg-primary/10 text-primary',
  completed: 'bg-success/10 text-success',
  awaiting_stock: 'bg-info/10 text-info',
  cancelled: 'bg-ink-muted/10 text-ink-muted',
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
