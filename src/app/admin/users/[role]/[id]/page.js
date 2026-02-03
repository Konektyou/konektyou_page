'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiUser,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiFile,
  FiImage,
  FiLoader,
  FiAlertCircle,
  FiX,
  FiDollarSign,
  FiCalendar,
  FiPackage
} from 'react-icons/fi';
import { getAdminToken } from '@/lib/adminAuth';
import ConfirmationModal from '@/components/admin/ConfirmationModal';

export default function UserDetailPage() { 
  const router = useRouter();
  const params = useParams();
  const role = params?.role;
  const id = params?.id;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'services' | 'booking'

  useEffect(() => {
    if (role && id) {
      fetchUserDetails();
    }
  }, [role, id]);

  // Fetch provider's offered services (provider only)
  useEffect(() => {
    if (!user || user.role !== 'provider' || !id) return;
    const token = getAdminToken();
    if (!token) return;
    let cancelled = false;
    setServicesLoading(true);
    fetch(`/api/admin/providers/${id}/services`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success) setServices(data.services || []);
      })
      .catch(() => { if (!cancelled) setServices([]); })
      .finally(() => { if (!cancelled) setServicesLoading(false); });
    return () => { cancelled = true; };
  }, [user, id]);

  // Fetch bookings (provider: jobs they did; client: jobs they requested)
  useEffect(() => {
    if (!user || !id) return;
    const token = getAdminToken();
    if (!token) return;
    const param = user.role === 'provider' ? 'providerId' : 'clientId';
    let cancelled = false;
    setBookingsLoading(true);
    fetch(`/api/admin/bookings?${param}=${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success) setBookings(data.bookings || []);
      })
      .catch(() => { if (!cancelled) setBookings([]); })
      .finally(() => { if (!cancelled) setBookingsLoading(false); });
    return () => { cancelled = true; };
  }, [user, id]);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const token = getAdminToken();
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/admin/users/${role}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
      } else {
        setError(data.message || 'Failed to fetch user details');
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('An error occurred while fetching user details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (user) => {
    if (user.isBanned) {
      return (
        <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">
          Banned
        </span>
      );
    }
    if (!user.isActive) {
      return (
        <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
          Inactive
        </span>
      );
    }
    if (user.role === 'provider' && (user.profileStatus === 'PENDING_REVIEW' || user.verificationStatus === 'PENDING')) {
      return (
        <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
          Pending Review
        </span>
      );
    }
    if (user.role === 'provider' && (user.profileStatus === 'REJECTED' || user.verificationStatus === 'REJECTED')) {
      return (
        <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">
          Rejected
        </span>
      );
    }
    if (user.role === 'business' && !user.isVerified) {
      return (
        <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
          Unverified
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
        Active
      </span>
    );
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'client':
        return 'bg-green-100 text-green-800';
      case 'business':
        return 'bg-purple-100 text-purple-800';
      case 'provider':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const token = getAdminToken();
      if (!token) {
        setError('Not authenticated');
        setActionLoading(false);
        return;
      }

      let endpoint = '';
      if (role === 'provider') {
        endpoint = `/api/admin/providers/verifications/${id}/approve`;
      } else if (role === 'business') {
        endpoint = `/api/admin/businesses/${id}/approve`;
      } else {
        setActionLoading(false);
        return;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setShowApproveModal(false);
        // Refresh user data
        fetchUserDetails();
        alert(`${role === 'provider' ? 'Provider' : 'Business'} approved successfully!`);
      } else {
        alert(data.message || `Failed to approve ${role}`);
      }
    } catch (err) {
      console.error(`Error approving ${role}:`, err);
      alert(`An error occurred while approving ${role}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      const token = getAdminToken();
      if (!token) {
        setError('Not authenticated');
        setActionLoading(false);
        return;
      }

      let endpoint = '';
      if (role === 'provider') {
        endpoint = `/api/admin/providers/verifications/${id}/reject`;
      } else if (role === 'business') {
        endpoint = `/api/admin/businesses/${id}/reject`;
      } else {
        setActionLoading(false);
        return;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setShowRejectModal(false);
        setRejectionReason('');
        // Refresh user data
        fetchUserDetails();
        alert(`${role === 'provider' ? 'Provider' : 'Business'} rejected successfully!`);
      } else {
        alert(data.message || `Failed to reject ${role}`);
      }
    } catch (err) {
      console.error(`Error rejecting ${role}:`, err);
      alert(`An error occurred while rejecting ${role}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiLoader className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Users</span>
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-800 font-medium">{error || 'User not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-1">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              <Link
                href="/admin/users"
                className="inline-flex mr-2 items-center gap-2 text-gray-600 hover:text-black transition-colors mb-4 border rounded-[3px] border-gray-300 p-[5px]"
              >
                <FiArrowLeft className="w-4 h-4 " />
              </Link>
              <span className="text-3xl font-bold text-gray-900">
                {user.name.charAt(0).toUpperCase() + user.name.slice(1)}
              </span>
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
              {getStatusBadge(user)}
            </div>
          </div>
          {/* Approve/Reject Buttons - Only for Business and Provider */}
          {(user.role === 'business' || user.role === 'provider') && 
           (user.verificationStatus === 'PENDING' || user.verificationStatus === 'NOT_SUBMITTED' || user.profileStatus === 'PENDING_REVIEW' || user.profileStatus === 'INCOMPLETE' || (user.role === 'business' && !user.isVerified)) && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveModal(true)}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm"
              >
                <FiCheckCircle className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm"
              >
                <FiXCircle className="w-4 h-4" />
                Reject
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'details'
                ? 'bg-white border border-b-0 border-gray-200 text-black -mb-px'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Worker Details
          </button>
          {user.role === 'provider' && (
            <button
              onClick={() => setActiveTab('services')}
              className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'services'
                  ? 'bg-white border border-b-0 border-gray-200 text-black -mb-px'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Services
            </button>
          )}
          {(user.role === 'provider' || user.role === 'client') && (
            <button
              onClick={() => setActiveTab('booking')}
              className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'booking'
                  ? 'bg-white border border-b-0 border-gray-200 text-black -mb-px'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Booking
            </button>
          )}
        </nav>
      </div>

      {/* Tab: Worker Details */}
      {activeTab === 'details' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-black/90 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Basic Information</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-gray-900 font-medium mt-1">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <div className="flex items-center gap-2 mt-1">
                    <FiMail className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                </div>
                {user.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <div className="flex items-center gap-2 mt-1">
                      <FiPhone className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{user.phone}</p>
                    </div>
                  </div>
                )}
                {(user.address || user.city || user.province) && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <div className="flex items-start gap-2 mt-1">
                      <FiMapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="text-gray-900">
                        {user.address && <p>{user.address}</p>}
                        {(user.city || user.province) && (
                          <p>{[user.city, user.province].filter(Boolean).join(', ')}</p>
                        )}
                        {user.postalCode && <p>{user.postalCode}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          {user.role === 'business' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-black/90 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Professional Information</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Business Name</label>
                    <p className="text-gray-900 font-medium mt-1">{user.businessName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Verification Status</label>
                    <div className="mt-1">
                      {user.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                          <FiCheckCircle className="w-4 h-4" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                          <FiXCircle className="w-4 h-4" />
                          Unverified
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created At</label>
                    <p className="text-gray-900 mt-1">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {user.role === 'provider' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-black/90 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Professional Information</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Service Type</label>
                    <p className="text-gray-900 font-medium mt-1">{user.serviceType || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Experience</label>
                    <p className="text-gray-900 mt-1">{user.experience || 'N/A'}</p>
                  </div>
                  {user.businessName && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Business Name</label>
                      <p className="text-gray-900 mt-1">{user.businessName}</p>
                    </div>
                  )}
                  {user.area && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Service Area</label>
                      <p className="text-gray-900 mt-1">{user.area}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Profile Status</label>
                    <p className="text-gray-900 font-medium mt-1">{user.profileStatus || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Verification Status</label>
                    <p className="text-gray-900 font-medium mt-1">{user.verificationStatus || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Verified</label>
                    <div className="mt-1">
                      {user.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                          <FiCheckCircle className="w-4 h-4" />
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
                          <FiXCircle className="w-4 h-4" />
                          No
                        </span>
                      )}
                    </div>
                  </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created At</label>
                      <p className="text-gray-900 mt-1">{formatDate(user.createdAt)}</p>
                    </div>
                  </div>
                {user.rejectionReason && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <label className="text-sm font-medium text-red-800">Rejection Reason</label>
                    <p className="text-red-700 mt-1">{user.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side */}
        <div className="space-y-6">
          {/* Profile Photo */}
          {user.role === 'provider' && user.photoPath && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-black/90 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Profile Photo</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col items-center gap-4">
                  <a
                    href={`/api/images/${user.photoPath.replace('src/images/', '').replace('images/', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <img
                      src={`/api/images/${user.photoPath.replace('src/images/', '').replace('images/', '')}`}
                      alt="Profile"
                      className="w-full max-w-xs h-auto object-cover rounded-lg border-2 border-gray-200 hover:opacity-90 transition-opacity cursor-pointer mx-auto"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </a>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Profile photo uploaded</p>
                    <p className="text-xs text-gray-500 mt-1">Click image to view full size</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documents */}
          {user.role === 'provider' && user.documents && user.documents.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-black/90 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Documents ({user.documents.length})</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {user.documents.map((doc, index) => {
                    const fileName = doc.filePath?.replace('src/images/', '').replace('images/', '') || doc.fileName;
                    const imageUrl = `/api/images/${fileName}`;
                    const documentUrl = `/api/images/${fileName}`;

                    return (
                      <div key={doc.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <FiFile className="w-4 h-4 text-gray-400" />
                              <p className="text-sm font-medium text-gray-900 truncate">{doc.originalName || doc.fileName}</p>
                            </div>
                            <p className="text-xs text-gray-500">{doc.documentType}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {(doc.fileSize / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded flex-shrink-0 ${doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                            doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                            {doc.status || 'pending'}
                          </span>
                        </div>
                        {doc.filePath && doc.fileType?.startsWith('image/') && (
                          <a
                            href={imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block mt-2"
                          >
                            <img
                              src={imageUrl}
                              alt={doc.originalName}
                              className="w-full h-32 object-cover rounded border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </a>
                        )}
                        <a
                          href={documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-sm text-black hover:underline font-medium"
                        >
                          <FiFile className="w-4 h-4" />
                          View Document
                        </a>
                        {doc.rejectionReason && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                            {doc.rejectionReason}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      )}

      {/* Tab: Services */}
      {activeTab === 'services' && user.role === 'provider' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-black/90 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FiPackage className="w-5 h-5" />
              Services Offered ({services.length})
            </h2>
          </div>
          <div className="p-6">
            {servicesLoading ? (
              <div className="flex items-center justify-center py-12">
                <FiLoader className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : services.length === 0 ? (
              <p className="text-gray-500">No services added yet.</p>
            ) : (
              <div className="space-y-4">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900">{svc.name}</h3>
                        {svc.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{svc.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {svc.category && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700">
                              {svc.category}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">{svc.unit || 'per hour'}</span>
                          {!svc.active && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-700">Inactive</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-lg font-bold text-gray-900 shrink-0">
                        <FiDollarSign className="w-5 h-5 text-gray-500" />
                        {Number(svc.basePrice).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Booking */}
      {activeTab === 'booking' && (user.role === 'provider' || user.role === 'client') && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-black/90 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FiCalendar className="w-5 h-5" />
              Bookings ({bookings.length})
            </h2>
          </div>
          <div className="p-6">
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-12">
                <FiLoader className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : bookings.length === 0 ? (
              <p className="text-gray-500">
                {user.role === 'provider' ? 'No bookings yet.' : 'No booking history.'}
              </p>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-gray-900">{b.serviceName || 'Service'}</p>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {user.role === 'provider' ? (
                            <>Client: <span className="font-medium text-gray-900">{b.clientName}</span></>
                          ) : (
                            <>Worker: <span className="font-medium text-gray-900">{b.providerName}</span></>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <FiClock className="w-3 h-3" />
                          {formatDate(b.startTime)} · {b.duration}h
                        </p>
                        {b.workLocation?.address && (
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <FiMapPin className="w-3 h-3" />
                            {b.workLocation.address}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-lg font-bold text-gray-900">
                          ${Number(b.amount).toFixed(2)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          b.status === 'completed' ? 'bg-green-100 text-green-800' :
                          b.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          b.status === 'confirmed' || b.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {b.status}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          b.paymentStatus === 'paid' ? 'bg-green-50 text-green-700' :
                          b.paymentStatus === 'failed' || b.paymentStatus === 'refunded' ? 'bg-red-50 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {b.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      <ConfirmationModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title={`Approve ${role === 'provider' ? 'Provider' : 'Business'}`}
        message={`Are you sure you want to approve this ${role}? This action will verify their account and allow them to use the platform.`}
        confirmText={actionLoading ? 'Processing...' : 'Approve'}
        cancelText="Cancel"
        confirmButtonColor="bg-green-600 hover:bg-green-700"
        icon={FiCheckCircle}
        iconColor="text-green-500"
      />

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-100">
                <FiXCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
              Reject {role === 'provider' ? 'Provider' : 'Business'}
            </h3>

            <p className="text-sm text-gray-600 text-center mb-4">
              Are you sure you want to reject this {role}? Please provide a reason for rejection.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="cursor-pointer flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="cursor-pointer flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {actionLoading ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


