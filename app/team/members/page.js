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
      email: 'piczeltoken@gmail.com',
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
      email: 'piczelusdg@gmail.com',
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
      email: 'piczeltoken1@gmail.com',
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
      email: 'usdgpiczel@gmail.com',
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
      email: 'piczeltoken2@gmail.com',
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

  return (
    <div className="min-h-screen flex p-8" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2 gradient-text-enhanced animate-fadeInUp">My Directs</h1>
          <p className="text-lg animate-fadeInUp" style={{color: 'rgba(255, 255, 255, 0.7)', animationDelay: '0.2s'}}>Check your Genealogy</p>
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
                {currentData.map((item, index) => (
                  <tr key={item.id} className="transition-colors duration-200 hover:bg-opacity-20" style={{
                    borderBottom: '1px solid var(--default-border)',
                    backgroundColor: 'rgba(29, 68, 67, 0.1)'
                  }}>
                    <td className="px-6 py-4" style={{color: 'rgba(255, 255, 255, 0.8)'}}>{startIndex + index + 1}</td>
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
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  const page = Math.max(1, currentPage - 3) + i;
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

export default TeamMembersPage;
