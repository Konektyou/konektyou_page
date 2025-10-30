'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiClock, FiStar, FiCheck, FiArrowRight, FiSearch } from 'react-icons/fi';

export default function OrderServicePage() {
  const [selectedService, setSelectedService] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);

  // Mock service providers data
  const providers = [
    {
      id: 1,
      name: "Sarah M.",
      service: "PSW",
      rating: 4.9,
      distance: "2 mins away",
      photo: "👩‍⚕️",
      price: "$25/hour",
      experience: "5 years",
      verified: true
    },
    {
      id: 2,
      name: "Mike R.",
      service: "Office Support",
      rating: 4.8,
      distance: "1 min away",
      photo: "💼",
      price: "$20/hour",
      experience: "3 years",
      verified: true
    },
    {
      id: 3,
      name: "Lisa K.",
      service: "PSW",
      rating: 4.9,
      distance: "3 mins away",
      photo: "👩‍⚕️",
      price: "$28/hour",
      experience: "7 years",
      verified: true
    }
  ];

  const serviceOptions = [
    'PSW (Personal Support Worker)',
    'Personal Trainer',
    'Photographer',
    'MAU (Makeup Artist)',
    'Hairstylist',
    'Plumber',
    'Office Support',
    'Cleaner',
    'Handyman'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white shadow-sm border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-black">Order Service Now</h1>
              <p className="text-gray-600 mt-1">Find and book verified professionals instantly</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Service Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-black mb-6">Select Service</h2>
              
              <div className="space-y-3">
                {serviceOptions.map((service) => (
                  <motion.button
                    key={service}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedService(service)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedService === service
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{service}</span>
                      {selectedService === service && (
                        <FiCheck className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-black">10K+</div>
                    <div className="text-sm text-gray-600">Professionals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-black">4.9★</div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Available Providers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-black mb-2">Available Professionals</h2>
              <p className="text-gray-600">Verified professionals ready to help you now</p>
            </div>

            <div className="space-y-4">
              {providers.map((provider) => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * provider.id }}
                  whileHover={{ scale: 1.02 }}
                  className={`bg-white rounded-2xl shadow-lg p-6 border-2 transition-all cursor-pointer ${
                    selectedProvider?.id === provider.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedProvider(provider)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="text-4xl">{provider.photo}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-bold text-black">{provider.name}</h3>
                          {provider.verified && (
                            <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                              <FiCheck className="w-3 h-3" />
                              <span>Verified</span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2">{provider.service} • {provider.experience} experience</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <FiStar className="w-4 h-4 text-yellow-500" />
                            <span>{provider.rating}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FiMapPin className="w-4 h-4" />
                            <span>{provider.distance}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FiClock className="w-4 h-4" />
                            <span>{provider.price}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-black">{provider.price}</div>
                      <div className="text-sm text-gray-600">per hour</div>
                    </div>
                  </div>

                  {selectedProvider?.id === provider.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Ready to book? This professional is available now.
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-black text-white px-6 py-2 rounded-xl font-semibold hover:bg-gray-800 transition-all flex items-center space-x-2"
                        >
                          <span>Book Now</span>
                          <FiArrowRight className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* No Service Selected Message */}
            {!selectedService && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <FiSearch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a Service</h3>
                <p className="text-gray-500">Choose a service from the left to see available professionals</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
