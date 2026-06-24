import capcutIcon from '@/assets/images/capcut.ico';
import heroImage from '@/assets/images/hero-image.png';
import netflixIcon from '@/assets/images/netflix.ico';
import youtubeIcon from '@/assets/images/youtube.ico';
import ClientLayout from '@/components/layout/client-layout';
import OrderModal from '@/components/shared/order-modal';
import { Button } from '@/components/ui';
import usePackages from '@/hooks/usePackages';
import useServices from '@/hooks/useServices';
import { countAvailableByPackage } from '@/lib/api-accounts';
import type { Tables } from '@/lib/database.types';
import { formatVnd } from '@/lib/format';
import { Accordion } from '@base-ui/react/accordion';
import {
  ArrowDownIcon,
  CaretDownIcon,
  CheckIcon,
  CircleWavyCheckIcon,
  CreditCardIcon,
  DeviceMobileIcon,
  DeviceTabletIcon,
  HeadsetIcon,
  LightningIcon,
  MagnifyingGlassIcon,
  MonitorIcon,
  PackageIcon,
  ProhibitIcon,
  QuotesIcon,
  RocketIcon,
  ShieldCheckIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { useEffect, useMemo, useState, type FC } from 'react';

interface HeroServiceItem {
  id: string;
  name: string;
}

interface DisplayPackage {
  raw: Tables<'packages'>;
  mailAvailable: boolean;
}

interface ServiceGroup {
  service: Tables<'services'>;
  packages: DisplayPackage[];
}

const CURRENT_YEAR = new Date().getFullYear();

const formatDurationLabel = (durationDays: number): string => {
  if (durationDays % 365 === 0) {
    const years = durationDays / 365;
    return years === 1 ? '1 Năm' : `${years} Năm`;
  }

  const months = Math.round(durationDays / 30);
  if (months > 0 && Math.abs(months * 30 - durationDays) <= 5) {
    return months === 1 ? '1 Tháng' : `${months} Tháng`;
  }

  return `${durationDays} Ngày`;
};

const serviceMark = (name: string): string =>
  name.trim().charAt(0).toUpperCase();

const SERVICE_ICONS = [
  { pattern: /netflix/i, src: netflixIcon, alt: 'Netflix' },
  { pattern: /youtube|you\s*tube/i, src: youtubeIcon, alt: 'YouTube Premium' },
  { pattern: /capcut|cap\s*cut/i, src: capcutIcon, alt: 'CapCut' },
] as const;

const getServiceIcon = (name: string) =>
  SERVICE_ICONS.find(({ pattern }) => pattern.test(name));

const Hero: FC<{ latestServices: HeroServiceItem[] }> = ({
  latestServices,
}) => (
  <section className="relative flex min-h-[72dvh] items-end overflow-hidden border-b border-border/50 md:min-h-[78dvh]">
    <img
      src={heroImage}
      alt=""
      width={1920}
      height={1080}
      className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover img-outline"
    />
    <div className="pointer-events-none absolute inset-0 bg-black/45" />
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(20,20,20,0.96)_0%,rgba(20,20,20,0.88)_30%,rgba(20,20,20,0.38)_68%,transparent_100%)]" />

    <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-10 pt-20 text-center md:px-8 md:pb-14 md:pt-24 lg:pb-16 lg:pt-28">
      <div className="mx-auto max-w-3xl">
        <p className="border-border/60 bg-canvas/70 text-ink-muted mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
          4K Premium
        </p>

        <h1 className="text-ink mb-6 text-balance text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
          Netflix &amp; YouTube Premium
          <br />
          dịch vụ tài khoản giá rẻ
        </h1>

        <p className="mb-10 text-base leading-relaxed text-ink-muted text-pretty md:text-lg">
          Nơi bạn tìm thấy những gói tài khoản được chọn lọc từ các dịch vụ đáng
          mua nhất hiện nay: rõ giá, dễ so sánh, giao nhanh qua email hoặc Zalo,
          hỗ trợ liên tục để mua một lần là yên tâm dùng ngay.
        </p>

        <a
          href="#packages"
          className="inline-flex min-h-12 items-center gap-2.5 rounded-md bg-primary px-6 py-3 text-base font-semibold text-white shadow-[0_8px_24px_-8px_rgba(229,9,20,0.55)] transition-[transform,background-color,box-shadow] duration-200 ease-in-out hover:bg-primary-hover hover:shadow-[0_12px_28px_-8px_rgba(229,9,20,0.65)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white motion-safe:active:scale-[0.96] motion-reduce:transition-none"
        >
          <ArrowDownIcon size={20} weight="bold" />
          Xem gói ngay
        </a>

        {latestServices.length > 0 && (
          <div className="mt-10 flex flex-wrap justify-center gap-2.5">
            {latestServices.map((service) => {
              const icon = getServiceIcon(service.name);

              return (
                <div
                  key={service.id}
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-canvas/70 px-4 py-2 text-sm text-ink shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-xs"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded bg-surface-2">
                    {icon ? (
                      <img
                        src={icon.src}
                        alt={icon.alt}
                        className="h-4 w-4 object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xs font-bold text-white">
                        {serviceMark(service.name)}
                      </span>
                    )}
                  </span>
                  <span className="text-pretty">{service.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  </section>
);

const FeatureItem: FC<{ text: string }> = ({ text }) => (
  <li className="flex items-start gap-2.5">
    <CheckIcon size={14} weight="bold" className="text-success mt-1 shrink-0" />
    <span className="text-sm leading-relaxed text-ink-muted text-pretty">
      {text}
    </span>
  </li>
);

const CardBadge: FC<{ children: string }> = ({ children }) => (
  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
    <span className="inline-flex min-h-6 items-center rounded-full border border-border/60 bg-surface-2 px-3 py-0.5 text-[11px] font-semibold text-white shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
      {children}
    </span>
  </div>
);

const ServiceHeading: FC<{ service: Tables<'services'> }> = ({ service }) => {
  const icon = getServiceIcon(service.name);

  return (
    <div className="mb-6 flex items-center gap-3 md:mb-8">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded bg-surface-2 shadow-[0_6px_18px_rgba(229,9,20,0.28)]">
        {icon ? (
          <img
            src={icon.src}
            alt={icon.alt}
            className="h-5 w-5 object-contain"
            loading="lazy"
          />
        ) : (
          <span className="text-sm font-bold text-white">
            {serviceMark(service.name)}
          </span>
        )}
      </span>
      <h2 className="text-2xl font-semibold tracking-tight text-ink text-balance md:text-3xl">
        {service.name}
      </h2>
      <div className="h-px flex-1 bg-border/70" />
    </div>
  );
};

const PackageCard: FC<{
  pkg: Tables<'packages'>;
  mailAvailable: boolean;
  onBuy: () => void;
}> = ({ pkg, mailAvailable, onBuy }) => {
  const highlighted = Boolean(pkg.badge);

  return (
    <article
      className={`group relative flex min-h-full flex-col rounded-lg bg-surface-1 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.4)] transition-[box-shadow,transform] duration-200 ease-in-out motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none md:p-5 ${
        highlighted
          ? 'shadow-[0_0_0_1px_rgba(229,9,20,0.18),0_12px_28px_rgba(0,0,0,0.38)]'
          : 'hover:shadow-[0_8px_22px_rgba(0,0,0,0.44)]'
      }`}
    >
      {pkg.badge && <CardBadge>{pkg.badge}</CardBadge>}

      <div className="mb-2">
        <h3 className="text-xl font-bold tracking-tight text-ink text-balance md:text-2xl">
          {formatDurationLabel(pkg.duration_days)}
        </h3>
        {pkg.description && (
          <p className="mt-1 text-sm text-ink-muted text-pretty">
            {pkg.description}
          </p>
        )}
      </div>

      <div className="mb-3 tabular-nums">
        <div className="text-4xl font-bold tracking-tight text-ink md:text-5xl">
          {formatVnd(pkg.price)}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 text-sm">
        {mailAvailable ? (
          <CircleWavyCheckIcon
            size={14}
            weight="fill"
            aria-hidden="true"
            className="shrink-0 text-success"
          />
        ) : (
          <ProhibitIcon
            size={14}
            weight="fill"
            aria-hidden="true"
            className="shrink-0 text-warning"
          />
        )}
        <span className="text-ink">
          {mailAvailable ? 'Mail sẵn hàng' : 'Mail hết, chọn Zalo'}
        </span>
      </div>

      <ul className="mb-6 flex grow flex-col gap-2.5">
        {pkg.features.map((feature) => (
          <FeatureItem key={feature} text={feature} />
        ))}
      </ul>

      <div className="mt-auto">
        <Button onClick={onBuy} variant="primary" className="w-full">
          Chọn gói này
        </Button>
      </div>
    </article>
  );
};

const SKELETON_SECTIONS = ['skeleton-section-1', 'skeleton-section-2'] as const;
const SKELETON_CARDS = [
  'skeleton-card-1',
  'skeleton-card-2',
  'skeleton-card-3',
  'skeleton-card-4',
] as const;

const PackagesSection: FC<{
  groups: ServiceGroup[];
  loading: boolean;
  error: Error | null;
  onBuy: (pkg: Tables<'packages'>) => void;
}> = ({ groups, loading, error, onBuy }) => (
  <section id="packages" className="bg-canvas px-6 py-24 md:px-12">
    <div className="mx-auto max-w-6xl">
      <div className="mb-14 max-w-3xl">
        <h2 className="mb-2 text-3xl font-bold tracking-tight text-ink text-balance md:text-4xl">
          Bảng giá theo từng dịch vụ
        </h2>
        <p className="text-sm leading-relaxed text-ink-muted text-pretty md:text-base">
          Các dịch vụ giá rẻ cung cấp bên chúng tôi bao gồm:
        </p>
      </div>

      {loading && (
        <div className="grid gap-10">
          {SKELETON_SECTIONS.map((sectionId) => (
            <div
              key={sectionId}
              className="space-y-5 animate-pulse motion-reduce:animate-none"
            >
              <div className="h-8 w-56 rounded bg-surface-2" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {SKELETON_CARDS.map((cardId) => (
                  <div
                    key={cardId}
                    className="min-h-90 rounded-lg border border-border/70 bg-surface-1 p-5"
                  >
                    <div className="mb-6 h-4 w-28 rounded bg-surface-2" />
                    <div className="mb-4 h-10 w-32 rounded bg-surface-2" />
                    <div className="mb-6 h-12 w-40 rounded bg-surface-2" />
                    <div className="space-y-3">
                      <div className="h-3 rounded bg-surface-2" />
                      <div className="h-3 rounded bg-surface-2" />
                      <div className="h-3 w-4/5 rounded bg-surface-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <WarningCircleIcon size={32} weight="fill" className="text-warning" />
          <p className="text-sm text-ink-muted text-pretty">
            Không thể tải dữ liệu gói dịch vụ. Vui lòng thử lại sau.
          </p>
        </div>
      )}

      {!loading && !error && groups.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <PackageIcon size={32} weight="fill" className="text-ink-muted/40" />
          <p className="text-sm text-ink-muted text-pretty">
            Hiện chưa có gói dịch vụ nào.
          </p>
        </div>
      )}

      {!loading && !error && groups.length > 0 && (
        <div className="space-y-14 md:space-y-18">
          {groups.map(({ service, packages }) => (
            <section key={service.id} className="space-y-5 md:space-y-6">
              <ServiceHeading service={service} />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {packages.map(({ raw, mailAvailable }) => (
                  <PackageCard
                    key={raw.id}
                    pkg={raw}
                    mailAvailable={mailAvailable}
                    onBuy={() => onBuy(raw)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  </section>
);

const BENEFITS = [
  {
    icon: LightningIcon,
    title: 'Giao ngay lập tức',
    desc: 'Nhận tài khoản qua email hoặc Zalo ngay sau khi thanh toán được xác nhận.',
  },
  {
    icon: HeadsetIcon,
    title: 'Hỗ trợ 24/7',
    desc: 'Đội ngũ hỗ trợ nhiệt tình qua Zalo và email, giải đáp mọi thắc mắc.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Bảo hành tận tâm',
    desc: 'Đổi tài khoản mới nếu có sự cố trong thời gian sử dụng, không phiền toái.',
  },
];

const BenefitsSection: FC = () => (
  <section className="border-t border-border/50 bg-canvas px-6 py-24 md:px-12">
    <div className="mx-auto max-w-6xl">
      <h2 className="mb-14 text-center text-3xl font-bold tracking-tight text-ink text-balance md:text-4xl">
        Tại sao chọn 4K Premium?
      </h2>
      <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-3">
        {BENEFITS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 shadow-ring">
              <Icon size={28} weight="fill" className="text-ink-muted" />
            </div>
            <h3 className="mb-2 text-base font-semibold tracking-tight text-ink text-balance">
              {title}
            </h3>
            <p className="mx-auto max-w-xs text-sm leading-relaxed text-ink-muted text-pretty">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const STEPS = [
  {
    icon: MagnifyingGlassIcon,
    title: 'Chọn gói',
    desc: 'Chọn dịch vụ và gói phù hợp với nhu cầu của bạn.',
  },
  {
    icon: CreditCardIcon,
    title: 'Đặt mua & thanh toán',
    desc: 'Nhập email, chuyển khoản theo hướng dẫn và chờ xác nhận trong ít phút.',
  },
  {
    icon: RocketIcon,
    title: 'Nhận tài khoản',
    desc: 'Kiểm tra email hoặc Zalo để nhận thông tin và bắt đầu sử dụng ngay.',
  },
];

const HowItWorksSection: FC = () => (
  <section className="bg-surface-1 px-6 py-24 md:px-12">
    <div className="mx-auto max-w-6xl">
      <h2 className="mb-14 text-center text-3xl font-bold tracking-tight text-ink text-balance md:text-4xl">
        Cách mua tài khoản tại 4K Premium
      </h2>
      <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, desc }, index) => (
          <div key={title} className="relative text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-border/30 bg-surface-2 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
              <Icon size={22} weight="fill" className="text-ink-muted" />
            </div>
            <h3 className="mb-2 text-base font-semibold tracking-tight text-ink text-balance">
              {title}
            </h3>
            <p className="mx-auto max-w-[22ch] text-sm leading-relaxed text-ink-muted text-pretty">
              {desc}
            </p>
            {index < STEPS.length - 1 && (
              <div className="absolute left-[calc(50%+3rem)] top-7 hidden h-px w-[calc(100%-6rem)] border-t border-border/30 md:block" />
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);

const DEVICES = [
  { icon: MonitorIcon, name: 'Máy tính', desc: 'Windows, macOS, Chrome OS' },
  {
    icon: DeviceTabletIcon,
    name: 'Máy tính bảng',
    desc: 'iPad, Android Tablet',
  },
  { icon: DeviceMobileIcon, name: 'Điện thoại', desc: 'iPhone, Android' },
];

const DevicesSection: FC = () => (
  <section className="border-t border-border/50 bg-canvas px-6 py-24 md:px-12">
    <div className="mx-auto max-w-6xl">
      <h2 className="mb-2 text-center text-3xl font-bold tracking-tight text-ink text-balance md:text-4xl">
        Xem trên mọi thiết bị
      </h2>
      <p className="mb-14 text-center text-sm text-ink-muted text-pretty">
        Tài khoản tương thích với các thiết bị phổ biến để bạn dùng ngay sau khi
        nhận.
      </p>
      <div className="flex gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
        {DEVICES.map(({ icon: Icon, name, desc }) => (
          <div
            key={name}
            className="w-64 shrink-0 rounded-lg bg-surface-1 p-6 text-center shadow-[0_2px_8px_rgba(0,0,0,0.4)] transition-[box-shadow,transform] duration-200 ease-in-out hover:shadow-[0_8px_22px_rgba(0,0,0,0.44)] motion-safe:hover:-translate-y-0.5 md:w-auto"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-2">
              <Icon size={24} weight="fill" className="text-ink-muted" />
            </div>
            <h3 className="mb-1 text-sm font-semibold tracking-tight text-ink text-balance">
              {name}
            </h3>
            <p className="text-xs text-ink-muted text-pretty">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FAQ_ITEMS = [
  {
    q: 'Sau khi thanh toán, bao lâu tôi nhận được tài khoản?',
    a: 'Sau khi chúng tôi xác nhận giao dịch chuyển khoản, tài khoản sẽ được gửi ngay qua email hoặc Zalo, thường trong vòng 30 phút.',
  },
  {
    q: 'Tài khoản có bảo hành không?',
    a: 'Chúng tôi hỗ trợ đổi tài khoản mới nếu có sự cố kỹ thuật trong thời gian sử dụng. Liên hệ qua Zalo hoặc email để được xử lý nhanh nhất.',
  },
  {
    q: 'Làm thế nào để gia hạn?',
    a: 'Bạn chỉ cần đặt mua lại gói dịch vụ tương ứng. Hệ thống sẽ tiếp tục hướng dẫn thanh toán và giao tài khoản theo đúng loại gói bạn chọn.',
  },
];

const FAQSection: FC = () => (
  <section className="border-t border-border/50 bg-surface-1 px-6 py-24 md:px-12">
    <div className="mx-auto max-w-6xl">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-2 text-center text-3xl font-bold tracking-tight text-ink text-balance md:text-4xl">
          Câu hỏi thường gặp
        </h2>
        <p className="mb-14 text-center text-sm text-ink-muted text-pretty">
          Giải đáp nhanh những điều người mua thường quan tâm trước khi đặt gói.
        </p>
      </div>
      <Accordion.Root className="mx-auto flex max-w-3xl flex-col gap-2">
        {FAQ_ITEMS.map((item) => (
          <Accordion.Item
            key={item.q}
            className="overflow-hidden rounded-lg border border-border/50 bg-canvas transition-colors duration-200"
          >
            <Accordion.Header className="m-0">
              <Accordion.Trigger className="group flex min-h-11 w-full items-center justify-between gap-4 px-6 py-4 text-left text-sm font-medium text-ink hover:not-data-disabled:bg-white/3 focus-visible:relative focus-visible:z-1 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white">
                <span className="text-balance">{item.q}</span>
                <CaretDownIcon
                  size={16}
                  className="shrink-0 text-ink-muted transition-transform duration-200 ease-in-out group-data-panel-open:rotate-180 motion-reduce:transition-none"
                />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel className="h-(--accordion-panel-height) overflow-hidden text-sm transition-[height] duration-200 ease-in-out data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none">
              <div className="border-t border-border/50 px-6 py-4">
                <p className="leading-relaxed text-ink-muted text-pretty">
                  {item.a}
                </p>
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  </section>
);

const TESTIMONIALS = [
  {
    text: 'Mua lần đầu hơi lo nhưng giao tài khoản nhanh, dùng ổn định. Sẽ ủng hộ dài dài.',
    author: 'Minh Hoàng',
    role: 'Khách hàng thân thiết',
  },
  {
    text: 'Hỗ trợ nhanh, nhiệt tình. Dùng ổn định, không bị lỗi vặt.',
    author: 'Thanh Trúc',
    role: 'Khách hàng',
  },
  {
    text: 'Giá rẻ hơn tự đăng ký trực tiếp mà lại có support tiếng Việt. Rất đáng tiền.',
    author: 'Quốc Bảo',
    role: 'Khách hàng',
  },
];

const TestimonialsSection: FC = () => (
  <section className="border-t border-border/50 bg-canvas px-6 py-24 md:px-12">
    <div className="mx-auto max-w-6xl">
      <h2 className="mb-14 text-center text-3xl font-bold tracking-tight text-ink text-balance md:text-4xl">
        Khách hàng nói gì
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
        {TESTIMONIALS.map(({ text, author, role }) => (
          <div
            key={author}
            className="w-70 shrink-0 rounded-lg bg-surface-1 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.4)] transition-[box-shadow,transform] duration-200 ease-in-out hover:shadow-[0_8px_22px_rgba(0,0,0,0.44)] motion-safe:hover:-translate-y-0.5 md:w-[320px]"
          >
            <QuotesIcon
              size={16}
              weight="fill"
              className="mb-3 text-ink-muted/20"
            />
            <p className="mb-6 text-sm leading-relaxed text-ink-muted text-pretty">
              &ldquo;{text}&rdquo;
            </p>
            <div className="border-t border-border/30 pt-4">
              <p className="text-sm font-medium text-ink text-balance">
                {author}
              </p>
              <p className="text-xs text-ink-muted">{role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Footer: FC = () => (
  <footer className="border-t border-border/50 bg-canvas px-6 py-10 text-center md:px-12">
    <p className="text-xs text-ink-muted text-pretty">
      &copy; {CURRENT_YEAR} 4K Premium. Cung cấp tài khoản các dịch vụ phổ biến
      giá rẻ tại Việt Nam.
    </p>
  </footer>
);

const Home: FC = () => {
  const {
    packages,
    loading: packagesLoading,
    error: packagesError,
  } = usePackages();
  const {
    services,
    loading: servicesLoading,
    error: servicesError,
  } = useServices();
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] =
    useState<Tables<'packages'> | null>(null);
  const [stockByPackage, setStockByPackage] = useState<Record<string, number>>(
    {},
  );

  useEffect(() => {
    let cancelled = false;

    countAvailableByPackage()
      .then((map) => {
        if (!cancelled) setStockByPackage(map);
      })
      .catch(() => {
        if (!cancelled) setStockByPackage({});
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const latestServices = useMemo(
    () =>
      [...services]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 5)
        .map((service) => ({ id: service.id, name: service.name })),
    [services],
  );

  const serviceGroups = useMemo<ServiceGroup[]>(() => {
    const sortedServices = [...services].sort((a, b) => {
      const orderDiff = a.sort_order - b.sort_order;
      if (orderDiff !== 0) return orderDiff;
      return a.name.localeCompare(b.name, 'vi');
    });

    return sortedServices.flatMap((service) => {
      const servicePackages = packages
        .filter((pkg) => pkg.service_id === service.id)
        .sort((a, b) => {
          const orderDiff = a.sort_order - b.sort_order;
          if (orderDiff !== 0) return orderDiff;
          return a.price - b.price;
        })
        .map((raw) => ({
          raw,
          mailAvailable: (stockByPackage[raw.id] ?? 0) > 0,
        }));

      return servicePackages.length > 0
        ? [{ service, packages: servicePackages }]
        : [];
    });
  }, [packages, services, stockByPackage]);

  const loading = packagesLoading || servicesLoading;
  const error = packagesError ?? servicesError;

  const handleBuy = (pkg: Tables<'packages'>) => {
    setSelectedPackage(pkg);
    setOrderModalOpen(true);
  };

  return (
    <ClientLayout>
      <Hero latestServices={latestServices} />
      <PackagesSection
        groups={serviceGroups}
        loading={loading}
        error={error}
        onBuy={handleBuy}
      />
      <BenefitsSection />
      <HowItWorksSection />
      <DevicesSection />
      <TestimonialsSection />
      <FAQSection />
      <Footer />
      <OrderModal
        pkg={selectedPackage}
        open={orderModalOpen}
        onOpenChange={setOrderModalOpen}
        mailAvailable={
          selectedPackage ? (stockByPackage[selectedPackage.id] ?? 0) > 0 : true
        }
      />
    </ClientLayout>
  );
};

export default Home;
