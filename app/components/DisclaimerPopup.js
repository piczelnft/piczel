"use client";

import { useState, useEffect } from 'react';

export default function DisclaimerPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [disclaimer, setDisclaimer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show disclaimer every time user visits
    fetchDisclaimer();
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
    // Don't save to localStorage - show every time
    setShowPopup(false);
  };

  if (loading || !showPopup || !disclaimer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
      <div className="relative w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl" style={{ backgroundColor: '#1565c0' }}>
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:text-gray-200 transition-colors duration-200 z-10 p-1"
          aria-label="Close disclaimer"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-4 sm:p-6 md:p-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6 text-center pr-8 sm:pr-0">{disclaimer.title}</h2>
          
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg text-black">
            <div className="space-y-4 sm:space-y-6">
              {disclaimer.sections.map((section, index) => (
                <div key={index} className="text-center">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{section.heading}</h3>
                  <p className="text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 px-2">{section.content}</p>
                  {section.image && (
                    <div className="flex justify-center">
                      <img
                        src={section.image}
                        alt={section.heading}
                        className="w-full max-w-[280px] sm:max-w-md rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Accept Button */}
          <div className="mt-4 sm:mt-6 md:mt-8 text-center">
            <button
              onClick={handleClose}
              className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-white text-blue-900 font-bold rounded-lg hover:bg-gray-100 transition-colors duration-200 text-base sm:text-lg shadow-lg"
            >
              I Understand & Accept
            </button>
            <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-white opacity-75 px-2">
              By clicking &quot;I Understand & Accept&quot;, you acknowledge that you have read and understood this disclaimer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
