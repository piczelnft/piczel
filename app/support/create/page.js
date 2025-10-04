'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const SupportCreatePage = () => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    memberId: '',
    subject: '',
    message: '',
    category: 'General',
    priority: 'medium'
  });
  const [adminInfo, setAdminInfo] = useState({
    name: 'Admin',
    email: 'admin@dgtek.com',
    memberId: 'ADMIN001'
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch user and admin information on component mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!token) {
        setError('Please login to create support tickets');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/support/user-info', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({
            ...prev,
            memberId: data.user.memberId
          }));
          setAdminInfo(data.admin);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch user information');
        }
      } catch (err) {
        setError('Network error. Please try again.');
        console.error('Error fetching user info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    if (!token) {
      setError('Please login to create support tickets');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/support/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: formData.subject,
          message: formData.message,
          category: formData.category,
          priority: formData.priority
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('Support ticket created successfully! We will get back to you soon.');
        setFormData(prev => ({
          ...prev,
          subject: '',
          message: '',
          category: 'General',
          priority: 'medium'
        }));
      } else {
        const errorData = await response.json();
        setError(errorData.error || errorData.details || 'Failed to create support ticket');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error creating support ticket:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Create Support Ticket</h1>
          <p className="text-lg text-gray-300">Send a message to our support team</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-center">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-green-300 text-center">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Admin Information */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 shadow-lg">
              <h2 className="text-xl font-semibold text-white mb-6 text-center">Admin Information</h2>
              
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg border-3 border-white mb-4">
                  <span className="text-white text-2xl font-bold">A</span>
                </div>
                <div className="text-white font-semibold text-lg">{adminInfo.name}</div>
                <div className="text-gray-300 text-sm">{adminInfo.memberId}</div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-slate-700/50 to-purple-700/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
                  <div className="text-gray-300 text-sm mb-1">Email</div>
                  <div className="text-white font-medium">{adminInfo.email}</div>
                </div>
                
                <div className="bg-gradient-to-br from-slate-700/50 to-purple-700/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
                  <div className="text-gray-300 text-sm mb-1">Member ID</div>
                  <div className="text-cyan-400 font-medium">{adminInfo.memberId}</div>
                </div>
                
                <div className="bg-gradient-to-br from-slate-700/50 to-purple-700/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
                  <div className="text-gray-300 text-sm mb-1">Status</div>
                  <div className="text-green-400 font-medium">Online</div>
                </div>
              </div>
            </div>
          </div>

          {/* Message Form */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 shadow-lg">
              <h2 className="text-2xl font-semibold text-white mb-8 text-center">Create Support Ticket</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Member ID */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Member ID
                  </label>
                  <div className="bg-gradient-to-br from-slate-700/50 to-purple-700/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
                    <div className="text-white font-semibold text-lg">{formData.memberId}</div>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Enter Subject"
                    className="w-full px-4 py-4 bg-slate-700/50 text-white border border-purple-500/30 rounded-lg text-base focus:outline-none focus:border-purple-400 transition-colors placeholder-gray-400"
                    required
                  />
                </div>

                {/* Category and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-slate-700/50 text-white border border-purple-500/30 rounded-lg text-base focus:outline-none focus:border-purple-400 transition-colors"
                    >
                      <option value="General">General</option>
                      <option value="Technical">Technical</option>
                      <option value="Account">Account</option>
                      <option value="Payment">Payment</option>
                      <option value="Bug Report">Bug Report</option>
                      <option value="Feature Request">Feature Request</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-slate-700/50 text-white border border-purple-500/30 rounded-lg text-base focus:outline-none focus:border-purple-400 transition-colors"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Enter Your Issue"
                    rows={6}
                    className="w-full px-4 py-4 bg-slate-700/50 text-white border border-purple-500/30 rounded-lg text-base focus:outline-none focus:border-purple-400 transition-colors placeholder-gray-400 resize-none"
                    required
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full px-6 py-4 rounded-lg text-lg font-medium transition-all duration-300 shadow-lg ${
                      submitting
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-600 hover:to-purple-700 hover:shadow-xl cursor-pointer'
                    }`}
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating Ticket...
                      </div>
                    ) : (
                      'Create Support Ticket'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

      </div>
      </div>
    </div>
  );
};

export default SupportCreatePage;
