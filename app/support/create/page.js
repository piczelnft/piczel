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
  const [myTickets, setMyTickets] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(true);

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

  // Fetch user's support tickets with replies
  useEffect(() => {
    const fetchMyTickets = async () => {
      if (!token) {
        setLoadingReplies(false);
        return;
      }
      try {
        setLoadingReplies(true);
        const res = await fetch('/api/support/tickets?include=responses', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (res.ok) {
          const data = await res.json();
          // Expecting data.tickets with optional replies array on each ticket
          const tickets = Array.isArray(data.tickets) ? data.tickets : [];
          // Sort tickets by most recent activity (reply or createdAt)
          tickets.sort((a, b) => {
            const aDate = new Date(a.updatedAt || a.lastResponse || a.createdAt).getTime();
            const bDate = new Date(b.updatedAt || b.lastResponse || b.createdAt).getTime();
            return bDate - aDate;
          });
          setMyTickets(tickets);
        } else {
          setMyTickets([]);
        }
      } catch (e) {
        console.error('Error fetching my tickets:', e);
        setMyTickets([]);
      } finally {
        setLoadingReplies(false);
      }
    };
    fetchMyTickets();
  }, [token, success]);

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-blue-900 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white p-8">
      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-blue-900 mb-2">Create Support Ticket</h1>
            <p className="text-lg text-blue-700">Send a message to our support team</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-700 text-center">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-green-700 text-center">{success}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Message Form */}
            <div className="lg:col-span-2">
              <div className="bg-[#1565c0] rounded-2xl p-8 border border-blue-800 shadow-lg">
                <h2 className="text-2xl font-semibold text-white mb-8 text-center">Create Support Ticket</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Member ID */}
                  <div>
                    <label className="block text-blue-100 text-sm font-medium mb-2">
                      Member ID
                    </label>
                    <div className="bg-blue-800/80 rounded-lg p-4 border border-blue-900">
                      <div className="text-white font-semibold text-lg">{formData.memberId}</div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-blue-100 text-sm font-medium mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Enter Subject"
                      className="w-full px-4 py-4 bg-blue-800/80 text-white border border-blue-900 rounded-lg text-base focus:outline-none focus:border-blue-400 transition-colors placeholder-blue-200"
                      required
                    />
                  </div>

                  {/* Category and Priority */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-blue-100 text-sm font-medium mb-2">
                        Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 bg-blue-800/80 text-white border border-blue-900 rounded-lg text-base focus:outline-none focus:border-blue-400 transition-colors"
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
                      <label className="block text-blue-100 text-sm font-medium mb-2">
                        Priority
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 bg-blue-800/80 text-white border border-blue-900 rounded-lg text-base focus:outline-none focus:border-blue-400 transition-colors"
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
                    <label className="block text-blue-100 text-sm font-medium mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Enter Your Issue"
                      rows={6}
                      className="w-full px-4 py-4 bg-blue-800/80 text-white border border-blue-900 rounded-lg text-base focus:outline-none focus:border-blue-400 transition-colors placeholder-blue-200 resize-none"
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
                          ? 'bg-blue-300 text-blue-100 cursor-not-allowed'
                          : 'bg-white text-[#1565c0] hover:bg-blue-100 hover:text-blue-900 cursor-pointer'
                      }`}
                    >
                      {submitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mr-2"></div>
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

      {/* Replies Section */}
      <div className="flex-1 mt-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#1565c0] rounded-2xl p-6 border border-blue-800 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Your Support Replies</h2>
            {loadingReplies ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
                <p className="text-blue-100 text-sm">Loading replies...</p>
              </div>
            ) : myTickets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-blue-100 text-sm">No tickets found yet. Create a ticket to receive replies from support.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myTickets.map((t) => {
                  const replies = Array.isArray(t.responses) ? t.responses.map(r => ({
                    message: r.message,
                    by: r.sender === 'admin' ? 'Admin' : 'You',
                    createdAt: r.createdAt
                  })) : [];
                  return (
                    <div key={t._id} className="p-4 rounded-lg border border-blue-900 bg-blue-800/80">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-white font-semibold">
                          #{t.ticketId} • {t.subject || 'No subject'}
                        </div>
                        <div className="text-xs text-blue-100">
                          {new Date(t.updatedAt || t.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-blue-100 text-sm mb-3">
                        {t.message || t.description}
                      </div>
                      {replies.length === 0 ? (
                        <div className="text-xs text-blue-100">No replies yet.</div>
                      ) : (
                        <div className="space-y-2">
                          {replies
                            .slice()
                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                            .map((r, idx) => (
                              <div key={`${t._id}-r-${idx}`} className="p-3 rounded-md bg-blue-900/80 border border-blue-800">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="text-xs text-white">
                                    {r.by || 'Admin'}
                                  </div>
                                  <div className="text-[10px] text-blue-100">
                                    {new Date(r.createdAt).toLocaleString()}
                                  </div>
                                </div>
                                <div className="text-sm text-white whitespace-pre-wrap">
                                  {r.message}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportCreatePage;
