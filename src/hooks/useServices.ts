import { useCallback } from 'react';
import { listServices } from '@/lib/api-services';
import useAsyncResource from '@/hooks/useAsyncResource';
import type { Tables } from '@/lib/database.types';

interface UseServicesReturn {
  services: Tables<'services'>[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const useServices = (): UseServicesReturn => {
  const fetchData = useCallback(async () => {
    return listServices();
  }, []);
  const {
    data: services,
    loading,
    error,
    refresh,
  } = useAsyncResource<Tables<'services'>[]>(fetchData, []);

  return { services, loading, error, refresh };
};

export default useServices;
