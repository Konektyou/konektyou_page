'use client';

import { useState } from 'react';
import ProviderSidebar from '@/components/provider/ProviderSidebar';
import ProviderHeader from '@/components/provider/ProviderHeader';
import ProviderAuthGuard from '@/components/provider/ProviderAuthGuard';

export default function ProviderLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ProviderAuthGuard>
      <div className="min-h-screen bg-gray-50">
        <ProviderSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-12'}`}>
          <ProviderHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="p-3">
            {children}
          </main>
        </div>
      </div>
    </ProviderAuthGuard>
  );
}

