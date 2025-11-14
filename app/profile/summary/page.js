'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileSummary() {
  const { user, token, isAuthenticated } = useAuth();
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    country: '',
    memberId: '',
    profileImage: null
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch profile data
  const fetchProfileData = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const data = await response.json();
      setProfileData(prev => data.profile || prev);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError(err.message);
      // Fallback to auth user data if API fails
      if (user) {
        setProfileData({
          fullName: user.name || '',
          email: user.email || '',
          mobile: user.mobile || '',
          country: user.profile?.country || '',
          memberId: user.memberId || '',
          profileImage: user.profile?.avatar || null
        });
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, user]);

  // Fetch data when component mounts
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

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

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setProfileData(data.profile);
      setIsEditing(false);
      
      // Show success message
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: '#fff', fontFamily: 'var(--default-font-family)'}}>
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !profileData.fullName) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: '#fff', fontFamily: 'var(--default-font-family)'}}>
        <div className="text-white text-center max-w-md">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button 
            onClick={fetchProfileData}
            className="btn-enhanced px-4 py-2 text-white hover-bounce"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: '#fff', fontFamily: 'var(--default-font-family)'}}>
      {/* Header */}
      <div className="border-b" style={{backgroundColor: '#1565c0', borderColor: '#1565c0'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="transition-colors text-white hover:text-blue-200">
              ← Back to Dashboard
            </Link>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
              <p className="text-white text-sm">Update your profile settings</p>
              <div className="mt-2">
                <button 
                  onClick={fetchProfileData}
                  className="px-3 py-1 text-white text-xs flex items-center space-x-1 mx-auto rounded-lg transition-all duration-200 hover:bg-blue-900"
                  disabled={loading}
                  style={{backgroundColor: '#0d47a1', border: 'none'}}
                >
                  <span className={`text-xs ${loading ? 'animate-spin' : ''}`}>
                    {loading ? '⟳' : '↻'}
                  </span>
                  <span>Refresh</span>
                </button>
              </div>
            </div>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <div className="rounded-2xl p-8 shadow-2xl animate-fadeInUp" style={{backgroundColor: '#1565c0', color: '#fff'}}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Profile Information</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 text-white ${
                isEditing
                  ? 'hover:bg-gray-700'
                  : 'hover:bg-blue-900'
              }`}
              style={{
                backgroundColor: isEditing ? '#6b7280' : '#0d47a1'
              }}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Image Section */}
            <div className="lg:col-span-1">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="w-full h-full rounded-full flex items-center justify-center text-white text-4xl font-bold" style={{backgroundColor: '#0d47a1', color: 'white'}}>
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
                  <h3 className="text-xl font-semibold text-white">{profileData.fullName || 'Loading...'}</h3>
                  <p className="text-white">{profileData.email}</p>
                  {profileData.memberId && (
                    <p className="text-sm" style={{color: '#fff'}}>ID: {profileData.memberId}</p>
                  )}
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mt-4 p-3 rounded-lg" style={{backgroundColor: '#fff', color: '#d32f2f'}}>
                    <p className="text-sm">
                      ⚠️ {error}
                    </p>
                  </div>
                )}

                {isEditing && (
                  <div className="mt-4">
                    
                  </div>
                )}
              </div>
            </div>

            {/* Profile Details Section */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Full Name:
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                      style={{
                        backgroundColor: '#0d47a1',
                        border: '1px solid #fff',
                      }}
                    />
                  ) : (
                    <div className="text-white px-4 py-3 rounded-xl" style={{backgroundColor: '#0d47a1', border: '1px solid #fff'}}>
                      {profileData.fullName}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Email:
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                      style={{
                        backgroundColor: '#0d47a1',
                        border: '1px solid #fff',
                      }}
                    />
                  ) : (
                    <div className="text-white px-4 py-3 rounded-xl" style={{backgroundColor: '#0d47a1', border: '1px solid #fff'}}>
                      {profileData.email}
                    </div>
                  )}
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Mobile:
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.mobile}
                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                      className="w-full text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                      style={{
                        backgroundColor: '#0d47a1',
                        border: '1px solid #fff',
                      }}
                    />
                  ) : (
                    <div className="text-white px-4 py-3 rounded-xl" style={{backgroundColor: '#0d47a1', border: '1px solid #fff'}}>
                      {profileData.mobile}
                    </div>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Country:
                  </label>
                  {isEditing ? (
                    <select
                      value={profileData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                      style={{
                        backgroundColor: '#0d47a1',
                        border: '1px solid #fff',
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
                    <div className="text-white px-4 py-3 rounded-xl" style={{backgroundColor: '#0d47a1', border: '1px solid #fff'}}>
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
                disabled={saving}
                className={`px-8 py-3 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2`}
                style={{backgroundColor: '#1565c0', border: 'none'}}
              >
                {saving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
