export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'completed'
  | 'awaiting_stock'
  | 'cancelled';

export type OrderEmailKind =
  | 'payment_received'
  | 'account_delivery'
  | 'manual_completed';

export type AccountStatus = 'available' | 'used';
