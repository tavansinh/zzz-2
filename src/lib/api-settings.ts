import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/database.types';
import type { SettingsPayload } from '@/types/settings';

const SETTINGS_COLUMNS = 'id, bank_id, account_no, account_name, template';

const getSettings = async (): Promise<Tables<'settings'> | null> => {
  const { data, error } = await supabase
    .from('settings')
    .select(SETTINGS_COLUMNS)
    .eq('id', true)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
};

const saveSettings = async (
  payload: SettingsPayload,
): Promise<Tables<'settings'>> => {
  const { data, error } = await supabase
    .from('settings')
    .upsert({ id: true, ...payload }, { onConflict: 'id' })
    .select(SETTINGS_COLUMNS)
    .single();
  if (error) throw error;
  return data;
};

export { getSettings, saveSettings };
