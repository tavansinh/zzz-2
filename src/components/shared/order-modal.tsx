import { Button, Dialog, Field, Input, Spinner } from '@/components/ui';
import { createOrder } from '@/lib/api-orders';
import type { Tables } from '@/lib/database.types';
import { reportError } from '@/lib/report-error';
import { formatNumber } from '@/lib/format';
import { routes } from '@/lib/routes';
import { useToast } from '@/stores/toast';
import { ChatsCircleIcon, EnvelopeIcon } from '@phosphor-icons/react';
import { useState, type FC, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router';
import type { DeliveryType } from '@/lib/labels';

interface OrderModalProps {
  pkg: Tables<'packages'> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mailAvailable: boolean;
}

interface OrderFormProps {
  pkg: Tables<'packages'>;
  onClose: () => void;
  mailAvailable: boolean;
}

const OrderForm: FC<OrderFormProps> = ({ pkg, onClose, mailAvailable }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(
    mailAvailable ? 'mail' : 'zalo',
  );
  const [zaloPhone, setZaloPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isZaloDelivery = deliveryType === 'zalo';

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (deliveryType === 'mail' && !mailAvailable) {
      toast.error('Mail tạm hết hàng', 'Vui lòng chọn giao qua Zalo');
      return;
    }

    if (deliveryType === 'mail' && !email.trim()) {
      toast.error('Thiếu email', 'Vui lòng nhập email để nhận tài khoản');
      return;
    }

    if (isZaloDelivery && !zaloPhone.trim()) {
      toast.error(
        'Thiếu số Zalo',
        'Vui lòng nhập số Zalo để admin giao tài khoản',
      );
      return;
    }

    setSubmitting(true);
    try {
      const order = await createOrder({
        customer_email: isZaloDelivery ? null : email.trim(),
        package_id: pkg.id,
        package_name: pkg.name,
        amount: pkg.price,
        delivery_type: deliveryType,
        status: 'pending',
        zalo_phone: isZaloDelivery ? zaloPhone.trim() : null,
      });
      toast.success(
        'Đặt mua thành công',
        'Chuyển sang trang hướng dẫn thanh toán',
      );
      onClose();
      navigate(routes.orderDetail(order.id), {
        state: {
          order: {
            id: order.id,
            packageName: order.package_name,
            amount: order.amount,
            email: order.customer_email,
            delivery_type: order.delivery_type,
            zalo_phone: order.zalo_phone,
          },
        },
      });
    } catch (err) {
      reportError(toast, err, 'Đặt mua thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field.Root>
        <Field.Label>Hình thức giao hàng</Field.Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={!mailAvailable}
            aria-pressed={deliveryType === 'mail'}
            onClick={() => setDeliveryType('mail')}
            className={`border-border bg-surface-1 text-ink flex min-h-11 items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50 ${
              deliveryType === 'mail'
                ? 'border-primary bg-primary/10'
                : 'hover:border-border/80'
            }`}
          >
            <EnvelopeIcon size={18} className="shrink-0" aria-hidden="true" />
            <span>
              <span className="block font-medium">Giao qua mail</span>
              <span className="text-ink-muted block text-xs">
                {mailAvailable ? 'Tự động sau khi duyệt' : 'Tạm hết hàng'}
              </span>
            </span>
          </button>
          <button
            type="button"
            aria-pressed={deliveryType === 'zalo'}
            onClick={() => setDeliveryType('zalo')}
            className={`border-border bg-surface-1 text-ink flex min-h-11 items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white ${
              deliveryType === 'zalo'
                ? 'border-primary bg-primary/10'
                : 'hover:border-border/80'
            }`}
          >
            <ChatsCircleIcon
              size={18}
              className="shrink-0"
              aria-hidden="true"
            />
            <span>
              <span className="block font-medium">Giao qua Zalo</span>
              <span className="text-ink-muted block text-xs">
                Admin liên hệ và giao thủ công
              </span>
            </span>
          </button>
        </div>
      </Field.Root>

      {!isZaloDelivery && (
        <Field.Root>
          <Field.Label>Email nhận tài khoản</Field.Label>
          <div className="relative">
            <EnvelopeIcon
              size={18}
              aria-hidden="true"
              className="text-ink-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            />
            <Input
              name="customer_email"
              type="email"
              required
              value={email}
              onValueChange={setEmail}
              placeholder="nhập email của bạn"
              autoComplete="email"
              spellCheck={false}
              className="pl-10"
            />
          </div>
        </Field.Root>
      )}

      {isZaloDelivery && (
        <Field.Root>
          <Field.Label>Số Zalo</Field.Label>
          <Input
            name="zalo_phone"
            type="tel"
            required
            value={zaloPhone}
            onValueChange={setZaloPhone}
            placeholder="nhập số Zalo của bạn"
            autoComplete="tel"
            inputMode="tel"
          />
        </Field.Root>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={submitting}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={
            submitting || (isZaloDelivery ? !zaloPhone.trim() : !email.trim())
          }
        >
          {submitting ? (
            <>
              <Spinner /> Đang xử lý…
            </>
          ) : (
            'Xác nhận đặt mua'
          )}
        </Button>
      </div>
    </form>
  );
};

const OrderModal: FC<OrderModalProps> = ({
  pkg,
  open,
  onOpenChange,
  mailAvailable,
}) => {
  if (!pkg || !open) return null;

  const handleClose = () => onOpenChange(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => !o && handleClose()}
      title="Đặt mua gói dịch vụ"
      description="Xác nhận để hoàn tất đặt mua"
    >
      <div className="border-border/50 bg-canvas mb-4 rounded-md border p-4">
        <p className="text-ink-muted mb-1 text-xs">Gói đã chọn</p>
        <p className="text-ink text-base font-semibold text-balance">
          {pkg.name}
        </p>
        <p className="text-ink mt-1 text-2xl font-bold tabular-nums">
          ₫{formatNumber(pkg.price)}
          <span className="text-ink-muted ml-1 text-xs font-normal">
            / {pkg.duration_days} ngày
          </span>
        </p>
      </div>

      <OrderForm
        key={`${pkg.id}-${mailAvailable ? 'mail' : 'zalo'}`}
        pkg={pkg}
        onClose={handleClose}
        mailAvailable={mailAvailable}
      />
    </Dialog>
  );
};

export default OrderModal;
