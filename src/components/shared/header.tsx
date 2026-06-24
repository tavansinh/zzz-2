import { type FC, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ShieldIcon, SignOutIcon, UserCircleIcon } from '@phosphor-icons/react';
import { useAuth } from '@/stores/auth';
import { routes } from '@/lib/routes';

const Header: FC = () => {
  const navigate = useNavigate();
  const { user, accountType, adminRole, logout, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate(routes.adminLogin);
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-border/50 bg-canvas/80 shadow-[0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-0">
        <a
          href="/"
          className="text-primary hover:text-primary-hover text-xl font-bold tracking-tight transition-colors duration-200 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white rounded md:text-2xl"
        >
          4K PREMIUM
        </a>

        {!isLoading && user && accountType === 'admin' && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="border-border/50 bg-surface-1 hover:bg-white/5 inline-flex min-h-11 items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium text-ink transition-colors duration-200 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
            >
              <UserCircleIcon size={18} weight="fill" />
              <span className="hidden max-w-45 truncate md:inline">
                {user.email}
              </span>
            </button>

            {menuOpen && (
              <div className="border-border/50 bg-surface-1 absolute right-0 z-50 mt-2 w-64 rounded-md border p-2 shadow-[0_4px_16px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)]">
                <div className="border-border/50 mb-1 truncate border-b px-3 py-2 text-xs text-ink-muted">
                  {user.email}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(routes.admin);
                  }}
                  className="text-ink hover:bg-white/5 flex min-h-10 w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
                >
                  <ShieldIcon size={16} />
                  Vào trang quản trị
                  <span className="text-ink-muted ml-auto text-xs">
                    {adminRole === 'admin' ? 'Admin' : 'Staff'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-ink hover:bg-white/5 flex min-h-10 w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
                >
                  <SignOutIcon size={16} />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
