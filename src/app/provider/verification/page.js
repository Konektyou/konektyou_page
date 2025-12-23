'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerificationPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to onboarding status page
    router.push('/provider/verification/onboarding');
  }, [router]);

  return null;
}

