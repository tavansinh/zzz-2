import { type FC, type ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '@/stores/auth';
import { Spinner } from '@/components/ui';
import { routes } from '@/lib/routes';

const SuperAdminRoute: FC<{ children: ReactNode }> = ({ children }) => {
  const { accountType, adminRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (accountType !== 'admin') {
    return <Navigate to={routes.home} replace />;
  }

  if (adminRole !== 'admin') {
    return <Navigate to={routes.admin} replace />;
  }

  return <>{children}</>;
};

export default SuperAdminRoute;
