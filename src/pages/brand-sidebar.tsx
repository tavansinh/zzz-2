import type { FC } from 'react';
import {
  PlayCircleIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
} from '@phosphor-icons/react';

const features = [
  { icon: ShoppingCartIcon, text: 'Mua tài khoản dịch vụ nhanh chóng' },
  { icon: PlayCircleIcon, text: 'Sử dụng ngay trên mọi thiết bị' },
  { icon: ShieldCheckIcon, text: 'Tra cứu lịch sử đơn hàng' },
] as const;

const BrandSidebar: FC = () => {
  return (
    <div className="hidden md:block">
      <h1 className="text-ink mb-4 text-4xl font-bold tracking-tight text-balance md:text-5xl">
        4K PREMIUM
      </h1>
      <p className="text-ink-muted mb-10 max-w-md text-sm leading-relaxed text-pretty">
        Cung cấp tài khoản các dịch vụ phổ biến — hỗ trợ 24/7. Giá tốt nhất thị
        trường Việt Nam.
      </p>
      <ul className="flex flex-col gap-4">
        {features.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3">
            <div className="bg-surface-2 flex h-9 w-9 items-center justify-center rounded-lg">
              <Icon size={18} weight="fill" className="text-ink-muted" />
            </div>
            <span className="text-ink text-sm text-pretty">{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BrandSidebar;
