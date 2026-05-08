'use client';

import { motion } from 'framer-motion';

const PLATFORM_FEATURES = [
  {
    title: 'Contractor Profiles',
    description: 'Contractors show skills, experience, availability, ratings, and verification status.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Job Applications',
    description: 'Businesses post short-term openings and contractors apply with a note from the app.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Location-Aware Feed',
    description: 'Contractors can discover open jobs by GPS or postal code, with filters for today and verified businesses.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Fast Hiring',
    description: 'Businesses review applicants and hire the contractor who fits the work.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

const TRUST_BADGES = ['Phone Verification', 'Business Profiles', 'Contractor Skills', 'Short-Term Work'];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function About() {
  return (
    <section id="about" className="py-16 sm:py-24 bg-white relative overflow-hidden">
      {/* Subtle background dots */}
      <div className="absolute inset-0 opacity-[0.03]" aria-hidden="true">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="about-dots" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1.5" fill="#000" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#about-dots)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: Mission copy */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-6">
              <span className="w-2 h-2 bg-black rounded-full mr-2" />
              Our Mission
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black leading-tight mb-6 tracking-tight">
              Staffing for the moment<br />
              <span className="text-gray-400">you are short-staffed.</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8">
              Konektly is built for short-term staffing: businesses post work with timing and location, while contractors browse nearby opportunities and apply from their phone.
            </p>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-10">
              The platform supports contractor and business onboarding, verification, applications, hiring, in-app messaging, and reviews.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2">
              {TRUST_BADGES.map(badge => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-700"
                >
                  <svg className="w-3.5 h-3.5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {badge}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right: Feature cards */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {PLATFORM_FEATURES.map((feat, i) => (
              <motion.div
                key={i}
                variants={item}
                className="bg-gray-50 rounded-2xl p-5 sm:p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-300"
              >
                <div className="w-11 h-11 bg-black rounded-xl flex items-center justify-center text-white mb-4">
                  {feat.icon}
                </div>
                <div className="text-sm sm:text-base font-bold text-black mb-1">
                  {feat.title}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                  {feat.description}
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
