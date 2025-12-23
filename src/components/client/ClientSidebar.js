'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FiHome, 
  FiMap, 
  FiCalendar, 
  FiCreditCard,
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiStar
} from 'react-icons/fi';
import { useState } from 'react';
import ConfirmationModal from '@/components/admin/ConfirmationModal';
import { clearClientAuth } from '@/lib/clientAuth';

export default function ClientSidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    {
      title: 'Dashboard',
      icon: FiHome,
      href: '/client',
      exact: true
    },
    {
      title: 'Find Providers',
      icon: FiMap,
      href: '/client/providers',
      exact: false
    },
    {
      title: 'My Bookings',
      icon: FiCalendar,
      href: '/client/bookings',
      exact: false
    },
    {
      title: 'Payment Methods',
      icon: FiCreditCard,
      href: '/client/payments'
    },
    {
      title: 'Reviews & Ratings',
      icon: FiStar,
      href: '/client/reviews'
    },
    {
      title: 'Profile',
      icon: FiUser,
      href: '/client/profile'
    },
    {
      title: 'Settings',
      icon: FiSettings,
      href: '/client/settings'
    },
  ];

  const isActive = (href, exact = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-12'
        }`}
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          {isOpen && (
            <h1 className="text-sm font-bold text-black">Konektly</h1>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isOpen ? (
              <FiChevronLeft className="w-4 h-4" />
            ) : (
              <FiChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-60px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-colors text-xs ${
                  active
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {isOpen && <span className="font-medium truncate">{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-gray-200">
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-2 px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors w-full text-xs"
          >
            <FiLogOut className="w-4 h-4" />
            {isOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          clearClientAuth();
          setShowLogoutModal(false);
          router.push('/login?role=client');
          router.refresh();
        }}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to login again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        confirmButtonColor="bg-red-600 hover:bg-red-700"
        icon={FiLogOut}
        iconColor="text-red-500"
      />
    </>
  );
}

