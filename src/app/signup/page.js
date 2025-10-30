'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiPhone, FiMapPin, FiClock, FiArrowRight } from 'react-icons/fi';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    area: '',
    time: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const serviceOptions = [
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send email to info@konektly.ca
      const response = await fetch('/api/send-signup-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Redirect to Order Service page
        router.push('/order-service');
      } else {
        console.error('Failed to send signup email');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-start justify-center px-4 pt-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl w-full"
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
            Join Konektly
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            Get Started
          </h1>
          <p className="text-gray-600">
            Connect with verified professionals in your area
          </p>
        </div>

        {/* Signup Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }} 
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name and Email Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name Field */}
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-gray-300 focus:shadow-none transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email Field */}
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-gray-300 focus:shadow-none transition-all"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            </div>

            {/* Phone and Service Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone Field */}
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-gray-300 focus:shadow-none transition-all"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Service Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Needed
                </label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-gray-300 focus:shadow-none transition-all"
                >
                  <option value="">Select a service</option>
                  {serviceOptions.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Area and Time Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Area Field */}
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-gray-300 focus:shadow-none transition-all"
                    placeholder="Enter your area (e.g., Toronto, ON)"
                  />
                </div>
              </div>

              {/* Time Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time
                </label>
                <div className="relative">
                  <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-gray-300 focus:shadow-none transition-all"
                  >
                    <option value="">Select preferred time</option>
                    <option value="morning">Morning (8 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                    <option value="evening">Evening (5 PM - 9 PM)</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
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
                <FiArrowRight className="w-5 h-5 mr-2" />
              )}
              {isSubmitting ? 'Creating Account...' : 'Sign Up & Continue'}
            </motion.button>
          </form>

          {/* Provider Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Are you a service provider?{' '}
              <a href="/provider-signup" className="text-black font-semibold hover:underline">
                Create your profile
              </a>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
