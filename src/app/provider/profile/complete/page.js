'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiUpload, FiX, FiEye, FiEyeOff, FiLoader, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { getProviderData, getProviderToken } from '@/lib/providerAuth';

const SERVICE_TYPES = [
  'Personal Support Worker (PSW)',
  'Home Health Care',
  'Cleaning Services',
  'Office Support',
  'Childcare',
  'Elderly Care',
  'Pet Care',
  'Landscaping',
  'Handyman Services',
  'Other'
];

const EXPERIENCE_YEARS = ['0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years'];

const CANADIAN_PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 
  'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 
  'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 
  'Saskatchewan', 'Yukon'
];

export default function CompleteProfilePage() {
  const router = useRouter();
  const providerData = getProviderData();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form fields
  const [formData, setFormData] = useState({
    name: providerData?.name || '',
    email: providerData?.email || '',
    phone: '',
    city: '',
    province: '',
    serviceType: '',
    experience: '',
    businessName: ''
  });

  // File states
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Fetch existing profile data if available
    if (providerData?.id) {
      fetchProfileData();
    }
  }, [providerData?.id]);

  const fetchProfileData = async () => {
    try {
      const token = getProviderToken();
      const response = await fetch(`/api/provider/profile?providerId=${providerData.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success && data.profile) {
        const profile = data.profile;
        setFormData({
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          city: profile.city || '',
          province: profile.province || '',
          serviceType: profile.serviceType || '',
          experience: profile.experience || '',
          businessName: profile.businessName || ''
        });
        
        if (profile.photoPath) {
          setProfilePhotoPreview(`/api/images/${profile.photoPath.split('/').pop()}`);
        }

        // If profile is already submitted and pending/approved, show status
        if (profile.profileStatus === 'PENDING_REVIEW' || profile.profileStatus === 'APPROVED') {
          setSuccess('Your profile has been submitted and is under review.');
        } else if (profile.profileStatus === 'REJECTED') {
          setError(profile.rejectionReason || 'Your profile was rejected. Please update and resubmit.');
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.province) newErrors.province = 'Province is required';
    if (!formData.serviceType) newErrors.serviceType = 'Service type is required';
    if (!formData.experience) newErrors.experience = 'Years of experience is required';
    if (!profilePhoto) newErrors.profilePhoto = 'Profile photo is required';
    if (documents.length === 0) newErrors.documents = 'At least one document is required';

    // Phone validation (Canadian format)
    const phoneRegex = /^(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Canadian phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, profilePhoto: 'Please upload an image file' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, profilePhoto: 'Image size must be less than 5MB' }));
      return;
    }

    setProfilePhoto(file);
    setErrors(prev => ({ ...prev, profilePhoto: '' }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDocumentAdd = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      // Validate file type (images and PDFs)
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError('Only images (JPEG, PNG, WebP) and PDF files are allowed');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setDocuments(prev => [...prev, {
        file,
        id: Date.now() + Math.random(),
        documentType: 'Professional Document',
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      }]);
    });

    setError('');
  };

  const handleDocumentRemove = (id) => {
    setDocuments(prev => {
      const doc = prev.find(d => d.id === id);
      if (doc?.preview) {
        URL.revokeObjectURL(doc.preview);
      }
      return prev.filter(d => d.id !== id);
    });
  };

  const handleDocumentTypeChange = (id, type) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, documentType: type } : doc
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setError('Please fill in all required fields correctly');
      return;
    }

    setSubmitting(true);

    try {
      const token = getProviderToken();
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setSubmitting(false);
        return;
      }

      const formDataToSend = new FormData();

      // Add form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add profile photo
      if (profilePhoto) {
        formDataToSend.append('profilePhoto', profilePhoto);
      }

      // Add documents
      documents.forEach((doc, index) => {
        formDataToSend.append('documents', doc.file);
        formDataToSend.append('documentTypes', doc.documentType);
      });

      console.log('Submitting profile with:', {
        fields: Object.fromEntries(formDataToSend.entries()),
        hasPhoto: !!profilePhoto,
        documentsCount: documents.length
      });

      const response = await fetch('/api/provider/profile/complete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type - browser will set it with boundary for FormData
        },
        body: formDataToSend
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (data.success) {
        setSuccess('Profile submitted successfully! It is now under admin review.');
        // Update localStorage with new profile status
        if (data.provider) {
          const currentAuth = JSON.parse(localStorage.getItem('providerAuth') || '{}');
          localStorage.setItem('providerAuth', JSON.stringify({
            ...currentAuth,
            provider: { ...currentAuth.provider, ...data.provider }
          }));
        }
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/provider/verification/onboarding');
        }, 2000);
      } else {
        setError(data.message || 'Failed to submit profile. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting profile:', err);
      setError(`An error occurred: ${err.message || 'Please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const isReadOnly = providerData?.profileStatus === 'PENDING_REVIEW' || providerData?.profileStatus === 'APPROVED';

  return (
    <div className="max-w-5xl mx-auto space-y-6 px-4 py-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
        <p className="text-gray-600 mt-2">
          Please fill in all required information to start providing services on Konektly
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3 shadow-sm">
          <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 font-semibold">Error</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 flex items-start gap-3 shadow-sm">
          <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-green-800 font-semibold">Success</p>
            <p className="text-green-700 text-sm mt-1">{success}</p>
          </div>
        </div>
      )}

      {/* Profile Status Banner */}
      {isReadOnly && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4 shadow-sm">
          <p className="text-yellow-800 text-sm">
            <strong>Profile Under Review:</strong> Your profile has been submitted and is currently being reviewed by our admin team. 
            You cannot edit your profile until the review is complete.
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
        {/* Personal Information */}
        <div className="p-6 space-y-4">
          <div className="pb-2 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
            <p className="text-sm text-gray-500 mt-1">Your basic contact details</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                } ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="John Doe"
              />
              {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                placeholder="john@example.com"
              />
              <p className="text-gray-500 text-xs mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                } ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="(555) 123-4567"
              />
              {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>
        </div>

        {/* Service Area */}
        <div className="p-6 space-y-4">
          <div className="pb-2 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Service Area</h2>
            <p className="text-sm text-gray-500 mt-1">Where you provide your services</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent ${
                  errors.city ? 'border-red-300' : 'border-gray-300'
                } ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="Toronto"
              />
              {errors.city && <p className="text-red-600 text-xs mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Province <span className="text-red-500">*</span>
              </label>
              <select
                name="province"
                value={formData.province}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent ${
                  errors.province ? 'border-red-300' : 'border-gray-300'
                } ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              >
                <option value="">Select Province</option>
                {CANADIAN_PROVINCES.map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
              {errors.province && <p className="text-red-600 text-xs mt-1">{errors.province}</p>}
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="p-6 space-y-4">
          <div className="pb-2 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Professional Information</h2>
            <p className="text-sm text-gray-500 mt-1">Your service type and experience</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Type <span className="text-red-500">*</span>
              </label>
              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent ${
                  errors.serviceType ? 'border-red-300' : 'border-gray-300'
                } ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              >
                <option value="">Select Service Type</option>
                {SERVICE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.serviceType && <p className="text-red-600 text-xs mt-1">{errors.serviceType}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Years of Experience <span className="text-red-500">*</span>
              </label>
              <select
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent ${
                  errors.experience ? 'border-red-300' : 'border-gray-300'
                } ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              >
                <option value="">Select Experience</option>
                {EXPERIENCE_YEARS.map(exp => (
                  <option key={exp} value={exp}>{exp}</option>
                ))}
              </select>
              {errors.experience && <p className="text-red-600 text-xs mt-1">{errors.experience}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name / Nature of Work (Optional)
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent ${
                  isReadOnly ? 'bg-gray-50 cursor-not-allowed' : 'border-gray-300'
                }`}
                placeholder="e.g., ABC Cleaning Services"
              />
            </div>
          </div>
        </div>

        {/* Profile Photo */}
        <div className="p-6 space-y-4">
          <div className="pb-2 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Profile Photo</h2>
            <p className="text-sm text-gray-500 mt-1">Upload a professional photo of yourself</p>
          </div>
          <div className="space-y-4 pt-2">
            {profilePhotoPreview ? (
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={profilePhotoPreview}
                    alt="Profile preview"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                  />
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        setProfilePhoto(null);
                        setProfilePhotoPreview(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-md transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Profile photo uploaded</p>
                  <p className="text-xs text-gray-500 mt-1">Click the X button to remove and upload a new one</p>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Profile Photo <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                  className="hidden"
                  id="profilePhoto"
                />
                <label
                  htmlFor="profilePhoto"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all"
                >
                  <FiUpload className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Choose Photo</span>
                </label>
                {errors.profilePhoto && <p className="text-red-600 text-xs mt-2">{errors.profilePhoto}</p>}
                <p className="text-gray-500 text-xs mt-2">Max size: 5MB. Formats: JPEG, PNG, WebP</p>
              </div>
            )}
          </div>
        </div>

        {/* Professional Documents */}
        <div className="p-6 space-y-4">
          <div className="pb-2 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Professional Documents</h2>
            <p className="text-sm text-gray-500 mt-1">Upload your certifications, licenses, and identification documents</p>
          </div>
          <div className="space-y-4 pt-2">
            {!isReadOnly && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Documents <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={handleDocumentAdd}
                  className="hidden"
                  id="documents"
                />
                <label
                  htmlFor="documents"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all"
                >
                  <FiUpload className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Add Documents</span>
                </label>
                {errors.documents && <p className="text-red-600 text-xs mt-2">{errors.documents}</p>}
                <p className="text-gray-500 text-xs mt-2">Max size: 10MB per file. Formats: JPEG, PNG, WebP, PDF</p>
              </div>
            )}

            {documents.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate" title={doc.file.name}>{doc.file.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{(doc.file.size / 1024).toFixed(2)} KB</p>
                      </div>
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => handleDocumentRemove(doc.id)}
                          className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                          title="Remove document"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {doc.preview && (
                      <div className="mb-3">
                        <img
                          src={doc.preview}
                          alt="Document preview"
                          className="w-full h-32 object-cover rounded border border-gray-200"
                        />
                      </div>
                    )}
                    {!isReadOnly && (
                      <select
                        value={doc.documentType}
                        onChange={(e) => handleDocumentTypeChange(doc.id, e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                      >
                        <option value="Professional Document">Professional Document</option>
                        <option value="Government ID">Government ID</option>
                        <option value="Certification">Certification</option>
                        <option value="License">License</option>
                        <option value="Insurance">Insurance</option>
                      </select>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        {!isReadOnly && (
          <div className="p-6 bg-gray-50 flex justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              <span className="text-red-500">*</span> Required fields must be filled before submission
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={submitting}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm"
              >
                {submitting ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit for Review'
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}



