'use client';

export default function HelpCategories() {
  const categories = [
    {
      name: 'Hair and beauty',
      icon: '✂️',
      examples: ['Haircuts', 'Manicures', 'Facials', 'Makeup', 'Styling']
    },
    {
      name: 'Home repair',
      icon: '🔧',
      examples: ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'General Maintenance']
    },
    {
      name: 'Cleaning',
      icon: '🧹',
      examples: ['House Cleaning', 'Deep Cleaning', 'Office Cleaning', 'Move-in/out', 'Window Cleaning']
    },
    {
      name: 'Fitness and training',
      icon: '💪',
      examples: ['Personal Training', 'Yoga', 'Pilates', 'Group Classes', 'Nutrition Coaching']
    },
    {
      name: 'Event and professional services',
      icon: '🎉',
      examples: ['Event Planning', 'Photography', 'Catering', 'DJ Services', 'Professional Consulting']
    },
    {
      name: 'Everyday help',
      icon: '🤝',
      examples: ['Grocery Shopping', 'Pet Care', 'Elderly Care', 'Childcare', 'Errands']
    }
  ];

  return (
    <section
      id="help-categories"
      className="py-12 sm:py-16 lg:py-20 bg-white relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" className="text-gray-400">
          <defs>
            <pattern id="dots-categories" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="2" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots-categories)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative">
        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-gray-100 rounded-full text-xs sm:text-sm font-medium text-gray-700 mb-4 sm:mb-6">
            <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
            What Help Means
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4 sm:mb-6 leading-tight px-2">
            Find the Help You Need
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
            Discover all the ways Konektly can help you connect with verified professionals in your area.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {categories.map((category, index) => (
            <div
              key={category.name}
              className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-200 hover:shadow-xl transition-all duration-300 group"
            >
              {/* Category Icon */}
              <div className="mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl sm:text-4xl">{category.icon}</span>
                </div>
              </div>

              {/* Category Name */}
              <h3 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6 text-center">
                {category.name}
              </h3>

              {/* Examples */}
              <div className="space-y-2 sm:space-y-3">
                {category.examples.map((example, exampleIndex) => (
                  <div
                    key={exampleIndex}
                    className="flex items-center text-sm sm:text-base text-gray-600"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-black mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{example}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
