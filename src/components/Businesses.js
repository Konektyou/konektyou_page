'use client';

import { motion } from 'framer-motion';
import { FiAlertTriangle, FiDollarSign } from 'react-icons/fi';
import { FaCheck } from 'react-icons/fa';

export default function Businesses() {
  return (
    (<motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true, margin: "-100px" }}
      id="businesses"
      className="py-12 sm:py-16 lg:py-20 bg-white relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" className="text-gray-400">
          <defs>
            <pattern id="business-dots" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="2" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#business-dots)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative">
        {/* Header Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-3 sm:px-4 py-2 bg-gray-100 rounded-full text-xs sm:text-sm font-medium text-gray-700 mb-4 sm:mb-6 shadow-sm"
          >
            <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
            For Businesses
          </motion.div>
          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4 sm:mb-6 leading-tight px-2"
          >
            Keep Your Business <br />
            <span className="text-gray-600">Running Smoothly</span>
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4"
          >
            Reliable help is available in minutes, not weeks. <br /> No hiring process.
          </motion.p>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center mb-12 sm:mb-16"
        >
          {/* Left Content - Benefits */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6 sm:space-y-8"
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              viewport={{ once: true }}
              className="space-y-4 sm:space-y-6"
            >
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-black flex items-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 mr-3 text-red-500 border-3 border-red-500 rounded-full p-1 flex items-center justify-center">
                  <FiAlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                Emergency Coverage
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                Fill critical shifts instantly when staff call in sick.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
              className="space-y-4 sm:space-y-6"
            >
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-black flex items-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 mr-3 text-green-500 border-3 border-green-500 rounded-full p-1 flex items-center justify-center">
                  <FiDollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                Protect Revenue
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                Never turn away customers due to staffing shortages.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              viewport={{ once: true }}
              className="space-y-4 sm:space-y-6"
            >
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-black flex items-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 mr-3 text-blue-500 border-3 border-blue-500 rounded-full p-1 flex items-center justify-center">
                  <FaCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                Verified Professionals
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                Pre-screened, background-checked professionals ready to maintain your standards.
              </p>
            </motion.div>
          </motion.div>

          {/* Right Content - Visual Elements */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            viewport={{ once: true }}
            className="relative order-first lg:order-last"
          >
            <motion.div className="bg-gray-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 h-64 sm:h-80 lg:h-96 relative overflow-hidden">
              {/* Business Dashboard Visualization */}
              <div className="absolute inset-0 p-4 sm:p-6 lg:p-8">
                {/* Header Bar */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-black">Business Dashboard</div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-200">
                    <div className="text-xs sm:text-sm text-gray-600">Active Shifts</div>
                    <div className="text-sm sm:text-lg font-bold text-black">12</div>
                  </div>
                  <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-200">
                    <div className="text-xs sm:text-sm text-gray-600">Coverage Rate</div>
                    <div className="text-sm sm:text-lg font-bold text-green-600">98%</div>
                  </div>
                </div>

                {/* Shift Cards */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-black">Morning Shift</div>
                      <div className="text-xs text-gray-600">8:00 AM - 4:00 PM</div>
                    </div>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-black">Evening Shift</div>
                      <div className="text-xs text-gray-600">4:00 PM - 12:00 AM</div>
                    </div>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-black">Night Shift</div>
                      <div className="text-xs text-gray-600">12:00 AM - 8:00 AM</div>
                    </div>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

      </div>
    </motion.section>)
  );
}
