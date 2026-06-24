import { supabase } from '@/lib/supabase';
import type { Tables, TablesInsert } from '@/lib/database.types';
import type { AccountStatus } from '@/types/orders';

const ACCOUNT_COLUMNS =
  'id, service_id, package_id, email, password, status, used_at, used_order, created_at, updated_at';

const listAccounts = async (): Promise<Tables<'accounts'>[]> => {
  const { data, error } = await supabase
    .from('accounts')
    .select(ACCOUNT_COLUMNS)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

const createAccount = async (
  payload: TablesInsert<'accounts'>,
): Promise<Tables<'accounts'>> => {
  const { data, error } = await supabase
    .from('accounts')
    .insert(payload)
    .select(ACCOUNT_COLUMNS)
    .single();
  if (error) throw error;
  return data;
};

const updateAccount = async (
  id: string,
  payload: Partial<TablesInsert<'accounts'>>,
): Promise<Tables<'accounts'>> => {
  const { data, error } = await supabase
    .from('accounts')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(ACCOUNT_COLUMNS)
    .single();
  if (error) throw error;
  return data;
};

const deleteAccount = async (id: string): Promise<void> => {
  const { error } = await supabase.from('accounts').delete().eq('id', id);
  if (error) throw error;
};

const getAvailableAccount = async (
  packageId: string,
): Promise<Tables<'accounts'> | null> => {
  const { data, error } = await supabase
    .from('accounts')
    .select(ACCOUNT_COLUMNS)
    .eq('package_id', packageId)
    .eq('status', 'available')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
};

const markAccountUsed = async (
  id: string,
  orderId: string,
): Promise<Tables<'accounts'>> => {
  const { data, error } = await supabase
    .from('accounts')
    .update({
      status: 'used' as AccountStatus,
      used_at: new Date().toISOString(),
      used_order: orderId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(ACCOUNT_COLUMNS)
    .single();
  if (error) throw error;
  return data;
};

const releaseAccount = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('accounts')
    .update({
      status: 'available' as AccountStatus,
      used_at: null,
      used_order: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw error;
};

const countAvailableByPackage = async (): Promise<Record<string, number>> => {
  const { data, error } = await supabase.rpc('count_available_by_package');
  if (error) throw error;
  const map: Record<string, number> = {};
  (data ?? []).forEach((row) => {
    if (!row.package_id) return;
    map[row.package_id] = Number(row.available_count ?? 0);
  });
  return map;
};

const importAccountsFromText = async (
  serviceId: string,
  packageId: string,
  content: string,
): Promise<
  Array<{
    line_number: number;
    email: string | null;
    ok: boolean;
    reason: string | null;
  }>
> => {
  const { data, error } = await supabase.rpc('import_accounts', {
    p_service_id: serviceId,
    p_package_id: packageId,
    p_content: content,
  });
  if (error) throw error;
  return (data ?? []) as Array<{
    line_number: number;
    email: string | null;
    ok: boolean;
    reason: string | null;
  }>;
};

export {
  countAvailableByPackage,
  createAccount,
  deleteAccount,
  getAvailableAccount,
  importAccountsFromText,
  listAccounts,
  markAccountUsed,
  releaseAccount,
  updateAccount,
};
