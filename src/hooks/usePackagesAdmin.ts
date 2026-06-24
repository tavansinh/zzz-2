import { useCallback } from 'react';
import {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageActive,
} from '@/lib/api-packages';
import useAsyncResource from '@/hooks/useAsyncResource';
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/database.types';

interface UsePackagesAdminReturn {
  packages: Tables<'packages'>[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  addPackage: (payload: TablesInsert<'packages'>) => Promise<void>;
  editPackage: (id: string, payload: TablesUpdate<'packages'>) => Promise<void>;
  removePackage: (id: string) => Promise<void>;
  setActive: (id: string, isActive: boolean) => Promise<void>;
}

const usePackagesAdmin = (): UsePackagesAdminReturn => {
  const fetchPackages = useCallback(async () => {
    return getPackages(true);
  }, []);
  const {
    data: packages,
    loading,
    error,
    refresh,
  } = useAsyncResource<Tables<'packages'>[]>(fetchPackages, []);

  const addPackage = useCallback(
    async (payload: TablesInsert<'packages'>) => {
      await createPackage(payload);
      await refresh();
    },
    [refresh],
  );

  const editPackage = useCallback(
    async (id: string, payload: TablesUpdate<'packages'>) => {
      await updatePackage(id, payload);
      await refresh();
    },
    [refresh],
  );

  const removePackage = useCallback(
    async (id: string) => {
      await deletePackage(id);
      await refresh();
    },
    [refresh],
  );

  const setActive = useCallback(
    async (id: string, isActive: boolean) => {
      await togglePackageActive(id, isActive);
      await refresh();
    },
    [refresh],
  );

  return {
    packages,
    loading,
    error,
    refresh,
    addPackage,
    editPackage,
    removePackage,
    setActive,
  };
};

export default usePackagesAdmin;
