'use client';

import { FiCheckCircle, FiXCircle, FiClock, FiAlertCircle, FiFileText, FiArrowRight } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { getProviderData, getProviderToken, setProviderAuth } from '@/lib/providerAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OnboardingStatus() {
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const providerData = getProviderData();

  useEffect(() => {
    if (providerData?.id) {
      fetchProfileStatus();
      // Refresh status every 30 seconds to check for admin approval
      const interval = setInterval(() => {
        fetchProfileStatus();
      }, 30000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [providerData?.id]);

  const fetchProfileStatus = async () => {
    try {
      const token = getProviderToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/provider/profile?providerId=${providerData.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success && data.profile) {
        setProfileData(data.profile);
        // Update localStorage with fresh data if status changed
        const currentAuth = JSON.parse(localStorage.getItem('providerAuth') || '{}');
        if (currentAuth.token) {
          setProviderAuth(currentAuth.token, {
            ...currentAuth.provider,
            profileStatus: data.profile.profileStatus,
            verificationStatus: data.profile.verificationStatus,
            isVerified: data.profile.isVerified
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FiClock className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const profileStatus = profileData?.profileStatus || 'INCOMPLETE';
  const verificationStatus = profileData?.verificationStatus || 'NOT_SUBMITTED';
  const rejectionReason = profileData?.rejectionReason;

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status: INCOMPLETE - Profile not submitted yet
  if (profileStatus === 'INCOMPLETE' || verificationStatus === 'NOT_SUBMITTED') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-gray-600 mt-1">Submit your profile information for admin review</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <FiFileText className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Not Submitted</h2>
            <p className="text-gray-600 mb-6">
              Please complete your profile with all required information and documents to proceed with verification.
            </p>
            <Link
              href="/provider/profile/complete"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Complete Profile
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Status: PENDING_REVIEW - Under admin review
  if (profileStatus === 'PENDING_REVIEW' || verificationStatus === 'PENDING') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Under Review</h1>
          <p className="text-gray-600 mt-1">Your profile is being reviewed by our admin team</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <FiClock className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Review in Progress</h2>
            <p className="text-gray-600 mb-4">
              Your profile has been submitted and is currently under review. Our admin team will review your information and documents.
            </p>
            {profileData?.updatedAt && (
              <p className="text-sm text-gray-500">
                Submitted on {formatDate(profileData.updatedAt)}
              </p>
            )}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This process typically takes 1-3 business days. You will be notified once the review is complete.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Status: APPROVED - Profile approved (both must be APPROVED)
  if (profileStatus === 'APPROVED' && verificationStatus === 'APPROVED') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Approved</h1>
          <p className="text-gray-600 mt-1">Your profile has been verified and approved</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <FiCheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Congratulations!</h2>
            <p className="text-gray-600 mb-4">
              Your profile has been approved by our admin team. You can now proceed to set up your services and start accepting bookings.
            </p>
            {profileData?.updatedAt && (
              <p className="text-sm text-gray-500 mb-6">
                Approved on {formatDate(profileData.updatedAt)}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  // Update localStorage before navigating
                  const currentAuth = JSON.parse(localStorage.getItem('providerAuth') || '{}');
                  if (currentAuth.token && profileData) {
                    setProviderAuth(currentAuth.token, {
                      ...currentAuth.provider,
                      profileStatus: profileData.profileStatus,
                      verificationStatus: profileData.verificationStatus,
                      isVerified: profileData.isVerified
                    });
                  }
                  router.push('/provider');
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Go to Dashboard
                <FiArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Status: REJECTED - Profile rejected
  if (profileStatus === 'REJECTED' || verificationStatus === 'REJECTED') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Rejected</h1>
          <p className="text-gray-600 mt-1">Please review the rejection reason and resubmit your profile</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <FiXCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Rejected</h2>
            <p className="text-gray-600 mb-4">
              Your profile submission was rejected. Please review the reason below and update your profile accordingly.
            </p>
            
            {rejectionReason && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <h3 className="font-medium text-red-900 mb-2">Rejection Reason:</h3>
                <p className="text-sm text-red-800">{rejectionReason}</p>
              </div>
            )}

            <div className="mt-6">
              <Link
                href="/provider/profile/complete"
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Update & Resubmit Profile
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Onboarding Status</h1>
        <p className="text-gray-600 mt-1">Track your profile submission status</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <FiAlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unknown Status</h2>
          <p className="text-gray-600 mb-6">
            Unable to determine your profile status. Please contact support if you believe this is an error.
          </p>
          <Link
            href="/provider/profile/complete"
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Go to Profile
            <FiArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
