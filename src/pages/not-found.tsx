import type { FC } from 'react';
import { Link } from 'react-router';
import ClientLayout from '@/components/layout/client-layout';
import { TelevisionIcon, HouseLineIcon } from '@phosphor-icons/react';
import { routes } from '@/lib/routes';

const linkBtn =
  'inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition-[transform,background-color] duration-200 hover:bg-primary-hover motion-safe:active:scale-[0.96] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white';

const NotFound: FC = () => {
  return (
    <ClientLayout>
      <section className="relative flex grow items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,#1a1a2e_0%,#141414_70%)]">
        <div className="pointer-events-none absolute inset-0 bg-black/30" />

        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-canvas via-canvas/40 to-transparent" />

        <div className="relative z-10 mx-auto max-w-sm px-6 text-center">
          <div className="bg-surface-2 mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-lg shadow-ring">
            <TelevisionIcon
              size={32}
              weight="fill"
              className="text-ink-muted"
            />
          </div>
          <h1 className="text-ink mb-2 text-7xl font-bold tracking-tighter md:text-8xl text-balance">
            404
          </h1>
          <p className="text-ink-muted mb-2 text-sm text-pretty">
            Trang bạn đang tìm không tồn tại hoặc đã được di chuyển
          </p>
          <p className="text-ink-muted mb-10 text-xs text-pretty">
            Có vẻ như bạn đã lạc vào vùng tối...
          </p>
          <Link to={routes.home} className={linkBtn}>
            <HouseLineIcon size={16} weight="fill" />
            Về trang chủ
          </Link>
        </div>
      </section>
    </ClientLayout>
  );
};

export default NotFound;
