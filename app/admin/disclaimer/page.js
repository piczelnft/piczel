"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from "../components/AdminLayout";

export default function DisclaimerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [sections, setSections] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      router.push('/admin/login');
      return;
    }
    fetchDisclaimer();
  }, [router]);

  const fetchDisclaimer = async () => {
    try {
      const response = await fetch('/api/admin/disclaimer');
      const data = await response.json();
      
      if (data) {
        setTitle(data.title || '⚠️ Important Disclaimer');
        setSections(data.sections || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching disclaimer:', error);
      setMessage({ type: 'error', text: 'Failed to load disclaimer' });
      setLoading(false);
    }
  };

  const handleAddSection = () => {
    setSections([...sections, { heading: '', content: '' }]);
  };

  const handleRemoveSection = (index) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleSectionChange = (index, field, value) => {
    const newSections = [...sections];
    newSections[index][field] = value;
    setSections(newSections);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Title is required' });
      return;
    }

    if (sections.length === 0) {
      setMessage({ type: 'error', text: 'At least one section is required' });
      return;
    }

    const hasEmptyFields = sections.some(s => !s.heading.trim() || !s.content.trim());
    if (hasEmptyFields) {
      setMessage({ type: 'error', text: 'All section headings and content must be filled' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const adminToken = localStorage.getItem("adminToken");
      console.log('Saving disclaimer:', { title, sectionsCount: sections.length });
      console.log('Admin token present:', !!adminToken);
      
      const response = await fetch('/api/admin/disclaimer', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ title, sections })
      });

      const data = await response.json();
      console.log('API response:', { status: response.status, data });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Disclaimer updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update disclaimer' });
      }
    } catch (error) {
      console.error('Error saving disclaimer:', error);
      setMessage({ type: 'error', text: 'Failed to save disclaimer' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Disclaimer Management</h1>
          <p className="text-gray-600">Manage the disclaimer content shown to users</p>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Title */}
        <div className="mb-6 bg-blue-50 p-6 rounded-lg border border-blue-200">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Disclaimer Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            placeholder="e.g., ⚠️ Important Disclaimer"
          />
        </div>

        {/* Sections */}
        <div className="space-y-6 mb-6">
          {sections.map((section, index) => (
            <div key={index} className="bg-white border-2 border-blue-600 p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-blue-600">Section {index + 1}</h3>
                <button
                  onClick={() => handleRemoveSection(index)}
                  className="text-red-600 hover:text-red-800 font-semibold"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Heading
                  </label>
                  <input
                    type="text"
                    value={section.heading}
                    onChange={(e) => handleSectionChange(index, 'heading', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="e.g., Investment Risk"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Content
                  </label>
                  <textarea
                    value={section.content}
                    onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 min-h-32"
                    placeholder="Enter the disclaimer content for this section..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleAddSection}
            className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-colors"
          >
            + Add Section
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Disclaimer'}
          </button>
        </div>

        {/* Preview */}
        <div className="mt-8 border-t-2 border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Preview</h2>
          <div className="bg-blue-600 p-6 rounded-lg">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">{title}</h3>
            <div className="bg-white p-6 rounded-lg">
              <div className="space-y-4 text-black">
                {sections.map((section, index) => (
                  <div key={index}>
                    <h4 className="text-xl font-semibold mb-2">{section.heading}</h4>
                    <p className="text-sm leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </AdminLayout>
  );
}
