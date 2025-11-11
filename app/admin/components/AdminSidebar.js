"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { useSidebar } from "../contexts/SidebarContext";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: "📊",
    current: false,
  },
  {
    name: "Member Management",
    icon: "👥",
    hasDropdown: true,
    subItems: [
      {
        name: "All Members",
        href: "/admin/members",
        icon: "👥",
      },
      {
        name: "NFT Counter",
        href: "/admin/nft-counter",
        icon: "🧮",
      },
    ],
  },
  {
    name: "Create User",
    href: "/admin/create-user",
    icon: "➕",
    current: false,
  },
  {
    name: "Fund Management",
    href: "/admin/funds",
    icon: "💰",
    current: false,
  },
  {
    name: "Wallet Address",
    href: "/admin/wallet-address",
    icon: "🔗",
    current: false,
  },
  {
    name: "Payment Management",
    icon: "💳",
    hasDropdown: true,
    subItems: [
      {
        name: "New Withdrawal Requests",
        href: "/admin/new-withdrawal-requests",
        icon: "⏳",
      },
      {
        name: "Payment History",
        href: "/admin/payment-history",
        icon: "📜",
      },
    ],
  },
  {
    name: "Support Tickets",
    href: "/admin/support-tickets",
    icon: "🎫",
    current: false,
  },
  {
    name: "NFT Market Withdrawal",
    icon: "🖼️",
    hasDropdown: true,
    subItems: [
      {
        name: "Withdrawal Management",
        href: "/admin/nft-market-withdrawal",
        icon: "💰",
      },
      {
        name: "Payout History",
        href: "/admin/nft-payout-history",
        icon: "📜",
      },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
  const [paymentDropdownOpen, setPaymentDropdownOpen] = useState(false);
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
  const [nftDropdownOpen, setNftDropdownOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Check if current path is a payment-related page
  const isPaymentPage =
    pathname.startsWith("/admin/payment-") ||
    pathname.startsWith("/admin/new-withdrawal-") ||
    pathname.startsWith("/admin/cancelled-");

  const isMemberPage =
    pathname === "/admin/members" || pathname.startsWith("/admin/nft-counter");

  const isNftPage =
    pathname.startsWith("/admin/nft-market-withdrawal") || 
    pathname.startsWith("/admin/nft-payout-history");

  // Auto-open dropdowns if on respective pages
  React.useEffect(() => {
    if (!isCollapsed || isHovered) {
      if (isPaymentPage) setPaymentDropdownOpen(true);
      if (isMemberPage) setMemberDropdownOpen(true);
      if (isNftPage) setNftDropdownOpen(true);
    }
  }, [isPaymentPage, isMemberPage, isNftPage, isCollapsed, isHovered]);

  // Close dropdown when sidebar is collapsed (but not when hovered)
  React.useEffect(() => {
    if (isCollapsed && !isHovered) {
      setPaymentDropdownOpen(false);
      setMemberDropdownOpen(false);
      setNftDropdownOpen(false);
    }
  }, [isCollapsed, isHovered]);

  // Determine if sidebar content should be visible (expanded or hovered)
  const isExpanded = !isCollapsed || isHovered;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileOpen(false)}
      />
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`bg-gray-800 transition-all duration-300 ${
          isCollapsed && !isHovered ? "w-16" : "w-64"
        } flex flex-col fixed left-0 top-16 bottom-0 z-50 md:z-30 md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {isExpanded && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">👑</span>
              </div>
              <span className="text-white font-semibold">Admin Panel</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <span className="text-lg">{isCollapsed ? "▶️" : "◀️"}</span>
          </button>
        </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          if (item.hasDropdown) {
            // Check if any sub-item is active
            const isAnySubItemActive = item.subItems?.some(
              (subItem) => pathname === subItem.href
            );

            return (
              <div key={item.name} className="relative">
                {/* Dropdown Trigger */}
                <button
                  onClick={() => {
                    if (isCollapsed && !isHovered) return;
                    if (item.name === "Payment Management") {
                      setPaymentDropdownOpen(!paymentDropdownOpen);
                    } else if (item.name === "Member Management") {
                      setMemberDropdownOpen(!memberDropdownOpen);
                    } else if (item.name === "NFT Market Withdrawal") {
                      setNftDropdownOpen(!nftDropdownOpen);
                    }
                  }}
                  className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isAnySubItemActive
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {isExpanded && (
                    <>
                      <span className="flex-1 text-left">{item.name}</span>
                      {item.name === "Payment Management" && (
                        <span
                          className={`ml-auto transition-transform duration-200 ${
                            paymentDropdownOpen ? "rotate-180" : "rotate-0"
                          }`}
                        >
                          ▼
                        </span>
                      )}
                      {item.name === "Member Management" && (
                        <span
                          className={`ml-auto transition-transform duration-200 ${
                            memberDropdownOpen ? "rotate-180" : "rotate-0"
                          }`}
                        >
                          ▼
                        </span>
                      )}
                      {item.name === "NFT Market Withdrawal" && (
                        <span
                          className={`ml-auto transition-transform duration-200 ${
                            nftDropdownOpen ? "rotate-180" : "rotate-0"
                          }`}
                        >
                          ▼
                        </span>
                      )}
                    </>
                  )}
                </button>

                {/* Dropdown Menu */}
                {isExpanded && item.name === "Payment Management" && paymentDropdownOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.subItems?.map((subItem) => {
                      const isSubItemActive = pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                            isSubItemActive
                              ? "bg-purple-600 text-white"
                              : "text-gray-300 hover:bg-gray-700 hover:text-white"
                          }`}
                        >
                          <span className="mr-3 text-lg">{subItem.icon}</span>
                          <span className="flex-1">{subItem.name}</span>
                          {isSubItemActive && (
                            <span className="ml-auto w-2 h-2 bg-white rounded-full"></span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
                {isExpanded && item.name === "Member Management" && memberDropdownOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.subItems?.map((subItem) => {
                      const isSubItemActive = pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                            isSubItemActive
                              ? "bg-purple-600 text-white"
                              : "text-gray-300 hover:bg-gray-700 hover:text-white"
                          }`}
                        >
                          <span className="mr-3 text-lg">{subItem.icon}</span>
                          <span className="flex-1">{subItem.name}</span>
                          {isSubItemActive && (
                            <span className="ml-auto w-2 h-2 bg-white rounded-full"></span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
                {isExpanded && item.name === "NFT Market Withdrawal" && nftDropdownOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.subItems?.map((subItem) => {
                      const isSubItemActive = pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                            isSubItemActive
                              ? "bg-purple-600 text-white"
                              : "text-gray-300 hover:bg-gray-700 hover:text-white"
                          }`}
                        >
                          <span className="mr-3 text-lg">{subItem.icon}</span>
                          <span className="flex-1">{subItem.name}</span>
                          {isSubItemActive && (
                            <span className="ml-auto w-2 h-2 bg-white rounded-full"></span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          } else {
            // Regular navigation item
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  isActive
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {isExpanded && <span className="flex-1">{item.name}</span>}
                {isActive && (
                  <span className="ml-auto w-2 h-2 bg-white rounded-full"></span>
                )}
              </Link>
            );
          }
        })}
      </nav>

      {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-700">
          {isExpanded && (
            <div className="text-xs text-gray-400 text-center">
              <p>PICZEL Admin Panel</p>
              <p>v1.0.0</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
