'use client';

import { motion } from 'framer-motion';

const APP_STORE_URL = 'https://apps.apple.com/us/app/konektly/id6761184414';

const MARKET_SIGNALS = [
  { label: 'Businesses', value: 'Post work. Hire directly' },
  { label: 'Workers', value: 'Apply to nearby jobs' },
  { label: 'Konektly+', value: 'Early access to work' },
];

const WORKFLOW = [
  { title: 'Business posts work', meta: 'Role, location, timing', status: 'Open' },
  { title: 'Workers apply directly', meta: 'Profile, skills, availability', status: 'Pending' },
  { title: 'Business hires in-app', meta: 'Choose the right worker', status: 'Hired' },
];

const PLATFORM = ['Phone verification', 'Worker profiles', 'Business profiles', 'Direct applications', 'Messaging', 'Reviews'];

export default function Hero() {
  return (
    <section className="relative min-h-[86vh] overflow-hidden bg-[#f8f8f4] border-b border-black/10">
      <div className="absolute inset-x-0 top-0 h-px bg-black/10" />
      <div className="absolute right-0 top-0 hidden h-full w-1/2 border-l border-black/10 bg-white/45 lg:block" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 sm:py-24 lg:py-28">
        <div className="grid lg:grid-cols-[1.02fr_0.98fr] gap-12 lg:gap-16 items-center">
          <div>
            <motion.a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 border border-black/15 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-black hover:border-black/35 transition-colors"
            >
              <span className="h-2 w-2 bg-[#0f766e]" />
              Now available on the App Store
            </motion.a>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mt-8 max-w-3xl text-5xl sm:text-6xl lg:text-7xl font-semibold text-black leading-[0.98] tracking-normal"
            >
              Konektly
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="mt-6 max-w-2xl text-2xl sm:text-3xl lg:text-4xl font-medium leading-tight text-black"
            >
              A new way to hire for short-term work.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.24 }}
              className="mt-6 max-w-xl text-base sm:text-lg leading-8 text-gray-700"
            >
              Konektly turns hiring into a direct marketplace. Businesses post work, workers apply from their phone, and both sides move faster without the old hiring playbook.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.32 }}
              className="mt-9 flex flex-col sm:flex-row gap-3"
            >
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-3 bg-black px-5 py-3 text-white font-semibold hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Download for iOS
              </a>
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center border border-black/20 bg-white px-5 py-3 font-semibold text-black hover:border-black/45 transition-colors"
              >
                Start posting in app
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-12 grid grid-cols-1 sm:grid-cols-3 border-y border-black/10"
            >
              {MARKET_SIGNALS.map((signal) => (
                <div key={signal.label} className="py-5 sm:px-5 first:pl-0 sm:border-r sm:border-black/10 last:border-r-0">
                  <div className="text-xs uppercase tracking-[0.18em] text-gray-500">{signal.label}</div>
                  <div className="mt-2 text-sm font-semibold text-black">{signal.value}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="relative"
          >
            <div className="border border-black/15 bg-white shadow-[18px_18px_0_0_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-gray-500">Hiring marketplace</div>
                  <div className="mt-1 text-lg font-semibold text-black">How work gets hired</div>
                </div>
                <div className="flex gap-1.5" aria-hidden="true">
                  <span className="h-2.5 w-2.5 bg-[#ef4444]" />
                  <span className="h-2.5 w-2.5 bg-[#f59e0b]" />
                  <span className="h-2.5 w-2.5 bg-[#0f766e]" />
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="border border-black/10 bg-[#f8f8f4] p-4">
                    <div className="text-3xl font-semibold text-black">3</div>
                    <div className="mt-1 text-sm text-gray-600">Core steps</div>
                  </div>
                  <div className="border border-black/10 bg-[#ecfdf5] p-4">
                    <div className="text-3xl font-semibold text-[#0f766e]">20</div>
                    <div className="mt-1 text-sm text-gray-600">Min Plus head start</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {WORKFLOW.map((item) => (
                    <div key={item.title} className="flex items-center justify-between gap-4 border border-black/10 p-4">
                      <div>
                        <div className="font-semibold text-black">{item.title}</div>
                        <div className="text-sm text-gray-500">{item.meta}</div>
                      </div>
                      <span className="bg-black px-3 py-1 text-xs font-semibold text-white">{item.status}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-black/10 pt-5">
                  <div className="mb-3 text-xs uppercase tracking-[0.18em] text-gray-500">Built into the platform</div>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORM.map((item) => (
                      <span key={item} className="border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-gray-700">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
