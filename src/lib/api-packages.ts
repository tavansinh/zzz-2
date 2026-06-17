import { supabase } from '@/lib/supabase';
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/database.types';

const PACKAGE_COLUMNS =
  'id, service_id, name, description, price, duration_days, delivery_type, features, badge, is_active, sort_order, created_at, updated_at';

const getPackages = async (
  includeInactive = false,
): Promise<Tables<'packages'>[]> => {
  const query = supabase
    .from('packages')
    .select(PACKAGE_COLUMNS)
    .order('sort_order', { ascending: true })
    .order('price', { ascending: true });
  if (!includeInactive) {
    query.eq('is_active', true);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
};

const createPackage = async (
  payload: TablesInsert<'packages'>,
): Promise<Tables<'packages'>> => {
  const { data, error } = await supabase
    .from('packages')
    .insert(payload)
    .select(PACKAGE_COLUMNS)
    .single();
  if (error) throw error;
  return data;
};

const updatePackage = async (
  id: string,
  payload: TablesUpdate<'packages'>,
): Promise<Tables<'packages'>> => {
  const { data, error } = await supabase
    .from('packages')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(PACKAGE_COLUMNS)
    .single();
  if (error) throw error;
  return data;
};

const deletePackage = async (id: string): Promise<void> => {
  const { error } = await supabase.from('packages').delete().eq('id', id);
  if (error) throw error;
};

const togglePackageActive = async (
  id: string,
  isActive: boolean,
): Promise<Tables<'packages'>> => updatePackage(id, { is_active: isActive });

export {
  createPackage,
  deletePackage,
  getPackages,
  togglePackageActive,
  updatePackage,
};
