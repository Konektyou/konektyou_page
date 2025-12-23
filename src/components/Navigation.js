'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser } from 'react-icons/fi';
import { isProviderAuthenticated } from '@/lib/providerAuth';
import { isClientAuthenticated } from '@/lib/clientAuth';
import { isBusinessAuthenticated } from '@/lib/businessAuth';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    if (isProviderAuthenticated()) {
      setIsLoggedIn(true);
      setUserType('provider');
    } else if (isClientAuthenticated()) {
      setIsLoggedIn(true);
      setUserType('client');
    } else if (isBusinessAuthenticated()) {
      setIsLoggedIn(true);
      setUserType('business');
    } else {
      setIsLoggedIn(false);
      setUserType(null);
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (userType === 'provider') return '/provider';
    if (userType === 'client') return '/client';
    if (userType === 'business') return '/business';
    return '#';
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-30"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-20">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center"
            >
              <motion.a
                href="/"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 sm:w-16 sm:h-16 bg-white rounded-[5px] overflow-hidden flex items-center justify-center mr-3 cursor-pointer"
              >
                <Image
                  src="/logo.png"
                  alt="Konektly Logo"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </motion.a>
              {/* <h1 className="text-xl sm:text-2xl font-bold text-black">Konektly</h1> */}
            </motion.div>
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hidden md:block"
            >
              <div className="ml-10 flex items-baseline space-x-2 lg:space-x-4">
                <motion.a
                  whileHover={{ y: -2 }}
                  href="#about"
                  className="text-gray-700 hover:text-black px-2 lg:px-3 py-2 text-sm font-medium"
                >
                  About
                </motion.a>
                <motion.a
                  whileHover={{ y: -2 }}
                  href="#businesses"
                  className="text-gray-700 hover:text-black px-2 lg:px-3 py-2 text-sm font-medium"
                >
                  Businesses
                </motion.a>
                <motion.a
                  whileHover={{ y: -2 }}
                  href="#how-it-works"
                  className="text-gray-700 hover:text-black px-2 lg:px-3 py-2 text-sm font-medium"
                >
                  How It Works
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="#contact"
                  className="border border-gray-700 text-gray-700 hover:bg-gray-700 hover:text-white px-3 lg:px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                >
                  Contact
                </motion.a>
                {/* Login/Register Buttons */}
                {isLoggedIn ? (
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={getDashboardLink()}
                    className="bg-black text-white hover:bg-gray-800 px-3 lg:px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FiUser className="w-4 h-4" />
                    Dashboard
                  </motion.a>
                ) : (
                  <>
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href="/login"
                      className="border border-gray-700 text-gray-700 hover:bg-gray-700 hover:text-white px-3 lg:px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                    >
                      Login
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href="/register"
                      className="bg-black text-white hover:bg-gray-800 px-3 lg:px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                    >
                      Register
                    </motion.a>
                  </>
                )}
              </div>
            </motion.div>
            {/* Mobile menu button */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="md:hidden"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleMenu}
                className="text-gray-700 hover:text-black p-2"
              >
                {isMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50"
              onClick={closeMenu}
            ></motion.div>
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl"
            >
              <div className="flex flex-col h-full">
                {/* Menu Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center">
                    <a href="/" className="w-16 h-16 bg-white rounded-[5px] flex items-center justify-center mr-3 cursor-pointer">
                      <Image
                        src="/logo.png"
                        alt="Konektly Logo"
                        width={80}
                        height={80}
                        className="object-contain"
                      />
                    </a>
                  </div>
                  <button
                    onClick={closeMenu}
                    className="text-gray-700 hover:text-black p-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Menu Items */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="flex-1 px-6 py-8"
                >
                  <nav className="space-y-6">
                    <motion.a
                      whileHover={{ x: 10 }}
                      href="#about"
                      onClick={closeMenu}
                      className="block text-lg font-medium text-gray-700 hover:text-black transition-colors"
                    >
                      About
                    </motion.a>
                    <motion.a
                      whileHover={{ x: 10 }}
                      href="#businesses"
                      onClick={closeMenu}
                      className="block text-lg font-medium text-gray-700 hover:text-black transition-colors"
                    >
                      Businesses
                    </motion.a>
                    <motion.a
                      whileHover={{ x: 10 }}
                      href="#how-it-works"
                      onClick={closeMenu}
                      className="block text-lg font-medium text-gray-700 hover:text-black transition-colors"
                    >
                      How It Works
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href="#contact"
                      onClick={closeMenu}
                      className="block w-full text-center border border-gray-700 text-gray-700 hover:bg-gray-700 hover:text-white px-6 py-3 text-lg font-medium rounded-lg transition-colors mt-8"
                    >
                      Contact
                    </motion.a>
                  </nav>

                  {/* Mobile Auth Section */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    {isLoggedIn ? (
                      <motion.a
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        href={getDashboardLink()}
                        onClick={closeMenu}
                        className="block w-full text-center bg-black text-white hover:bg-gray-800 px-6 py-3 text-lg font-medium rounded-lg transition-colors"
                      >
                        Go to Dashboard
                      </motion.a>
                    ) : (
                      <>
                        <motion.a
                          whileHover={{ x: 10 }}
                          href="/login"
                          onClick={closeMenu}
                          className="block text-lg font-medium text-gray-700 hover:text-black transition-colors mb-4"
                        >
                          Login
                        </motion.a>
                        <motion.a
                          whileHover={{ x: 10 }}
                          href="/register"
                          onClick={closeMenu}
                          className="block text-lg font-medium text-gray-700 hover:text-black transition-colors"
                        >
                          Sign Up
                        </motion.a>
                      </>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}
