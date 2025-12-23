'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FiArrowLeft, 
  FiLoader, 
  FiCalendar, 
  FiClock, 
  FiMapPin, 
  FiUser, 
  FiDollarSign,
  FiStar,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiMail,
  FiPhone,
  FiBriefcase
} from 'react-icons/fi';
import { getAdminToken } from '@/lib/adminAuth';

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId;
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const token = getAdminToken();
      
      if (!token) {
        setError('Please login to view booking details');
        return;
      }

      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setBooking(data.booking);
      } else {
        setError(data.message || 'Failed to load booking details');
      }
    } catch (err) {
      setError('Failed to load booking details');
      console.error('Error fetching booking details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'confirmed':
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FiLoader className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Bookings
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Booking not found'}</p>
        </div>
      </div>
    );
  }

  const startDate = booking.startTime ? new Date(booking.startTime) : null;
  const endDate = booking.endTime ? new Date(booking.endTime) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
            <p className="text-gray-600 mt-1">Booking ID: #{booking.id?.slice(-8) || 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(booking.status)}`}>
            {booking.status}
          </span>
          <span className={`px-4 py-2 text-sm font-medium rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
            Payment: {booking.paymentStatus || 'pending'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiUser className="w-5 h-5" />
              Client Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {booking.clientName?.charAt(0).toUpperCase() || 'C'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{booking.clientName}</p>
                  {booking.clientEmail && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <FiMail className="w-4 h-4" />
                      {booking.clientEmail}
                    </div>
                  )}
                  {booking.clientPhone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <FiPhone className="w-4 h-4" />
                      {booking.clientPhone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Provider Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiBriefcase className="w-5 h-5" />
              Provider Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {booking.providerPhoto ? (
                  <img 
                    src={booking.providerPhoto} 
                    alt={booking.providerName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-300 to-blue-400 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {booking.providerName?.charAt(0).toUpperCase() || 'P'}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{booking.providerName}</p>
                  {booking.providerEmail && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <FiMail className="w-4 h-4" />
                      {booking.providerEmail}
                    </div>
                  )}
                  {booking.providerPhone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <FiPhone className="w-4 h-4" />
                      {booking.providerPhone}
                    </div>
                  )}
                  {booking.providerCity && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <FiMapPin className="w-4 h-4" />
                      {booking.providerCity}, {booking.providerProvince}
                    </div>
                  )}
                </div>
              </div>

              {/* Provider Services */}
              {booking.providerServices && booking.providerServices.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                    Provider Services ({booking.providerServices.length})
                  </h3>
                  <div className="space-y-2">
                    {booking.providerServices.map((service) => (
                      <div key={service.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{service.name}</p>
                            {service.description && (
                              <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                {service.category}
                              </span>
                              <span className="text-sm font-bold text-gray-900">
                                {formatCurrency(service.basePrice)}/{service.unit}
                              </span>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            service.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {service.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Service & Booking Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Service & Booking Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Service Name</p>
                <p className="font-semibold text-gray-900 text-lg">{booking.serviceName}</p>
                {booking.serviceDescription && (
                  <p className="text-sm text-gray-600 mt-2">{booking.serviceDescription}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Duration</p>
                  <p className="font-semibold text-gray-900">{booking.duration} hours</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Amount</p>
                  <p className="font-semibold text-gray-900 text-lg">{formatCurrency(booking.amount)}</p>
                </div>
              </div>

              {startDate && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Start Time</p>
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-4 h-4 text-gray-400" />
                    <p className="font-semibold text-gray-900">
                      {startDate.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )}

              {endDate && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">End Time</p>
                  <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4 text-gray-400" />
                    <p className="font-semibold text-gray-900">
                      {endDate.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Work Location */}
          {booking.workLocation && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiMapPin className="w-5 h-5" />
                Work Location
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-gray-900">{booking.workLocation.address}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {booking.workLocation.city}, {booking.workLocation.province}
                </p>
                {booking.workLocation.postalCode && (
                  <p className="text-sm text-gray-600">{booking.workLocation.postalCode}</p>
                )}
              </div>
            </div>
          )}

          {/* Rating & Review */}
          {booking.rating && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiStar className="w-5 h-5 text-yellow-500" />
                Client Rating & Review
              </h2>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-5 h-5 ${
                          i < booking.rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-gray-900">{booking.rating}/5</span>
                </div>
                {booking.review && (
                  <p className="text-sm text-gray-700 italic mt-2">"{booking.review}"</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Booking Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Booking Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Booking ID</span>
                <span className="text-sm font-medium text-gray-900">#{booking.id?.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payment Status</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                  {booking.paymentStatus || 'pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Amount</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(booking.amount)}</span>
              </div>
              {booking.createdAt && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Created At</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(booking.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Client Bookings */}
          {booking.clientBookings && booking.clientBookings.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Client's Other Bookings</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {booking.clientBookings.map((clientBooking) => {
                  const bookingStartDate = clientBooking.startTime ? new Date(clientBooking.startTime) : null;
                  return (
                    <div key={clientBooking.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500">#{clientBooking.id?.slice(-8)}</p>
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            {clientBooking.providerName} • {clientBooking.serviceName}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(clientBooking.status)}`}>
                          {clientBooking.status}
                        </span>
                      </div>
                      {bookingStartDate && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                          <FiCalendar className="w-3 h-3" />
                          <span>{bookingStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          {clientBooking.duration && (
                            <span className="ml-2">{clientBooking.duration}h</span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(clientBooking.amount)}</span>
                        {clientBooking.rating && (
                          <div className="flex items-center gap-1">
                            <FiStar className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs text-gray-600">{clientBooking.rating}/5</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

