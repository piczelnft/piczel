'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ProfileSummary() {
  const [profileData, setProfileData] = useState({
    fullName: 'Admin',
    email: 'admin@gmail.com',
    mobile: '3434847312',
    country: 'India',
    profileImage: null
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileData(prev => ({
        ...prev,
        profileImage: file
      }));
    }
  };

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving profile:', profileData);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>
      {/* Header */}
      <div className="backdrop-blur-sm border-b" style={{background: 'linear-gradient(to right, rgba(29, 68, 67, 0.8), rgba(29, 68, 67, 0.8))', borderColor: 'var(--default-border)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="transition-colors" style={{color: 'var(--primary-color)'}}>
              ← Back to Dashboard
            </Link>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">👤 Profile Settings</h1>
              <p className="text-gray-300 text-sm" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Update your profile settings</p>
            </div>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <div className="card-enhanced rounded-2xl p-8 shadow-2xl animate-fadeInUp">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Profile Information</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 ${
                isEditing
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white'
                  : 'btn-enhanced text-white'
              }`}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Image Section */}
            <div className="lg:col-span-1">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="w-full h-full rounded-full flex items-center justify-center text-white text-4xl font-bold" style={{background: 'linear-gradient(to bottom right, var(--primary-color), var(--secondary-color))', color: 'white'}}>
                    {profileData.profileImage ? (
                      <Image
                        src={URL.createObjectURL(profileData.profileImage)}
                        alt="Profile"
                        fill
                        className="object-cover rounded-full"
                      />
                    ) : (
                      profileData.fullName.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">{profileData.fullName}</h3>
                  <p className="text-gray-400">{profileData.email}</p>
                </div>

                {isEditing && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Profile Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:text-white file:cursor-pointer cursor-pointer"
                      style={{
                        fileBackgroundColor: 'var(--primary-color)',
                        fileHoverBackgroundColor: 'var(--secondary-color)'
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">No file chosen</p>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Details Section */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name:
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                      style={{
                        backgroundColor: 'rgba(29, 68, 67, 0.8)',
                        border: '1px solid var(--default-border)',
                        focusRingColor: 'var(--primary-color)'
                      }}
                    />
                  ) : (
                    <div className="text-white px-4 py-3 rounded-xl" style={{backgroundColor: 'rgba(29, 68, 67, 0.8)', border: '1px solid var(--default-border)'}}>
                      {profileData.fullName}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email:
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                      style={{
                        backgroundColor: 'rgba(29, 68, 67, 0.8)',
                        border: '1px solid var(--default-border)',
                        focusRingColor: 'var(--primary-color)'
                      }}
                    />
                  ) : (
                    <div className="text-white px-4 py-3 rounded-xl" style={{backgroundColor: 'rgba(29, 68, 67, 0.8)', border: '1px solid var(--default-border)'}}>
                      {profileData.email}
                    </div>
                  )}
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mobile:
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.mobile}
                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                      className="w-full text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                      style={{
                        backgroundColor: 'rgba(29, 68, 67, 0.8)',
                        border: '1px solid var(--default-border)',
                        focusRingColor: 'var(--primary-color)'
                      }}
                    />
                  ) : (
                    <div className="text-white px-4 py-3 rounded-xl" style={{backgroundColor: 'rgba(29, 68, 67, 0.8)', border: '1px solid var(--default-border)'}}>
                      {profileData.mobile}
                    </div>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Country:
                  </label>
                  {isEditing ? (
                    <select
                      value={profileData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                      style={{
                        backgroundColor: 'rgba(29, 68, 67, 0.8)',
                        border: '1px solid var(--default-border)',
                        focusRingColor: 'var(--primary-color)'
                      }}
                    >
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Japan">Japan</option>
                      <option value="China">China</option>
                      <option value="Brazil">Brazil</option>
                    </select>
                  ) : (
                    <div className="text-white px-4 py-3 rounded-xl" style={{backgroundColor: 'rgba(29, 68, 67, 0.8)', border: '1px solid var(--default-border)'}}>
                      {profileData.country}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
