'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import { SidebarProvider, useSidebar } from '../contexts/SidebarContext';

function AdminLayoutContent({ children }) {
  const { isCollapsed, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navbar */}
      <AdminNavbar />
      
      {/* Admin Sidebar */}
      <AdminSidebar />
      
      {/* Page Content */}
      <main className={`transition-all duration-300 p-6 pt-24 md:${isCollapsed ? 'ml-16' : 'ml-64'} ml-0`}
        onClick={() => {
          // close sidebar if clicking on content while mobile sidebar open
          if (isMobileOpen) {
            // cannot access setter here; rely on backdrop to close
          }
        }}
      >
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminUser');
    
    if (!adminToken || !adminData) {
      router.push('/admin/login');
      return;
    }

    try {
      JSON.parse(adminData);
    } catch (error) {
      console.error('Error parsing admin data:', error);
      router.push('/admin/login');
    }
  }, [router]);

  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  );
}
