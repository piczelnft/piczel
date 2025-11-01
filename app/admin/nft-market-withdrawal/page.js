"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../components/AdminLayout";

export default function NFTMarketWithdrawal() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({});
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [selectedPayouts, setSelectedPayouts] = useState(new Set()); // Changed from selectedUsers
  const [selectAll, setSelectAll] = useState(false);

  // Fetch NFT purchases for all users
  const fetchNftPurchases = useCallback(async (userIds) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken || !userIds.length) return {};

      const response = await fetch('/api/admin/nft-purchases', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        method: 'POST',
        body: JSON.stringify({ userIds })
      });

      if (response.ok) {
        const data = await response.json();
        return data.purchases || {};
      }
    } catch (err) {
      console.error("Error fetching NFT purchases:", err);
    }
    return {};
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        setError("No admin token found");
        return;
      }

      // Use the same API as NFT Counter which is working
      // Fetch more data to ensure we have enough for pagination
      const params = new URLSearchParams({
        page: "1", // Always fetch from page 1 to get all data
        limit: "1000", // Fetch a large number to get all users
        search: searchTerm,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      const response = await fetch(`/api/admin/nft-purchases?${params}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch NFT purchases");
      }

      const data = await response.json();
      console.log("Fetched NFT purchases data:", data); // Debug log
      
      const purchases = data.items || [];
      
      // Group purchases by user
      const userMap = new Map();
      
      purchases.forEach(purchase => {
        const userId = purchase.userId || purchase.user?._id;
        const userName = purchase.user?.name || purchase.userName || 'Unknown User';
        const userEmail = purchase.user?.email || purchase.userEmail || 'No email';
        const memberId = purchase.user?.memberId || purchase.memberId || 'N/A';
        
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            _id: userId,
            name: userName,
            email: userEmail,
            memberId: memberId,
            nftPurchases: []
          });
        }
        
        userMap.get(userId).nftPurchases.push({
          code: purchase.code,
          series: purchase.series,
          purchasedAt: purchase.purchasedAt
        });
      });
      
      const allUsers = Array.from(userMap.values());
      console.log("Processed users:", allUsers); // Debug log
      
      // Apply pagination to the processed users
      const startIndex = (currentPage - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = allUsers.slice(startIndex, endIndex);
      
      setUsers(paginatedUsers);
      setPagination({
        total: allUsers.length,
        totalPages: Math.ceil(allUsers.length / limit),
        currentPage: currentPage
      });
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      fetchUsers();
    }, 500);

    setSearchTimeout(timeout);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Clear selection when changing pages
    setSelectedPayouts(new Set());
    setSelectAll(false);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  // Handle individual payout selection
  const handlePayoutSelect = (payoutId) => {
    const newSelected = new Set(selectedPayouts);
    if (newSelected.has(payoutId)) {
      newSelected.delete(payoutId);
    } else {
      newSelected.add(payoutId);
    }
    setSelectedPayouts(newSelected);
    // Determine if all payouts on the current page are selected
    const allPayoutIdsOnPage = users.flatMap(user => calculateIndividualNftPayouts(user).individualPayouts.map(p => p.id));
    setSelectAll(allPayoutIdsOnPage.length > 0 && allPayoutIdsOnPage.every(id => newSelected.has(id)));
  };

  // Handle select all/none
  const handleSelectAll = () => {
    const allPayoutIdsOnPage = users.flatMap(user => calculateIndividualNftPayouts(user).individualPayouts.map(p => p.id));
    if (selectAll) {
      setSelectedPayouts(new Set(selectedPayouts.keys().filter(id => !allPayoutIdsOnPage.includes(id))));
    } else {
      const newSelected = new Set(selectedPayouts);
      allPayoutIdsOnPage.forEach(id => newSelected.add(id));
      setSelectedPayouts(newSelected);
    }
    setSelectAll(!selectAll);
  };

  // Handle batch payout
  const handleBatchPayout = () => {
    if (selectedPayouts.size === 0) {
      alert('Please select at least one NFT payout to process.');
      return;
    }

    const selectedIndividualPayouts = users.flatMap(user => 
      calculateIndividualNftPayouts(user).individualPayouts
    ).filter(payout => selectedPayouts.has(payout.id));

    const totalAmount = selectedIndividualPayouts.reduce((sum, payout) => sum + payout.totalHolding, 0);
    const payoutNfts = selectedIndividualPayouts.map(payout => payout.nftCode).join(', ');
    const uniqueUsersCount = new Set(selectedIndividualPayouts.map(p => p.user._id)).size;
    
    const confirmed = window.confirm(
      `Process batch payout for ${selectedPayouts.size} NFTs across ${uniqueUsersCount} user${uniqueUsersCount !== 1 ? 's' : ''}?

NFTs: ${payoutNfts}
Total Amount: ${formatCurrency(totalAmount)}

This action will transfer the holding wallet amounts for the selected NFTs.`
    );

    if (confirmed) {
      // TODO: Implement actual batch payout API call for individual payouts
      alert(`Batch payout of ${formatCurrency(totalAmount)} processed for ${selectedPayouts.size} NFTs.`);
      setSelectedPayouts(new Set());
      setSelectAll(false);
    }
  };

  // Calculate individual NFT payout data
  const calculateIndividualNftPayouts = (user) => {
    console.log("Calculating individual NFT payouts for user:", user); // Debug log
    
    // Check for NFT purchases in different possible formats
    let nftPurchases = [];
    if (user.nftPurchases && Array.isArray(user.nftPurchases)) {
      nftPurchases = user.nftPurchases;
    } else if (user.purchases && Array.isArray(user.purchases)) {
      nftPurchases = user.purchases;
    } else if (user.nftData && Array.isArray(user.nftData)) {
      nftPurchases = user.nftData;
    }

    if (!nftPurchases || nftPurchases.length === 0) {
      return { individualPayouts: [], totalValue: 0, totalProfit: 0, totalHolding: 0, nftCount: 0 };
    }

    // Calculate individual payout for each NFT
    const individualPayouts = nftPurchases.map((nft, index) => {
      const purchasePrice = 100; // $100 per NFT
      const profit = 5; // $5 profit per NFT
      const profitAfterTax = profit - (profit * 0.25); // 25% tax on profit
      const totalHolding = purchasePrice + profitAfterTax;

      return {
        id: `${user._id}-${nft.code || nft.series || index}`,
        nftCode: nft.code || nft.series || `NFT-${index + 1}`,
        purchasePrice: purchasePrice,
        profit: profit,
        profitAfterTax: profitAfterTax,
        totalHolding: totalHolding,
        purchasedAt: nft.purchasedAt || new Date().toISOString(),
        user: user
      };
    });

    // Calculate totals
    const totalValue = individualPayouts.reduce((sum, payout) => sum + payout.purchasePrice, 0);
    const totalProfit = individualPayouts.reduce((sum, payout) => sum + payout.profitAfterTax, 0);
    const totalHolding = individualPayouts.reduce((sum, payout) => sum + payout.totalHolding, 0);

    return {
      individualPayouts: individualPayouts,
      totalValue: totalValue,
      totalProfit: totalProfit,
      totalHolding: totalHolding,
      nftCount: nftPurchases.length
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Retry
          </button>
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
            <h1 className="text-2xl font-bold text-gray-900">NFT Market Withdrawal</h1>
            <p className="text-gray-600 mt-1">
              Manage users&apos; holding wallet amounts and NFT withdrawal requests
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, email, or user ID..."
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

        {/* Batch Actions */}
        {selectedPayouts.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-800">
                  {selectedPayouts.size} NFT payout{selectedPayouts.size !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => {
                    setSelectedPayouts(new Set());
                    setSelectAll(false);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear Selection
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBatchPayout}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  💰 Batch Payout ({formatCurrency(
                    users
                      .flatMap(user => calculateIndividualNftPayouts(user).individualPayouts)
                      .filter(payout => selectedPayouts.has(payout.id))
                      .reduce((sum, payout) => sum + payout.totalHolding, 0)
                  )})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NFT Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchase Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit (After Tax)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Payout
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchased Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No NFT payouts found
                    </td>
                  </tr>
                )}
                {users.map((user, userIndex) => {
                  const payoutData = calculateIndividualNftPayouts(user);
                  return payoutData.individualPayouts.map((payout, payoutIndex) => (
                    <tr key={payout.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedPayouts.has(payout.id)}
                          onChange={() => handlePayoutSelect(payout.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-purple-600">
                                {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || 'User'}
                            </div>
                            <div className="text-sm text-gray-500">{user.email || 'No email'}</div>
                            <div className="text-xs text-gray-400">ID: {user.memberId || user._id?.substring(0, 8) || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payout.nftCode}</div>
                        <div className="text-xs text-gray-500">NFT #{payoutIndex + 1}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">
                          {formatCurrency(payout.purchasePrice)}
                        </div>
                        <div className="text-xs text-gray-500">Purchase amount</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          {formatCurrency(payout.profitAfterTax)}
                        </div>
                        <div className="text-xs text-gray-500">After 25% tax</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-purple-600">
                          {formatCurrency(payout.totalHolding)}
                        </div>
                        <div className="text-xs text-gray-500">Total payout</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(payout.purchasedAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(payout.purchasedAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
                          onClick={() => {
                            const confirmed = window.confirm(
                              `Process payout of ${formatCurrency(payout.totalHolding)} for ${payout.nftCode} to ${user.name || user.email || 'User'}?\n\nThis action will transfer the holding wallet amount for this specific NFT to the user.`
                            );
                            if (confirmed) {
                              // TODO: Implement actual payout API call
                              alert(`Payout of ${formatCurrency(payout.totalHolding)} processed for ${payout.nftCode} to ${user.name || user.email || 'User'}`);
                            }
                          }}
                        >
                          💰 Payout {formatCurrency(payout.totalHolding)}
                        </button>
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Grid */}
          <div className="md:hidden p-4">
            <div className="grid grid-cols-1 gap-4">
              {users.map((user, userIndex) => {
                const payoutData = calculateIndividualNftPayouts(user);
                return payoutData.individualPayouts.map((payout, payoutIndex) => (
                  <div key={payout.id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedPayouts.has(payout.id)}
                          onChange={() => handlePayoutSelect(payout.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {user.name || user.email || 'User'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {user.email || 'No email'}
                          </p>
                          <p className="text-xs text-gray-400">
                            ID: {user._id?.substring(0, 8) || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3 p-3 bg-white rounded-lg border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900">{payout.nftCode}</span>
                        <span className="text-xs text-gray-500">NFT #{payoutIndex + 1}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Purchased: {new Date(payout.purchasedAt).toLocaleDateString()} at {new Date(payout.purchasedAt).toLocaleTimeString()}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Purchase Price:</span>
                        <span className="font-medium text-blue-600">{formatCurrency(payout.purchasePrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Profit (After Tax):</span>
                        <span className="font-medium text-green-600">{formatCurrency(payout.profitAfterTax)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-gray-900">Total Payout:</span>
                        <span className="text-purple-600">{formatCurrency(payout.totalHolding)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <button
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        onClick={() => {
                          const confirmed = window.confirm(
                            `Process payout of ${formatCurrency(payout.totalHolding)} for ${payout.nftCode} to ${user.name || user.email || 'User'}?\n\nThis action will transfer the holding wallet amount for this specific NFT to the user.`
                          );
                          if (confirmed) {
                            // TODO: Implement actual payout API call
                            alert(`Payout of ${formatCurrency(payout.totalHolding)} processed for ${payout.nftCode} to ${user.name || user.email || 'User'}`);
                          }
                        }}
                      >
                        💰 Payout {formatCurrency(payout.totalHolding)}
                      </button>
                    </div>
                  </div>
                ));
              })}
            </div>
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
            <div className="text-sm font-medium text-gray-500">Total Users</div>
            <div className="text-2xl font-bold text-gray-900">{pagination.total || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Total NFT Payouts</div>
            <div className="text-2xl font-bold text-blue-600">
              {users.reduce((sum, user) => {
                const payoutData = calculateIndividualNftPayouts(user);
                return sum + payoutData.nftCount;
              }, 0)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Total Purchase Value</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(
                users.reduce((sum, user) => {
                  const payoutData = calculateIndividualNftPayouts(user);
                  return sum + payoutData.totalValue;
                }, 0)
              )}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Total Payout Value</div>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(
                users.reduce((sum, user) => {
                  const payoutData = calculateIndividualNftPayouts(user);
                  return sum + payoutData.totalHolding;
                }, 0)
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
