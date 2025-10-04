'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const SupportTicketsPage = () => {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [ticketsData, setTicketsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});

  // Fetch tickets from API
  useEffect(() => {
    const fetchTickets = async () => {
      if (!token) {
        setError('Please login to view support tickets');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/support/tickets?page=${currentPage}&limit=${entriesPerPage}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTicketsData(data.tickets);
          setPagination(data.pagination);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch support tickets');
        }
      } catch (err) {
        setError('Network error. Please try again.');
        console.error('Error fetching tickets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [token, currentPage, entriesPerPage]);

  const filteredData = ticketsData.filter(item =>
    item.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEntries = pagination.totalCount || filteredData.length;
  const totalPages = pagination.totalPages || Math.ceil(totalEntries / entriesPerPage);
  const startIndex = pagination.startIndex || (currentPage - 1) * entriesPerPage;
  const endIndex = pagination.endIndex || startIndex + entriesPerPage;
  const currentData = filteredData;

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEntriesChange = (e) => {
    setEntriesPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-green-500/20 text-green-400';
      case 'In Progress':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Resolved':
        return 'bg-blue-500/20 text-blue-400';
      case 'Closed':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500/20 text-red-400';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Low':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading support tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Support Tickets</h1>
          <p className="text-lg text-gray-300">View and manage your support tickets</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-center">{error}</p>
          </div>
        )}

        <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-8 text-center">Support Ticket</h2>
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-4">
              <label className="text-gray-300 text-sm font-medium">Show</label>
              <select
                value={entriesPerPage}
                onChange={handleEntriesChange}
                className="px-3 py-2 bg-slate-700/50 text-white border border-purple-500/30 rounded-lg text-sm focus:outline-none focus:border-purple-400 transition-colors"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-gray-300 text-sm">entries</span>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-gray-300 text-sm font-medium">Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search..."
                className="px-3 py-2 bg-slate-700/50 text-white border border-purple-500/30 rounded-lg text-sm focus:outline-none focus:border-purple-400 transition-colors placeholder-gray-400 w-48"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gradient-to-r from-slate-700/50 to-purple-700/50 border-b border-purple-500/30">
                  <th className="px-6 py-4 text-white font-semibold">S.No</th>
                  <th className="px-6 py-4 text-white font-semibold">Ticket ID</th>
                  <th className="px-6 py-4 text-white font-semibold">Subject</th>
                  <th className="px-6 py-4 text-white font-semibold">Status</th>
                  <th className="px-6 py-4 text-white font-semibold">Priority</th>
                  <th className="px-6 py-4 text-white font-semibold">Category</th>
                  <th className="px-6 py-4 text-white font-semibold">Created Date</th>
                  <th className="px-6 py-4 text-white font-semibold">Last Updated</th>
                  <th className="px-6 py-4 text-white font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-8 text-center text-gray-400">
                      {searchTerm ? 'No tickets found matching your search.' : 'No support tickets found.'}
                    </td>
                  </tr>
                ) : (
                  currentData.map((ticket, index) => (
                    <tr key={ticket._id} className="border-b border-purple-500/20 hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 text-gray-300">{startIndex + index}</td>
                      <td className="px-6 py-4 text-cyan-400 font-medium">{ticket.ticketId}</td>
                      <td className="px-6 py-4 text-white font-medium">{ticket.subject}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-purple-400 font-medium">{ticket.category}</td>
                      <td className="px-6 py-4 text-gray-300">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {new Date(ticket.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg text-xs font-medium hover:from-cyan-600 hover:to-purple-700 transition-all duration-300">
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Info */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-gray-300 text-sm">
              Showing {startIndex + 1} to {Math.min(endIndex, totalEntries)} of {totalEntries} entries
            </div>
            
            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-slate-700/50 text-white border border-purple-500/30 rounded-lg text-sm hover:bg-slate-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, currentPage - 2) + i;
                  if (page > totalPages) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                          : 'bg-slate-700/50 text-gray-300 border border-purple-500/30 hover:bg-slate-600/50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-slate-700/50 text-white border border-purple-500/30 rounded-lg text-sm hover:bg-slate-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportTicketsPage;
