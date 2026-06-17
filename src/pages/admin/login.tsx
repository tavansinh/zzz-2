import { useEffect, type FC } from 'react';
import { useNavigate } from 'react-router';
import { Spinner } from '@/components/ui';
import { useAuth } from '@/stores/auth';
import { routes } from '@/lib/routes';

const AdminLogin: FC = () => {
  const navigate = useNavigate();
  const { accountType, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (accountType === 'admin') {
      navigate(routes.admin, { replace: true });
      return;
    }
    navigate(routes.login, { replace: true });
  }, [accountType, isLoading, navigate]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas">
      <Spinner className="h-8 w-8 text-primary" />
    </div>
  );
};

export default AdminLogin;
