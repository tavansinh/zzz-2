import { supabase } from '@/lib/supabase';
import type { Tables, TablesUpdate } from '@/lib/database.types';
import type { AdminRole } from '@/types/admin';

export type { AdminRole };

const ADMIN_COLUMNS =
  'id, email, role, is_active, is_protected, created_by, created_at, updated_at';

const listStaff = async (): Promise<Tables<'admin_users'>[]> => {
  const { data, error } = await supabase
    .from('admin_users')
    .select(ADMIN_COLUMNS)
    .eq('role', 'staff')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

const addStaff = async (email: string): Promise<void> => {
  const { error } = await supabase.rpc('add_existing_staff', {
    staff_email: email,
  });
  if (error) throw error;
};

const updateAdmin = async (
  id: string,
  payload: TablesUpdate<'admin_users'>,
): Promise<Tables<'admin_users'>> => {
  const { data, error } = await supabase
    .from('admin_users')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(ADMIN_COLUMNS)
    .single();
  if (error) throw error;
  return data;
};

const setAdminRole = async (
  id: string,
  role: AdminRole,
): Promise<Tables<'admin_users'>> => updateAdmin(id, { role });

const setAdminActive = async (
  id: string,
  isActive: boolean,
): Promise<Tables<'admin_users'>> => updateAdmin(id, { is_active: isActive });

const removeStaff = async (id: string): Promise<void> => {
  const { error } = await supabase.from('admin_users').delete().eq('id', id);
  if (error) throw error;
};

export { addStaff, listStaff, removeStaff, setAdminActive, setAdminRole };
