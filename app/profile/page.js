"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function ProfilePage() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.profile?.phone || "",
    country: user?.profile?.country || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here you would typically call an API to update the user profile
    console.log("Update profile:", formData);
    setIsEditing(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>
      <div className="max-w-4xl mx-auto">
        <div className="card-enhanced rounded-xl shadow-2xl overflow-hidden animate-fadeInUp">
          {/* Header */}
          <div className="px-6 py-8 border-b" style={{background: 'linear-gradient(to right, rgba(0, 255, 190, 0.2), rgba(0, 227, 210, 0.2))', borderColor: 'var(--default-border)'}}>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center ring-4" style={{background: 'linear-gradient(to bottom right, rgb(var(--success-rgb)), var(--primary-color))', ringColor: 'rgba(0, 255, 190, 0.3)'}}>
                <span className="text-white font-bold text-2xl">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {user?.name || "User Profile"}
                </h1>
                <p className="text-gray-300" style={{color: 'rgba(255, 255, 255, 0.7)'}}>
                  Member since{" "}
                  {new Date(user?.createdAt).toLocaleDateString() || "Unknown"}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            {/* Member ID Section */}
            <div className="mb-8 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-400/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Your Member ID
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Share this ID with others for sponsorship
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-black/20 px-4 py-2 rounded-lg border border-white/20">
                    <span className="text-green-400 font-mono text-lg font-bold">
                      {user?.memberId || "Not assigned"}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(user?.memberId || "");
                      // You could add a toast notification here
                      alert("Member ID copied to clipboard!");
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
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
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">
                    Personal Information
                  </h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="btn-enhanced px-4 py-2 text-white rounded-lg transition-colors"
                  >
                    {isEditing ? "Cancel" : "Edit"}
                  </button>
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-gray-200 text-sm font-medium mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                        style={{
                          backgroundColor: 'rgba(29, 68, 67, 0.8)',
                          border: '1px solid var(--default-border)',
                          focusRingColor: 'var(--primary-color)'
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-gray-200 text-sm font-medium mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                        style={{
                          backgroundColor: 'rgba(29, 68, 67, 0.8)',
                          border: '1px solid var(--default-border)',
                          focusRingColor: 'var(--primary-color)'
                        }}
                        disabled
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Email cannot be changed
                      </p>
                    </div>

                    <div>
                      <label className="block text-gray-200 text-sm font-medium mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                        style={{
                          backgroundColor: 'rgba(29, 68, 67, 0.8)',
                          border: '1px solid var(--default-border)',
                          focusRingColor: 'var(--primary-color)'
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-gray-200 text-sm font-medium mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="Enter your country"
                        className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                        style={{
                          backgroundColor: 'rgba(29, 68, 67, 0.8)',
                          border: '1px solid var(--default-border)',
                          focusRingColor: 'var(--primary-color)'
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn-enhanced w-full py-3 text-white rounded-lg transition-all duration-200"
                    >
                      Save Changes
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                      <span className="text-gray-300">Name</span>
                      <span className="text-white font-medium">
                        {user?.name || "Not set"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                      <span className="text-gray-300">Email</span>
                      <span className="text-white font-medium">
                        {user?.email || "Not set"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                      <span className="text-gray-300">Phone</span>
                      <span className="text-white font-medium">
                        {user?.profile?.phone || "Not set"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                      <span className="text-gray-300">Country</span>
                      <span className="text-white font-medium">
                        {user?.profile?.country || "Not set"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                      <span className="text-gray-300">Account Status</span>
                      <span
                        className={`font-medium ${
                          user?.isVerified
                            ? "text-green-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {user?.isVerified ? "Verified" : "Pending Verification"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Summary */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">
                  Account Summary
                </h2>

                <div className="rounded-lg p-6" style={{background: 'linear-gradient(to bottom right, rgba(0, 255, 190, 0.2), rgba(0, 227, 210, 0.2))', border: '1px solid rgba(0, 255, 190, 0.3)'}}>
                  <h3 className="text-lg font-medium text-white mb-4">
                    Wallet Balance
                  </h3>
                  <div className="text-3xl font-bold text-green-400">
                    ${user?.wallet?.balance?.toFixed(2) || "0.00"}
                  </div>
                  <p className="text-gray-300 text-sm mt-2">
                    Available Balance
                  </p>
                </div>

                <div className="rounded-lg p-6" style={{background: 'linear-gradient(to bottom right, rgba(29, 68, 67, 0.2), rgba(0, 227, 210, 0.2))', border: '1px solid rgba(255, 255, 255, 0.1)'}}>
                  <h3 className="text-lg font-medium text-white mb-4">
                    Account Details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">User ID</span>
                      <span className="text-white font-mono text-sm">
                        {user?._id?.slice(-8) || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Role</span>
                      <span className="text-white capitalize">
                        {user?.role || "User"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Join Date</span>
                      <span className="text-white">
                        {new Date(user?.createdAt).toLocaleDateString() ||
                          "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* <button className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                    Add Funds
                  </button> */}
                  {/* <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    Withdraw Funds
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
