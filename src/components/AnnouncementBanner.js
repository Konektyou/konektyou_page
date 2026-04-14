'use client';

import { useState, useEffect } from 'react';

export default function AnnouncementBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show again if user already dismissed
    const dismissed = sessionStorage.getItem('announcement_ios_launch_dismissed');
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem('announcement_ios_launch_dismissed', '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="bg-black text-white text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        <div className="flex-1 text-center flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3">
          <span className="font-medium text-xs sm:text-sm leading-snug">
            <span className="sm:hidden">Konektly is on the App Store.</span>
            <span className="hidden sm:inline">Konektly for iOS is now available on the App Store.</span>
          </span>
          <a
            href="https://apps.apple.com/us/app/konektly/id6761184414"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-black text-xs font-semibold px-3 py-1 rounded-full hover:bg-gray-200 transition-colors whitespace-nowrap"
          >
            Install Now
          </a>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
