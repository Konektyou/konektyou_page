'use client';

import { useState } from 'react';
import ClientSidebar from '@/components/client/ClientSidebar';
import ClientHeader from '@/components/client/ClientHeader';
import ClientAuthGuard from '@/components/client/ClientAuthGuard';

export default function ClientLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ClientAuthGuard>
      <div className="min-h-screen bg-gray-50">
        <ClientSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-12'}`}>
          <ClientHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="p-3">
            {children}
          </main>
        </div>
      </div>
    </ClientAuthGuard>
  );
}

