"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "./Sidebar";

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, isLoading, authVersion } = useAuth();
  const userMenuRef = useRef(null);

  // Debug logging
  useEffect(() => {
    console.log("Navbar - Auth state changed:", {
      isAuthenticated,
      user: user?.name,
      authVersion,
    });
  }, [isAuthenticated, user, authVersion]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (isLoading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 backdrop-blur-md border-b border-purple-500/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
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
            <div className="animate-pulse bg-slate-700 h-8 w-20 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

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
                  <div
                    className={`w-5 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-300 ${
                      sidebarOpen ? "rotate-45 translate-y-1.5" : ""
                    }`}
                  ></div>
                  <div
                    className={`w-5 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-300 ${
                      sidebarOpen ? "opacity-0" : ""
                    }`}
                  ></div>
                  <div
                    className={`w-5 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-300 ${
                      sidebarOpen ? "-rotate-45 -translate-y-1.5" : ""
                    }`}
                  ></div>
                </div>
              </button>
            </div>

            {/* Right side - Authentication */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-3 bg-gradient-to-r from-slate-800/50 to-purple-800/50 rounded-lg px-4 py-2 border border-purple-500/30 backdrop-blur-sm hover:border-purple-400/50 transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center ring-2 ring-purple-400/30 group-hover:ring-purple-400/50 transition-all">
                      <span className="text-white font-semibold text-sm">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="text-white hidden sm:block">
                      <div className="text-sm font-medium">
                        {user?.name || "User"}
                      </div>
                      <div className="text-xs text-gray-300">
                        {user?.email || ""}
                      </div>
                      <div className="text-xs text-purple-300">
                        Balance: ${user?.wallet?.balance?.toFixed(2) || "0.00"}
                      </div>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        userMenuOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* User Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-800/95 backdrop-blur-md rounded-lg shadow-xl border border-purple-500/30 py-2 z-50">
                      {/* User Info Section */}
                      <div className="px-4 py-3 border-b border-gray-600">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {user?.name?.charAt(0).toUpperCase() || "U"}
                            </span>
                          </div>
                          <div>
                            <div className="text-white font-medium text-sm">
                              {user?.name || "User"}
                            </div>
                            <div className="text-gray-300 text-xs">
                              {user?.email || ""}
                            </div>
                            <div className="text-purple-300 text-xs font-medium">
                              Wallet: $
                              {user?.wallet?.balance?.toFixed(2) || "0.00"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-purple-600/20 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <svg
                            className="w-4 h-4 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          Profile
                        </Link>
                        <Link
                          href="/wallet"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-purple-600/20 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <svg
                            className="w-4 h-4 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                          Wallet
                        </Link>
                        <Link
                          href="/profile/summary"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-purple-600/20 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <svg
                            className="w-4 h-4 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Settings
                        </Link>
                      </div>

                      <hr className="my-2 border-gray-600" />

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-600/20 transition-colors"
                      >
                        <svg
                          className="w-4 h-4 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-white hover:text-purple-200 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
