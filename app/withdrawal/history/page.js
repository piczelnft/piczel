"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function WithdrawalHistoryPage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { token } = useAuth();

  const itemsPerPage = 10;

  // Fetch withdrawal history
  useEffect(() => {
    const fetchWithdrawals = async () => {
      if (!token) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/withdrawal/history?page=${currentPage}&limit=${itemsPerPage}&status=${filter}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setWithdrawals(data.withdrawals || []);
          setTotalPages(data.totalPages || 1);
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to fetch withdrawal history");
        }
      } catch (error) {
        console.error("Error fetching withdrawal history:", error);
        setError("Network error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWithdrawals();
  }, [token, currentPage, filter]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-400 bg-green-400/20";
      case "pending":
        return "text-yellow-400 bg-yellow-400/20";
      case "processing":
        return "text-blue-400 bg-blue-400/20";
      case "cancelled":
      case "rejected":
        return "text-red-400 bg-red-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "pending":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "processing":
        return (
          <svg
            className="w-4 h-4 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        );
      case "cancelled":
      case "rejected":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div
      className="min-h-screen pt-16 lg:pt-8"
      style={{
        background:
          "linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)",
        fontFamily: "var(--default-font-family)",
      }}
    >
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white gradient-text-enhanced mb-2">
              Withdrawal History
            </h1>
            <p className="text-white/70 text-sm sm:text-base">
              Track all your withdrawal requests and their status
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6 justify-center">
            {["all", "pending", "processing", "completed", "cancelled"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => handleFilterChange(status)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 capitalize ${
                    filter === status
                      ? "bg-white text-black"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {status}
                </button>
              )
            )}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex justify-center items-center py-8 sm:py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white/70 text-sm sm:text-base">Loading withdrawal history...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8 sm:py-12">
              <div
                className="card-enhanced rounded-xl p-6 sm:p-8 max-w-md mx-4"
                style={{
                  backgroundColor: "rgba(255, 74, 74, 0.1)",
                  border: "1px solid rgba(255, 74, 74, 0.3)",
                }}
              >
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-400 text-sm sm:text-base">{error}</p>
              </div>
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div
                className="card-enhanced rounded-xl p-6 sm:p-8 max-w-md mx-4"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                  backdropFilter: "blur(10px)",
                  borderColor: "var(--default-border)",
                }}
              >
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-white font-semibold mb-2 text-base sm:text-lg">
                  No Withdrawals Found
                </h3>
                <p className="text-white/70 text-sm sm:text-base">
                  You haven&apos;t made any withdrawal requests yet.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <div
                  className="card-enhanced rounded-xl overflow-hidden"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                    backdropFilter: "blur(10px)",
                    borderColor: "var(--default-border)",
                  }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr
                          className="border-b"
                          style={{ borderColor: "var(--default-border)" }}
                        >
                          <th className="text-left py-4 px-6 text-white font-semibold">
                            ID
                          </th>
                          <th className="text-left py-4 px-6 text-white font-semibold">
                            Amount
                          </th>
                          <th className="text-left py-4 px-6 text-white font-semibold">
                            Method
                          </th>
                          <th className="text-left py-4 px-6 text-white font-semibold">
                            Status
                          </th>
                          <th className="text-left py-4 px-6 text-white font-semibold">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {withdrawals.map((withdrawal, index) => (
                          <tr
                            key={withdrawal._id || index}
                            className="border-b hover:bg-white/5 transition-colors duration-200"
                            style={{ borderColor: "var(--default-border)" }}
                          >
                            <td className="py-4 px-6">
                              <span className="text-white font-mono text-sm">
                                #
                                {withdrawal.withdrawalId ||
                                  withdrawal._id?.slice(-8)}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-white font-semibold">
                                ${withdrawal.amount?.toFixed(2)}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-white/80 capitalize">
                                {withdrawal.paymentMethod}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  withdrawal.status
                                )}`}
                              >
                                {getStatusIcon(withdrawal.status)}
                                {withdrawal.status}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-white/80 text-sm">
                                {formatDate(withdrawal.createdAt)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {withdrawals.map((withdrawal, index) => (
                  <div
                    key={withdrawal._id || index}
                    className="card-enhanced rounded-xl p-4 sm:p-6"
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 0.1)",
                      backdropFilter: "blur(10px)",
                      borderColor: "var(--default-border)",
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-white font-semibold text-lg">
                          ${withdrawal.amount?.toFixed(2)}
                        </h3>
                        <p className="text-white/60 text-sm font-mono">
                          #{withdrawal.withdrawalId || withdrawal._id?.slice(-8)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          withdrawal.status
                        )}`}
                      >
                        {getStatusIcon(withdrawal.status)}
                        {withdrawal.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-wide">Method</p>
                        <p className="text-white capitalize text-sm">
                          {withdrawal.paymentMethod}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-wide">Date</p>
                        <p className="text-white text-sm">
                          {formatDate(withdrawal.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-1 sm:gap-2 mt-4 sm:mt-6">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                    }}
                  >
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </button>

                  {/* Show limited page numbers on mobile */}
                  <div className="hidden sm:flex gap-1 sm:gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            currentPage === page
                              ? "bg-white text-black"
                              : "bg-white/10 text-white hover:bg-white/20"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>

                  {/* Mobile pagination - show current page and total */}
                  <div className="sm:hidden flex items-center gap-2">
                    <span className="text-white/70 text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                    }}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">Next</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
