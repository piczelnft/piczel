"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../components/AdminLayout";

export default function CommissionManagement() {
  const router = useRouter();
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [lastProcessed, setLastProcessed] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        setError("No admin token found");
        return;
      }

      const response = await fetch("/api/admin/process-daily-commissions", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch commission statistics");
      }

      const data = await response.json();
      setStatistics(data.statistics);
    } catch (err) {
      console.error("Error fetching statistics:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processDailyCommissions = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        setError("No admin token found");
        return;
      }

      const response = await fetch("/api/admin/process-daily-commissions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process daily commissions");
      }

      const data = await response.json();
      setLastProcessed(data);
      
      // Refresh statistics
      await fetchStatistics();
      
      alert(`Daily commissions processed successfully!\n\nProcessed: ${data.summary.totalProcessed} commissions\nTotal Amount: $${data.summary.totalAmount}\nCompleted: ${data.summary.completedCommissions} commissions`);
    } catch (err) {
      console.error("Error processing daily commissions:", err);
      setError(err.message);
      alert(`Error processing daily commissions: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading commission statistics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Daily Commission Management</h1>
            <p className="mt-2 text-gray-600">Process and monitor daily commission distributions</p>
          </div>
          <button
            onClick={() => router.back()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{statistics.totalCommissions}</div>
              <div className="text-sm text-gray-600">Total Commissions</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statistics.activeCommissions}</div>
              <div className="text-sm text-gray-600">Active Commissions</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{statistics.completedCommissions}</div>
              <div className="text-sm text-gray-600">Completed Commissions</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(statistics.totalCommissionAmount)}</div>
              <div className="text-sm text-gray-600">Total Commission Amount</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{formatCurrency(statistics.totalPaidAmount)}</div>
              <div className="text-sm text-gray-600">Total Paid Amount</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{statistics.todaysCommissions}</div>
              <div className="text-sm text-gray-600">Today&apos;s Commissions</div>
            </div>
          </div>
        </div>
      )}

      {/* Process Daily Commissions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Process Daily Commissions</h2>
          <button
            onClick={processDailyCommissions}
            disabled={processing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>Process Today&apos;s Commissions</span>
              </>
            )}
          </button>
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          This will process all daily commission payments that are due today. 
          Each sponsor will receive their daily commission amount based on their NFT purchase commissions.
        </div>

        {lastProcessed && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Last Processing Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Processed:</span> {lastProcessed.summary.totalProcessed} commissions
              </div>
              <div>
                <span className="font-medium">Total Amount:</span> {formatCurrency(lastProcessed.summary.totalAmount)}
              </div>
              <div>
                <span className="font-medium">Completed:</span> {lastProcessed.summary.completedCommissions} commissions
              </div>
            </div>
            {lastProcessed.summary.errors > 0 && (
              <div className="mt-2 text-red-600">
                <span className="font-medium">Errors:</span> {lastProcessed.summary.errors}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}
      </div>

      {/* Information Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">How Daily Commissions Work</h3>
        <div className="text-sm text-blue-700 space-y-2">
          <p>• When a user buys an NFT, their sponsors receive commission over 365 days instead of instantly</p>
          <p>• Each day, sponsors receive 1/365th of their total commission amount</p>
          <p>• Level 1 sponsors get 10% of NFT value over 365 days</p>
          <p>• Level 2-10 sponsors get their respective percentages over 365 days</p>
          <p>• This system ensures long-term income distribution for sponsors</p>
          <p>• Process daily commissions manually or set up automated cron jobs</p>
        </div>
      </div>
    </AdminLayout>
  );
}
