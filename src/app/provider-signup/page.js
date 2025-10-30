'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiPhone, FiMapPin, FiUpload, FiCheck, FiX, FiCamera } from 'react-icons/fi';

export default function ProviderSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: '',
    experience: '',
    area: '',
    businessName: '',
    documents: [],
    photo: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState([]);

  const serviceTypes = [
    'PSW (Personal Support Worker)',
    'Personal Trainer',
    'Photographer',
    'MAU (Makeup Artist)',
    'Hairstylist',
    'Plumber',
    'Office Support',
    'Cleaner',
    'Handyman',
    'Other'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = (e, type) => {
    const files = Array.from(e.target.files);
    if (type === 'documents') {
      setUploadedDocs([...uploadedDocs, ...files]);
    } else if (type === 'photo') {
      setFormData({
        ...formData,
        photo: files[0]
      });
    }
  };

  const removeDocument = (index) => {
    setUploadedDocs(uploadedDocs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send email to info@konektly.ca with provider details
      const response = await fetch('/api/send-provider-signup-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          documents: uploadedDocs.map(doc => doc.name)
        }),
      });

      if (response.ok) {
        // Redirect to success page or dashboard
        router.push('/provider-success');
      } else {
        console.error('Failed to send provider signup email');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center px-4 py-2 bg-black rounded-full text-sm font-medium text-white mb-6"
          >
            <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
            Service Provider Registration
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            Create Your Profile
          </h1>
          <p className="text-gray-600">
            Join our network of verified professionals
          </p>
        </div>

        {/* Provider Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-black mb-4">Personal Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Area
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your service area"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-black mb-4">Professional Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type
                  </label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select your service type</option>
                    {serviceTypes.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select experience</option>
                    <option value="0-1">0-1 years</option>
                    <option value="2-5">2-5 years</option>
                    <option value="6-10">6-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name / Nature of Work
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., Salon, Restaurant, Freelance"
                />
              </div>
            </div>

            {/* Documents Upload */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-black mb-4">Upload Documents</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Documents (Certificates, Licenses, etc.)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                    <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Click to upload documents</p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e, 'documents')}
                      className="hidden"
                      id="documents"
                    />
                    <label htmlFor="documents" className="cursor-pointer">
                      <span className="text-blue-600 font-medium">Choose Files</span>
                    </label>
                  </div>
                </div>

                {/* Uploaded Documents List */}
                {uploadedDocs.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Uploaded Documents:</p>
                    {uploadedDocs.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                          <span className="text-sm text-gray-700">{doc.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Photo Upload */}
            <div className="pb-6">
              <h3 className="text-lg font-semibold text-black mb-4">Profile Photo</h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                <FiCamera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload your profile photo</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'photo')}
                  className="hidden"
                  id="photo"
                />
                <label htmlFor="photo" className="cursor-pointer">
                  <span className="text-blue-600 font-medium">Choose Photo</span>
                </label>
                {formData.photo && (
                  <p className="text-sm text-green-600 mt-2">✓ {formData.photo.name}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-black text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 flex items-center justify-center disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <FiCheck className="w-5 h-5 mr-2" />
              )}
              {isSubmitting ? 'Creating Profile...' : 'Create Profile & Get Verified'}
            </motion.button>
          </form>

          {/* User Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Looking for services instead?{' '}
              <a href="/signup" className="text-black font-semibold hover:underline">
                Sign up as a client
              </a>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
