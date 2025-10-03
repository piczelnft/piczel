'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminNavbar() {
  const [adminUser, setAdminUser] = useState(null);
  const router = useRouter();

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
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Brand and Admin Name */}
          <div className="flex items-center space-x-4">
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
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {adminUser?.name || 'Administrator'}
                </p>
                <p className="text-xs text-gray-500">
                  {adminUser?.email || 'admin@gmail.com'}
                </p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {adminUser?.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
