'use client';

import { motion } from 'framer-motion';

const PROBLEMS = [
  {
    title: 'Businesses need short-term coverage',
    body: 'A short-staffed moment can happen fast. Konektly gives businesses a place to post the need and receive contractor applications.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Contractors need flexible opportunities',
    body: 'Contractors should be able to find nearby short-term work, apply quickly, and get hired without chasing scattered leads.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Trust needs structure',
    body: 'Profiles, verification status, messaging, and reviews give both sides a clearer way to work together.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const SOLUTION_POINTS = [
  'Businesses post openings with role details, timing, and location',
  'Contractors browse nearby jobs, swipe, and apply',
  'Businesses review applicants and hire the right contractor',
  'Konektly+ contractors get priority job notifications',
];

export default function ProblemSolution() {
  return (
    <section id="problem-solution" className="py-16 sm:py-24 bg-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative">

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14 sm:mb-20"
        >
          <div className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 mb-6 shadow-sm">
            <span className="w-2 h-2 bg-black rounded-full mr-2" />
            Why Konektly Exists
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black leading-tight tracking-tight">
            Short-staffed moments<br />
            <span className="text-gray-400">need faster connections.</span>
          </h2>
        </motion.div>

        {/* Problems row */}
        <div className="grid md:grid-cols-3 gap-5 sm:gap-6 mb-8 sm:mb-12">
          {PROBLEMS.map((problem, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 hover:shadow-md transition-shadow duration-300"
            >
              <div className="w-10 h-10 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center text-red-500 mb-5">
                {problem.icon}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-black mb-3">{problem.title}</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{problem.body}</p>
            </motion.div>
          ))}
        </div>

        {/* Connector arrow */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="flex flex-col items-center gap-1">
            <div className="w-0.5 h-8 bg-gray-200" />
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className="w-0.5 h-8 bg-gray-200" />
          </div>
        </div>

        {/* Solution card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-black rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden"
        >
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-5" aria-hidden="true">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="solution-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#solution-grid)" />
            </svg>
          </div>

          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full text-sm font-medium text-white/80 mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                The Solution
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
                Konektly connects businesses with contractors for short-term work, then supports the relationship with profiles, messaging, and reviews.
              </h3>
              <p className="text-gray-400 text-base sm:text-lg">
                The website should reflect the product: contractor and business profiles, short-term jobs, and fast hiring for staffing gaps.
              </p>
            </div>

            <div className="space-y-4">
              {SOLUTION_POINTS.map((point, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base text-gray-300">{point}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
