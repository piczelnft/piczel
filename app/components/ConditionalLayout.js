'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import LayoutWithSidebar from './LayoutWithSidebar';

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  
  // Routes that should not show navbar and crypto ticker
  const authRoutes = ['/login', '/signup', '/admin/login'];
  const isAuthRoute = authRoutes.includes(pathname);
  
  // Check if current route is an admin route
  const isAdminRoute = pathname.startsWith('/admin/');

  if (isAuthRoute || isAdminRoute) {
    // Clean layout for auth pages and admin pages - no navbar, no crypto ticker, no sidebar
    return (
      <main className="min-h-screen">{children}</main>
    );
  }

  // Full layout for authenticated pages
  return (
    <>
      <Navbar />
      {/* <CryptoPriceTicker /> */}
      <LayoutWithSidebar>
        <main className="pt-16">{children}</main>
      </LayoutWithSidebar>
    </>
  );
}
