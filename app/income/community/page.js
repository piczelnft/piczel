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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Community Rewards</h1>
          <p className="text-lg text-gray-300">Income Section</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-8 text-center">Community Rewards</h2>
          
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
                    <tr key={item.id} className="border-b border-purple-500/20 hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 text-gray-300">{startIndex + index + 1}</td>
                      <td className="px-6 py-4 text-gray-300">{item.date}</td>
                      <td className="px-6 py-4 text-cyan-400 font-medium">{item.memberId}</td>
                      <td className="px-6 py-4 text-blue-400 font-medium">{item.leftForwarded}</td>
                      <td className="px-6 py-4 text-purple-400 font-medium">{item.leftNew}</td>
                      <td className="px-6 py-4 text-yellow-400 font-medium">{item.totalLeft}</td>
                      <td className="px-6 py-4 text-green-400 font-medium">{item.rightForwarded}</td>
                      <td className="px-6 py-4 text-orange-400 font-medium">{item.rightNew}</td>
                      <td className="px-6 py-4 text-red-400 font-medium">{item.totalRight}</td>
                      <td className="px-6 py-4 text-indigo-400 font-medium">{item.matching}</td>
                      <td className="px-6 py-4 text-pink-400 font-medium">{item.totalAmount}</td>
                      <td className="px-6 py-4 text-teal-400 font-medium">{item.flushout}</td>
                      <td className="px-6 py-4 text-lime-400 font-medium">{item.amount}</td>
                      <td className="px-6 py-4 text-emerald-400 font-medium">{item.forwardLeft}</td>
                      <td className="px-6 py-4 text-violet-400 font-medium">{item.forwardRight}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="16" className="px-6 py-8 text-center text-gray-400">
                      No data available in table
                    </td>
                  </tr>
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

export default CommunityRewardsPage;
