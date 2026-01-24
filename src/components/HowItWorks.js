'use client';

export default function HowItWorks() {
  return (
    <section 
      id="how-it-works" 
      className="py-12 sm:py-16 lg:py-20 relative overflow-hidden bg-gray-50"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" className="text-gray-400">
          <defs>
            <pattern id="hexagons" width="80" height="80" patternUnits="userSpaceOnUse">
              <polygon points="40,5 70,25 70,55 40,75 10,55 10,25" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative">
        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-gray-100 rounded-full text-xs sm:text-sm font-medium text-gray-700 mb-4 sm:mb-6 shadow-sm">
            <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
            Simple Process
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4 sm:mb-6 leading-tight px-2">
            The help you need is 2 minutes away
          </h2>
        </div>

        {/* Steps Section */}
        <div className="relative mb-12 sm:mb-16 lg:mb-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 relative z-10">
            {/* Step 1 */}
            <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center group hover:shadow-lg transition-shadow duration-300 border border-gray-300">
              <div className="relative mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-black mb-3 sm:mb-4">1. Select the service</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Choose from our wide range of service categories to find exactly what you need.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center group hover:shadow-lg transition-shadow duration-300 border border-gray-300">
              <div className="relative mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-black mb-3 sm:mb-4">2. View real people nearby</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                See verified professionals in your area with ratings, reviews, and availability.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center group hover:shadow-lg transition-shadow duration-300 border border-gray-300">
              <div className="relative mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-black mb-3 sm:mb-4">3. Book in one tap</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Instantly confirm your booking with secure payment. Your help is on the way.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center hover:shadow-md transition-shadow duration-300 border border-gray-300">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm border border-gray-200">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h4 className="text-sm sm:text-base font-semibold text-black mb-1 sm:mb-2">Secure Payments</h4>
            <p className="text-xs sm:text-sm text-gray-600">Protected transactions with escrow system</p>
          </div>

          <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center hover:shadow-md transition-shadow duration-300 border border-gray-300">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm border border-gray-200">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h4 className="text-sm sm:text-base font-semibold text-black mb-1 sm:mb-2">Verified Pros</h4>
            <p className="text-xs sm:text-sm text-gray-600">Background checked and insured professionals</p>
          </div>

          <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center hover:shadow-md transition-shadow duration-300 border border-gray-300">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm border border-gray-200">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="text-sm sm:text-base font-semibold text-black mb-1 sm:mb-2">Instant Matching</h4>
            <p className="text-xs sm:text-sm text-gray-600">Real-time availability and instant booking</p>
          </div>

          <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center hover:shadow-md transition-shadow duration-300 border border-gray-300">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm border border-gray-200">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h4 className="text-sm sm:text-base font-semibold text-black mb-1 sm:mb-2">24/7 Support</h4>
            <p className="text-xs sm:text-sm text-gray-600">Round-the-clock customer assistance</p>
          </div>
        </div>
      </div>
    </section>
  );
}
