import React, { useEffect, type FC, type ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import '@/assets/css/index.css';
import { BrowserRouter, Route, Routes } from 'react-router';
import { useAuth } from '@/stores/auth';
import Home from '@/pages/home';
import Login from '@/pages/login';
import OrderHistory from '@/pages/order-history';
import OrderSuccess from '@/pages/order-success';
import NotFound from '@/pages/not-found';
import AdminRoute from '@/components/shared/admin-route';
import SuperAdminRoute from '@/components/shared/super-admin-route';
import AdminLayout from '@/components/layout/admin-layout';
import AdminLogin from '@/pages/admin/login';
import AdminDashboard from '@/pages/admin/dashboard';
import AdminOrders from '@/pages/admin/orders';
import AdminAccounts from '@/pages/admin/accounts';
import AdminPackages from '@/pages/admin/packages';
import AdminSettings from '@/pages/admin/settings';
import AdminAdmins from '@/pages/admin/admins';
import { ToastProvider } from '@/components/ui';

const AuthInit: FC<{ children: ReactNode }> = ({ children }) => {
  useEffect(() => {
    const cleanupPromise = useAuth.getState().initialize();
    return () => {
      void cleanupPromise.then((cleanup) => cleanup?.());
    };
  }, []);
  return <>{children}</>;
};

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <BrowserRouter useTransitions={false}>
        <ToastProvider>
          <AuthInit>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/lich-su-mua-hang" element={<OrderHistory />} />
              <Route path="/dat-mua-thanh-cong" element={<OrderSuccess />} />
              <Route path="/don-hang/:orderId" element={<OrderSuccess />} />
              <Route path="/dang-nhap" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route
                  path="accounts"
                  element={
                    <SuperAdminRoute>
                      <AdminAccounts />
                    </SuperAdminRoute>
                  }
                />
                <Route
                  path="packages"
                  element={
                    <SuperAdminRoute>
                      <AdminPackages />
                    </SuperAdminRoute>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <SuperAdminRoute>
                      <AdminSettings />
                    </SuperAdminRoute>
                  }
                />
                <Route
                  path="admins"
                  element={
                    <SuperAdminRoute>
                      <AdminAdmins />
                    </SuperAdminRoute>
                  }
                />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthInit>
        </ToastProvider>
      </BrowserRouter>
    </React.StrictMode>,
  );
}

export default AuthInit;
