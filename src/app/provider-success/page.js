'use client';

import { motion } from 'framer-motion';
import { FiCheck, FiMail, FiClock, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

export default function ProviderSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <FiCheck className="w-10 h-10 text-green-600" />
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-black mb-4">
            Profile Created Successfully!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Thank you for joining our network of verified professionals. 
            Your profile is being reviewed and you'll receive an email confirmation soon.
          </p>

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-black mb-4">What happens next?</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start space-x-3">
                <FiMail className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-black">Email Confirmation</p>
                  <p className="text-sm text-gray-600">You'll receive a confirmation email within 24 hours</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FiClock className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-black">Profile Review</p>
                  <p className="text-sm text-gray-600">Our team will review your documents and verify your credentials</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FiCheck className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-black">Account Activation</p>
                  <p className="text-sm text-gray-600">Once verified, you'll be able to receive booking requests</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-black text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 flex items-center justify-center"
              >
                <span>Return to Home</span>
                <FiArrowRight className="w-5 h-5 ml-2" />
              </motion.button>
            </Link>
            
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gray-100 text-black py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
              >
                Need Services Instead?
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-gray-600">
            Questions? Contact us at{' '}
            <a href="mailto:info@konektly.ca" className="text-black font-semibold hover:underline">
              info@konektly.ca
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
