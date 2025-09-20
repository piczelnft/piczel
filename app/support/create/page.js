'use client';

import { useState } from 'react';

const SupportCreatePage = () => {
  const [formData, setFormData] = useState({
    memberId: 'DGT123456',
    subject: '',
    message: ''
  });

  const adminInfo = {
    name: 'Admin',
    email: 'admin@gmail.com',
    memberId: 'DGT123456'
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Support message submitted:', formData);
    // Add your support message logic here
    alert('Message sent successfully! We will get back to you soon.');
    setFormData({
      memberId: 'DGT123456',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Send Messages</h1>
          <p className="text-lg text-gray-300">Send message</p>
        </div>

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
                    className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg text-lg font-medium hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SupportCreatePage;
