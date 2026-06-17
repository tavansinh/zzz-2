import { supabase } from '@/lib/supabase';
import type { Tables, TablesInsert } from '@/lib/database.types';
import type { OrderStatus } from '@/types/orders';

export type { OrderStatus };

const ORDER_COLUMNS =
  'id, customer_email, user_id, package_id, package_name, amount, status, delivery_type, account_id, note, created_at, paid_at, completed_at, cancelled_at';

const createOrder = async (
  payload: TablesInsert<'orders'>,
): Promise<Tables<'orders'>> => {
  const { data, error } = await supabase
    .from('orders')
    .insert(payload)
    .select(ORDER_COLUMNS)
    .single();
  if (error) throw error;
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

const listMyOrders = async (userId: string): Promise<Tables<'orders'>[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

const getOrder = async (id: string): Promise<Tables<'orders'>> => {
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_COLUMNS)
    .eq('id', id)
    .single();
  if (error) throw error;
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

export {
  createOrder,
  deleteOrder,
  getOrder,
  listMyOrders,
  listOrders,
  updateOrderStatus,
};
