'use client';

export default function ProblemSolution() {
  const problems = [
    'People struggle to find reliable help nearby when they need it',
    'Businesses struggle when staff call in sick or don\'t show up',
    'Service providers struggle to get steady bookings'
  ];

  return (
    <section
      id="problem-solution"
      className="py-12 sm:py-16 lg:py-20 bg-gray-50 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" className="text-gray-400">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative">
        {/* Problems Section */}
        <div className="mb-12 sm:mb-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-6 sm:mb-8 leading-tight">
              The Problems We Solve
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {problems.map((problem, index) => (
              <div
                key={index}
                className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-200 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-start mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed flex-1">
                    {problem}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Solution Section */}
        <div className="text-center bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 border-2 border-black/30 shadow-xl">
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-sm sm:text-base font-medium text-green-800 mb-6 sm:mb-8">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
              The Solution
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black leading-tight">
              Konektly solves all three problems instantly with real-time geo-location talent.
            </h3>
          </div>
          <div className="mt-6 sm:mt-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 w-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
