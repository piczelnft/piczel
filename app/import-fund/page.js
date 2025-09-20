'use client';

import Link from 'next/link';

export default function ImportFund() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Page Header */}
      <div className="relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Import Fund
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Send payment details after successful payment.
          </p>
        </div>

        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Import Fund Form */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/20 shadow-lg">
          <div className="space-y-6">
            
            {/* Member ID */}
            <div>
              <label className="block text-gray-300 text-sm mb-2">Member ID</label>
              <input
                type="text"
                value="DGT123456"
                readOnly
                className="w-full bg-slate-700/50 text-white px-4 py-3 rounded-lg border border-purple-500/30 focus:outline-none text-sm"
              />
            </div>

            {/* USDT Amount */}
            <div>
              <label className="block text-gray-300 text-sm mb-2">USDT Amount</label>
              <input
                type="number"
                placeholder="Enter USDT Amount"
                className="w-full bg-slate-700/50 text-white px-4 py-3 rounded-lg border border-cyan-500/30 focus:outline-none text-sm"
              />
            </div>

            {/* USDG Amount */}
            <div>
              <label className="block text-gray-300 text-sm mb-2">USDG Amount</label>
              <input
                type="text"
                value="0"
                readOnly
                className="w-full bg-slate-700/50 text-white px-4 py-3 rounded-lg border border-purple-500/30 text-sm"
              />
            </div>

            {/* Deposit Wallet Balance */}
            <div>
              <label className="block text-gray-300 text-sm mb-2">Deposit Wallet Balance</label>
              <input
                type="text"
                value="0.00"
                readOnly
                className="w-full bg-slate-700/50 text-white px-4 py-3 rounded-lg border border-indigo-500/30 text-sm"
              />
            </div>

            {/* Terms Notice */}
            <div className="text-xs text-gray-400 mt-6 leading-relaxed">
              By continuing, you accept to our{" "}
              <Link href="/terms" className="text-cyan-400 hover:underline">
                Terms of Services
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-purple-400 hover:underline">
                Privacy Policy
              </Link>
              . <br />
              Please note that payments are{" "}
              <span className="text-red-400 font-semibold">non-refundable</span>.
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 shadow-lg">
                Import Fund
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
