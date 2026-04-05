'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import Footer from './Footer';
import AnnouncementBanner from './AnnouncementBanner';

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
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

  return (
    <>
      {!hideNavFooter && <AnnouncementBanner />}
      {!hideNavFooter && <Navigation />}
      <div className={!hideNavFooter ? 'pt-20' : ''}>
        {children}
      </div>
      {!hideNavFooter && <Footer />}
    </>
  );
}

