import { useCallback } from 'react';
import {
  listAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  importAccountsFromText,
  countAvailableByPackage,
} from '@/lib/api-accounts';
import useAsyncResource from '@/hooks/useAsyncResource';
import type { Tables, TablesInsert } from '@/lib/database.types';

type ImportAccountsResult = {
  total: number;
  imported: number;
  skipped: number;
  errors: Array<{ line: number; reason: string }>;
};

interface UseAccountsAdminReturn {
  accounts: Tables<'accounts'>[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  addAccount: (payload: TablesInsert<'accounts'>) => Promise<void>;
  editAccount: (
    id: string,
    payload: Partial<TablesInsert<'accounts'>>,
  ) => Promise<void>;
  removeAccount: (id: string) => Promise<void>;
  importText: (
    serviceId: string,
    packageId: string,
    content: string,
  ) => Promise<ImportAccountsResult>;
  availableCountByPackage: () => Promise<Record<string, number>>;
}

const useAccountsAdmin = (): UseAccountsAdminReturn => {
  const fetchData = useCallback(async () => {
    return listAccounts();
  }, []);
  const {
    data: accounts,
    loading,
    error,
    refresh,
  } = useAsyncResource<Tables<'accounts'>[]>(fetchData, []);

  const addAccount = useCallback(
    async (payload: TablesInsert<'accounts'>) => {
      await createAccount(payload);
      await refresh();
    },
    [refresh],
  );

  const editAccount = useCallback(
    async (id: string, payload: Partial<TablesInsert<'accounts'>>) => {
      await updateAccount(id, payload);
      await refresh();
    },
    [refresh],
  );

  const removeAccount = useCallback(
    async (id: string) => {
      await deleteAccount(id);
      await refresh();
    },
    [refresh],
  );

  const importText = useCallback(
    async (
      serviceId: string,
      packageId: string,
      content: string,
    ): Promise<ImportAccountsResult> => {
      const raw = await importAccountsFromText(serviceId, packageId, content);
      const result: ImportAccountsResult = {
        total: raw.length,
        imported: 0,
        skipped: 0,
        errors: [],
      };
      raw.forEach((row) => {
        if (row.ok) {
          result.imported += 1;
        } else {
          result.skipped += 1;
          result.errors.push({
            line: row.line_number,
            reason: row.reason ?? 'unknown',
          });
        }
      });
      await refresh();
      return result;
    },
    [refresh],
  );

  const availableCountByPackage = useCallback(
    () => countAvailableByPackage(),
    [],
  );

  return {
    accounts,
    loading,
    error,
    refresh,
    addAccount,
    editAccount,
    removeAccount,
    importText,
    availableCountByPackage,
  };
};

export default useAccountsAdmin;
