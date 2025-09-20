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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 px-6 py-8 border-b border-white/10">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center ring-4 ring-purple-400/30">
                <span className="text-white font-bold text-2xl">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {user?.name || "User Profile"}
                </h1>
                <p className="text-gray-300">
                  Member since{" "}
                  {new Date(user?.createdAt).toLocaleDateString() || "Unknown"}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">
                    Personal Information
                  </h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
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
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200"
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

                <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg p-6 border border-purple-500/30">
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

                <div className="bg-gradient-to-br from-slate-700/20 to-purple-700/20 rounded-lg p-6 border border-slate-500/30">
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
                  <button className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                    Add Funds
                  </button>
                  <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    Withdraw Funds
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
