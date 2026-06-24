import { useCallback } from 'react';
import {
  listServices,
  createService,
  updateService,
  deleteService,
  toggleServiceActive,
} from '@/lib/api-services';
import useAsyncResource from '@/hooks/useAsyncResource';
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/database.types';

interface UseServicesAdminReturn {
  services: Tables<'services'>[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  addService: (payload: TablesInsert<'services'>) => Promise<void>;
  editService: (id: string, payload: TablesUpdate<'services'>) => Promise<void>;
  removeService: (id: string) => Promise<void>;
  setActive: (id: string, isActive: boolean) => Promise<void>;
}

const useServicesAdmin = (): UseServicesAdminReturn => {
  const fetchServices = useCallback(async () => {
    return listServices(true);
  }, []);
  const {
    data: services,
    loading,
    error,
    refresh,
  } = useAsyncResource<Tables<'services'>[]>(fetchServices, []);

  const addService = useCallback(
    async (payload: TablesInsert<'services'>) => {
      await createService(payload);
      await refresh();
    },
    [refresh],
  );

  const editService = useCallback(
    async (id: string, payload: TablesUpdate<'services'>) => {
      await updateService(id, payload);
      await refresh();
    },
    [refresh],
  );

  const removeService = useCallback(
    async (id: string) => {
      await deleteService(id);
      await refresh();
    },
    [refresh],
  );

  const setActive = useCallback(
    async (id: string, isActive: boolean) => {
      await toggleServiceActive(id, isActive);
      await refresh();
    },
    [refresh],
  );

  return {
    services,
    loading,
    error,
    refresh,
    addService,
    editService,
    removeService,
    setActive,
  };
};

export default useServicesAdmin;
