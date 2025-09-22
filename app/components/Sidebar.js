'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Sidebar({ isOpen, onClose }) {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [expandedItems, setExpandedItems] = useState({});

  const menuItems = [
    { name: 'Dashboard', icon: '📊', href: '/' },
    { name: 'About', icon: 'ℹ️', href: '/about' },
    { 
      name: 'Profile', 
      icon: '👤',
      hasDropdown: true,
      dropdownItems: [
        { name: 'User Summary', icon: '📋', href: '/profile/summary' },
        { name: 'Change Password', icon: '🔐', href: '/profile/password' },
        { name: 'Wallet Address', icon: '💳', href: '/profile/wallet' }
      ]
    },
    { 
      name: 'Import Fund', 
      icon: '💰',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Import Fund', icon: '💰', href: '/import-fund' },
        { name: 'Import Fund History', icon: '📜', href: '/import-fund/history' }
      ]
    },
    { 
      name: 'Staking Section', 
      icon: '🔒',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Create Staking', icon: '🔒', href: '/staking/create' },
        { name: 'Staking Details', icon: '📊', href: '/staking/details' },
        { name: 'Monthly Staking Rewards', icon: '🎁', href: '/staking/rewards' }
      ]
    },
    { 
      name: 'Income Section', 
      icon: '📈',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Affiliate Rewards', icon: '🤝', href: '/income/affiliate' },
        { name: 'Community Rewards', icon: '👥', href: '/income/community' }
      ]
    },
    { 
      name: 'Wallet Section', 
      icon: '💳',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Main Wallet', icon: '💳', href: '/wallet/main' },
        { name: 'Wallet History', icon: '📜', href: '/wallet/history' },
      ]
    },
    { 
      name: 'Team Management', 
      icon: '👥',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Geneology', icon: '🌳', href: '/team/geneology' },
        { name: 'Direct Members', icon: '👤', href: '/team/members' },
        { name: 'Level Member Table', icon: '📊', href: '/team/levels' }
      ]
    },
    { 
      name: 'Support Section', 
      icon: '🆘',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Create New Ticket', icon: '🎫', href: '/support/create' },
        { name: 'Support Tickets', icon: '📋', href: '/support/tickets' }
      ]
    },
    { name: 'Logout', icon: '🚪', isLogout: true }
  ];

  const handleItemClick = (itemName, hasDropdown = false, isLogout = false) => {
    if (isLogout) {
      // Handle logout logic here
      console.log('Logout clicked');
      return;
    }
    
    if (hasDropdown) {
      setExpandedItems(prev => ({
        ...prev,
        [itemName]: !prev[itemName]
      }));
    } else {
      setActiveItem(itemName);
    }
  };

  const handleDropdownItemClick = (itemName) => {
    setActiveItem(itemName);
    console.log(`${itemName} clicked`);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-slate-900 via-purple-900/90 to-slate-900 backdrop-blur-xl border-r border-purple-500/20 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
          <div className="flex items-center space-x-3">
            <div>
              <h2 className="font-bold text-xl bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                PICZEL
              </h2>
              <p className="text-gray-400 text-sm">Meme NFT</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-purple-600/20 transition-colors duration-200"
          >
            <svg className="w-6 h-6 text-gray-400 hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent hover:scrollbar-thumb-purple-500/50">
          {menuItems.map((item, index) => (
            <div key={item.name}>
              {item.isLogout ? (
                <button
                  onClick={() => handleItemClick(item.name, item.hasDropdown, item.isLogout)}
                  className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
                    activeItem === item.name
                      ? 'bg-gradient-to-r from-purple-600/30 to-cyan-600/30 border border-purple-500/50 shadow-lg'
                      : 'hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-cyan-600/20 hover:border hover:border-purple-500/30'
                  }`}
                >
                  <div className={`text-2xl transition-transform duration-300 group-hover:scale-110 ${
                    activeItem === item.name ? 'animate-pulse' : ''
                  }`}>
                    {item.icon}
                  </div>
                  <span className={`font-medium transition-colors duration-300 ${
                    activeItem === item.name 
                      ? 'text-white' 
                      : 'text-gray-300 group-hover:text-white'
                  }`}>
                    {item.name}
                  </span>
                </button>
              ) : item.hasDropdown ? (
                <button
                  onClick={() => handleItemClick(item.name, item.hasDropdown, item.isLogout)}
                  className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
                    activeItem === item.name
                      ? 'bg-gradient-to-r from-purple-600/30 to-cyan-600/30 border border-purple-500/50 shadow-lg'
                      : 'hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-cyan-600/20 hover:border hover:border-purple-500/30'
                  }`}
                >
                  <div className={`text-2xl transition-transform duration-300 group-hover:scale-110 ${
                    activeItem === item.name ? 'animate-pulse' : ''
                  }`}>
                    {item.icon}
                  </div>
                  <span className={`font-medium transition-colors duration-300 ${
                    activeItem === item.name 
                      ? 'text-white' 
                      : 'text-gray-300 group-hover:text-white'
                  }`}>
                    {item.name}
                  </span>
                  <div className={`ml-auto transition-transform duration-300 ${
                    expandedItems[item.name] ? 'rotate-180' : ''
                  }`}>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
              ) : (
                <Link href={item.href}>
                  <button
                    onClick={() => handleItemClick(item.name, item.hasDropdown, item.isLogout)}
                    className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
                      activeItem === item.name
                        ? 'bg-gradient-to-r from-purple-600/30 to-cyan-600/30 border border-purple-500/50 shadow-lg'
                        : 'hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-cyan-600/20 hover:border hover:border-purple-500/30'
                    }`}
                  >
                    <div className={`text-2xl transition-transform duration-300 group-hover:scale-110 ${
                      activeItem === item.name ? 'animate-pulse' : ''
                    }`}>
                      {item.icon}
                    </div>
                    <span className={`font-medium transition-colors duration-300 ${
                      activeItem === item.name 
                        ? 'text-white' 
                        : 'text-gray-300 group-hover:text-white'
                    }`}>
                      {item.name}
                    </span>
                    <div className="ml-auto w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse"></div>
                  </button>
                </Link>
              )}

              {/* Dropdown Items */}
              {item.hasDropdown && expandedItems[item.name] && (
                <div className="ml-6 mt-2 space-y-1">
                  {item.dropdownItems.map((dropdownItem) => (
                    <Link key={dropdownItem.name} href={dropdownItem.href}>
                      <button
                        onClick={() => handleDropdownItemClick(dropdownItem.name)}
                        className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-300 group ${
                          activeItem === dropdownItem.name
                            ? 'bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30'
                            : 'hover:bg-gradient-to-r hover:from-purple-600/10 hover:to-cyan-600/10'
                        }`}
                      >
                        <div className="text-lg">
                          {dropdownItem.icon}
                        </div>
                        <span className={`text-sm font-medium transition-colors duration-300 ${
                          activeItem === dropdownItem.name 
                            ? 'text-white' 
                            : 'text-gray-400 group-hover:text-gray-300'
                        }`}>
                          {dropdownItem.name}
                        </span>
                        {activeItem === dropdownItem.name && (
                          <div className="ml-auto w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse"></div>
                        )}
                      </button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

      </div>
    </>
  );
}
