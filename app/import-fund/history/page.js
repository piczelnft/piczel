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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Page Header */}
      <div className="relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Import Fund History
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Track all your imported fund transactions here.
          </p>
        </div>

        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* History Table */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/20 shadow-lg">
          {/* Controls */}
          <div className="flex justify-between items-center mb-6 text-sm">
            <div>
              Show{" "}
              <select
                value={entries}
                onChange={(e) => setEntries(Number(e.target.value))}
                className="bg-slate-700/50 border border-purple-500/30 rounded px-2 py-1 text-white"
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
                className="bg-slate-700/50 border border-cyan-500/30 rounded px-2 py-1 text-white placeholder-gray-400"
                placeholder="Search..."
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-purple-500/20">
              <thead>
                <tr className="bg-slate-700/50 text-gray-300">
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
                      className="hover:bg-slate-700/40 transition-colors"
                    >
                      <td className="px-3 py-2">{row.sno}</td>
                      <td className="px-3 py-2">{row.date}</td>
                      <td className="px-3 py-2">{row.memberId}</td>
                      <td className="px-3 py-2 break-all text-cyan-400">
                        {row.txnId}
                      </td>
                      <td className="px-3 py-2">{row.addedBy}</td>
                      <td className="px-3 py-2 text-purple-300">{row.usdg}</td>
                      <td className="px-3 py-2 text-cyan-300">{row.usdt}</td>
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
          <div className="flex justify-between items-center mt-6 text-sm text-gray-300">
            <p>
              Showing 1 to {filteredData.length} of {filteredData.length} entries
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded bg-slate-700/50 border border-purple-500/30 hover:bg-slate-700">
                Previous
              </button>
              <button className="px-3 py-1 rounded bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg">
                1
              </button>
              <button className="px-3 py-1 rounded bg-slate-700/50 border border-purple-500/30 hover:bg-slate-700">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
