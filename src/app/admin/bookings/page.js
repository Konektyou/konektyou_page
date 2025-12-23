'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BookingsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to all bookings page
    router.replace('/admin/bookings/all');
  }, [router]);

  return null;
}

