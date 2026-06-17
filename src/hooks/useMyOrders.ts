import { useCallback } from 'react';
import { listMyOrders } from '@/lib/api-orders';
import useAsyncResource from '@/hooks/useAsyncResource';
import type { Tables } from '@/lib/database.types';

interface UseMyOrdersReturn {
  orders: Tables<'orders'>[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const useMyOrders = (userId: string | null): UseMyOrdersReturn => {
  const fetchData = useCallback(
    () => (userId ? listMyOrders(userId) : Promise.resolve([])),
    [userId],
  );
  const {
    data: orders,
    loading,
    error,
    refresh,
  } = useAsyncResource<Tables<'orders'>[]>(fetchData, []);

  return { orders, loading, error, refresh };
};

export default useMyOrders;
