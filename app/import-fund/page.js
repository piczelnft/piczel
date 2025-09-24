'use client';

import Link from 'next/link';

export default function ImportFund() {
  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>
      {/* Page Header */}
      <div className="relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 gradient-text-enhanced animate-fadeInUp">
            Import Fund
          </h1>
          <p className="max-w-2xl mx-auto animate-fadeInUp" style={{color: 'rgba(255, 255, 255, 0.7)', animationDelay: '0.2s'}}>
            Send payment details after successful payment.
          </p>
        </div>

        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{backgroundColor: 'rgba(0, 227, 210, 0.2)'}}></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000" style={{backgroundColor: 'rgba(0, 255, 190, 0.2)'}}></div>
        </div>
      </div>

      {/* Import Fund Form */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="card-enhanced rounded-2xl p-8 shadow-lg animate-fadeInUp" style={{animationDelay: '0.4s'}}>
          <div className="space-y-6">
            
            {/* Member ID */}
            <div>
              <label className="block text-sm mb-2" style={{color: 'rgba(255, 255, 255, 0.8)'}}>Member ID</label>
              <input
                type="text"
                value="DGT123456"
                readOnly
                className="w-full text-white px-4 py-3 rounded-lg focus:outline-none text-sm transition-all duration-200"
                style={{
                  backgroundColor: 'rgba(29, 68, 67, 0.8)',
                  border: '1px solid var(--default-border)'
                }}
              />
            </div>

            {/* USDT Amount */}
            <div>
              <label className="block text-sm mb-2" style={{color: 'rgba(255, 255, 255, 0.8)'}}>USDT Amount</label>
              <input
                type="number"
                placeholder="Enter USDT Amount"
                className="w-full text-white px-4 py-3 rounded-lg focus:outline-none text-sm transition-all duration-200"
                style={{
                  backgroundColor: 'rgba(29, 68, 67, 0.8)',
                  border: '1px solid var(--default-border)',
                  focusRingColor: 'var(--primary-color)'
                }}
              />
            </div>

            {/* USDG Amount */}
            <div>
              <label className="block text-sm mb-2" style={{color: 'rgba(255, 255, 255, 0.8)'}}>USDG Amount</label>
              <input
                type="text"
                value="0"
                readOnly
                className="w-full text-white px-4 py-3 rounded-lg text-sm transition-all duration-200"
                style={{
                  backgroundColor: 'rgba(29, 68, 67, 0.8)',
                  border: '1px solid var(--default-border)'
                }}
              />
            </div>

            {/* Deposit Wallet Balance */}
            <div>
              <label className="block text-sm mb-2" style={{color: 'rgba(255, 255, 255, 0.8)'}}>Deposit Wallet Balance</label>
              <input
                type="text"
                value="0.00"
                readOnly
                className="w-full text-white px-4 py-3 rounded-lg text-sm transition-all duration-200"
                style={{
                  backgroundColor: 'rgba(29, 68, 67, 0.8)',
                  border: '1px solid var(--default-border)'
                }}
              />
            </div>

            {/* Terms Notice */}
            <div className="text-xs mt-6 leading-relaxed" style={{color: 'rgba(255, 255, 255, 0.6)'}}>
              By continuing, you accept to our{" "}
              <Link href="/terms" className="hover:underline transition-colors duration-200" style={{color: 'var(--primary-color)'}}>
                Terms of Services
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="hover:underline transition-colors duration-200" style={{color: 'var(--secondary-color)'}}>
                Privacy Policy
              </Link>
              . <br />
              Please note that payments are{" "}
              <span className="font-semibold" style={{color: 'rgb(var(--danger-rgb))'}}>non-refundable</span>.
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button className="btn-enhanced w-full py-3 rounded-lg text-white font-semibold transition-all duration-300 shadow-lg">
                Import Fund
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
