"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function SponsorChainDebug() {
  const { token } = useAuth();
  const [sponsorChain, setSponsorChain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSponsorChain = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/debug/sponsor-chain", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch sponsor chain");
        }

        const data = await response.json();
        setSponsorChain(data);
      } catch (err) {
        console.error("Error fetching sponsor chain:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSponsorChain();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sponsor chain...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Sponsor Chain Debug</h1>
        
        {sponsorChain && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Member ID:</strong> {sponsorChain.user.memberId}</p>
                <p><strong>Name:</strong> {sponsorChain.user.name}</p>
                <p><strong>Sponsor ID:</strong> {sponsorChain.user.sponsorId || "None"}</p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Sponsor Chain</h2>
              <p className="text-gray-600 mb-4">Total levels found: {sponsorChain.totalLevels}</p>
              
              {sponsorChain.sponsorChain.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">No sponsors found in your chain. This means you won&apos;t receive any commission from NFT purchases.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sponsorChain.sponsorChain.map((sponsor, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">Level {sponsor.level}</p>
                          <p className="text-gray-600">Member ID: {sponsor.memberId}</p>
                          <p className="text-gray-600">Name: {sponsor.name}</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {sponsor.level === 1 ? "Direct Sponsor" : `Level ${sponsor.level} Sponsor`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Commission Rates</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Level 1 (Direct): 10% = $10 over 365 days ($0.0274/day)</p>
                <p>• Level 2: 3% = $3 over 365 days ($0.0082/day)</p>
                <p>• Level 3: 2% = $2 over 365 days ($0.0055/day)</p>
                <p>• Level 4-5: 1% each = $1 over 365 days ($0.0027/day each)</p>
                <p>• Level 6: 1% = $1 over 365 days ($0.0027/day)</p>
                <p>• Level 7-10: 0.5% each = $0.50 over 365 days ($0.0014/day each)</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
