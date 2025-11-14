'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const TeamMembersPage = () => {
  const { user, token, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [membersData, setMembersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalMembers: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
    startIndex: 0,
    endIndex: 0
  });

  // Fetch team members data
  const fetchMembersData = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: entriesPerPage.toString(),
        ...(searchTerm && { search: searchTerm })
      });
      
      const response = await fetch(`/api/team/members?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }

      const data = await response.json();
      setMembersData(data.members || []);
      setPagination(prev => data.pagination || prev);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError(err.message);
      // Fallback to empty array if API fails
      setMembersData([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, currentPage, entriesPerPage, searchTerm]);

  // Fetch data when component mounts or dependencies change
  useEffect(() => {
    fetchMembersData();
  }, [fetchMembersData]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEntriesChange = (e) => {
    setEntriesPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when changing entries per page
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return {
          backgroundColor: 'rgba(var(--success-rgb), 0.2)',
          color: 'rgb(var(--success-rgb))'
        };
      case 'Inactive':
        return {
          backgroundColor: 'rgba(var(--danger-rgb), 0.2)',
          color: 'rgb(var(--danger-rgb))'
        };
      case 'Pending':
        return {
          backgroundColor: 'rgba(var(--warning-rgb), 0.2)',
          color: 'rgb(var(--warning-rgb))'
        };
      default:
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          color: 'rgba(255, 255, 255, 0.8)'
        };
    }
  };

  // Loading state
  if (loading && membersData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[#1565c0] text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1565c0] mx-auto mb-4"></div>
          <p>Loading team members...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && membersData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[#1565c0] text-center max-w-md">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button 
            onClick={fetchMembersData}
            className="px-4 py-2 rounded bg-[#1565c0] text-white font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex p-4 sm:p-8 pt-20 lg:pt-8 bg-white">

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold text-[#1565c0] mb-2 animate-fadeInUp">My Directs</h1>
          <p className="text-base sm:text-lg animate-fadeInUp text-[#1565c0]/80" style={{animationDelay: '0.2s'}}>Check your Genealogy</p>
          <div className="mt-4">
            <button 
              onClick={fetchMembersData}
              className="px-4 py-2 rounded bg-[#1565c0] text-white font-semibold text-sm flex items-center space-x-2 mx-auto"
              disabled={loading}
            >
              <span className={`text-sm ${loading ? 'animate-spin' : ''}`}>
                {loading ? '⟳' : '↻'}
              </span>
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        <div className="rounded-2xl p-4 sm:p-8 shadow-lg animate-fadeInUp" style={{animationDelay: '0.4s', background:'#1565c0', color:'#fff'}}>
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-6 sm:mb-8 text-center">My Directs</h2>
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <label className="text-xs sm:text-sm font-medium text-white/80">Show</label>
              <select
                value={entriesPerPage}
                onChange={handleEntriesChange}
                className="px-2 sm:px-3 py-2 text-[#1565c0] rounded-lg text-xs sm:text-sm focus:outline-none transition-colors"
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #1565c0'
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-xs sm:text-sm text-white/80">entries</span>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-xs sm:text-sm font-medium text-white/80">Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search..."
                className="px-2 sm:px-3 py-2 text-[#1565c0] rounded-lg text-xs sm:text-sm focus:outline-none transition-colors placeholder-[#1565c0]/50 w-32 sm:w-48"
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #1565c0'
                }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left">
              <thead>
                <tr style={{background: '#1565c0', borderBottom: '1px solid #fff'}}>
                  <th className="px-2 sm:px-6 py-3 sm:py-4 text-white font-semibold">S.No</th>
                  <th className="px-2 sm:px-6 py-3 sm:py-4 text-white font-semibold hidden sm:table-cell">Image</th>
                  <th className="px-2 sm:px-6 py-3 sm:py-4 text-white font-semibold">Joining Date</th>
                  <th className="px-2 sm:px-6 py-3 sm:py-4 text-white font-semibold">Member ID</th>
                  <th className="px-2 sm:px-6 py-3 sm:py-4 text-white font-semibold">Name</th>
                  <th className="px-2 sm:px-6 py-3 sm:py-4 text-white font-semibold hidden md:table-cell">Email ID</th>
                  <th className="px-2 sm:px-6 py-3 sm:py-4 text-white font-semibold hidden lg:table-cell">Package</th>
                  <th className="px-2 sm:px-6 py-3 sm:py-4 text-white font-semibold hidden lg:table-cell">Sponsor ID</th>
                  <th className="px-2 sm:px-6 py-3 sm:py-4 text-white font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {membersData.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="9" className="px-4 sm:px-6 py-6 sm:py-8 text-center text-white text-sm">
                      No team members found
                    </td>
                  </tr>
                ) : (
                  membersData.map((item, index) => (
                    <tr key={item.id} className="transition-colors duration-200 hover:bg-white/10" style={{
                      borderBottom: '1px solid #fff',
                      backgroundColor: '#1565c0'
                    }}>
                      <td className="px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-white/80">{pagination.startIndex + index}</td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white">
                          <span className="text-[#1565c0] text-xs sm:text-sm font-medium">
                            {item.name.charAt(0)}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-white/80">{item.joiningDate}</td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm text-white">{item.memberId}</td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4 text-white font-medium text-xs sm:text-sm">{item.name}</td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4 font-medium max-w-xs truncate text-xs sm:text-sm hidden md:table-cell text-white/80" title={item.email}>
                        {item.email}
                      </td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm hidden lg:table-cell text-white/80">{item.package}</td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm hidden lg:table-cell text-white/80">{item.sponsorId}</td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4">
                        {(() => {
                          const amount = parseFloat((item.package ?? 0).toString().replace(/[^0-9.\-]/g, ''));
                          const derivedStatus = !isNaN(amount) && amount > 0 ? 'Active' : 'Inactive';
                          return (
                            <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-white text-[#1565c0]">
                              {derivedStatus}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Info */}
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <div className="text-xs sm:text-sm text-center sm:text-left" style={{color: 'rgba(255, 255, 255, 0.8)'}}>
              Showing {pagination.startIndex} to {pagination.endIndex} of {pagination.totalMembers} entries
            </div>
            
            {/* Pagination Controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrevPage || loading}
                className="px-2 sm:px-3 py-2 text-white rounded-lg text-xs sm:text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'rgba(29, 68, 67, 0.8)',
                  border: '1px solid var(--default-border)'
                }}
              >
                Prev
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = Math.max(1, currentPage - 2) + i;
                  if (page > pagination.totalPages) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      disabled={loading}
                      className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        currentPage === page
                          ? 'text-white btn-enhanced'
                          : 'text-white'
                      }`}
                      style={{
                        backgroundColor: currentPage === page ? 'var(--primary-color)' : 'rgba(29, 68, 67, 0.8)',
                        border: currentPage === page ? 'none' : '1px solid var(--default-border)'
                      }}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNextPage || loading}
                className="px-2 sm:px-3 py-2 text-white rounded-lg text-xs sm:text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'rgba(29, 68, 67, 0.8)',
                  border: '1px solid var(--default-border)'
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default TeamMembersPage;
