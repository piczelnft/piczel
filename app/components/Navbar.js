'use client';

import { useState } from 'react';
import Image from 'next/image';
import Sidebar from './Sidebar';

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 backdrop-blur-md border-b border-purple-500/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and Menu Button */}
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-30 h-10 relative">
                  <Image
                    src="/DGlogo.png"
                    alt="DGtek Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              {/* Hamburger Menu Button */}
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg bg-gradient-to-r from-purple-600/20 to-cyan-600/20 hover:from-purple-600/30 hover:to-cyan-600/30 transition-all duration-300 border border-purple-500/30 hover:border-purple-400/50 group"
                aria-label="Toggle sidebar"
              >
                <div className="w-6 h-6 flex flex-col justify-center items-center space-y-1">
                  <div className={`w-5 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-300 ${sidebarOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                  <div className={`w-5 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-300 ${sidebarOpen ? 'opacity-0' : ''}`}></div>
                  <div className={`w-5 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-300 ${sidebarOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
                </div>
              </button>
            </div>

            {/* Right side - User ID */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-gradient-to-r from-slate-800/50 to-purple-800/50 rounded-lg px-4 py-2 border border-purple-500/30 backdrop-blur-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">U</span>
                </div>
                <div className="text-white">
                  <div className="text-sm font-medium">User ID</div>
                  <div className="text-xs text-gray-300">0x742d...3a8f</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
