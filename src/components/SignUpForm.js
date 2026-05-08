'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COMPARISONS = [
  {
    label: 'Job Flow',
    us: 'Post, apply, hire',
    them: 'Slow intake and follow-ups',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    label: 'Worker Access',
    us: 'Nearby jobs with filters and swipes',
    them: 'Static listings with stale leads',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: 'Verification',
    us: 'Phone, profile, and status checks',
    them: 'Self-reported account details',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('client');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const endpoint = role === 'provider' ? '/api/send-provider-signup-email' : '/api/send-signup-email';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14 sm:mb-20"
        >
          <div className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 mb-6 shadow-sm">
            <span className="w-2 h-2 bg-black rounded-full mr-2" />
            Why Konektly
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-5 leading-tight tracking-tight">
            Built for the next way<br />
            <span className="text-gray-400">businesses hire.</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Konektly is built for short-term jobs: businesses post work, workers apply, and hiring happens through a direct marketplace instead of a slow agency-style process.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Comparison */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3 mb-2 px-1">
              <div className="text-xs font-bold text-black uppercase tracking-wider">Konektly</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Old Hiring</div>
            </div>

            {COMPARISONS.map((comp, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                  <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                    {comp.icon}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-700">{comp.label}</span>
                </div>
                <div className="grid grid-cols-2">
                  <div className="px-4 py-4 border-r border-gray-100">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-2.5 h-2.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 leading-snug">{comp.us}</p>
                    </div>
                  </div>
                  <div className="px-4 py-4 bg-gray-50">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-2.5 h-2.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 leading-snug">{comp.them}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Sign-up form */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-24"
          >
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-7 sm:p-8">
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-black mb-3">You&apos;re on the list!</h3>
                    <p className="text-gray-600 text-sm sm:text-base mb-6">
                      Check your inbox — we sent you everything you need to get started.
                    </p>
                    <a
                      href="https://apps.apple.com/us/app/konektly/id6761184414"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors"
                    >
                      Download the App Now
                    </a>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-black mb-1">Get early access</h3>
                      <p className="text-sm text-gray-500">Create a worker or business account and get started on Konektly.</p>
                    </div>

                    {/* Role toggle */}
                    <div className="flex rounded-xl border border-gray-200 overflow-hidden p-1 bg-gray-50 gap-1">
                      {[
                        { value: 'client', label: 'I am a business' },
                        { value: 'provider', label: 'I am a worker' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setRole(opt.value)}
                          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                            role === opt.value
                              ? 'bg-black text-white shadow-sm'
                              : 'text-gray-600 hover:text-black'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email address
                      </label>
                      <input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
                        placeholder="you@example.com"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      />
                    </div>

                    {status === 'error' && (
                      <p className="text-sm text-red-600">Something went wrong. Please try again or email us at hello@konektly.ca.</p>
                    )}

                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full bg-black text-white py-3.5 rounded-xl font-semibold text-sm sm:text-base hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {status === 'loading' ? 'Sending...' : 'Get Started Free →'}
                    </button>

                    <p className="text-xs text-gray-400 text-center">
                      No spam. Unsubscribe anytime. Or{' '}
                      <a href="https://apps.apple.com/us/app/konektly/id6761184414" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
                        download the app
                      </a>{' '}
                      directly.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
