import { type FC } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router';
import { useAuth } from '@/stores/auth';
import {
  GaugeIcon,
  ShoppingCartIcon,
  UsersIcon,
  PackageIcon,
  GearIcon,
  ShieldIcon,
  SignOutIcon,
} from '@phosphor-icons/react';
import { routes } from '@/lib/routes';

interface NavItem {
  to: string;
  label: string;
  icon: typeof GaugeIcon;
  adminOnly: boolean;
}

const navItems: NavItem[] = [
  { to: routes.admin, label: 'Dashboard', icon: GaugeIcon, adminOnly: false },
  {
    to: routes.adminOrders,
    label: 'Đơn hàng',
    icon: ShoppingCartIcon,
    adminOnly: false,
  },
  {
    to: routes.adminAccounts,
    label: 'Kho tài khoản',
    icon: UsersIcon,
    adminOnly: true,
  },
  {
    to: routes.adminPackages,
    label: 'Gói dịch vụ',
    icon: PackageIcon,
    adminOnly: true,
  },
  {
    to: routes.adminSettings,
    label: 'Cài đặt',
    icon: GearIcon,
    adminOnly: true,
  },
  {
    to: routes.adminAdmins,
    label: 'Nhân viên',
    icon: ShieldIcon,
    adminOnly: true,
  },
];

const AdminLayout: FC = () => {
  const { user, adminRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(routes.login);
  };

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || adminRole === 'admin',
  );

  return (
    <div className="bg-canvas text-ink flex min-h-dvh antialiased">
      <aside className="border-border/50 bg-surface-1 hidden w-64 flex-col border-r md:flex">
        <div className="border-border/50 flex items-center gap-3 border-b px-6 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-sm font-bold text-white">
            4K
          </div>
          <span className="text-lg font-bold tracking-tight">Admin</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-ink-muted hover:bg-white/5 hover:text-ink'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-border/50 border-t px-4 py-4">
          <div className="mb-3 truncate text-xs text-ink-muted">
            {user?.email}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-10 w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-muted transition-colors duration-150 hover:bg-white/5 hover:text-ink focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
          >
            <SignOutIcon size={16} />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-border/50 bg-surface-1 flex items-center justify-between border-b px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-xs font-bold text-white">
              4K
            </div>
            <span className="text-sm font-bold tracking-tight">Admin</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Đăng xuất"
            className="text-ink-muted hover:text-ink flex min-h-11 min-w-11 items-center justify-center rounded transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
          >
            <SignOutIcon size={18} />
          </button>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
