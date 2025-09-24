'use client';

import { useState } from 'react';

const CommunityRewardsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Sample community rewards data (empty for now as per request)
  const communityData = [];

  const filteredData = communityData.filter(item =>
    item.memberId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.totalAmount?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEntries = filteredData.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

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

  return (
    <div className="min-h-screen flex p-8" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>
      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2 gradient-text-enhanced animate-fadeInUp">Community Rewards</h1>
          <p className="text-lg animate-fadeInUp" style={{color: 'rgba(255, 255, 255, 0.7)', animationDelay: '0.2s'}}>Income Section</p>
        </div>

        <div className="card-enhanced rounded-2xl p-8 shadow-lg animate-fadeInUp" style={{animationDelay: '0.4s'}}>
          <h2 className="text-2xl font-semibold text-white mb-8 text-center">Community Rewards</h2>
          
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
                  <th className="px-6 py-4 text-white font-semibold">S No.</th>
                  <th className="px-6 py-4 text-white font-semibold">Date</th>
                  <th className="px-6 py-4 text-white font-semibold">Member ID</th>
                  <th className="px-6 py-4 text-white font-semibold">Left Forwarded</th>
                  <th className="px-6 py-4 text-white font-semibold">Left New</th>
                  <th className="px-6 py-4 text-white font-semibold">Total Left</th>
                  <th className="px-6 py-4 text-white font-semibold">Right Forwarded</th>
                  <th className="px-6 py-4 text-white font-semibold">Right New</th>
                  <th className="px-6 py-4 text-white font-semibold">Total Right</th>
                  <th className="px-6 py-4 text-white font-semibold">Matching</th>
                  <th className="px-6 py-4 text-white font-semibold">Total Amount</th>
                  <th className="px-6 py-4 text-white font-semibold">Flushout</th>
                  <th className="px-6 py-4 text-white font-semibold">Amount</th>
                  <th className="px-6 py-4 text-white font-semibold">Forward Left</th>
                  <th className="px-6 py-4 text-white font-semibold">Forward Right</th>
                  <th className="px-6 py-4 text-white font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((item, index) => (
                    <tr key={item.id} className="transition-colors duration-200 hover:bg-opacity-20" style={{
                      borderBottom: '1px solid var(--default-border)',
                      backgroundColor: 'rgba(29, 68, 67, 0.1)'
                    }}>
                      <td className="px-6 py-4" style={{color: 'rgba(255, 255, 255, 0.8)'}}>{startIndex + index + 1}</td>
                      <td className="px-6 py-4" style={{color: 'rgba(255, 255, 255, 0.8)'}}>{item.date}</td>
                      <td className="px-6 py-4 font-medium" style={{color: 'var(--primary-color)'}}>{item.memberId}</td>
                      <td className="px-6 py-4 font-medium" style={{color: 'rgb(var(--info-rgb))'}}>{item.leftForwarded}</td>
                      <td className="px-6 py-4 font-medium" style={{color: 'var(--secondary-color)'}}>{item.leftNew}</td>
                      <td className="px-6 py-4 font-medium" style={{color: 'rgb(var(--warning-rgb))'}}>{item.totalLeft}</td>
                      <td className="px-6 py-4 font-medium" style={{color: 'rgb(var(--success-rgb))'}}>{item.rightForwarded}</td>
                      <td className="px-6 py-4 font-medium" style={{color: 'rgb(var(--danger-rgb))'}}>{item.rightNew}</td>
                      <td className="px-6 py-4 font-medium" style={{color: 'rgb(var(--danger-rgb))'}}>{item.totalRight}</td>
                      <td className="px-6 py-4 font-medium" style={{color: 'rgb(var(--info-rgb))'}}>{item.matching}</td>
                      <td className="px-6 py-4 font-medium" style={{color: 'rgb(var(--warning-rgb))'}}>{item.totalAmount}</td>
                      <td className="px-6 py-4 font-medium" style={{color: 'var(--primary-color)'}}>{item.flushout}</td>
                      <td className="px-6 py-4 font-medium" style={{color: 'rgb(var(--success-rgb))'}}>{item.amount}</td>
                      <td className="px-6 py-4 font-medium" style={{color: 'rgb(var(--success-rgb))'}}>{item.forwardLeft}</td>
                      <td className="px-6 py-4 font-medium" style={{color: 'var(--secondary-color)'}}>{item.forwardRight}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium" style={{
                          backgroundColor: 'rgba(var(--success-rgb), 0.2)',
                          color: 'rgb(var(--success-rgb))'
                        }}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="16" className="px-6 py-8 text-center" style={{color: 'rgba(255, 255, 255, 0.6)'}}>
                      No data available in table
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Info */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm" style={{color: 'rgba(255, 255, 255, 0.8)'}}>
              Showing {startIndex + 1} to {Math.min(endIndex, totalEntries)} of {totalEntries} entries
            </div>
            
            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
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
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, currentPage - 2) + i;
                  if (page > totalPages) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
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
                disabled={currentPage === totalPages}
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

export default CommunityRewardsPage;
