import { useCallback } from 'react';
import {
  listStaff,
  setAdminRole,
  setAdminActive,
  removeStaff,
  type AdminRole,
} from '@/lib/api-admin-users';
import useAsyncResource from '@/hooks/useAsyncResource';
import type { Tables } from '@/lib/database.types';

interface UseAdminsAdminReturn {
  staff: Tables<'admin_users'>[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  setRole: (id: string, role: AdminRole) => Promise<void>;
  setActive: (id: string, isActive: boolean) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const useAdminsAdmin = (): UseAdminsAdminReturn => {
  const fetchData = useCallback(async () => {
    return listStaff();
  }, []);
  const {
    data: staff,
    loading,
    error,
    refresh,
  } = useAsyncResource<Tables<'admin_users'>[]>(fetchData, []);

  const setRole = useCallback(
    async (id: string, role: AdminRole) => {
      await setAdminRole(id, role);
      await refresh();
    },
    [refresh],
  );

  const setActive = useCallback(
    async (id: string, isActive: boolean) => {
      await setAdminActive(id, isActive);
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await removeStaff(id);
      await refresh();
    },
    [refresh],
  );

  return { staff, loading, error, refresh, setRole, setActive, remove };
};

export default useAdminsAdmin;
