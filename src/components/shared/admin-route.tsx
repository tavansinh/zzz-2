import { type FC, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import { useAuth } from '@/stores/auth';
import { Spinner } from '@/components/ui';
import AdminLogin from '@/pages/admin/login';

const AdminRoute: FC<{ children: ReactNode }> = ({ children }) => {
  const { user, accountType, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AdminLogin redirectTo={location.pathname} />;
  }

  if (accountType !== 'admin') {
    return <AdminLogin redirectTo={location.pathname} />;
  }

  return <>{children}</>;
};

export default AdminRoute;
