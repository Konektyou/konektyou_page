'use client';

import { motion } from 'framer-motion';

export default function About() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true, margin: "-100px" }}
      id="about"
      className="py-12 sm:py-16 lg:py-20 bg-white relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" className="text-gray-400">
          <defs>
            <pattern id="dots" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="2" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
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
            className="inline-flex items-center px-3 sm:px-4 py-2 bg-gray-100 rounded-full text-xs sm:text-sm font-medium text-gray-700 mb-4 sm:mb-6"
          >
            <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
            About Our Platform
          </motion.div>
          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4 sm:mb-6 leading-tight px-2"
          >
            Revolutionizing Service <br />
            <span className="text-gray-600">Connections</span>
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4"
          >
            Connect with verified professionals instantly.
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
          {/* Left Content */}
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
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-black">Real-Time Matching</h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                Instantly connect with verified professionals in your area.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
              className="space-y-4 sm:space-y-6"
            >
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-black">Verified Professionals</h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                Thoroughly vetted and rated by real customers.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              viewport={{ once: true }}
              className="space-y-4 sm:space-y-6"
            >
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-black">Simple Booking</h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                Transparent pricing, instant booking, secure payments.
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
              {/* Network Visualization */}
              <motion.div className="absolute inset-0 p-4 sm:p-6 lg:p-8">
                {/* Central Node */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-black rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-black font-bold text-xs sm:text-sm">K</span>
                    </div>
                  </div>
                </div>

                {/* Surrounding Nodes */}
                <div className="absolute top-6 sm:top-8 left-6 sm:left-8 w-6 h-6 sm:w-8 sm:h-8 bg-gray-600 rounded-full"></div>
                <div className="absolute top-6 sm:top-8 right-6 sm:right-8 w-6 h-6 sm:w-8 sm:h-8 bg-gray-600 rounded-full"></div>
                <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 w-6 h-6 sm:w-8 sm:h-8 bg-gray-600 rounded-full"></div>
                <div className="absolute bottom-6 sm:bottom-8 right-6 sm:right-8 w-6 h-6 sm:w-8 sm:h-8 bg-gray-600 rounded-full"></div>
                <div className="absolute top-1/2 left-3 sm:left-4 w-4 h-4 sm:w-6 sm:h-6 bg-gray-500 rounded-full"></div>
                <div className="absolute top-1/2 right-3 sm:right-4 w-4 h-4 sm:w-6 sm:h-6 bg-gray-500 rounded-full"></div>
                <div className="absolute top-3 sm:top-4 left-1/2 w-4 h-4 sm:w-6 sm:h-6 bg-gray-500 rounded-full"></div>
                <div className="absolute bottom-3 sm:bottom-4 left-1/2 w-4 h-4 sm:w-6 sm:h-6 bg-gray-500 rounded-full"></div>

                {/* Connection Lines */}
                <svg className="absolute inset-0 w-full h-full">
                  <line x1="50%" y1="50%" x2="12.5%" y2="12.5%" stroke="#000" strokeWidth="1" opacity="0.3" />
                  <line x1="50%" y1="50%" x2="87.5%" y2="12.5%" stroke="#000" strokeWidth="1" opacity="0.3" />
                  <line x1="50%" y1="50%" x2="12.5%" y2="87.5%" stroke="#000" strokeWidth="1" opacity="0.3" />
                  <line x1="50%" y1="50%" x2="87.5%" y2="87.5%" stroke="#000" strokeWidth="1" opacity="0.3" />
                  <line x1="50%" y1="50%" x2="6.25%" y2="50%" stroke="#000" strokeWidth="1" opacity="0.3" />
                  <line x1="50%" y1="50%" x2="93.75%" y2="50%" stroke="#000" strokeWidth="1" opacity="0.3" />
                  <line x1="50%" y1="50%" x2="50%" y2="6.25%" stroke="#000" strokeWidth="1" opacity="0.3" />
                  <line x1="50%" y1="50%" x2="50%" y2="93.75%" stroke="#000" strokeWidth="1" opacity="0.3" />
                </svg>

                {/* Floating Elements */}
                <div className="absolute top-8 sm:top-12 left-8 sm:left-12 bg-white border border-gray-200 rounded-lg p-2 sm:p-3 shadow-sm">
                  <div className="text-xs text-gray-600">Office Support</div>
                  <div className="text-xs sm:text-sm font-semibold text-black">4.8★</div>
                </div>
                <div className="absolute top-12 sm:top-16 right-12 sm:right-16 bg-white border border-gray-200 rounded-lg p-2 sm:p-3 shadow-sm">
                  <div className="text-xs text-gray-600">PSW</div>
                  <div className="text-xs sm:text-sm font-semibold text-black">4.9★</div>
                </div>
                <div className="absolute bottom-12 sm:bottom-16 left-12 sm:left-16 bg-white border border-gray-200 rounded-lg p-2 sm:p-3 shadow-sm">
                  <div className="text-xs text-gray-600">Cleaner</div>
                  <div className="text-xs sm:text-sm font-semibold text-black">4.9★</div>
                </div>
                <div className="absolute bottom-8 sm:bottom-12 right-8 sm:right-12 bg-white border border-gray-200 rounded-lg p-2 sm:p-3 shadow-sm">
                  <div className="text-xs text-gray-600">Handyman</div>
                  <div className="text-xs sm:text-sm font-semibold text-black">4.7★</div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-1 sm:mb-2">10K+</div>
            <div className="text-xs sm:text-sm text-gray-600">Active Professionals</div>
          </motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-1 sm:mb-2">50+</div>
            <div className="text-xs sm:text-sm text-gray-600">Service Categories</div>
          </motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-1 sm:mb-2">10K+</div>
            <div className="text-xs sm:text-sm text-gray-600">Jobs Completed</div>
          </motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-1 sm:mb-2">4.9★</div>
            <div className="text-xs sm:text-sm text-gray-600">Average Rating</div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}