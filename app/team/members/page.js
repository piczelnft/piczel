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
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading team members...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && membersData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>
        <div className="text-white text-center max-w-md">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button 
            onClick={fetchMembersData}
            className="btn-enhanced px-4 py-2 text-white hover-bounce"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex p-8" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2 gradient-text-enhanced animate-fadeInUp">My Directs</h1>
          <p className="text-lg animate-fadeInUp" style={{color: 'rgba(255, 255, 255, 0.7)', animationDelay: '0.2s'}}>Check your Genealogy</p>
          <div className="mt-4">
            <button 
              onClick={fetchMembersData}
              className="btn-enhanced px-4 py-2 text-white hover-bounce text-sm flex items-center space-x-2 mx-auto"
              disabled={loading}
            >
              <span className={`text-sm ${loading ? 'animate-spin' : ''}`}>
                {loading ? '⟳' : '↻'}
              </span>
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        <div className="card-enhanced rounded-2xl p-8 shadow-lg animate-fadeInUp" style={{animationDelay: '0.4s'}}>
          <h2 className="text-2xl font-semibold text-white mb-8 text-center">My Directs</h2>
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium" style={{color: 'rgba(255, 255, 255, 0.8)'}}>Show</label>
              <select
                value={entriesPerPage}
                onChange={handleEntriesChange}
                className="px-3 py-2 text-white rounded-lg text-sm focus:outline-none transition-colors"
                style={{
                  backgroundColor: 'rgba(29, 68, 67, 0.8)',
                  border: '1px solid var(--default-border)'
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm" style={{color: 'rgba(255, 255, 255, 0.8)'}}>entries</span>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium" style={{color: 'rgba(255, 255, 255, 0.8)'}}>Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search..."
                className="px-3 py-2 text-white rounded-lg text-sm focus:outline-none transition-colors placeholder-gray-400 w-48"
                style={{
                  backgroundColor: 'rgba(29, 68, 67, 0.8)',
                  border: '1px solid var(--default-border)'
                }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr style={{background: 'linear-gradient(to right, rgba(29, 68, 67, 0.8), rgba(29, 68, 67, 0.8))', borderBottom: '1px solid var(--default-border)'}}>
                  <th className="px-6 py-4 text-white font-semibold">S.No</th>
                  <th className="px-6 py-4 text-white font-semibold">Image</th>
                  <th className="px-6 py-4 text-white font-semibold">Joining Date</th>
                  <th className="px-6 py-4 text-white font-semibold">Member ID</th>
                  <th className="px-6 py-4 text-white font-semibold">Name</th>
                  <th className="px-6 py-4 text-white font-semibold">Email ID</th>
                  <th className="px-6 py-4 text-white font-semibold">Downline</th>
                  <th className="px-6 py-4 text-white font-semibold">Package</th>
                  <th className="px-6 py-4 text-white font-semibold">Sponsor ID</th>
                  <th className="px-6 py-4 text-white font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {membersData.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-8 text-center text-white">
                      No team members found
                    </td>
                  </tr>
                ) : (
                  membersData.map((item, index) => (
                    <tr key={item.id} className="transition-colors duration-200 hover:bg-opacity-20" style={{
                      borderBottom: '1px solid var(--default-border)',
                      backgroundColor: 'rgba(29, 68, 67, 0.1)'
                    }}>
                      <td className="px-6 py-4" style={{color: 'rgba(255, 255, 255, 0.8)'}}>{pagination.startIndex + index}</td>
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                          background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))'
                        }}>
                          <span className="text-white text-sm font-medium">
                            {item.name.charAt(0)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4" style={{color: 'rgba(255, 255, 255, 0.8)'}}>{item.joiningDate}</td>
                      <td className="px-6 py-4 font-medium" style={{color: 'var(--primary-color)'}}>{item.memberId}</td>
                      <td className="px-6 py-4 text-white font-medium">{item.name}</td>
                      <td className="px-6 py-4 font-medium max-w-xs truncate" style={{color: 'rgb(var(--info-rgb))'}} title={item.email}>
                        {item.email}
                      </td>
                      <td className="px-6 py-4 font-medium" style={{color: 'var(--secondary-color)'}}>{item.downline}</td>
                      <td className="px-6 py-4 font-medium" style={{color: 'rgb(var(--success-rgb))'}}>{item.package}</td>
                      <td className="px-6 py-4 font-medium" style={{color: 'rgb(var(--warning-rgb))'}}>{item.sponsorId}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium" style={getStatusColor(item.status)}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Info */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm" style={{color: 'rgba(255, 255, 255, 0.8)'}}>
              Showing {pagination.startIndex} to {pagination.endIndex} of {pagination.totalMembers} entries
            </div>
            
            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrevPage || loading}
                className="px-3 py-2 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'rgba(29, 68, 67, 0.8)',
                  border: '1px solid var(--default-border)'
                }}
              >
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(7, pagination.totalPages) }, (_, i) => {
                  const page = Math.max(1, currentPage - 3) + i;
                  if (page > pagination.totalPages) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      disabled={loading}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
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
                className="px-3 py-2 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
