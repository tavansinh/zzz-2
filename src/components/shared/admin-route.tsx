import { type FC, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '@/stores/auth';
import { Spinner } from '@/components/ui';
import { routes } from '@/lib/routes';

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
    return (
      <Navigate to={routes.login} state={{ from: location.pathname }} replace />
    );
  }

  if (accountType !== 'admin') {
    return <Navigate to={routes.home} replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
