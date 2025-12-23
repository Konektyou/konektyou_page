'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiLoader, FiAlertCircle, FiCheckCircle, FiXCircle, FiMail, FiPhone, FiMapPin, FiBriefcase, FiUser, FiFileText, FiImage, FiArrowLeft } from 'react-icons/fi';
import { getAdminToken } from '@/lib/adminAuth';
import Link from 'next/link';

export default function ProviderVerificationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const providerId = params?.id;

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (providerId) {
      fetchProviderDetails();
    }
  }, [providerId]);

  const fetchProviderDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const token = getAdminToken();
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/admin/providers/verifications/${providerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setProvider(data.provider);
      } else {
        setError(data.message || 'Failed to fetch provider details');
      }
    } catch (err) {
      console.error('Error fetching provider:', err);
      setError('An error occurred while fetching provider details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this provider profile?')) {
      return;
    }

    setActionLoading(true);
    try {
      const token = getAdminToken();
      const response = await fetch(`/api/admin/providers/verifications/${providerId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Provider profile approved successfully!');
        router.push('/admin/providers/verifications');
      } else {
        alert(data.message || 'Failed to approve provider');
      }
    } catch (err) {
      console.error('Error approving provider:', err);
      alert('An error occurred while approving provider');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      const token = getAdminToken();
      const response = await fetch(`/api/admin/providers/verifications/${providerId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      });

      const data = await response.json();

      if (data.success) {
        alert('Provider profile rejected successfully!');
        router.push('/admin/providers/verifications');
      } else {
        alert(data.message || 'Failed to reject provider');
      }
    } catch (err) {
      console.error('Error rejecting provider:', err);
      alert('An error occurred while rejecting provider');
    } finally {
      setActionLoading(false);
      setShowRejectModal(false);
      setRejectionReason('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FiLoader className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="text-center py-12">
        <FiAlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <p className="text-red-600">{error || 'Provider not found'}</p>
        <Link
          href="/admin/providers/verifications"
          className="mt-4 inline-block px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Back to Verifications
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/providers/verifications"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-4"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Verifications</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{provider.name}</h1>
          <p className="text-gray-600 mt-1">Review provider profile and documents</p>
        </div>
        {provider.profileStatus === 'PENDING_REVIEW' && (
          <div className="flex gap-3">
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {actionLoading ? (
                <FiLoader className="w-4 h-4 animate-spin" />
              ) : (
                <FiCheckCircle className="w-4 h-4" />
              )}
              Approve
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={actionLoading}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FiXCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        )}
      </div>

      {/* Status Badge */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Profile Status</p>
            <div className="mt-1">
              {provider.profileStatus === 'PENDING_REVIEW' && (
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                  Pending Review
                </span>
              )}
              {provider.profileStatus === 'APPROVED' && (
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                  Approved
                </span>
              )}
              {provider.profileStatus === 'REJECTED' && (
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">
                  Rejected
                </span>
              )}
            </div>
          </div>
          {provider.rejectionReason && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Rejection Reason</p>
              <p className="text-sm text-red-600 mt-1">{provider.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Photo */}
          {provider.photoPath && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Photo</h2>
              <div className="flex justify-center">
                <img
                  src={`/api/images/${provider.photoPath.split('/').pop()}`}
                  alt="Profile"
                  className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200"
                />
              </div>
            </div>
          )}

          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                <p className="text-gray-900">{provider.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <p className="text-gray-900 flex items-center gap-2">
                  <FiMail className="w-4 h-4" />
                  {provider.email}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                <p className="text-gray-900 flex items-center gap-2">
                  <FiPhone className="w-4 h-4" />
                  {provider.phone || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
                <p className="text-gray-900 flex items-center gap-2">
                  <FiMapPin className="w-4 h-4" />
                  {provider.city && provider.province
                    ? `${provider.city}, ${provider.province}`
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Professional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Service Type</label>
                <p className="text-gray-900 flex items-center gap-2">
                  <FiBriefcase className="w-4 h-4" />
                  {provider.serviceType || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Experience</label>
                <p className="text-gray-900">{provider.experience || 'N/A'}</p>
              </div>
              {provider.businessName && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Business Name</label>
                  <p className="text-gray-900">{provider.businessName}</p>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          {provider.documents && provider.documents.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Documents ({provider.documents.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {provider.documents.map((doc, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{doc.documentType}</p>
                        <p className="text-xs text-gray-500 mt-1">{doc.originalName}</p>
                        <p className="text-xs text-gray-500">
                          {(doc.fileSize / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                        doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                    {doc.fileType?.startsWith('image/') && (
                      <a
                        href={`/api/images/${doc.filePath.split('/').pop()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-2"
                      >
                        <img
                          src={`/api/images/${doc.filePath.split('/').pop()}`}
                          alt={doc.originalName}
                          className="w-full h-32 object-cover rounded border border-gray-200 hover:opacity-80 transition-opacity"
                        />
                      </a>
                    )}
                    <a
                      href={`/api/images/${doc.filePath.split('/').pop()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm text-black hover:underline"
                    >
                      <FiFileText className="w-4 h-4" />
                      View Document
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Account Created</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(provider.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(provider.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Verification Status</p>
                <p className="text-sm font-medium text-gray-900">{provider.verificationStatus}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Provider Profile</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this profile. The provider will be notified of this reason.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent mb-4"
              rows={4}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Rejecting...' : 'Reject Profile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



