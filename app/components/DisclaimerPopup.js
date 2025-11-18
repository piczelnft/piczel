"use client";

import { useState, useEffect } from 'react';

export default function DisclaimerPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [disclaimer, setDisclaimer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has seen the disclaimer
    const hasSeenDisclaimer = localStorage.getItem('hasSeenDisclaimer');
    if (!hasSeenDisclaimer) {
      fetchDisclaimer();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchDisclaimer = async () => {
    try {
      const response = await fetch('/api/admin/disclaimer');
      const data = await response.json();
      setDisclaimer(data);
      setShowPopup(true);
    } catch (error) {
      console.error('Error fetching disclaimer:', error);
      // Show default disclaimer if fetch fails
      setDisclaimer({
        title: '⚠️ Important Disclaimer',
        sections: [
          {
            heading: 'Platform Notice',
            content: 'Welcome to PICZEL NFT Platform. Please read this disclaimer carefully before using our services.'
          },
          {
            heading: 'Investment Risk',
            content: 'Trading and investing in NFTs and cryptocurrencies involves substantial risk of loss. You should carefully consider whether such activities are suitable for you in light of your circumstances and financial resources.'
          }
        ]
      });
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    localStorage.setItem('hasSeenDisclaimer', 'true');
    setShowPopup(false);
  };

  if (loading || !showPopup || !disclaimer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
      <div className="relative w-full rounded-lg shadow-2xl" style={{ backgroundColor: '#1565c0', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors duration-200 z-10"
          aria-label="Close disclaimer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">{disclaimer.title}</h2>
          
          <div className="bg-white p-6 rounded-lg text-black">
            <div className="space-y-4">
              {disclaimer.sections.map((section, index) => (
                <div key={index}>
                  <h3 className="text-xl font-semibold mb-2">{section.heading}</h3>
                  <p className="text-sm leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Accept Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleClose}
              className="px-8 py-3 bg-white text-blue-900 font-bold rounded-lg hover:bg-gray-100 transition-colors duration-200 text-lg shadow-lg"
            >
              I Understand & Accept
            </button>
            <p className="mt-4 text-xs text-white opacity-75">
              By clicking &quot;I Understand & Accept&quot;, you acknowledge that you have read and understood this disclaimer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
