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
  const [uploadingImage, setUploadingImage] = useState({});

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
      
      console.log('Fetched disclaimer data:', data);
      console.log('Sections from API:', data.sections);
      
      if (data) {
        setTitle(data.title || '⚠️ Important Disclaimer');
        // Ensure all sections have the image field
        const sectionsWithImage = (data.sections || []).map(section => ({
          heading: section.heading || '',
          content: section.content || '',
          image: section.image || ''
        }));
        console.log('Sections after mapping:', sectionsWithImage);
        setSections(sectionsWithImage);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching disclaimer:', error);
      setMessage({ type: 'error', text: 'Failed to load disclaimer' });
      setLoading(false);
    }
  };

  const handleAddSection = () => {
    setSections([...sections, { heading: '', content: '', image: '' }]);
  };

  const handleImageUpload = async (index, file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 10MB' });
      return;
    }

    setUploadingImage(prev => ({ ...prev, [index]: true }));
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const adminToken = localStorage.getItem("adminToken");
      
      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Upload error:', data);
        throw new Error(data.error || 'Upload failed');
      }

      handleSectionChange(index, 'image', data.url);
      setMessage({ type: 'success', text: 'Image uploaded successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage({ type: 'error', text: `Failed to upload image: ${error.message}` });
    } finally {
      setUploadingImage(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleRemoveImage = (index) => {
    handleSectionChange(index, 'image', '');
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
      console.log('Sections being sent:', JSON.stringify(sections, null, 2));
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
      console.log('Full response data:', JSON.stringify(data, null, 2));

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
      <div className="min-h-screen bg-white p-3 sm:p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">Disclaimer Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage the disclaimer content shown to users</p>
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
        <div className="mb-4 sm:mb-6 bg-blue-50 p-3 sm:p-4 md:p-6 rounded-lg border border-blue-200">
          <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2">
            Disclaimer Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            placeholder="e.g., ⚠️ Important Disclaimer"
          />
        </div>

        {/* Sections */}
        <div className="space-y-4 sm:space-y-6 mb-4 sm:mb-6">
          {sections.map((section, index) => (
            <div key={index} className="bg-white border-2 border-blue-600 p-3 sm:p-4 md:p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-blue-600">Section {index + 1}</h3>
                <button
                  onClick={() => handleRemoveSection(index)}
                  className="text-sm sm:text-base text-red-600 hover:text-red-800 font-semibold"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2">
                    Heading
                  </label>
                  <input
                    type="text"
                    value={section.heading}
                    onChange={(e) => handleSectionChange(index, 'heading', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="e.g., Investment Risk"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2">
                    Content
                  </label>
                  <textarea
                    value={section.content}
                    onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 min-h-24 sm:min-h-32"
                    placeholder="Enter the disclaimer content for this section..."
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2">
                    Image (Optional)
                  </label>
                  {section.image ? (
                    <div className="space-y-2">
                      <div className="relative inline-block">
                        <img
                          src={section.image}
                          alt="Section image"
                          className="w-full max-w-[200px] sm:max-w-xs rounded-lg border border-gray-300"
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-600 text-white rounded-full p-1.5 sm:p-2 hover:bg-red-700"
                          type="button"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(index, e.target.files[0])}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        disabled={uploadingImage[index]}
                      />
                      {uploadingImage[index] && (
                        <p className="text-xs sm:text-sm text-blue-600 mt-2">Uploading image...</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={handleAddSection}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-colors"
          >
            + Add Section
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Disclaimer'}
          </button>
        </div>

        {/* Preview */}
        <div className="mt-6 sm:mt-8 border-t-2 border-gray-200 pt-6 sm:pt-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Preview</h2>
          <div className="bg-blue-600 p-3 sm:p-4 md:p-6 rounded-lg">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 text-center">{title}</h3>
            <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg">
              <div className="space-y-4 sm:space-y-6 text-black">
                {sections.map((section, index) => (
                  <div key={index} className="text-center">
                    <h4 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{section.heading}</h4>
                    <p className="text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 px-2">{section.content}</p>
                    {section.image && (
                      <div className="flex justify-center">
                        <img
                          src={section.image}
                          alt={section.heading}
                          className="w-full max-w-[250px] sm:max-w-md rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
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
