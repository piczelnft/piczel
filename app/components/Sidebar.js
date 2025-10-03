'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Sidebar({ isOpen, onClose }) {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [expandedItems, setExpandedItems] = useState({});

  // Function to render SVG icons
  const renderIcon = (iconName, className = "w-5 h-5") => {
    const icons = {
      'home': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      'user': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      'file-text': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      'lock': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      'credit-card': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      'bank': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      'dollar-sign': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      'scroll': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      'coins': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'shield': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      'bar-chart': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      'gift': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      ),
      'eye': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      'users': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      'wallet': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      'tree': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.5 2.5L12 6l-3.5-3.5L11 1zm0 0v4m0-4h-4m4 0l-2.5 2.5M12 6l2.5-2.5M12 6v4m0-4h4m-4 0l2.5 2.5M12 10l-2.5 2.5M12 10v4m0-4h-4m4 0l-2.5-2.5M12 14l2.5 2.5M12 14v4m0-4h4m-4 0l2.5-2.5" />
        </svg>
      ),
      'message-circle': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      'ticket': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
      'log-out': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      )
    };
    return icons[iconName] || null;
  };

  const menuItems = [
    { name: 'Dashboard', icon: 'home', href: '/' },
    { 
      name: 'Profile', 
      icon: 'user',
      hasDropdown: true,
      dropdownItems: [
        { name: 'User Summary', icon: 'file-text', href: '/profile/summary' },
        { name: 'Change Password', icon: 'lock', href: '/profile/password' },
        { name: 'Wallet Address', icon: 'credit-card', href: '/profile/wallet' }
      ]
    },
    { 
      name: 'Import Fund', 
      icon: 'bank',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Import Fund', icon: 'dollar-sign', href: '/import-fund' },
        { name: 'Import Fund History', icon: 'scroll', href: '/import-fund/history' }
      ]
    },
    // { 
    //   name: 'Staking Section', 
    //   icon: 'coins',
    //   hasDropdown: true,
    //   dropdownItems: [
    //     { name: 'Create Staking', icon: 'shield', href: '/staking/create' },
    //     { name: 'Staking Details', icon: 'bar-chart', href: '/staking/details' },
    //     { name: 'Monthly Staking Rewards', icon: 'gift', href: '/staking/rewards' }
    //   ]
    // },
    { 
      name: 'Income Section', 
      icon: 'eye',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Affiliate Rewards', icon: 'users', href: '/income/affiliate' },
        { name: 'Community Rewards', icon: 'users', href: '/income/community' }
      ]
    },
    { 
      name: 'Wallet Section', 
      icon: 'wallet',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Main Wallet', icon: 'wallet', href: '/wallet/main' },
        { name: 'Wallet History', icon: 'scroll', href: '/wallet/history' },
      ]
    },
    { 
      name: 'Team Management', 
      icon: 'users',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Geneology', icon: 'tree', href: '/team/geneology' },
        { name: 'Direct Members', icon: 'user', href: '/team/members' },
        { name: 'Level Member Table', icon: 'bar-chart', href: '/team/levels' }
      ]
    },
    { 
      name: 'Support Section', 
      icon: 'message-circle',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Create New Ticket', icon: 'ticket', href: '/support/create' },
      ]
    },
    // { name: 'Logout', icon: 'log-out', isLogout: true }
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
      {/* Sidebar */}
      <div className={`w-64 border-r shadow-2xl flex flex-col animate-fadeInLeft mt-11 ml-4`} style={{borderColor: 'var(--default-border)', height: 'calc(100vh - 4rem)', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)'}}>
        {/* Header */}
        <div className="flex items-center p-4 border-b" style={{borderColor: 'var(--default-border)'}}>
          <div className="flex items-center space-x-3 group">
            <div className="w-6 h-6 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 animate-cardFloat" style={{background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))'}}>
              <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{backgroundColor: 'var(--primary-color)'}}></div>
              </div>
            </div>
            <div>
              <h2 className="font-bold text-lg text-white gradient-text-enhanced animate-neonGlow">
                PICZEL
              </h2>
              <p className="text-xs" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Crypto Trading Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent" style={{scrollbarThumb: 'rgba(0, 255, 190, 0.3)'}}>
          {menuItems.map((item, index) => (
            <div key={item.name} className="animate-fadeInUp" style={{animationDelay: `${index * 0.1}s`}}>
              {item.isLogout ? (
                <button
                  onClick={() => handleItemClick(item.name, item.hasDropdown, item.isLogout)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 group hover-lift-enhanced ${
                    activeItem === item.name
                      ? 'glass-card border shadow-lg glow-border'
                      : 'hover:glass-card hover:border hover-glow'
                  }`}
                  style={{borderColor: 'var(--default-border)'}}
                >
                  <div className={`text-white transition-transform duration-300 group-hover:scale-110 ${
                    activeItem === item.name ? 'animate-pulse' : ''
                  }`}>
                    {renderIcon(item.icon, "w-5 h-5")}
                  </div>
                  {item.name !== 'Dashboard' && (
                    <span className={`font-medium transition-colors duration-300 ${
                      activeItem === item.name 
                        ? 'text-white gradient-text-neon' 
                        : 'text-white group-hover:text-white'
                    }`} style={{color: activeItem === item.name ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.8)'}}>
                      {item.name}
                    </span>
                  )}
                </button>
              ) : item.hasDropdown ? (
                <button
                  onClick={() => handleItemClick(item.name, item.hasDropdown, item.isLogout)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 group hover-lift-enhanced ${
                    activeItem === item.name
                      ? 'glass-card border border-slate-500/50 shadow-lg glow-border'
                      : 'hover:glass-card hover:border hover:border-slate-500/30 hover-glow'
                  }`}
                >
                  <div className={`text-white transition-transform duration-300 group-hover:scale-110 ${
                    activeItem === item.name ? 'animate-pulse' : ''
                  }`}>
                    {renderIcon(item.icon, "w-5 h-5")}
                  </div>
                  {item.name !== 'Dashboard' && (
                    <span className={`font-medium transition-colors duration-300 ${
                      activeItem === item.name 
                        ? 'text-white gradient-text-neon' 
                        : 'text-slate-300 group-hover:text-white'
                    }`}>
                      {item.name}
                    </span>
                  )}
                  <div className={`ml-auto transition-transform duration-300 ${
                    expandedItems[item.name] ? 'rotate-180' : ''
                  }`}>
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
              ) : (
                <Link href={item.href}>
                  <button
                    onClick={() => handleItemClick(item.name, item.hasDropdown, item.isLogout)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 group hover-lift-enhanced ${
                      activeItem === item.name
                        ? 'glass-card border border-slate-500/50 shadow-lg glow-border'
                        : 'hover:glass-card hover:border hover:border-slate-500/30 hover-glow'
                    }`}
                  >
                    <div className={`text-white transition-transform duration-300 group-hover:scale-110 ${
                      activeItem === item.name ? 'animate-pulse' : ''
                    }`}>
                      {renderIcon(item.icon, "w-5 h-5")}
                    </div>
                    {item.name !== 'Dashboard' && (
                      <span className={`font-medium transition-colors duration-300 ${
                        activeItem === item.name 
                          ? 'text-white gradient-text-neon' 
                          : 'text-slate-300 group-hover:text-white'
                      }`}>
                        {item.name}
                      </span>
                    )}
                    <div className="ml-auto w-2 h-2 bg-gradient-to-r from-slate-400 to-slate-300 rounded-full animate-pulse"></div>
                  </button>
                </Link>
              )}

              {/* Dropdown Items */}
              {item.hasDropdown && expandedItems[item.name] && (
                <div className="ml-6 mt-2 space-y-1 animate-fadeInUp">
                  {item.dropdownItems.map((dropdownItem, dropdownIndex) => (
                    <Link key={dropdownItem.name} href={dropdownItem.href}>
                      <button
                        onClick={() => handleDropdownItemClick(dropdownItem.name)}
                        className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-300 group hover-lift-enhanced ${
                          activeItem === dropdownItem.name
                            ? 'glass-card border border-slate-500/30 glow-border'
                            : 'hover:glass-card hover:border hover:border-slate-500/20 hover-glow'
                        }`}
                        style={{animationDelay: `${dropdownIndex * 0.05}s`}}
                      >
                        <div className="text-white group-hover:scale-110 transition-transform duration-300">
                          {renderIcon(dropdownItem.icon, "w-5 h-5")}
                        </div>
                        <span className={`text-xs font-medium transition-colors duration-300 ${
                          activeItem === dropdownItem.name 
                            ? 'text-white gradient-text-neon' 
                            : 'text-slate-400 group-hover:text-slate-300'
                        }`}>
                          {dropdownItem.name}
                        </span>
                        {activeItem === dropdownItem.name && (
                          <div className="ml-auto w-1.5 h-1.5 bg-gradient-to-r from-slate-400 to-slate-300 rounded-full animate-pulse"></div>
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
