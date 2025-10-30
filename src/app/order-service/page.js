'use client';

import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';

export default function OrderServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black mb-3">Thank you! We’ll get in touch with you soon.</h1>
          <p className="text-gray-600 mb-6">Your request has been received. Our team will contact you to confirm details and connect you with a verified professional.</p>
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-black mb-2">Live booking and map</h2>
            <p className="text-gray-600">Coming soon. We’re launching the real‑time map and instant booking experience shortly.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
