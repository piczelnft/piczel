'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';

export default function NewWithdrawalRequests() {
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({});
  const [processingPayment, setProcessingPayment] = useState(null);

  const fetchWithdrawalRequests = useCallback(async () => {
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
        status: statusFilter,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      const response = await fetch(`/api/admin/withdrawal-requests?${params}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch withdrawal requests');
      }

      const data = await response.json();
      setWithdrawalRequests(data.requests || []);
      setPagination(data.pagination || {});
    } catch (err) {
      console.error('Error fetching withdrawal requests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchTerm, statusFilter]);

  useEffect(() => {
    fetchWithdrawalRequests();
  }, [fetchWithdrawalRequests]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

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

  const handleMetaMaskPayment = async (request) => {
    try {
      setProcessingPayment(request.requestId);
      
      // Show confirmation dialog
      const confirmMessage = `Are you sure you want to process this payment?\n\n` +
        `Amount: $${request.net}\n` +
        `To: ${request.walletAddress}\n` +
        `Member: ${request.memberId}`;
      
      if (!confirm(confirmMessage)) {
        setProcessingPayment(null);
        return;
      }
      
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        alert('MetaMask is not installed. Please install MetaMask to process payments.');
        setProcessingPayment(null);
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length === 0) {
        alert('No accounts found. Please connect your MetaMask wallet.');
        setProcessingPayment(null);
        return;
      }

      // Get the current account
      const fromAddress = accounts[0];
      
      // Convert amount to wei (assuming ETH payments)
      // You might want to adjust this based on your token
      const amountInWei = (parseFloat(request.net) * Math.pow(10, 18)).toString(16);
      
      // Get current gas price
      const gasPrice = await window.ethereum.request({
        method: 'eth_gasPrice',
      });
      
      // Create transaction parameters
      const transactionParams = {
        from: fromAddress,
        to: request.walletAddress,
        value: '0x' + amountInWei,
        gas: '0x5208', // 21000 gas limit for simple ETH transfer
        gasPrice: gasPrice,
      };

      console.log('Sending transaction with params:', transactionParams);

      // Send transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParams],
      });

      console.log('Transaction sent:', txHash);

      // Update withdrawal status to processing with transaction hash
      await handleWithdrawalAction(request.requestId, 'approve', txHash);
      
      alert(`Payment initiated successfully!\n\nTransaction Hash: ${txHash}\n\nYou can track this transaction on Etherscan.`);
      
    } catch (error) {
      console.error('MetaMask payment error:', error);
      if (error.code === 4001) {
        alert('Transaction was rejected by user.');
      } else if (error.code === -32602) {
        alert('Invalid transaction parameters. Please check the wallet address and amount.');
      } else if (error.code === -32603) {
        alert('Internal JSON-RPC error. Please try again.');
      } else {
        alert(`Payment failed: ${error.message}`);
      }
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleWithdrawalAction = async (requestId, action, transactionHash = null) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) return;

      // Add confirmation for reject action
      if (action === 'reject') {
        const request = withdrawalRequests.find(req => req.requestId === requestId);
        if (request) {
          const confirmMessage = `Are you sure you want to reject this withdrawal request?\n\n` +
            `Request ID: ${request.requestId}\n` +
            `Member: ${request.memberId}\n` +
            `Amount: $${request.net}\n\n` +
            `This action will refund the amount back to the user's balance.`;
          
          if (!confirm(confirmMessage)) {
            return;
          }
        }
      }

      const response = await fetch('/api/admin/withdrawal-requests/action', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          action,
          transactionHash
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Withdrawal action successful:', data.message);
        fetchWithdrawalRequests(); // Refresh the list
      } else {
        const errorData = await response.json();
        console.error('Error updating withdrawal request:', errorData.error);
        setError(errorData.error || 'Failed to update withdrawal request');
      }
    } catch (err) {
      console.error('Error updating withdrawal request:', err);
      setError('Network error. Please try again.');
    }
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

  if (loading && withdrawalRequests.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading withdrawal requests...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">New Withdrawal Requests</h1>
        <p className="mt-2 text-gray-600">New Withdrawal Requests to verify</p>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-blue-400">ℹ️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">MetaMask Integration</h3>
              <div className="mt-1 text-sm text-blue-700">
                <p>To process payments, you need MetaMask installed and connected. Click "Pay with MetaMask" to initiate blockchain transactions directly from your wallet.</p>
              </div>
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
                  placeholder="Search by request ID, member ID..."
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
              <label className="text-sm text-gray-700">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Id</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member Id</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Charges</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gateway</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {withdrawalRequests.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-6 py-12 text-center text-gray-500">
                    No data available in table
                  </td>
                </tr>
              ) : (
                withdrawalRequests.map((request, index) => (
                  <tr key={request.requestId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(currentPage - 1) * limit + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(request.requestDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {request.requestId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.memberId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {request.walletAddress ? `${request.walletAddress.slice(0, 6)}...${request.walletAddress.slice(-4)}` : 'N/A'}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(request.gross)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(request.charges)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(request.net)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.gateway || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        request.status === 'completed' ? 'bg-green-100 text-green-800' :
                        request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        request.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.status?.charAt(0).toUpperCase() + request.status?.slice(1) || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleMetaMaskPayment(request)}
                              disabled={processingPayment === request.requestId}
                              className={`${
                                processingPayment === request.requestId 
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-green-600 hover:text-green-900'
                              }`}
                            >
                              {processingPayment === request.requestId ? 'Processing...' : 'Pay with MetaMask'}
                            </button>
                            <button
                              onClick={() => handleWithdrawalAction(request.requestId, 'reject')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {request.status === 'processing' && (
                          <button
                            onClick={() => handleWithdrawalAction(request.requestId, 'completed')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Complete
                          </button>
                        )}
                        {request.status === 'completed' && (
                          <span className="text-green-600">Completed</span>
                        )}
                        {request.status === 'rejected' && (
                          <span className="text-red-600">Rejected</span>
                        )}
                        {request.status === 'cancelled' && (
                          <span className="text-gray-600">Cancelled</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalCount > 0 && renderPagination()}

        {/* Error State */}
        {error && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">❌</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading withdrawal requests</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={fetchWithdrawalRequests}
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
