import { supabase } from '@/lib/supabase';
import type { OrderEmailKind } from '@/types/orders';

const sendOrderEmail = async (
  orderId: string,
  kind: OrderEmailKind,
): Promise<void> => {
  const { error } = await supabase.functions.invoke('send-order-email', {
    body: { orderId, kind },
  });
  if (error) throw error;
};

export { sendOrderEmail };
