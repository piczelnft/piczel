'use client';

import { useState } from 'react';

const WalletHistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Sample withdrawal history data
  const withdrawalData = [
    {
      id: 1,
      requestDate: '11,Aug 2025',
      requestId: 'RQ1754884775',
      walletAddress: 'utyduyduy;r8uiyj',
      usdtAmount: '$500.0000',
      grossAmount: '72.46 USDG',
      service: '3.6230 USDG',
      netAmount: '68.8370 USDG',
      paymentDate: '15-08-2025 00:00:00',
      status: 'Completed'
    },
    {
      id: 2,
      requestDate: '29,Jul 2025',
      requestId: 'RQ1753764449',
      walletAddress: '0x4A7e83dFdD60E3A170CA5C6a31e39363a2DeC2f6',
      usdtAmount: '$4.0000',
      grossAmount: '0.00 USDG',
      service: '0.0000 USDG',
      netAmount: '2.0000 USDG',
      paymentDate: '29-07-2025 00:00:00',
      status: 'Completed'
    },
    {
      id: 3,
      requestDate: '10,Jul 2025',
      requestId: 'RQ1752111076',
      walletAddress: 'utyduyduy;r8uiyj',
      usdtAmount: '$1000.0000',
      grossAmount: '77.34 USDG',
      service: '3.8670 USDG',
      netAmount: '73.4730 USDG',
      paymentDate: '--',
      status: 'Pending'
    },
    {
      id: 4,
      requestDate: '09,Jul 2025',
      requestId: 'RQ1752060893',
      walletAddress: 'utyduyduy;r8uiyj',
      usdtAmount: '$100.0000',
      grossAmount: '7.73 USDG',
      service: '0.3865 USDG',
      netAmount: '7.3435 USDG',
      paymentDate: '09-07-2025 00:00:00',
      status: 'Completed'
    },
    {
      id: 5,
      requestDate: '09,Jul 2025',
      requestId: 'RQ1752053835',
      walletAddress: 'utyduyduy;r8uiyj',
      usdtAmount: '$10.0000',
      grossAmount: '2.00 USDG',
      service: '0.1000 USDG',
      netAmount: '1.9000 USDG',
      paymentDate: '--',
      status: 'Pending'
    },
    {
      id: 6,
      requestDate: '09,Jul 2025',
      requestId: 'RQ1752053734',
      walletAddress: 'utyduyduy;r8uiyj',
      usdtAmount: '$10.0000',
      grossAmount: '2.00 USDG',
      service: '0.1000 USDG',
      netAmount: '1.9000 USDG',
      paymentDate: '09-07-2025 00:00:00',
      status: 'Completed'
    }
  ];

  const filteredData = withdrawalData.filter(item =>
    item.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.walletAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.usdtAmount.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500/20 text-green-400';
      case 'Pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Failed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Withdrawal History</h1>
          <p className="text-lg text-gray-300">Use Withdrawal</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-8 text-center">Withdrawal History</h2>
          
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
                  <th className="px-6 py-4 text-white font-semibold">Request Date</th>
                  <th className="px-6 py-4 text-white font-semibold">Request ID</th>
                  <th className="px-6 py-4 text-white font-semibold">Wallet Address</th>
                  <th className="px-6 py-4 text-white font-semibold">USDT Amount</th>
                  <th className="px-6 py-4 text-white font-semibold">Gross Amount</th>
                  <th className="px-6 py-4 text-white font-semibold">Service</th>
                  <th className="px-6 py-4 text-white font-semibold">Net Amount</th>
                  <th className="px-6 py-4 text-white font-semibold">Payment Date</th>
                  <th className="px-6 py-4 text-white font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((item, index) => (
                  <tr key={item.id} className="border-b border-purple-500/20 hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-gray-300">{startIndex + index + 1}</td>
                    <td className="px-6 py-4 text-gray-300">{item.requestDate}</td>
                    <td className="px-6 py-4 text-cyan-400 font-medium">{item.requestId}</td>
                    <td className="px-6 py-4 text-blue-400 font-medium max-w-xs truncate" title={item.walletAddress}>
                      {item.walletAddress}
                    </td>
                    <td className="px-6 py-4 text-green-400 font-medium">{item.usdtAmount}</td>
                    <td className="px-6 py-4 text-purple-400 font-medium">{item.grossAmount}</td>
                    <td className="px-6 py-4 text-yellow-400 font-medium">{item.service}</td>
                    <td className="px-6 py-4 text-orange-400 font-medium">{item.netAmount}</td>
                    <td className="px-6 py-4 text-gray-300 text-xs">{item.paymentDate}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
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

export default WalletHistoryPage;
