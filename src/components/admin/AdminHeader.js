'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiMenu, FiUser, FiSettings, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { getAdminData } from '@/lib/adminAuth';

export default function AdminHeader({ onMenuClick }) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const admin = getAdminData();
    setAdminData(admin);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-2 h-12">
        {/* Left: Menu Button */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          >
            <FiMenu className="w-4 h-4" />
          </button>
        </div>

        {/* Right: User Avatar with Dropdown */}
          <div className="flex items-center gap-2 relative" ref={dropdownRef}>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-gray-900">{adminData?.username || 'Admin User'}</p>
              <p className="text-[10px] text-gray-500">{adminData?.role?.replace('_', ' ').toUpperCase() || 'Admin'}</p>
            </div>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <FiUser className="w-4 h-4 text-white" />
            </div>
            <FiChevronDown className={`w-3 h-3 text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  // Handle profile action
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <FiUser className="w-3 h-3" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  // Handle settings action
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <FiSettings className="w-3 h-3" />
                <span>Settings</span>
              </button>
              <div className="border-t border-gray-200 my-1"></div>
              <button
                onClick={async () => {
                  setIsDropdownOpen(false);
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
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
              >
                <FiLogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

