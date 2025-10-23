"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../components/AdminLayout";

export default function NFTPayoutHistory() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({});
  const [searchTimeout, setSearchTimeout] = useState(null);

  const fetchPayouts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        setError("No admin token found");
        return;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        search: searchTerm,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      // Try to fetch from API, but fall back to mock data if it doesn't exist
      let payouts = [];
      try {
        const response = await fetch(`/api/admin/nft-payouts?${params}`, {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched payout history data:", data); // Debug log
          payouts = data.payouts || [];
        } else {
          console.log("API endpoint not available, using mock data");
          // Fall back to mock data
        }
      } catch (apiError) {
        console.log("API error, using mock data:", apiError.message);
        // Fall back to mock data
      }

      // Use mock data if API is not available or returns empty
      // Comment out mock data to show "No payout history" message
      // if (payouts.length === 0) {
      //   payouts = [
      //   {
      //     _id: "payout-1",
      //     userId: "user-1",
      //     userName: "John Doe",
      //     userEmail: "john@example.com",
      //     memberId: "MMH123456",
      //     amount: 103.75,
      //     nftCount: 1,
      //     nftCodes: ["A1"],
      //     status: "completed",
      //     processedAt: new Date().toISOString(),
      //     processedBy: "admin@example.com"
      //   },
      //   {
      //     _id: "payout-2", 
      //     userId: "user-2",
      //     userName: "Jane Smith",
      //     userEmail: "jane@example.com",
      //     memberId: "MMH789012",
      //     amount: 207.50,
      //     nftCount: 2,
      //     nftCodes: ["A1", "A2"],
      //     status: "completed",
      //     processedAt: new Date(Date.now() - 86400000).toISOString(),
      //     processedBy: "admin@example.com"
      //   },
      //   {
      //     _id: "payout-3",
      //     userId: "user-3", 
      //     userName: "Bob Wilson",
      //     userEmail: "bob@example.com",
      //     memberId: "MMH345678",
      //     amount: 311.25,
      //     nftCount: 3,
      //     nftCodes: ["A1", "A2", "A3"],
      //     status: "pending",
      //     processedAt: null,
      //     processedBy: null
      //   }
      //   ];
      // }

      setPayouts(payouts);
      setPagination({
        total: payouts.length,
        totalPages: Math.ceil(payouts.length / limit),
        currentPage: currentPage
      });
    } catch (err) {
      console.error("Error fetching payouts:", err);
      // Don't set error for missing API, just show empty state
      setPayouts([]);
      setPagination({
        total: 0,
        totalPages: 1,
        currentPage: 1
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchTerm]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      fetchPayouts();
    }, 500);

    setSearchTimeout(timeout);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Completed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-red-600 text-lg font-medium mb-2">
              Error Loading Payout History
            </div>
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchPayouts}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">NFT Payout History</h1>
            <p className="text-gray-600 mt-1">
              Track all NFT market withdrawal payouts and their status
            </p>
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                📝 <strong>Note:</strong> Currently showing sample data. Real payout history will appear here once payouts are processed from the Withdrawal Management page.
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by user name, email, or member ID..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={limit}
                onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* No Data Message */}
        {!loading && payouts.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <div className="text-blue-600 text-lg font-medium mb-2">
              No Payout History Found
            </div>
            <div className="text-blue-500 text-sm">
              There are no NFT payout records available at this time.
            </div>
          </div>
        )}

        {/* Payouts Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NFT Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Processed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payouts.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No payout history found
                    </td>
                  </tr>
                )}
                {payouts.map((payout, index) => (
                  <tr key={payout._id || `payout-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-purple-600">
                              {payout.userName?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {payout.userName || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">{payout.userEmail || 'No email'}</div>
                          <div className="text-xs text-gray-400">ID: {payout.memberId || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payout.nftCount} NFTs</div>
                      <div className="text-xs text-gray-500">{payout.nftCodes?.join(', ') || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        {formatCurrency(payout.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payout.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {payout.processedAt ? new Date(payout.processedAt).toLocaleDateString() : 'Not processed'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {payout.processedBy || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {payout.status === 'pending' && (
                        <button
                          className="text-green-600 hover:text-green-900"
                          onClick={() => {
                            // TODO: Implement approve payout
                            alert(`Approve payout for ${payout.userName}`);
                          }}
                        >
                          Approve
                        </button>
                      )}
                      {payout.status === 'completed' && (
                        <span className="text-gray-400">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && (pagination.totalPages || 0) > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === (pagination.totalPages || 1)}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {((currentPage - 1) * limit + 1) || 0}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * limit, pagination.total || 0) || 0}
                    </span>{" "}
                    of <span className="font-medium">{pagination.total || 0}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, pagination.totalPages || 1) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? "z-10 bg-purple-50 border-purple-500 text-purple-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === (pagination.totalPages || 1)}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Total Payouts</div>
            <div className="text-2xl font-bold text-gray-900">{pagination.total || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Completed</div>
            <div className="text-2xl font-bold text-green-600">
              {payouts.filter(p => p.status === 'completed').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">
              {payouts.filter(p => p.status === 'pending').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Total Amount</div>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(payouts.reduce((sum, payout) => sum + payout.amount, 0))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
