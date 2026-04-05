'use client';

import { usePathname } from 'next/navigation';
import { useRef, useEffect, useState } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import AnnouncementBanner from './AnnouncementBanner';

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.includes('/admin/');
  const isClientRoute = pathname?.startsWith('/client') || pathname?.includes('/client/');
  const isProviderRoute = pathname?.startsWith('/provider') || pathname?.includes('/provider/');
  const isBusinessRoute = pathname?.startsWith('/business') || pathname?.includes('/business/');
  const isAdminLoginRoute = pathname === '/admin-login';
  const isProviderForgotPasswordRoute = pathname === '/provider-forgot-password';
  const isClientForgotPasswordRoute = pathname === '/client-forgot-password';
  const isBusinessForgotPasswordRoute = pathname === '/business-forgot-password';
  const isLoginRoute = pathname === '/login';
  const isRegisterRoute = pathname === '/register';
  const hideNavFooter = !pathname || isAdminRoute || isClientRoute || isProviderRoute || isBusinessRoute || isAdminLoginRoute || isProviderForgotPasswordRoute || isClientForgotPasswordRoute || isBusinessForgotPasswordRoute || isLoginRoute || isRegisterRoute;

  useEffect(() => {
    if (hideNavFooter || !headerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setHeaderHeight(entry.contentRect.height);
    });
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, [hideNavFooter]);

  return (
    <>
      {!hideNavFooter && (
        <div ref={headerRef} className="fixed top-0 w-full z-30">
          <AnnouncementBanner />
          <Navigation />
        </div>
      )}
      <div style={!hideNavFooter && headerHeight ? { paddingTop: headerHeight } : undefined}>
        {children}
      </div>
      {!hideNavFooter && <Footer />}
    </>
  );
}
