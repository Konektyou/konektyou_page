'use client';

import { useState } from 'react';
import BusinessSidebar from '@/components/business/BusinessSidebar';
import BusinessHeader from '@/components/business/BusinessHeader';
import BusinessAuthGuard from '@/components/business/BusinessAuthGuard';

export default function BusinessLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <BusinessAuthGuard>
      <div className="min-h-screen bg-gray-50">
        <BusinessSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-12'}`}>
          <BusinessHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </BusinessAuthGuard>
  );
}

