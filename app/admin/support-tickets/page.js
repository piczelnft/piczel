'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({});
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [stats, setStats] = useState({});

  const fetchTickets = useCallback(async () => {
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
        status: selectedStatus,
        priority: selectedPriority,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      const response = await fetch(`/api/admin/support-tickets?${params}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch support tickets');
      }

      const data = await response.json();
      setTickets(data.tickets);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching support tickets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchTerm, selectedStatus, selectedPriority]);

  const fetchTicketStats = useCallback(async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) return;

      const response = await fetch('/api/admin/support-ticket-stats', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching ticket stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    fetchTicketStats();
  }, [fetchTickets, fetchTicketStats]);

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

  const getStatusBadge = (status) => {
    const statusConfig = {
      'open': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Open' },
      'in_progress': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'In Progress' },
      'resolved': { bg: 'bg-green-100', text: 'text-green-800', label: 'Resolved' },
      'closed': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Closed' },
      'pending': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Pending' }
    };

    const config = statusConfig[status] || statusConfig['open'];

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.text.replace('text-', 'bg-')}`}></span>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'low': { bg: 'bg-green-100', text: 'text-green-800', label: 'Low' },
      'medium': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Medium' },
      'high': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'High' },
      'urgent': { bg: 'bg-red-100', text: 'text-red-800', label: 'Urgent' }
    };

    const config = priorityConfig[priority] || priorityConfig['medium'];

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) return;

      const response = await fetch('/api/admin/support-tickets/update-status', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId,
          status: newStatus
        }),
      });

      if (response.ok) {
        fetchTickets();
        fetchTicketStats();
      }
    } catch (err) {
      console.error('Error updating ticket status:', err);
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

  if (loading && tickets.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading support tickets...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
        <p className="mt-2 text-gray-600">Manage and respond to customer support tickets</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎫</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Tickets</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalTickets || 0}</p>
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
              <h3 className="text-lg font-medium text-gray-900">Open</h3>
              <p className="text-3xl font-bold text-green-600">{stats.openTickets || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">In Progress</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats.inProgressTickets || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Resolved</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.resolvedTickets || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🚨</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Urgent</h3>
              <p className="text-3xl font-bold text-red-600">{stats.urgentTickets || 0}</p>
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
                  placeholder="Search by ticket ID, subject, or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="pending">Pending</option>
              </select>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
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
                  Ticket ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr key={ticket.ticketId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{ticket.ticketId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {ticket.userName?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {ticket.userName || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ticket.userEmail || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={ticket.subject}>
                      {ticket.subject}
                    </div>
                    <div className="text-sm text-gray-500 max-w-xs truncate" title={ticket.description}>
                      {ticket.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ticket.category || 'General'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPriorityBadge(ticket.priority)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(ticket.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(ticket.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {ticket.status === 'open' && (
                        <button
                          onClick={() => handleStatusUpdate(ticket._id, 'in_progress')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Start
                        </button>
                      )}
                      {ticket.status === 'in_progress' && (
                        <button
                          onClick={() => handleStatusUpdate(ticket._id, 'resolved')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Resolve
                        </button>
                      )}
                      <button className="text-purple-600 hover:text-purple-900">
                        View
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Close
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalCount > 0 && renderPagination()}

        {/* Empty State */}
        {!loading && tickets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎫</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No support tickets found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all' ? 'Try adjusting your search criteria.' : 'No support tickets have been created yet.'}
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
                  <h3 className="text-sm font-medium text-red-800">Error loading support tickets</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={fetchTickets}
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
