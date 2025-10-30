'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

// Create a dynamic map component that only renders on client
const DynamicMap = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  )
});

export default function Hero() {
  const [activeProviders, setActiveProviders] = useState([]);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Animated text sequence
  const textSequence = [
    'Find nearby talent instantly.',
    'No waiting. No calling. Just connect.'
  ];

  // Mock service providers data with Toronto coordinates
  const providers = [
    { id: 1, name: "Sarah M.", service: "PSW", rating: 4.9, distance: "2 mins away", photo: "👩‍⚕️", position: [43.6532, -79.3832] },
    { id: 2, name: "Mike R.", service: "Office Support", rating: 4.8, distance: "1 min away", photo: "💼", position: [43.6426, -79.3871] },
    { id: 3, name: "Lisa K.", service: "PSW", rating: 4.9, distance: "3 mins away", photo: "👩‍⚕️", position: [43.6670, -79.4000] },
    { id: 4, name: "David L.", service: "Office Support", rating: 4.7, distance: "5 mins away", photo: "💼", position: [43.6300, -79.4200] },
    { id: 5, name: "Emma S.", service: "PSW", rating: 4.8, distance: "1 min away", photo: "👩‍⚕️", position: [43.6800, -79.3600] },
    { id: 6, name: "Alex T.", service: "Office Support", rating: 4.9, distance: "4 mins away", photo: "💼", position: [43.6200, -79.3500] }
  ];


  useEffect(() => {
    // Set mounted state
    setIsMounted(true);

    // Animated text sequence
    const textInterval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % textSequence.length);
    }, 3000);

    // Show providers one by one with delay
    const showProvidersSequentially = () => {
      setActiveProviders([]);
      providers.forEach((provider, index) => {
        setTimeout(() => {
          setActiveProviders(prev => [...prev, provider]);
        }, index * 500);
      });
    };

    showProvidersSequentially();
    const mapInterval = setInterval(showProvidersSequentially, 30000);

    return () => {
      clearInterval(textInterval);
      clearInterval(mapInterval);
    };
  }, []);

  const handleRoleSelect = (role) => {
    // Redirect immediately based on role
    if (role === 'provider') {
      window.location.href = '/provider-signup';
    } else {
      window.location.href = '/signup';
    }
  };

  // Toronto area coordinates - centered higher to avoid text overlap
  const torontoCenter = [43.7000, -79.4000];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="h-[90vh] w-full relative overflow-hidden bg-gray-100"
    >
      {/* Full-screen 3D Map Background */}
      <div className="absolute inset-0 z-0 h-full w-full">
        {isMounted && <DynamicMap 
          activeProviders={activeProviders} 
          torontoCenter={torontoCenter}
        />}
      </div>

      {/* Overlay Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-start items-start px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mt-20">
          {/* Animated Text Sequence */}
          <motion.div
            key={currentTextIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="mb-8 sm:mb-12 h-32 flex items-center justify-center"
          >
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-black mb-4 sm:mb-6 leading-tight drop-shadow-lg text-center">
              {textSequence[currentTextIndex]}
            </h1>
          </motion.div>

          {/* Role Selection Buttons */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-8"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleRoleSelect('client')}
              className="bg-white/50 backdrop-blur-sm text-black px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white transition-all shadow-lg border border-gray-200 focus:outline-none focus:ring-0"
            >
              For Clients
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleRoleSelect('business')}
              className="bg-white/50 backdrop-blur-sm text-black px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white transition-all shadow-lg border border-gray-200 focus:outline-none focus:ring-0"
            >
              For Businesses
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleRoleSelect('provider')}
              className="bg-white/50 backdrop-blur-sm text-black px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white transition-all shadow-lg border border-gray-200 focus:outline-none focus:ring-0"
            >
              For Service Providers
            </motion.button>
          </motion.div>

        </div>
      </div>
    </motion.section>
  );
}
