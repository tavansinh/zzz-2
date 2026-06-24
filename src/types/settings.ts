import type { Tables } from '@/lib/database.types';

export type SettingsPayload = Pick<
  Tables<'settings'>,
  'bank_id' | 'account_no' | 'account_name' | 'template'
>;
