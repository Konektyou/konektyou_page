'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock, FiUser, FiAlertCircle, FiLoader, FiCheck, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { setProviderAuth } from '@/lib/providerAuth';
import { setClientAuth } from '@/lib/clientAuth';
import { setBusinessAuth } from '@/lib/businessAuth';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleFromUrl = searchParams?.get('role');
  
  // Set default tab based on URL parameter, fallback to 'client'
  const getInitialTab = () => {
    if (roleFromUrl === 'client' || roleFromUrl === 'business' || roleFromUrl === 'provider') {
      return roleFromUrl;
    }
    return 'client';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const tabs = [
    { id: 'client', label: 'Client' },
    { id: 'business', label: 'Business' },
    { id: 'provider', label: 'Provider' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  useEffect(() => {
    // Set active tab from URL parameter if present
    if (roleFromUrl === 'client' || roleFromUrl === 'business' || roleFromUrl === 'provider') {
      setActiveTab(roleFromUrl);
    }
  }, [roleFromUrl]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess(false);
    setShowVerification(false);
    setVerificationEmail('');
    setOtp('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: ''
    });
  };

  const handleResendOTP = async () => {
    try {
      setSendingOtp(true);
      setError('');
      
      const response = await fetch(`/api/${activeTab}/verify-email/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: verificationEmail }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.message || 'Failed to resend verification code');
      }
    } catch (error) {
      setError('Failed to resend verification code');
      console.error('Resend OTP error:', error);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setVerifyingOtp(true);
      setError('');

      const response = await fetch(`/api/${activeTab}/verify-email/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: verificationEmail,
          otp: otp
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Email verified - proceed with login
        if (activeTab === 'provider') {
          setProviderAuth(data.token, data.provider);
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
        } else if (activeTab === 'business') {
          setBusinessAuth(data.token, data.business);
          router.push('/business');
        }
      } else {
        setError(data.message || 'Invalid verification code');
      }
    } catch (error) {
      setError('Failed to verify code');
      console.error('Verify OTP error:', error);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const endpoint = `/api/${activeTab}/signup`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Check if email verification is required
        if (data.requiresVerification) {
          setVerificationEmail(formData.email);
          setShowVerification(true);
          setLoading(false);
          return;
        }

        // Auto-login after successful registration
        // For provider, we need to login to get the full provider data with onboarding status
        if (activeTab === 'provider') {
          // Login to get full provider data
          const loginResponse = await fetch('/api/provider/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password
            }),
          });

          const loginData = await loginResponse.json();
          if (loginData.success) {
            setProviderAuth(loginData.token, loginData.provider);
            // Redirect based on profile status
            if (loginData.provider.profileStatus === 'INCOMPLETE') {
              router.push('/provider/profile/complete');
            } else if (loginData.provider.profileStatus === 'APPROVED' && loginData.provider.verificationStatus === 'APPROVED') {
              router.push('/provider');
            } else {
              router.push('/provider/verification/onboarding');
            }
            return;
          }
        } else if (activeTab === 'client') {
          // Login to get full client data
          const loginResponse = await fetch('/api/client/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password
            }),
          });

          const loginData = await loginResponse.json();
          if (loginData.success) {
            setClientAuth(loginData.token, loginData.client);
            router.push('/client');
            return;
          }
        } else if (activeTab === 'business') {
          // Login to get full business data
          const loginResponse = await fetch('/api/business/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password
            }),
          });

          const loginData = await loginResponse.json();
          if (loginData.success) {
            setBusinessAuth(loginData.token, loginData.business);
            router.push('/business');
            return;
          }
        }

        // Fallback: show success message and redirect to login
        setSuccess(true);
        setTimeout(() => {
          router.push(`/login?role=${activeTab}`);
        }, 2000);
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = () => {
    switch (activeTab) {
      case 'client':
        return 'Client';
      case 'business':
        return 'Business';
      case 'provider':
        return 'Provider';
      default:
        return 'User';
    }
  };

  if (showVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Back Button */}
            <button
              onClick={() => {
                setShowVerification(false);
                setOtp('');
                setError('');
              }}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-6"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
              <p className="text-gray-600">We've sent a verification code to</p>
              <p className="text-gray-900 font-medium">{verificationEmail}</p>
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

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">Verification code sent successfully!</p>
              </div>
            )}

            {/* OTP Input */}
            <div className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Verification Code
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(value);
                    setError('');
                  }}
                  maxLength={6}
                  className="block w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="000000"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={verifyingOtp || otp.length !== 6}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                  verifyingOtp || otp.length !== 6
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-black hover:bg-gray-800'
                }`}
              >
                {verifyingOtp ? (
                  <span className="flex items-center justify-center gap-2">
                    <FiLoader className="w-5 h-5 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  'Verify Email'
                )}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                <button
                  onClick={handleResendOTP}
                  disabled={sendingOtp}
                  className="text-black font-medium hover:underline disabled:text-gray-400"
                >
                  {sendingOtp ? (
                    <span className="flex items-center justify-center gap-2">
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    'Resend Code'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success && !showVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
            <p className="text-gray-600 mb-4">Your {getRoleLabel().toLowerCase()} account has been created successfully.</p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Sign up to get started</p>
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

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
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
                  Creating Account...
                </span>
              ) : (
                `Create ${getRoleLabel()} Account`
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-black font-medium hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

