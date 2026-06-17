import { useCallback } from 'react';
import {
  listOrders,
  updateOrderStatus,
  deleteOrder,
  type OrderStatus,
} from '@/lib/api-orders';
import {
  getAvailableAccount,
  markAccountUsed,
  releaseAccount,
} from '@/lib/api-accounts';
import { sendOrderEmail } from '@/lib/api-email';
import useAsyncResource from '@/hooks/useAsyncResource';
import type { Tables } from '@/lib/database.types';

type OrderStatusPatch = Partial<
  Pick<
    Tables<'orders'>,
    'paid_at' | 'completed_at' | 'cancelled_at' | 'account_id'
  >
>;

interface UseOrdersAdminReturn {
  orders: Tables<'orders'>[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  approve: (id: string) => Promise<void>;
  complete: (id: string) => Promise<void>;
  cancel: (id: string) => Promise<void>;
  retryDelivery: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const reserveAccount = async (order: Tables<'orders'>): Promise<string> => {
  if (order.account_id) return order.account_id;
  if (!order.package_id) {
    throw new Error('Đơn hàng chưa có gói hợp lệ');
  }
  const account = await getAvailableAccount(order.package_id);
  if (!account) throw new Error('Hết tài khoản cho gói này');
  await markAccountUsed(account.id, order.id);
  return account.id;
};

const useOrdersAdmin = (): UseOrdersAdminReturn => {
  const fetchData = useCallback(async () => {
    return listOrders();
  }, []);
  const {
    data: orders,
    setData: setOrders,
    loading,
    error,
    refresh,
  } = useAsyncResource<Tables<'orders'>[]>(fetchData, []);

  const setStatus = useCallback(
    async (id: string, status: OrderStatus, patch: OrderStatusPatch = {}) => {
      return updateOrderStatus(id, status, patch);
    },
    [],
  );

  const replaceOrder = useCallback(
    (updated: Tables<'orders'>) => {
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    },
    [setOrders],
  );

  const fulfillAutoOrder = useCallback(
    async (order: Tables<'orders'>, now: string) => {
      const accountId = await reserveAccount(order);
      try {
        const paid = await setStatus(order.id, 'paid', {
          paid_at: order.paid_at ?? now,
          account_id: accountId,
        });
        replaceOrder(paid);

        try {
          await sendOrderEmail(paid.id, 'account_delivery');
        } catch (err) {
          const reverted = await setStatus(order.id, 'pending', {
            paid_at: null,
            account_id: null,
          });
          replaceOrder(reverted);
          await releaseAccount(accountId);
          throw err;
        }

        try {
          const completed = await setStatus(order.id, 'completed', {
            completed_at: now,
          });
          replaceOrder(completed);
        } catch (err) {
          console.warn('err marking auto order completed', order.id, err);
        }
      } catch (err) {
        await releaseAccount(accountId);
        throw err;
      }
    },
    [replaceOrder, setStatus],
  );

  const markPaidZalo = useCallback(
    async (order: Tables<'orders'>, now: string) => {
      const paid = await setStatus(order.id, 'paid', { paid_at: now });
      replaceOrder(paid);
      await sendOrderEmail(paid.id, 'payment_received');
    },
    [replaceOrder, setStatus],
  );

  const completeZalo = useCallback(
    async (order: Tables<'orders'>, now: string) => {
      const completed = await setStatus(order.id, 'completed', {
        completed_at: now,
      });
      replaceOrder(completed);
      await sendOrderEmail(completed.id, 'manual_completed');
    },
    [replaceOrder, setStatus],
  );

  const runWithAutoOrZalo = useCallback(
    async (
      id: string,
      auto: (order: Tables<'orders'>, now: string) => Promise<void>,
      zalo: (order: Tables<'orders'>, now: string) => Promise<void>,
    ) => {
      const found = orders.find((o) => o.id === id);
      if (!found) throw new Error('Không tìm thấy đơn hàng');
      const now = new Date().toISOString();
      const handler = found.delivery_type === 'auto' ? auto : zalo;
      try {
        await handler(found, now);
      } finally {
        await refresh();
      }
    },
    [orders, refresh],
  );

  const approve = useCallback(
    (id: string) => runWithAutoOrZalo(id, fulfillAutoOrder, markPaidZalo),
    [fulfillAutoOrder, markPaidZalo, runWithAutoOrZalo],
  );

  const complete = useCallback(
    (id: string) => runWithAutoOrZalo(id, fulfillAutoOrder, completeZalo),
    [completeZalo, fulfillAutoOrder, runWithAutoOrZalo],
  );

  const cancel = useCallback(
    async (id: string) => {
      const found = orders.find((o) => o.id === id);
      if (!found) throw new Error('Không tìm thấy đơn hàng');
      const now = new Date().toISOString();
      const cancelled = await setStatus(found.id, 'cancelled', {
        cancelled_at: now,
      });
      replaceOrder(cancelled);
      if (found.account_id) await releaseAccount(found.account_id);
      await refresh();
    },
    [orders, refresh, replaceOrder, setStatus],
  );

  const retryDelivery = useCallback(
    async (id: string) => {
      const found = orders.find((o) => o.id === id);
      if (!found) throw new Error('Không tìm thấy đơn hàng');
      if (found.delivery_type !== 'auto') {
        throw new Error('Chỉ hỗ trợ giao lại cho gói tự động');
      }
      const now = new Date().toISOString();
      const statusUpdate = setStatus(found.id, 'paid', {
        paid_at: now,
        account_id: null,
      });
      if (found.account_id) {
        await Promise.all([releaseAccount(found.account_id), statusUpdate]);
      } else {
        await statusUpdate;
      }
      await Promise.all([
        refresh(),
        fulfillAutoOrder(
          {
            ...found,
            account_id: null,
            status: 'paid',
            paid_at: now,
          },
          now,
        ),
      ]);
      await refresh();
    },
    [fulfillAutoOrder, orders, refresh, setStatus],
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteOrder(id);
      await refresh();
    },
    [refresh],
  );

  return {
    orders,
    loading,
    error,
    refresh,
    approve,
    complete,
    cancel,
    retryDelivery,
    remove,
  };
};

export default useOrdersAdmin;
