'use client';

import { useState, useEffect } from 'react';
import { useSidebar } from '../contexts/SidebarContext';
import { useRouter } from 'next/navigation';

export default function AdminNavbar() {
  const [adminUser, setAdminUser] = useState(null);
  const router = useRouter();
  const { isMobileOpen, setIsMobileOpen } = useSidebar();

  useEffect(() => {
    const adminData = localStorage.getItem('adminUser');
    if (adminData) {
      setAdminUser(JSON.parse(adminData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed inset-x-0 top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Brand and Admin Name */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="mr-2 inline-flex items-center justify-center rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
              aria-label="Open sidebar"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">👑</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PICZEL Admin</h1>
                <p className="text-sm text-gray-600">Administration Panel</p>
              </div>
            </div>
          </div>

          {/* Right side - Admin Info and Logout */}
          <div className="flex items-center space-x-4">
            {/* Desktop admin info */}
            <div className="hidden sm:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[160px]">
                  {adminUser?.name || 'Administrator'}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[180px]">
                  {adminUser?.email || 'admin@gmail.com'}
                </p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {adminUser?.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
            </div>

            {/* Mobile avatar only */}
            <div className="sm:hidden w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {adminUser?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
            >
              <span className="hidden sm:inline">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
