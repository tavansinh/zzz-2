import type { FC } from 'react';
import { useAuth } from '@/stores/auth';
import Login from '@/pages/login';
import { routes } from '@/lib/routes';
import { Navigate } from 'react-router';

const AdminLogin: FC = () => {
  const { accountType, isLoading } = useAuth();
  if (!isLoading && accountType === 'admin')
    return <Navigate to={routes.admin} replace />;
  return <Login redirectTo={routes.admin} />;
};

export default AdminLogin;
