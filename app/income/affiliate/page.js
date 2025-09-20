'use client';

import { useState } from 'react';

const AffiliateRewardsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Sample affiliate rewards data
  const affiliateData = [
    { id: 1, date: '04-08-2025', memberId: 'DGT123456', package: '$ 100', type: 'Staking', directId: 'DGT576923', name: 'TWO WINGS', amount: '$ 12.50', status: 'Paid' },
    { id: 2, date: '04-08-2025', memberId: 'DGT123456', package: '$ 101', type: 'Staking', directId: 'DGT576923', name: 'TWO WINGS', amount: '$ 12.63', status: 'Paid' },
    { id: 3, date: '04-08-2025', memberId: 'DGT123456', package: '$ 100', type: 'Staking', directId: 'DGT576923', name: 'TWO WINGS', amount: '$ 12.50', status: 'Paid' },
    { id: 4, date: '30-07-2025', memberId: 'DGT123456', package: '$ 10000', type: 'Staking', directId: 'DGT892829', name: 'SS ASSOCIATES', amount: '$ 1250.00', status: 'Paid' },
    { id: 5, date: '13-07-2025', memberId: 'DGT123456', package: '$ 5000', type: 'Staking', directId: 'DGT892829', name: 'SS ASSOCIATES', amount: '$ 625.00', status: 'Paid' },
    { id: 6, date: '11-07-2025', memberId: 'DGT123456', package: '$ 5000', type: 'Staking', directId: 'DGT892829', name: 'SS ASSOCIATES', amount: '$ 625.00', status: 'Paid' },
    { id: 7, date: '09-07-2025', memberId: 'DGT123456', package: '$ 5000', type: 'Staking', directId: 'DGT996616', name: 'GBG', amount: '$ 625.00', status: 'Paid' },
    { id: 8, date: '09-07-2025', memberId: 'DGT123456', package: '$ 100', type: 'Staking', directId: 'DGT141911', name: 'Balaji', amount: '$ 12.50', status: 'Paid' },
    { id: 9, date: '09-07-2025', memberId: 'DGT123456', package: '$ 100', type: 'Staking', directId: 'DGT660396', name: 'Patil', amount: '$ 12.50', status: 'Paid' },
    { id: 10, date: '09-07-2025', memberId: 'DGT123456', package: '$ 100', type: 'Staking', directId: 'DGT660396', name: 'Patil', amount: '$ 12.50', status: 'Paid' },
    { id: 11, date: '09-07-2025', memberId: 'DGT123456', package: '$ 100', type: 'Staking', directId: 'DGT138974', name: 'Vijayan', amount: '$ 12.50', status: 'Paid' },
    { id: 12, date: '09-07-2025', memberId: 'DGT123456', package: '$ 100', type: 'Staking', directId: 'DGT336219', name: 'Ambika', amount: '$ 12.50', status: 'Paid' },
    { id: 13, date: '09-07-2025', memberId: 'DGT123456', package: '$ 100', type: 'Staking', directId: 'DGT597530', name: 'Arshad', amount: '$ 12.50', status: 'Paid' },
    { id: 14, date: '09-07-2025', memberId: 'DGT123456', package: '$ 100', type: 'Staking', directId: 'DGT828259', name: 'Anoop', amount: '$ 12.50', status: 'Paid' },
    { id: 15, date: '09-07-2025', memberId: 'DGT123456', package: '$ 100', type: 'Staking', directId: 'DGT838762', name: 'Shan renjith', amount: '$ 12.50', status: 'Paid' },
    { id: 16, date: '09-07-2025', memberId: 'DGT123456', package: '$ 100', type: 'Staking', directId: 'DGT965134', name: 'Shabeeb', amount: '$ 12.50', status: 'Paid' },
    { id: 17, date: '09-07-2025', memberId: 'DGT123456', package: '$ 100', type: 'Staking', directId: 'DGT277621', name: 'Sivaranjith', amount: '$ 12.50', status: 'Paid' },
    { id: 18, date: '09-07-2025', memberId: 'DGT123456', package: '$ 100', type: 'Staking', directId: 'DGT433403', name: 'Sivaji', amount: '$ 12.50', status: 'Paid' },
    { id: 19, date: '09-07-2025', memberId: 'DGT123456', package: '$ 100', type: 'Staking', directId: 'DGT159158', name: 'Babu', amount: '$ 12.50', status: 'Paid' },
    { id: 20, date: '09-07-2025', memberId: 'DGT123456', package: '$ 100', type: 'Staking', directId: 'DGT738585', name: 'Arunkumar', amount: '$ 12.50', status: 'Paid' }
  ];

  const filteredData = affiliateData.filter(item =>
    item.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.package.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.directId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.amount.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-4xl font-bold text-white mb-2">Affiliate Rewards</h1>
          <p className="text-lg text-gray-300">Income Section</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-8 text-center">Affiliate Rewards</h2>
          
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
                  <th className="px-6 py-4 text-white font-semibold">S.No.</th>
                  <th className="px-6 py-4 text-white font-semibold">Date</th>
                  <th className="px-6 py-4 text-white font-semibold">Member ID</th>
                  <th className="px-6 py-4 text-white font-semibold">Package</th>
                  <th className="px-6 py-4 text-white font-semibold">Type</th>
                  <th className="px-6 py-4 text-white font-semibold">Direct ID</th>
                  <th className="px-6 py-4 text-white font-semibold">Name</th>
                  <th className="px-6 py-4 text-white font-semibold">Amount</th>
                  <th className="px-6 py-4 text-white font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((item, index) => (
                  <tr key={item.id} className="border-b border-purple-500/20 hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-gray-300">{startIndex + index + 1}</td>
                    <td className="px-6 py-4 text-gray-300">{item.date}</td>
                    <td className="px-6 py-4 text-cyan-400 font-medium">{item.memberId}</td>
                    <td className="px-6 py-4 text-blue-400 font-medium">{item.package}</td>
                    <td className="px-6 py-4 text-purple-400 font-medium">{item.type}</td>
                    <td className="px-6 py-4 text-yellow-400 font-medium">{item.directId}</td>
                    <td className="px-6 py-4 text-white font-medium">{item.name}</td>
                    <td className="px-6 py-4 text-green-400 font-medium">{item.amount}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
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

export default AffiliateRewardsPage;
