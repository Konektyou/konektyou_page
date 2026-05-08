'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const BENEFITS = [
  {
    title: 'Post Openings Fast',
    body: 'Create a short-term opening with location, timing, and requirements so contractors can apply from the app.',
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-100',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    title: 'Review Applications',
    body: 'See pending applicants, public contractor profiles, skills, experience, ratings, and verification status before hiring.',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-100',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Hire for the Gap',
    body: 'Choose the contractor who fits the work and move faster than a traditional hiring process.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Keep Work Organized',
    body: 'Keep the job details, conversation, reviews, and application history tied to the work.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

const METRICS = [
  { value: 'Open', label: 'Job posted' },
  { value: 'Pending', label: 'Applications' },
  { value: 'Hired', label: 'Contractor selected' },
];

export default function Businesses() {
  const router = useRouter();

  return (
    <section id="businesses" className="py-16 sm:py-24 bg-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 sm:mb-20"
        >
          <div className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 mb-6 shadow-sm">
            <span className="w-2 h-2 bg-black rounded-full mr-2" />
            For Businesses
          </div>
          <div className="grid lg:grid-cols-2 gap-6 items-end">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black leading-tight tracking-tight">
              Post openings, review contractors,<br />
              <span className="text-gray-400">and cover staffing gaps.</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed lg:text-right">
              Konektly helps businesses find contractors for short-term and short-staffed moments without turning every gap into a long hiring process.
            </p>
          </div>
        </motion.div>

        {/* Content: benefits + dashboard */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start mb-14 sm:mb-20">

          {/* Benefits */}
          <div className="space-y-5">
            {BENEFITS.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-4 p-5 sm:p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-sm transition-shadow duration-300 cursor-pointer"
                onClick={() => router.push('/register')}
              >
                <div className={`w-10 h-10 ${b.bg} ${b.border} border rounded-xl flex items-center justify-center ${b.color} flex-shrink-0 mt-0.5`}>
                  {b.icon}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-black mb-1">{b.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{b.body}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-24"
          >
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
              {/* Window chrome */}
              <div className="bg-gray-50 border-b border-gray-200 px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                  <div className="w-3 h-3 bg-green-400 rounded-full" />
                </div>
                <span className="text-xs font-semibold text-gray-500">Business Dashboard</span>
                <div className="w-16" />
              </div>

              {/* Dashboard content */}
              <div className="p-5 sm:p-6">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {METRICS.map((m, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                      <div className="text-sm sm:text-base font-bold text-black leading-none mb-1">{m.value}</div>
                      <div className="text-xs text-gray-500 leading-tight">{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* Active openings */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-black">Open Staffing Needs</span>
                    <span className="text-xs text-gray-500">Today</span>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { name: 'Warehouse support', time: '8:00 AM - 4:00 PM', status: 'Hired', color: 'bg-green-50 text-green-700 border-green-100' },
                      { name: 'Event setup', time: '12:00 PM - 8:00 PM', status: 'Open', color: 'bg-blue-50 text-blue-700 border-blue-100' },
                      { name: 'Night coverage', time: '11:00 PM - 7:00 AM', status: 'Pending', color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
                    ].map((shift, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
                        <div>
                          <div className="text-xs sm:text-sm font-semibold text-black">{shift.name}</div>
                          <div className="text-xs text-gray-500">{shift.time}</div>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${shift.color}`}>
                          {shift.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emergency button */}
                <button
                  onClick={() => router.push('/register')}
                  className="w-full bg-black text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
                >
                  + Post Opening
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-black rounded-2xl p-7 sm:p-8"
        >
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1">Ready to cover your next staffing gap?</h3>
            <p className="text-sm text-gray-400">Create a business profile, verify your account, and start reaching contractors on Konektly.</p>
          </div>
          <a
            href="/register"
            className="flex-shrink-0 bg-white text-black px-6 py-3 rounded-xl font-semibold text-sm sm:text-base hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            Get Started Free →
          </a>
        </motion.div>

      </div>
    </section>
  );
}
