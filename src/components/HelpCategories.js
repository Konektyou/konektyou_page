'use client';

import { motion } from 'framer-motion';

const CATEGORIES = [
  {
    name: 'Post Short-Term Work',
    description: 'Businesses create openings with title, details, address or GPS location, requirements, and timing.',
    examples: ['Role Details', 'Timing', 'Location', 'Requirements'],
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    name: 'Find Nearby Work',
    description: 'Workers browse open jobs by location, postal code, radius, and feed filters including today and verified businesses.',
    examples: ['Nearby Jobs', 'Today', 'Verified', 'Filters'],
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: 'Swipe and Apply',
    description: 'Workers can like or skip jobs, hide already-seen jobs, and apply once per job with a cover note.',
    examples: ['Swipe Feed', 'Apply Once', 'Cover Note', 'Applications'],
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: 'Hire Workers',
    description: 'Businesses review applications, inspect public worker profiles, and hire an applicant when ready.',
    examples: ['Public Profiles', 'Skills', 'Experience', 'Ratings'],
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    name: 'Stay Coordinated',
    description: 'Once hired, both sides keep the job details, conversation, and status in one place.',
    examples: ['Job Details', 'Messages', 'Status', 'History'],
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: 'Chat and Review',
    description: 'Messaging and reviews help both sides stay coordinated before and after a hire.',
    examples: ['Messages', 'Reviews', 'Profiles', 'History'],
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

export default function HelpCategories() {
  return (
    <section id="help-categories" className="py-16 sm:py-24 bg-white relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 opacity-[0.025]" aria-hidden="true">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="cat-dots" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="2" fill="#000" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cat-dots)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14 sm:mb-20"
        >
          <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-6">
            <span className="w-2 h-2 bg-black rounded-full mr-2" />
            Marketplace
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-5 leading-tight tracking-tight">
            Built around direct hiring,<br />
            <span className="text-gray-400">not generic service cards.</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            The Konektly app is organized around businesses, workers, short-term openings, applications, messaging, and reviews.
          </p>
        </motion.div>

        {/* Categories grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="group bg-white rounded-2xl p-6 sm:p-7 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-gray-800 mb-5 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all duration-300">
                {cat.icon}
              </div>

              {/* Name */}
              <h3 className="text-base sm:text-lg font-bold text-black mb-2">
                {cat.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-500 leading-relaxed mb-5">
                {cat.description}
              </p>

              {/* Examples */}
              <div className="flex flex-wrap gap-1.5">
                {cat.examples.map((ex) => (
                  <span
                    key={ex}
                    className="inline-block px-2.5 py-1 bg-gray-50 border border-gray-100 text-gray-600 text-xs rounded-lg font-medium"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mt-12 sm:mt-16"
        >
          <p className="text-gray-500 text-sm sm:text-base mb-4">
            Download the app to use the worker and business marketplace.
          </p>
          <a
            href="https://apps.apple.com/us/app/konektly/id6761184414"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-semibold text-sm sm:text-base hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            Open Konektly on iOS
          </a>
        </motion.div>

      </div>
    </section>
  );
}
