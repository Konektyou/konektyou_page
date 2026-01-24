'use client';

import { useState } from 'react';

export default function Contact() {
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send data to your backend or email service
    console.log('Contact data:', contactData);
    alert('Thank you for your message! We\'ll get back to you soon.');
    setContactData({ name: '', email: '', message: '' });
  };

  return (
    <section 
      id="contact" 
      className="py-12 sm:py-16 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-4 sm:mb-6">
            Contact Us
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Have questions? We'd love to hear from you.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
          <div>
            <form 
              onSubmit={handleContactSubmit} 
              className="space-y-4 sm:space-y-6"
            >
              <div>
                <label htmlFor="contact-name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  id="contact-name"
                  value={contactData.name}
                  onChange={(e) => setContactData({...contactData, name: e.target.value})}
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  id="contact-email"
                  value={contactData.email}
                  onChange={(e) => setContactData({...contactData, email: e.target.value})}
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  id="message"
                  rows={4}
                  value={contactData.message}
                  onChange={(e) => setContactData({...contactData, message: e.target.value})}
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm sm:text-base"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-black text-white py-3 sm:py-3 rounded-lg sm:rounded-md font-semibold text-sm sm:text-base hover:bg-gray-800 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-black mb-3 sm:mb-4">Get in Touch</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                Ready to revolutionize how you find and book services? Contact us to learn more about Konektly 
                and how we can help connect you with the right professionals.
              </p>
              <div className="space-y-1 sm:space-y-2">
                <p className="text-sm sm:text-base text-gray-600">Email: info@konektly.ca</p>
                <p className="text-sm sm:text-base text-gray-600">Website: www.konektly.ca</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-black mb-3 sm:mb-4">Follow Us</h3>
              <div className="flex space-x-3 sm:space-x-4">
                <a 
                  href="#" 
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a 
                  href="#" 
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
