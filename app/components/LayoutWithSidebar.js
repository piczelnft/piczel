"use client";

import { useSidebar } from "../contexts/SidebarContext";
import Sidebar from "./Sidebar";

export default function LayoutWithSidebar({ children }) {
  const { sidebarOpen, closeSidebar } = useSidebar();

  return (
    <div className="min-h-screen flex" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>
      {/* Sidebar */}
      {sidebarOpen && (
        <div>
          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
