import { supabase } from '@/lib/supabase';
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/database.types';

const SERVICE_COLUMNS =
  'id, name, sort_order, is_active, created_at, updated_at';

const listServices = async (
  includeInactive = false,
): Promise<Tables<'services'>[]> => {
  const query = supabase
    .from('services')
    .select(SERVICE_COLUMNS)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });
  if (!includeInactive) {
    query.eq('is_active', true);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
};

const createService = async (
  payload: TablesInsert<'services'>,
): Promise<Tables<'services'>> => {
  const { data, error } = await supabase
    .from('services')
    .insert(payload)
    .select(SERVICE_COLUMNS)
    .single();
  if (error) throw error;
  return data;
};

const updateService = async (
  id: string,
  payload: TablesUpdate<'services'>,
): Promise<Tables<'services'>> => {
  const { data, error } = await supabase
    .from('services')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(SERVICE_COLUMNS)
    .single();
  if (error) throw error;
  return data;
};

const deleteService = async (id: string): Promise<void> => {
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw error;
};

const toggleServiceActive = async (
  id: string,
  isActive: boolean,
): Promise<Tables<'services'>> => updateService(id, { is_active: isActive });

export {
  createService,
  deleteService,
  listServices,
  toggleServiceActive,
  updateService,
};
