'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'provider_first_login_experience_done';

export function setFirstLoginExperienceDone() {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, 'true');
  }
}

export function hasSeenFirstLoginExperience() {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem(STORAGE_KEY) === 'true';
}

const MOCK_JOBS = [
  { id: 1, title: 'House Cleaning', company: 'CleanPro', distance: '0.8 km away', logo: null },
  { id: 2, title: 'Landscaping', company: 'GreenLawn', distance: '1.2 km away', logo: null },
  { id: 3, title: 'Moving Help', company: 'QuickMove', distance: '2 km away', logo: null },
  { id: 4, title: 'Dog Walking', company: 'PawWalk', distance: '0.5 km away', logo: null },
  { id: 5, title: 'Handyman', company: 'FixIt', distance: '1.8 km away', logo: null },
  { id: 6, title: 'Tutoring', company: 'LearnNow', distance: '3 km away', logo: null },
  { id: 7, title: 'Delivery', company: 'FastDrop', distance: '1 km away', logo: null },
  { id: 8, title: 'Event Setup', company: 'EventPro', distance: '2.5 km away', logo: null },
];

function JobCard({ job }) {
  return (
    <div className="flex-shrink-0 w-[280px] rounded-xl bg-white/90 backdrop-blur border border-gray-200/80 shadow-sm overflow-hidden pointer-events-none select-none">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium shrink-0">
            {job.company.slice(0, 2)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{job.title}</p>
            <p className="text-xs text-gray-500">{job.company}</p>
          </div>
        </div>
        <span className="inline-flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
          {job.distance}
        </span>
      </div>
    </div>
  );
}

export default function WorkerFirstLoginExperience() {
  const router = useRouter();
  const [step, setStep] = useState('social'); // 'social' | 'paywall'

  const handleSeeWhatsWaiting = useCallback(() => {
    setStep('paywall');
  }, []);

  const handleSubscribeToUnlock = useCallback(() => {
    setFirstLoginExperienceDone();
    router.push('/provider/subscription');
  }, [router]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-gray-900">
      {/* Dimmed, blurred background feed */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/70 to-gray-900/90 z-10" />
        <div className="absolute inset-0 backdrop-blur-md z-[1]" />
        <div
          className="absolute inset-0 flex items-center overflow-hidden z-0"
          style={{ pointerEvents: 'none' }}
          aria-hidden
        >
          <div className="flex gap-4 worker-feed-scroll py-8">
            {[...MOCK_JOBS, ...MOCK_JOBS].map((job) => (
              <JobCard key={`${job.id}-${job.distance}`} job={job} />
            ))}
          </div>
        </div>
      </div>

      {/* Modal 1: Social proof / urgency */}
      {step === 'social' && (
        <div className="relative z-20 flex items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              People near you are getting hired right now
            </h2>
            <p className="text-gray-600 mb-2">
              2 people in your area found work in the last 15 minutes.
            </p>
            <p className="text-gray-600 mb-6">
              Live opportunities are being filled as you&apos;re here.
            </p>
            <button
              type="button"
              onClick={handleSeeWhatsWaiting}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
            >
              See what&apos;s waiting
            </button>
          </div>
        </div>
      )}

      {/* Modal 2: Paywall */}
      {step === 'paywall' && (
        <div className="relative z-20 flex items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Subscribe to start finding work
            </h2>
            <p className="text-gray-600 mb-6">
              Unlock the job feed and start applying to opportunities near you.
            </p>
            <button
              type="button"
              onClick={handleSubscribeToUnlock}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
            >
              Subscribe to unlock
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes worker-feed-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .worker-feed-scroll {
          animation: worker-feed-scroll 45s linear infinite;
        }
      `}} />
    </div>
  );
}
