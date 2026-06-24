const routes = {
  home: '/',
  orderSuccess: '/dat-mua-thanh-cong',
  orderDetail: (id: string) => `/don-hang/${id}`,
  login: '/dang-nhap',
  admin: '/admin',
  adminLogin: '/admin/login',
  adminOrders: '/admin/orders',
  adminAccounts: '/admin/accounts',
  adminPackages: '/admin/packages',
  adminSettings: '/admin/settings',
  adminAdmins: '/admin/admins',
} as const;

export { routes };
