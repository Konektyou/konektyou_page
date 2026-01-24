'use client';

import ClientAuthGuard from '@/components/client/ClientAuthGuard';

export default function ClientLayout({ children }) {
  return (
    <ClientAuthGuard>
      <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', margin: 0, padding: 0 }}>
        {children}
      </div>
    </ClientAuthGuard>
  );
}

 