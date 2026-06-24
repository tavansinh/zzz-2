import type { FC, ReactNode } from 'react';
import ChatSupport from '@/components/shared/chat-support';
import Header from '@/components/shared/header';

const ClientLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="bg-canvas font-sans text-ink flex min-h-dvh flex-col antialiased">
      <Header />
      {children}
      <ChatSupport />
    </div>
  );
};

export default ClientLayout;
