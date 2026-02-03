'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock, FiAlertCircle, FiLoader, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { setProviderAuth } from '@/lib/providerAuth';
import { setClientAuth } from '@/lib/clientAuth';
import { isProviderAuthenticated } from '@/lib/providerAuth';
import { isClientAuthenticated } from '@/lib/clientAuth';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleFromUrl = searchParams?.get('role');
  
  // Set default tab based on URL parameter, fallback to 'client'
  const getInitialTab = () => {
    if (roleFromUrl === 'client' || roleFromUrl === 'provider') {
      return roleFromUrl;
    }
    return 'client';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const tabs = [
    { id: 'client', label: 'Business' },
    { id: 'provider', label: 'Worker' }
  ];

  useEffect(() => {
    // Set active tab from URL parameter if present
    if (roleFromUrl === 'client' || roleFromUrl === 'provider') {
      setActiveTab(roleFromUrl);
    }
    
    // Check if already authenticated
    if (isProviderAuthenticated()) {
      router.push('/provider');
      return;
    }
    if (isClientAuthenticated()) {
      router.push('/client');
      return;
    }
  }, [router, roleFromUrl]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setFormData({
      email: '',
      password: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = `/api/${activeTab}/login`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Save auth data to localStorage based on role
        if (activeTab === 'provider') {
          setProviderAuth(data.token, data.provider);
          // Redirect based on profile status
          if (data.provider.profileStatus === 'INCOMPLETE') {
            router.push('/provider/profile/complete');
          } else if (data.provider.profileStatus === 'APPROVED' && data.provider.verificationStatus === 'APPROVED') {
            router.push('/provider');
          } else {
            router.push('/provider/verification/onboarding');
          }
        } else if (activeTab === 'client') {
          setClientAuth(data.token, data.client);
          router.push('/client');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = () => {
    switch (activeTab) {
      case 'client':
        return 'Business';
      case 'provider':
        return 'Worker';
      default:
        return 'User';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-6"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link
                href={`/${activeTab}-forgot-password`}
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-black hover:bg-gray-800'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <FiLoader className="w-5 h-5 animate-spin" />
                  Logging in...
                </span>
              ) : (
                `Login as ${getRoleLabel()}`
              )}
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-black font-medium hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FiLoader className="w-8 h-8 animate-spin mx-auto text-gray-600 mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
