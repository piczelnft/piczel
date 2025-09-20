'use client';

import { useState } from 'react';

const TeamMembersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Sample team members data
  const membersData = [
    {
      id: 1,
      image: '',
      joiningDate: '07-07-2025',
      memberId: 'DGT892829',
      name: 'SS ASSOCIATES',
      email: 'dgtektoken@gmail.com',
      downline: 151,
      package: '$10000',
      sponsorId: 'DGT123456',
      status: 'Active'
    },
    {
      id: 2,
      image: '',
      joiningDate: '07-07-2025',
      memberId: 'DGT571988',
      name: 'SS ASSOCIATES',
      email: 'dgtekusdg@gmail.com',
      downline: 0,
      package: '$0',
      sponsorId: 'DGT123456',
      status: 'Active'
    },
    {
      id: 3,
      image: '',
      joiningDate: '07-07-2025',
      memberId: 'DGT715473',
      name: 'SS ASSOCIATES',
      email: 'dgtektoken1@gmail.com',
      downline: 0,
      package: '$100',
      sponsorId: 'DGT123456',
      status: 'Active'
    },
    {
      id: 4,
      image: '',
      joiningDate: '07-07-2025',
      memberId: 'DGT491923',
      name: 'SS ASSOCIATES',
      email: 'usdgdgtek@gmail.com',
      downline: 0,
      package: '$100',
      sponsorId: 'DGT123456',
      status: 'Active'
    },
    {
      id: 5,
      image: '',
      joiningDate: '07-07-2025',
      memberId: 'DGT864962',
      name: 'SS ASSOCIATES',
      email: 'dgtektoken2@gmail.com',
      downline: 0,
      package: '$0',
      sponsorId: 'DGT123456',
      status: 'Active'
    },
    {
      id: 6,
      image: '',
      joiningDate: '07-07-2025',
      memberId: 'DGT471927',
      name: 'SS ASSOCIATES',
      email: 'brizcog@gmail.com',
      downline: 0,
      package: '$0',
      sponsorId: 'DGT123456',
      status: 'Active'
    },
    {
      id: 7,
      image: '',
      joiningDate: '07-07-2025',
      memberId: 'DGT400216',
      name: 'Shareekh',
      email: 'shareekhhaseena@gmail.com',
      downline: 18,
      package: '$100',
      sponsorId: 'DGT123456',
      status: 'Active'
    },
    {
      id: 8,
      image: '',
      joiningDate: '07-07-2025',
      memberId: 'DGT714533',
      name: 'Sfdf',
      email: 'dfdd@dff',
      downline: 0,
      package: '$100',
      sponsorId: 'DGT123456',
      status: 'Active'
    },
    {
      id: 9,
      image: '',
      joiningDate: '07-07-2025',
      memberId: 'DGT551005',
      name: 'Sfdffd',
      email: 'dfdff@dff',
      downline: 0,
      package: '$100',
      sponsorId: 'DGT123456',
      status: 'Active'
    },
    {
      id: 10,
      image: '',
      joiningDate: '07-07-2025',
      memberId: 'DGT717916',
      name: 'Aa5',
      email: 'sfsfzf@dff',
      downline: 0,
      package: '$100',
      sponsorId: 'DGT123456',
      status: 'Active'
    }
  ];

  const filteredData = membersData.filter(item =>
    item.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sponsorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      case 'Active':
        return 'bg-green-500/20 text-green-400';
      case 'Inactive':
        return 'bg-red-500/20 text-red-400';
      case 'Pending':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">My Directs</h1>
          <p className="text-lg text-gray-300">Check your Genealogy</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-8 text-center">My Directs</h2>
          
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
                {currentData.map((item, index) => (
                  <tr key={item.id} className="border-b border-purple-500/20 hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-gray-300">{startIndex + index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {item.name.charAt(0)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{item.joiningDate}</td>
                    <td className="px-6 py-4 text-cyan-400 font-medium">{item.memberId}</td>
                    <td className="px-6 py-4 text-white font-medium">{item.name}</td>
                    <td className="px-6 py-4 text-blue-400 font-medium max-w-xs truncate" title={item.email}>
                      {item.email}
                    </td>
                    <td className="px-6 py-4 text-purple-400 font-medium">{item.downline}</td>
                    <td className="px-6 py-4 text-green-400 font-medium">{item.package}</td>
                    <td className="px-6 py-4 text-yellow-400 font-medium">{item.sponsorId}</td>
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
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  const page = Math.max(1, currentPage - 3) + i;
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

export default TeamMembersPage;
