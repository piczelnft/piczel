"use client";

import { useState } from "react";

export default function ImportFundHistory() {
  const [entries, setEntries] = useState(10);
  const [search, setSearch] = useState("");

  const data = [
    {
      sno: 1,
      date: "07-07-2025",
      memberId: "DGT123456",
      txnId:
        "0x28c5c3cf07a64c7c9070982380e08275830e8b45e1074b5d0cd09a494336a568",
      addedBy: "User",
      usdg: "20.00 USDG",
      usdt: "$ 100.00",
      status: "",
    },
  ];

  const filteredData = data.filter(
    (row) =>
      row.memberId.toLowerCase().includes(search.toLowerCase()) ||
      row.txnId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen text-white" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>
      {/* Page Header */}
      <div className="relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 gradient-text-enhanced animate-fadeInUp">
            Import Fund History
          </h1>
          <p className="max-w-2xl mx-auto animate-fadeInUp" style={{color: 'rgba(255, 255, 255, 0.7)', animationDelay: '0.2s'}}>
            Track all your imported fund transactions here.
          </p>
        </div>

        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{backgroundColor: 'rgba(0, 227, 210, 0.2)'}}></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000" style={{backgroundColor: 'rgba(0, 255, 190, 0.2)'}}></div>
        </div>
      </div>

      {/* History Table */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="card-enhanced rounded-2xl p-8 shadow-lg animate-fadeInUp" style={{animationDelay: '0.4s'}}>
          {/* Controls */}
          <div className="flex justify-between items-center mb-6 text-sm" style={{color: 'rgba(255, 255, 255, 0.8)'}}>
            <div>
              Show{" "}
              <select
                value={entries}
                onChange={(e) => setEntries(Number(e.target.value))}
                className="rounded px-2 py-1 text-white transition-all duration-200"
                style={{
                  backgroundColor: 'rgba(29, 68, 67, 0.8)',
                  border: '1px solid var(--default-border)'
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>{" "}
              entries
            </div>
            <div>
              Search:{" "}
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded px-2 py-1 text-white placeholder-gray-400 transition-all duration-200"
                style={{
                  backgroundColor: 'rgba(29, 68, 67, 0.8)',
                  border: '1px solid var(--default-border)'
                }}
                placeholder="Search..."
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{border: '1px solid var(--default-border)'}}>
              <thead>
                <tr style={{backgroundColor: 'rgba(29, 68, 67, 0.8)', color: 'rgba(255, 255, 255, 0.8)'}}>
                  <th className="px-3 py-2 text-left">S.No.</th>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Memberid</th>
                  <th className="px-3 py-2 text-left">TXNId</th>
                  <th className="px-3 py-2 text-left">Added By</th>
                  <th className="px-3 py-2 text-left">USDG Amount</th>
                  <th className="px-3 py-2 text-left">USDT Amount</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((row) => (
                    <tr
                      key={row.sno}
                      className="transition-colors duration-200 hover:bg-opacity-20"
                      style={{
                        backgroundColor: 'rgba(29, 68, 67, 0.1)'
                      }}
                    >
                      <td className="px-3 py-2">{row.sno}</td>
                      <td className="px-3 py-2">{row.date}</td>
                      <td className="px-3 py-2">{row.memberId}</td>
                      <td className="px-3 py-2 break-all" style={{color: 'var(--primary-color)'}}>
                        {row.txnId}
                      </td>
                      <td className="px-3 py-2">{row.addedBy}</td>
                      <td className="px-3 py-2" style={{color: 'var(--secondary-color)'}}>{row.usdg}</td>
                      <td className="px-3 py-2" style={{color: 'rgb(var(--success-rgb))'}}>{row.usdt}</td>
                      <td className="px-3 py-2">{row.status || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-3 py-2 text-center" colSpan="8">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6 text-sm" style={{color: 'rgba(255, 255, 255, 0.8)'}}>
            <p>
              Showing 1 to {filteredData.length} of {filteredData.length} entries
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded transition-all duration-200 hover:bg-opacity-20" style={{
                backgroundColor: 'rgba(29, 68, 67, 0.8)',
                border: '1px solid var(--default-border)'
              }}>
                Previous
              </button>
              <button className="px-3 py-1 rounded text-white shadow-lg btn-enhanced">
                1
              </button>
              <button className="px-3 py-1 rounded transition-all duration-200 hover:bg-opacity-20" style={{
                backgroundColor: 'rgba(29, 68, 67, 0.8)',
                border: '1px solid var(--default-border)'
              }}>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
