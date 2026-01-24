'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FiHome, 
  FiUsers, 
  FiMap, 
  FiCalendar, 
  FiDollarSign, 
  FiBriefcase,
  FiUserCheck,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { FaAngleDown } from "react-icons/fa6";
import ConfirmationModal from './ConfirmationModal';

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    {
      title: 'Dashboard',
      icon: FiHome,
      href: '/admin',
      exact: true
    },
    {
      title: 'User Management',
      icon: FiUsers,
      href: '/admin/users',
      exact: false
    },
    {
      title: 'Real-Time Monitoring',
      icon: FiMap,
      href: '/admin/monitoring'
    },
    {
      title: 'Booking Control',
      icon: FiCalendar,
      href: '/admin/bookings/all',
      exact: false
    },
    {
      title: 'Payment & Revenue',
      icon: FiDollarSign,
      href: '/admin/payments',
      exact: false
    },
    {
      title: 'Business Controls',
      icon: FiBriefcase,
      href: '/admin/businesses',
      submenu: [
        { title: 'Verifications', href: '/admin/businesses/verifications' },
        { title: 'Subscriptions', href: '/admin/businesses/subscriptions' },
        { title: 'Booking History', href: '/admin/businesses/history' },
      ]
    },
    {
      title: 'Service Provider Controls',
      icon: FiUserCheck,
      href: '/admin/providers',
      submenu: [
        { title: 'Profile Verifications', href: '/admin/providers/verifications' },
        { title: 'Document Verification', href: '/admin/providers/documents' },
        { title: 'Onboarding', href: '/admin/providers/onboarding' },
        { title: 'Performance', href: '/admin/providers/performance' },
      ]
    },
    {
      title: 'Service Categories',
      icon: FiBriefcase,
      href: '/admin/service-categories'
    },
    {
      title: 'Settings',
      icon: FiSettings,
      href: '/admin/settings',
      submenu: [
        { title: 'General Settings', href: '/admin/settings' },
        { title: 'Subscription Pricing', href: '/admin/settings/subscription' },
      ]
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
            <h1 className="text-sm font-bold text-black">Konektly Admin</h1>
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
            const hasSubmenu = item.submenu && item.submenu.length > 0;

            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center justify-between gap-2 px-2 py-2 rounded-lg transition-colors text-xs ${
                    active
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {isOpen && <span className="font-medium truncate">{item.title}</span>}
                  </div>
                  {isOpen && hasSubmenu && (
                    <FaAngleDown className={`w-3 h-3 flex-shrink-0 transition-transform ${
                      active ? 'rotate-180' : ''
                    }`} />
                  )}
                </Link>

                {/* Submenu */}
                {isOpen && hasSubmenu && active && (
                  <div className="ml-3 mt-1 space-y-0.5 border-l-2 border-gray-200 pl-3">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`block px-2 py-1.5 rounded-lg text-xs transition-colors ${
                          pathname === subItem.href
                            ? 'bg-gray-100 text-black font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
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
        onConfirm={async () => {
          try {
            // Get admin data before clearing
            const adminAuth = typeof window !== 'undefined' ? localStorage.getItem('adminAuth') : null;
            let adminData = null;
            if (adminAuth) {
              try {
                adminData = JSON.parse(adminAuth);
              } catch (e) {
                console.error('Error parsing admin auth:', e);
              }
            }

            // Call logout API with admin data
            if (adminData?.admin) {
              await fetch('/api/admin/logout', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  adminId: adminData.admin.id,
                  username: adminData.admin.username
                }),
              });
            }

            // Clear localStorage regardless of API response
            if (typeof window !== 'undefined') {
              localStorage.removeItem('adminAuth');
            }
            router.push('/admin-login');
            router.refresh();
          } catch (error) {
            console.error('Logout error:', error);
            // Clear localStorage even if API call fails
            if (typeof window !== 'undefined') {
              localStorage.removeItem('adminAuth');
            }
            router.push('/admin-login');
            router.refresh();
          }
          setShowLogoutModal(false);
        }}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to login again to access the admin panel."
        confirmText="Logout"
        cancelText="Cancel"
        confirmButtonColor="bg-red-600 hover:bg-red-700"
        icon={FiLogOut}
        iconColor="text-red-500"
      />
    </>
  );
}

