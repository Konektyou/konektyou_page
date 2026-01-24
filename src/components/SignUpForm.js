'use client';

import { useState } from 'react';

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    role: 'client'
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send data to your backend or email service
    console.log('Sign up data:', formData);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', location: '', role: 'client' });
    }, 3000);
  };

  return (
    <section
      className="py-12 sm:py-16 lg:py-20 bg-white relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" className="text-gray-400">
          <defs>
            <pattern id="circles" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="3" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circles)" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 relative">
        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-gray-100 rounded-full text-xs sm:text-sm font-medium text-gray-700 mb-4 sm:mb-6 shadow-sm">
            <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
            Why Konektly is Better
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4 sm:mb-6 leading-tight px-2">
            The Future of <span className="text-gray-600">Service</span> <br />
            Connections
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            Hyperlocal, real-time service connections that put you in control.
            See who's available right now, right where you are.
          </p>
        </div>

        {/* Comparison Section - Full Width */}
        <div className="mb-12 sm:mb-16">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-4">Why Konektly is Better</h3>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              See how we compare to traditional service platforms
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {/* Connection Speed */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-black">Connection Speed</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-semibold text-black">Konektly</p>
                    <p className="text-xs text-gray-600">Real-time, instant matching</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-semibold text-black">Traditional</p>
                    <p className="text-xs text-gray-600">Delayed responses, scheduling ahead</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Discovery Method */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-black">Discovery</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-semibold text-black">Konektly</p>
                    <p className="text-xs text-gray-600">Interactive map with live profiles</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-semibold text-black">Traditional</p>
                    <p className="text-xs text-gray-600">List-based, no geolocation</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Use Case */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-black">Use Case</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-semibold text-black">Konektly</p>
                    <p className="text-xs text-gray-600">On-demand human skills</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-semibold text-black">Traditional</p>
                    <p className="text-xs text-gray-600">Appointment-based only</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section - Centered */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200">
            {!isSubmitted ? (
              <form onSubmit={handleSignUpSubmit} className="space-y-4 sm:space-y-6">
                <div className="text-center mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-black mb-2">Experience the Difference</h3>
                  <p className="text-sm sm:text-base text-gray-600">Join the hyperlocal revolution</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm sm:text-base"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm sm:text-base"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="location" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, State or Province"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">I am a</label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm sm:text-base"
                  >
                    <option value="client">Client (Looking for services)</option>
                    <option value="provider">Service Provider (Offering services)</option>
                  </select>
                </div>

                 <button
                   type="submit"
                   className="w-full bg-black text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-800 transition-colors duration-300 shadow-lg hover:shadow-xl"
                 >
                   Join the Revolution
                 </button>

                <p className="text-xs text-gray-500 text-center">
                  By joining, you agree to receive updates about Konektly. Unsubscribe anytime.
                </p>
              </form>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-black mb-3 sm:mb-4">Welcome to the Future!</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  You're now part of the hyperlocal revolution! Experience real-time service connections like never before.
                </p>
                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
                  <div className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">What's Next?</div>
                  <div className="text-sm sm:text-base text-black font-medium">Explore the interactive map and connect instantly</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
