"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import AdminLayout from "../../components/AdminLayout";

export default function MemberDetail() {
  const params = useParams();
  const router = useRouter();
  const { memberId } = params;
  
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMemberDetails = async () => {
      try {
        setLoading(true);
        const adminToken = localStorage.getItem("adminToken");
        if (!adminToken) {
          setError("No admin token found");
          return;
        }

        const response = await fetch(`/api/admin/members/${memberId}`, {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch member details");
        }

        const data = await response.json();
        setMember(data.member);
      } catch (err) {
        console.error("Error fetching member details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (memberId) {
      fetchMemberDetails();
    }
  }, [memberId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      Active: "bg-green-100 text-green-800",
      Inactive: "bg-yellow-100 text-yellow-800",
      Blocked: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
          statusClasses[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading member details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!member) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Member not found</p>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Member Details</h1>
            <p className="mt-2 text-gray-600">Detailed information for {member.memberId}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            ← Back to Members
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Member Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              {member.avatar ? (
                <Image
                  src={member.avatar}
                  alt="Avatar"
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full mx-auto mb-4"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-500 text-2xl">👤</span>
                </div>
              )}
              <h2 className="text-xl font-semibold text-gray-900">{member.memberName}</h2>
              {/* <p className="text-gray-600">{member.memberId}</p>
              <div className="mt-4">
                {getStatusBadge(member.rank === "Basic" ? "Inactive" : member.status)}
              </div> */}
            </div>
          </div>
        </div>

        {/* Member Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Member Information</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member ID
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {member.memberId}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member Name
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {member.memberName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {member.email || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {member.mobile || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sponsor ID
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {member.sponsorId || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sponsor Name
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {member.sponsorName || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rank
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {member.rank || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {member.status || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Joining Date
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {formatDate(member.joining)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Login
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {formatDate(member.lastLogin)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Financial Information</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wallet Balance
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded font-semibold">
                    {formatCurrency(member.walletBalance)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sponsor Income
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded font-semibold">
                    {formatCurrency(member.sponsorIncome)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level Income
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded font-semibold">
                    {formatCurrency(member.levelIncome)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reward Income (Spot)
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded font-semibold">
                    {formatCurrency(member.rewardIncome)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Income
                  </label>
                  <p className="text-sm bg-gray-50 p-2 rounded font-semibold text-green-600">
                    {formatCurrency((member.sponsorIncome || 0) + (member.rewardIncome || 0))}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Withdrawals
                  </label>
                  <p className="text-sm bg-gray-50 p-2 rounded font-semibold text-red-600">
                    {formatCurrency(member.totalWithdrawals)}
                  </p>
                </div>
              </div>
            </div>
          </div> */}

          {/* Team Information
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Team Information</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Direct Members
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded font-semibold">
                    {member.directMembers || 0}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Team Members
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded font-semibold">
                    {member.totalTeamMembers || 0}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NFT Purchases
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded font-semibold">
                    {member.nftPurchases || 0}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NFT Investment Amount
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded font-semibold">
                    {formatCurrency((member.nftPurchases || 0) * 80)}
                  </p>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </AdminLayout>
  );
}
