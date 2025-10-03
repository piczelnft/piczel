'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';

export default function WalletAddressPage() {
  const [walletAddresses, setWalletAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({});

  const fetchWalletAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        setError('No admin token found');
        return;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        search: searchTerm,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      const response = await fetch(`/api/admin/wallet-addresses?${params}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wallet addresses');
      }

      const data = await response.json();
      setWalletAddresses(data.walletAddresses);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching wallet addresses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchTerm]);

  useEffect(() => {
    fetchWalletAddresses();
  }, [fetchWalletAddresses]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getConnectionStatusBadge = (isConnected) => {
    if (isConnected) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
          Connected
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1.5"></span>
          Disconnected
        </span>
      );
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const renderPagination = () => {
    if (!pagination.totalPages || pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-2 text-sm font-medium rounded-md ${
            currentPage === i
              ? 'bg-purple-600 text-white'
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-700">
          Showing {pagination.startIndex} to {pagination.endIndex} of {pagination.totalCount} entries
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {pages}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  if (loading && walletAddresses.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading wallet addresses...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Wallet Address Management</h1>
        <p className="mt-2 text-gray-600">Manage and monitor user wallet addresses</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔗</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Wallets</h3>
              <p className="text-3xl font-bold text-blue-600">{pagination.totalCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Connected</h3>
              <p className="text-3xl font-bold text-green-600">
                {walletAddresses.filter(w => w.isConnected).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Disconnected</h3>
              <p className="text-3xl font-bold text-red-600">
                {walletAddresses.filter(w => !w.isConnected).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Connection Rate</h3>
              <p className="text-3xl font-bold text-purple-600">
                {pagination.totalCount > 0 
                  ? Math.round((walletAddresses.filter(w => w.isConnected).length / pagination.totalCount) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Search and Filter */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by member ID, name, or wallet address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-sm text-gray-700">Show:</label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value={10}>10 entries</option>
                <option value={25}>25 entries</option>
                <option value={50}>50 entries</option>
                <option value={100}>100 entries</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  S.No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wallet Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Network
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Connected At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {walletAddresses.map((wallet, index) => (
                <tr key={wallet._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(currentPage - 1) * limit + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {wallet.memberName?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {wallet.memberName || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {wallet.memberId || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <code className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : 'Not Connected'}
                      </code>
                      {wallet.address && (
                        <button
                          onClick={() => copyToClipboard(wallet.address)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copy full address"
                        >
                          📋
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {wallet.network || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {wallet.connectedAt ? formatDate(wallet.connectedAt) : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getConnectionStatusBadge(wallet.isConnected)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      View Details
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      Disconnect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalCount > 0 && renderPagination()}

        {/* Empty State */}
        {!loading && walletAddresses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔗</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No wallet addresses found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria.' : 'No users have connected their wallets yet.'}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">❌</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading wallet addresses</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={fetchWalletAddresses}
                      className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
