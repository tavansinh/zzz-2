import { Button, Dialog, Field, Input, Spinner } from '@/components/ui';
import { createOrder } from '@/lib/api-orders';
import type { Tables } from '@/lib/database.types';
import { reportError } from '@/lib/report-error';
import { formatNumber } from '@/lib/format';
import { routes } from '@/lib/routes';
import { useAuth } from '@/stores/auth';
import { useToast } from '@/stores/toast';
import {
  CheckCircleIcon,
  EnvelopeIcon,
  SignInIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { useState, type FC, type SubmitEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';

interface OrderModalProps {
  pkg: Tables<'packages'> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface OrderFormProps {
  pkg: Tables<'packages'>;
  onClose: () => void;
}

const OrderForm: FC<OrderFormProps> = ({ pkg, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, accountType } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState(user?.email ?? '');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAuthenticated =
    !!user && (accountType === 'user' || accountType === 'admin');
  const noteRequired = pkg.delivery_type === 'zalo';

  const handleLoginRedirect = () => {
    onClose();
    navigate(routes.login, { state: { from: location.pathname } });
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !email.trim() || submitting) return;

    if (noteRequired && !note.trim()) {
      toast.error(
        'Thiếu số Zalo',
        'Vui lòng nhập số Zalo hoặc ghi chú liên hệ',
      );
      return;
    }

    setSubmitting(true);
    try {
      const order = await createOrder({
        customer_email: email.trim(),
        user_id: user!.id,
        package_id: pkg.id,
        package_name: pkg.name,
        amount: pkg.price,
        delivery_type: pkg.delivery_type,
        status: 'pending',
        note: note.trim() || null,
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
          },
        },
      });
    } catch (err) {
      reportError(toast, err, 'Đặt mua thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-4">
        <div className="border-border/50 bg-warning/10 text-ink flex items-start gap-3 rounded-md border p-3 text-sm text-pretty">
          <WarningCircleIcon
            size={20}
            weight="fill"
            className="text-warning shrink-0"
          />
          <div>
            Bạn cần đăng nhập hoặc tạo tài khoản để đặt mua gói này. Sau khi
            thanh toán, tài khoản sẽ được gửi qua email của bạn.
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button type="button" onClick={handleLoginRedirect}>
            <SignInIcon size={16} weight="bold" />
            Đăng nhập để mua
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field.Root>
        <Field.Label>Email nhận tài khoản</Field.Label>
        <div className="relative">
          <EnvelopeIcon
            size={18}
            className="text-ink-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
          />
          <Input
            type="email"
            required
            value={email}
            onValueChange={setEmail}
            placeholder="email@example.com"
            autoComplete="email"
            className="pl-10"
          />
        </div>
      </Field.Root>

      <Field.Root>
        <Field.Label>
          {noteRequired ? 'Số Zalo hoặc ghi chú' : 'Ghi chú (tuỳ chọn)'}
        </Field.Label>
        <Input
          value={note}
          onValueChange={setNote}
          required={noteRequired}
          placeholder={
            noteRequired
              ? 'Nhập số Zalo để admin giao tài khoản qua Zalo'
              : 'Yêu cầu thêm cho đơn hàng'
          }
        />
      </Field.Root>

      <div className="text-ink-muted flex items-start gap-2 text-xs leading-relaxed text-pretty">
        <CheckCircleIcon
          size={14}
          weight="fill"
          className="text-success mt-0.5 shrink-0"
        />
        <span>
          Sau khi đặt mua, bạn sẽ được chuyển sang trang hướng dẫn thanh toán
          chuyển khoản ngân hàng.
        </span>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={submitting}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={submitting || !email.trim()}>
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

const OrderModal: FC<OrderModalProps> = ({ pkg, open, onOpenChange }) => {
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

      <OrderForm key={pkg.id} pkg={pkg} onClose={handleClose} />
    </Dialog>
  );
};

export default OrderModal;
