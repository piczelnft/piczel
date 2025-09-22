'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <Link href="/swap">
                <div className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-2xl px-8 py-4 rounded-xl shadow-lg hover:from-cyan-600 hover:to-purple-700 hover:scale-105 transition-all duration-300 cursor-pointer">
                  🚀 PICZEL SWAP
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Member Info Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {/* Member ID */}
          <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <div className="text-center">
              <div className="text-gray-300 text-sm mb-2">Member ID</div>
              <div className="text-white font-bold text-lg">DGT123456</div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-gradient-to-br from-slate-800/50 to-green-800/50 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20">
            <div className="text-center">
              <div className="text-gray-300 text-sm mb-2">Status</div>
              <div className="text-green-400 font-bold text-lg">Active</div>
            </div>
          </div>

          {/* Rank */}
          <div className="bg-gradient-to-br from-slate-800/50 to-yellow-800/50 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20">
            <div className="text-center">
              <div className="text-gray-300 text-sm mb-2">Rank</div>
              <div className="text-yellow-400 font-bold text-lg">Basic</div>
            </div>
          </div>

          {/* Total Team */}
          <div className="bg-gradient-to-br from-slate-800/50 to-cyan-800/50 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/20">
            <div className="text-center">
              <div className="text-gray-300 text-sm mb-2">Total Team</div>
              <div className="text-cyan-400 font-bold text-lg">863</div>
            </div>
          </div>

          {/* My Directs */}
          <div className="bg-gradient-to-br from-slate-800/50 to-blue-800/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
            <div className="text-center">
              <div className="text-gray-300 text-sm mb-2">My Directs</div>
              <div className="text-blue-400 font-bold text-lg">65</div>
            </div>
          </div>

          {/* Wallet */}
          <div className="bg-gradient-to-br from-slate-800/50 to-emerald-800/50 backdrop-blur-sm rounded-2xl p-6 border border-emerald-500/20">
            <div className="text-center">
              <div className="text-gray-300 text-sm mb-2">Wallet</div>
              <div className="text-emerald-400 font-bold text-lg">$4926.13</div>
            </div>
          </div>

          {/* Deposit Wallet */}
          <div className="bg-gradient-to-br from-slate-800/50 to-indigo-800/50 backdrop-blur-sm rounded-2xl p-6 border border-indigo-500/20">
            <div className="text-center">
              <div className="text-gray-300 text-sm mb-2">Deposit Wallet</div>
              <div className="text-indigo-400 font-bold text-lg">$0.00</div>
            </div>
          </div>
        </div>

        {/* Capping Section */}
        <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">CAPPING 4X</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400 mb-2">$40,800</div>
              <div className="text-gray-300 text-sm">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">$5,528.13</div>
              <div className="text-gray-300 text-sm">Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-2">$35,271.87</div>
              <div className="text-gray-300 text-sm">Balance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-2">$5,528.13</div>
              <div className="text-gray-300 text-sm">Total Income</div>
            </div>
          </div>
        </div>

        {/* Income Graphs Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Income Graph */}
          <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-lg font-semibold text-white mb-4">Total Income</h3>
            <div className="relative h-24 mb-4 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                <path
                  d="M0,50 L20,30 L40,70 L60,20 L80,80 L100,40 L120,90 L140,10 L160,60 L180,35 L200,55"
                  stroke="url(#purpleGradient)"
                  strokeWidth="2"
                  fill="none"
                  className="animate-zigzag"
                />
                <defs>
                  <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-400 mb-1">$5,528.13</div>
              <div className="text-xs text-gray-400">Total Earnings</div>
            </div>
          </div>

          {/* Affiliate Reward Graph */}
          <div className="bg-gradient-to-br from-slate-800/50 to-green-800/50 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20">
            <h3 className="text-lg font-semibold text-white mb-4">Affiliate Reward</h3>
            <div className="relative h-24 mb-4 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                <path
                  d="M0,60 L25,25 L50,75 L75,15 L100,85 L125,35 L150,65 L175,20 L200,70"
                  stroke="url(#greenGradient)"
                  strokeWidth="2"
                  fill="none"
                  className="animate-zigzag"
                />
                <defs>
                  <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#6ee7b7" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-400 mb-1">$4,925.13</div>
              <div className="text-xs text-gray-400">Referral Earnings</div>
            </div>
          </div>

          {/* Monthly Staking Reward Graph */}
          <div className="bg-gradient-to-br from-slate-800/50 to-blue-800/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
            <h3 className="text-lg font-semibold text-white mb-4">Monthly Staking Reward</h3>
            <div className="relative h-24 mb-4 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                <path
                  d="M0,80 L30,20 L60,90 L90,10 L120,70 L150,30 L180,85 L200,40"
                  stroke="url(#blueGradient)"
                  strokeWidth="2"
                  fill="none"
                  className="animate-zigzag"
                />
                <defs>
                  <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#93c5fd" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400 mb-1">$603.00</div>
              <div className="text-xs text-gray-400">Staking Returns</div>
            </div>
          </div>

          {/* Community Reward Graph */}
          <div className="bg-gradient-to-br from-slate-800/50 to-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-500/20">
            <h3 className="text-lg font-semibold text-white mb-4">Community Reward</h3>
            <div className="relative h-24 mb-4 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                <path
                  d="M0,50 L50,50 L100,50 L150,50 L200,50"
                  stroke="url(#grayGradient)"
                  strokeWidth="2"
                  fill="none"
                  className="animate-zigzag"
                />
                <defs>
                  <linearGradient id="grayGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6b7280" />
                    <stop offset="50%" stopColor="#9ca3af" />
                    <stop offset="100%" stopColor="#d1d5db" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-400 mb-1">$0</div>
              <div className="text-xs text-gray-400">Community Earnings</div>
            </div>
          </div>
        </div>

        {/* Club Statistics Section */}
        <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Club Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-300">Club A Team:</span>
                <span className="text-cyan-400 font-medium">839</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Club B Team:</span>
                <span className="text-purple-400 font-medium">24</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-300">Total Club A Business:</span>
                <span className="text-green-400 font-medium">$1,135,733.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Total Club B Business:</span>
                <span className="text-white font-medium">$0.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-lg font-semibold text-white mb-4">Withdrawals</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Total Withdrawal:</span>
                <span className="text-red-400 font-medium">USDG 82.19</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Today&apos;s Withdrawal:</span>
                <span className="text-white font-medium">USDG 0</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-lg font-semibold text-white mb-4">Deposits & Investment</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Total Deposit:</span>
                <span className="text-green-400 font-medium">$100.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Total Investment:</span>
                <span className="text-blue-400 font-medium">$10,200 / 1,478.26 USDG</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Current Matching:</span>
                <span className="text-white font-medium">$0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Links */}
        <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
          <h3 className="text-lg font-semibold text-white mb-4">Referral Links</h3>
          <div className="space-y-4">
            <div>
              <div className="text-gray-300 text-sm mb-2">Club A Referral Code:</div>
              <div className="flex items-center space-x-2">
                <input 
                  type="text" 
                  value="http://piczelite.com/member/register/PIC123456/ClubA" 
                  readOnly 
                  className="flex-1 bg-slate-700/50 text-white px-3 py-2 rounded-lg border border-purple-500/30 text-sm"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 text-sm">
                  Copy
                </button>
              </div>
            </div>
            <div>
              <div className="text-gray-300 text-sm mb-2">Club B Referral Code:</div>
              <div className="flex items-center space-x-2">
                <input 
                  type="text" 
                  value="http://piczelite.com/member/register/PIC123456/ClubB" 
                  readOnly 
                  className="flex-1 bg-slate-700/50 text-white px-3 py-2 rounded-lg border border-purple-500/30 text-sm"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 text-sm">
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-800/50 to-purple-800/50 backdrop-blur-sm border-t border-purple-500/20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Haldar AI & IT. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
