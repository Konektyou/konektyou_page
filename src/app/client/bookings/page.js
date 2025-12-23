'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiStar, FiEye, FiCalendar, FiClock, FiMapPin, FiMessageCircle, FiLoader, FiCheckCircle, FiGrid, FiList, FiX, FiXCircle } from 'react-icons/fi';
import { getClientToken } from '@/lib/clientAuth';
import ConfirmationModal from '@/components/admin/ConfirmationModal';

export default function BookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'list'
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToRate, setBookingToRate] = useState(null);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchBookings();
    
    // Check for success message
    if (searchParams?.get('success') === 'true') {
      const bookingId = searchParams.get('bookingId');
      const isPending = searchParams.get('pending') === 'true';
      if (bookingId) {
        // Show success message
        if (isPending) {
          setSuccessMessage('Booking request submitted successfully! Payment received. Waiting for provider to accept your booking request.');
        } else {
          setSuccessMessage('Booking created successfully!');
        }
        setTimeout(() => {
          fetchBookings();
          setSuccessMessage('');
        }, 5000);
      }
    }
  }, [searchParams]);


  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = getClientToken();
      
      if (!token) {
        setError('Please login to view bookings');
        return;
      }

      const response = await fetch('/api/client/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setBookings(data.bookings || []);
      } else {
        setError(data.message || 'Failed to load bookings');
      }
    } catch (err) {
      setError('Failed to load bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const activeBookings = bookings.filter(b => 
    ['pending', 'confirmed', 'in-progress'].includes(b.status)
  );

  const handleCompleteBooking = (booking) => {
    setBookingToRate(booking);
    setRating(0);
    setReview('');
    setShowRatingModal(true);
  };

  const handleCancelBooking = (booking) => {
    setBookingToCancel(booking);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const submitRating = async () => {
    if (!rating || rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5 stars');
      return;
    }

    try {
      setProcessing(true);
      const token = getClientToken();
      
      const response = await fetch(`/api/client/bookings/${bookingToRate.id}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating,
          review: review.trim() || null
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Booking completed successfully! Thank you for your rating.');
        setShowRatingModal(false);
        setBookingToRate(null);
        setRating(0);
        setReview('');
        fetchBookings();
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setError(data.message || 'Failed to complete booking');
      }
    } catch (err) {
      setError('Failed to complete booking');
      console.error('Error completing booking:', err);
    } finally {
      setProcessing(false);
    }
  };

  const submitCancellation = async () => {
    try {
      setProcessing(true);
      const token = getClientToken();
      
      const response = await fetch(`/api/client/bookings/${bookingToCancel.id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: cancelReason.trim() || 'Client requested cancellation'
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.refundId 
          ? 'Booking cancelled successfully! Refund has been processed and will appear in your account shortly.'
          : 'Booking cancelled successfully!');
        setShowCancelModal(false);
        setBookingToCancel(null);
        setCancelReason('');
        fetchBookings();
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setError(data.message || 'Failed to cancel booking');
      }
    } catch (err) {
      setError('Failed to cancel booking');
      console.error('Error cancelling booking:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm text-green-800">{successMessage}</p>
          <button
            onClick={() => setSuccessMessage('')}
            className="text-green-600 hover:text-green-800"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={() => setError('')}
            className="text-red-600 hover:text-red-800"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-1">Manage and track your service bookings</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'cards' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FiGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FiList className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Active</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{activeBookings.length}</p>
            </div>
            <div className="bg-blue-500 rounded-full p-3">
              <FiClock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Completed</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {bookings.filter(b => b.status === 'completed').length}
              </p>
            </div>
            <div className="bg-green-500 rounded-full p-3">
              <FiCheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border border-purple-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Pending</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                {bookings.filter(b => b.status === 'pending').length}
              </p>
            </div>
            <div className="bg-purple-500 rounded-full p-3">
              <FiCalendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{bookings.length}</p>
            </div>
            <div className="bg-gray-500 rounded-full p-3">
              <FiCalendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>


      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <FiLoader className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Bookings Content */}
      {!loading && !error && (
        <>
          {bookings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCalendar className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600">No bookings match your search criteria.</p>
            </div>
          ) : viewMode === 'cards' ? (
            // Card View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.map((booking) => {
                const isActive = ['pending', 'confirmed', 'in-progress'].includes(booking.status);
                const startDate = booking.startTime ? new Date(booking.startTime) : null;
                const endDate = booking.endTime ? new Date(booking.endTime) : null;
                
                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden group"
                  >
                    {/* Card Header */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">#{booking.id?.slice(-8) || 'N/A'}</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {booking.providerName || 'Provider'}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                            {booking.paymentStatus || 'pending'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          {booking.serviceName || 'Service'}
                        </p>
                        {booking.duration && (
                          <p className="text-xs text-gray-500">{booking.duration} hours</p>
                        )}
                      </div>

                      {startDate && (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <FiCalendar className="w-3.5 h-3.5" />
                            <span>{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <FiClock className="w-3.5 h-3.5" />
                            <span>
                              {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - 
                              {endDate ? endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                            </span>
                          </div>
                        </div>
                      )}

                      {booking.workLocation && (
                        <div className="flex items-start gap-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
                          <FiMapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">
                            {booking.workLocation.address}, {booking.workLocation.city}
                          </span>
                        </div>
                      )}

                      {booking.rating && (
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={`w-3 h-3 ${
                                i < booking.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Total Amount</p>
                          <p className="text-lg font-bold text-gray-900">
                            ${booking.amount?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isActive && (
                            <button
                              onClick={() => router.push(`/client/chat/${booking.providerId}`)}
                              className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                              title="Chat"
                            >
                              <FiMessageCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            className="p-2 border border-gray-300 rounded-lg hover:bg-white transition-colors"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                        {booking.status === 'pending' && (
                          <div className="w-full px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-xs text-yellow-800 text-center">
                              ⏳ Waiting for provider to accept your booking request
                            </p>
                          </div>
                        )}
                        {isActive && booking.paymentStatus === 'paid' && booking.status !== 'pending' && (
                          <>
                            {['confirmed', 'in-progress'].includes(booking.status) && !booking.rating && (
                              <button
                                onClick={() => handleCompleteBooking(booking)}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium flex items-center justify-center gap-2"
                              >
                                <FiCheckCircle className="w-4 h-4" />
                                Complete Job
                              </button>
                            )}
                            {!['cancelled', 'completed'].includes(booking.status) && (
                              <button
                                onClick={() => handleCancelBooking(booking)}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium flex items-center justify-center gap-2"
                              >
                                <FiXCircle className="w-4 h-4" />
                                Cancel
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // List View
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {bookings.map((booking) => {
                  const isActive = ['pending', 'confirmed', 'in-progress'].includes(booking.status);
                  const startDate = booking.startTime ? new Date(booking.startTime) : null;
                  const endDate = booking.endTime ? new Date(booking.endTime) : null;
                  
                  return (
                    <div
                      key={booking.id}
                      className="p-5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                          {/* Booking Info */}
                          <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-gray-900">#{booking.id?.slice(-8) || 'N/A'}</h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                                {booking.paymentStatus || 'pending'}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 mb-1">
                              {booking.providerName || 'Provider'} • {booking.serviceName || 'Service'}
                            </p>
                            {booking.duration && (
                              <p className="text-xs text-gray-500">{booking.duration} hours</p>
                            )}
                          </div>

                          {/* Date & Time */}
                          <div className="space-y-1">
                            {startDate && (
                              <>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <FiCalendar className="w-4 h-4" />
                                  <span>{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <FiClock className="w-4 h-4" />
                                  <span>
                                    {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - 
                                    {endDate ? endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Location */}
                          <div>
                            {booking.workLocation && (
                              <div className="flex items-start gap-2 text-sm text-gray-600">
                                <FiMapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-2">
                                  {booking.workLocation.address}, {booking.workLocation.city}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Amount & Actions */}
                          <div className="flex flex-col items-end gap-3">
                            <div className="text-right">
                              <p className="text-xs text-gray-500 mb-1">Amount</p>
                              <p className="text-lg font-bold text-gray-900">
                                ${booking.amount?.toFixed(2) || '0.00'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {booking.status === 'pending' && (
                                <div className="px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                  <p className="text-xs text-yellow-800">
                                    ⏳ Waiting for provider response
                                  </p>
                                </div>
                              )}
                              {isActive && booking.paymentStatus === 'paid' && booking.status !== 'pending' && (
                                <>
                                  {['confirmed', 'in-progress'].includes(booking.status) && !booking.rating && (
                                    <button
                                      onClick={() => handleCompleteBooking(booking)}
                                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium flex items-center gap-2"
                                    >
                                      <FiCheckCircle className="w-4 h-4" />
                                      Complete
                                    </button>
                                  )}
                                  {!['cancelled', 'completed'].includes(booking.status) && (
                                    <button
                                      onClick={() => handleCancelBooking(booking)}
                                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium flex items-center gap-2"
                                    >
                                      <FiXCircle className="w-4 h-4" />
                                      Cancel
                                    </button>
                                  )}
                                </>
                              )}
                              {isActive && (
                                <button
                                  onClick={() => router.push(`/client/chat/${booking.providerId}`)}
                                  className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                                  title="Chat"
                                >
                                  <FiMessageCircle className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                className="p-2 border border-gray-300 rounded-lg hover:bg-white transition-colors"
                                title="View Details"
                              >
                                <FiEye className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Rating Modal */}
      {showRatingModal && bookingToRate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => {
                setShowRatingModal(false);
                setBookingToRate(null);
                setRating(0);
                setReview('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Booking</h3>
              <p className="text-sm text-gray-600">
                Rate your experience with {bookingToRate.providerName}
              </p>
            </div>

            {/* Star Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-2 rounded-lg transition-all ${
                      rating >= star
                        ? 'text-yellow-400 bg-yellow-50'
                        : 'text-gray-300 hover:text-yellow-300'
                    }`}
                  >
                    <FiStar
                      className={`w-8 h-8 ${rating >= star ? 'fill-current' : ''}`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              )}
            </div>

            {/* Review Text */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review (Optional)
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setBookingToRate(null);
                  setRating(0);
                  setReview('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={submitRating}
                disabled={processing || rating === 0}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="w-4 h-4" />
                    Submit Rating
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && bookingToCancel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => {
                setShowCancelModal(false);
                setBookingToCancel(null);
                setCancelReason('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={processing}
            >
              <FiX className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <FiXCircle className="w-6 h-6 text-red-500" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                Cancel Booking
              </h3>
              <p className="text-sm text-gray-600 text-center mb-4">
                {bookingToCancel.paymentStatus === 'paid'
                  ? `Are you sure you want to cancel this booking? The amount of $${bookingToCancel.amount?.toFixed(2) || '0.00'} will be refunded to your account.`
                  : 'Are you sure you want to cancel this booking?'}
              </p>
            </div>

            {/* Cancellation Reason */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Cancellation (Optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please let us know why you're cancelling..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
                disabled={processing}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setBookingToCancel(null);
                  setCancelReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                disabled={processing}
              >
                Keep Booking
              </button>
              <button
                onClick={submitCancellation}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiXCircle className="w-4 h-4" />
                    Cancel Booking
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
