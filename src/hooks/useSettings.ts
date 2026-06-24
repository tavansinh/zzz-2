import { useCallback } from 'react';
import { getSettings, saveSettings } from '@/lib/api-settings';
import useAsyncResource from '@/hooks/useAsyncResource';
import type { Tables } from '@/lib/database.types';
import type { SettingsPayload } from '@/types/settings';

interface UseSettingsReturn {
  settings: Tables<'settings'> | null;
  loading: boolean;
  error: Error | null;
  save: (payload: SettingsPayload) => Promise<void>;
  refresh: () => Promise<void>;
}

const useSettings = (): UseSettingsReturn => {
  const fetchData = useCallback(async () => {
    return getSettings();
  }, []);
  const {
    data: settings,
    setData: setSettings,
    loading,
    error,
    refresh,
  } = useAsyncResource<Tables<'settings'> | null>(fetchData, null);

  const save = useCallback(
    async (payload: SettingsPayload) => {
      const data = await saveSettings(payload);
      setSettings(data);
    },
    [setSettings],
  );

  return { settings, loading, error, save, refresh };
};

export default useSettings;
