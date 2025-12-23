'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import Footer from './Footer';

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isClientRoute = pathname?.startsWith('/client');
  const isProviderRoute = pathname?.startsWith('/provider');
  const isBusinessRoute = pathname?.startsWith('/business');
  const isAdminLoginRoute = pathname === '/admin-login';
  const isProviderForgotPasswordRoute = pathname === '/provider-forgot-password';
  const isClientForgotPasswordRoute = pathname === '/client-forgot-password';
  const isBusinessForgotPasswordRoute = pathname === '/business-forgot-password';
  const isLoginRoute = pathname === '/login';
  const isRegisterRoute = pathname === '/register';
  const hideNavFooter = isAdminRoute || isClientRoute || isProviderRoute || isBusinessRoute || isAdminLoginRoute || isProviderForgotPasswordRoute || isClientForgotPasswordRoute || isBusinessForgotPasswordRoute || isLoginRoute || isRegisterRoute;

  return (
    <>
      {!hideNavFooter && <Navigation />}
      <div className={!hideNavFooter ? 'pt-20' : ''}>
        {children}
      </div>
      {!hideNavFooter && <Footer />}
    </>
  );
}

