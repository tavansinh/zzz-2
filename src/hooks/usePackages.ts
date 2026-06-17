import { useCallback } from 'react';
import { getPackages } from '@/lib/api-packages';
import useAsyncResource from '@/hooks/useAsyncResource';
import type { Tables } from '@/lib/database.types';

interface UsePackagesReturn {
  packages: Tables<'packages'>[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const usePackages = (): UsePackagesReturn => {
  const fetchData = useCallback(async () => {
    return getPackages();
  }, []);
  const {
    data: packages,
    loading,
    error,
    refresh,
  } = useAsyncResource<Tables<'packages'>[]>(fetchData, []);

  return { packages, loading, error, refresh };
};

export default usePackages;
