'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isProviderAuthenticated, getProviderData } from '@/lib/providerAuth';
import { FiLoader } from 'react-icons/fi';

export default function ProviderAuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isProviderAuthenticated();
      setIsAuthenticated(authenticated);
      setIsChecking(false);

      if (!authenticated) {
        // Redirect to login if not authenticated
        router.push('/login?role=provider');
        return;
      }

      // Get provider data to check profile status
      const providerData = getProviderData();
      const profileStatus = providerData?.profileStatus;
      const verificationStatus = providerData?.verificationStatus;
      const isProfileCompleteRoute = pathname === '/provider/profile/complete';
      const isVerificationRoute = pathname?.startsWith('/provider/verification');
      const isDashboardRoute = pathname === '/provider';

      // If profile is incomplete and not on profile completion route, redirect to complete profile
      if (profileStatus === 'INCOMPLETE' && !isProfileCompleteRoute) {
        router.push('/provider/profile/complete');
        return;
      }

      // If profile is rejected, allow access to profile complete to resubmit
      if (profileStatus === 'REJECTED' && !isProfileCompleteRoute && !isVerificationRoute) {
        router.push('/provider/profile/complete');
        return;
      }

      // If profile is pending review, redirect to verification status page
      if (profileStatus === 'PENDING_REVIEW' && !isVerificationRoute && !isProfileCompleteRoute) {
        router.push('/provider/verification/onboarding');
        return;
      }

      // If profile is approved, allow access to all routes (provider can work)
      if (profileStatus === 'APPROVED' && verificationStatus === 'APPROVED') {
        // Allow access to all routes - no redirect needed
        return;
      }

      // If not approved and trying to access dashboard or other routes (except profile complete and verification), redirect to verification status
      if (!isProfileCompleteRoute && !isVerificationRoute) {
        router.push('/provider/verification/onboarding');
        return;
      }
    };

    checkAuth();
  }, [router, pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FiLoader className="w-8 h-8 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}

