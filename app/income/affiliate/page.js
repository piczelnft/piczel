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
    <div className="min-h-screen flex p-8" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2 gradient-text-enhanced animate-fadeInUp">Affiliate Rewards</h1>
          <p className="text-lg animate-fadeInUp" style={{color: 'rgba(255, 255, 255, 0.7)', animationDelay: '0.2s'}}>Income Section</p>
        </div>

        <div className="card-enhanced rounded-2xl p-8 shadow-lg animate-fadeInUp" style={{animationDelay: '0.4s'}}>
          <h2 className="text-2xl font-semibold text-white mb-8 text-center">Affiliate Rewards</h2>
          
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
                  <tr key={item.id} className="transition-colors duration-200 hover:bg-opacity-20" style={{
                    borderBottom: '1px solid var(--default-border)',
                    backgroundColor: 'rgba(29, 68, 67, 0.1)'
                  }}>
                    <td className="px-6 py-4" style={{color: 'rgba(255, 255, 255, 0.8)'}}>{startIndex + index + 1}</td>
                    <td className="px-6 py-4" style={{color: 'rgba(255, 255, 255, 0.8)'}}>{item.date}</td>
                    <td className="px-6 py-4 font-medium" style={{color: 'var(--primary-color)'}}>{item.memberId}</td>
                    <td className="px-6 py-4 font-medium" style={{color: 'rgb(var(--info-rgb))'}}>{item.package}</td>
                    <td className="px-6 py-4 font-medium" style={{color: 'var(--secondary-color)'}}>{item.type}</td>
                    <td className="px-6 py-4 font-medium" style={{color: 'rgb(var(--warning-rgb))'}}>{item.directId}</td>
                    <td className="px-6 py-4 font-medium text-white">{item.name}</td>
                    <td className="px-6 py-4 font-medium" style={{color: 'rgb(var(--success-rgb))'}}>{item.amount}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{
                        backgroundColor: 'rgba(var(--success-rgb), 0.2)',
                        color: 'rgb(var(--success-rgb))'
                      }}>
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

export default AffiliateRewardsPage;
