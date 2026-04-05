import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-20 sm:h-20 mr-3 sm:mr-4">
                <Image
                  src="/logo.png"
                  alt="Konektly Logo"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 max-w-md leading-relaxed">
              Revolutionizing how you connect with skilled professionals. 
              Find, book, and get the help you need instantly in your area.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Quick Links</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a href="#about" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">About Us</a>
              </li>
              <li>
                <a href="#how-it-works" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">How It Works</a>
              </li>
              <li>
                <a href="#contact" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">Contact</a>
              </li>
                  <li>
                    <a href="#" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">Sign up now</a>
                  </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Support</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href="/support" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">Help Center</Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/support" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link href="/support#faq" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">FAQ</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 text-center">
            <p className="text-gray-500 text-xs sm:text-sm mb-4 md:mb-0">
              © 2025 Konektly. All rights reserved.
            </p>
        </div>
      </div>
    </footer>
  );
}
