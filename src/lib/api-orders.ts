import { supabase } from '@/lib/supabase';
import type { Tables, TablesInsert } from '@/lib/database.types';
import type { OrderStatus } from '@/types/orders';

export type { OrderStatus };

const ORDER_COLUMNS =
  'id, customer_email, package_id, package_name, amount, status, delivery_type, account_id, zalo_phone, created_at, paid_at, completed_at, cancelled_at';

const createOrder = async (
  payload: TablesInsert<'orders'>,
): Promise<Tables<'orders'>> => {
  const { data, error } = await supabase.rpc('create_public_order', {
    p_customer_email: payload.customer_email ?? null,
    p_delivery_type: payload.delivery_type ?? 'mail',
    p_package_id: payload.package_id ?? '',
    p_zalo_phone: payload.zalo_phone ?? null,
  });
  if (error) throw error;
  if (!data) throw new Error('Không thể tạo đơn hàng');
  return data;
};

const listOrders = async (): Promise<Tables<'orders'>[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_COLUMNS)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

const getOrder = async (id: string): Promise<Tables<'orders'>> => {
  const { data, error } = await supabase.rpc('get_public_order', {
    p_order_id: id,
  });
  if (error) throw error;
  if (!data) throw new Error('Không tìm thấy đơn hàng');
  return data;
};

const updateOrderStatus = async (
  id: string,
  status: OrderStatus,
  patch: Partial<
    Pick<
      Tables<'orders'>,
      'paid_at' | 'completed_at' | 'cancelled_at' | 'account_id'
    >
  > = {},
): Promise<Tables<'orders'>> => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, ...patch })
    .eq('id', id)
    .select(ORDER_COLUMNS)
    .single();
  if (error) throw error;
  return data;
};

const deleteOrder = async (id: string): Promise<void> => {
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) throw error;
};

export { createOrder, deleteOrder, getOrder, listOrders, updateOrderStatus };
