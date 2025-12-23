'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiCalendar, FiClock, FiMapPin, FiUser, FiLoader, FiGrid, FiList, FiChevronLeft, FiChevronRight, FiCheckCircle, FiXCircle, FiMessageCircle, FiAlertCircle } from 'react-icons/fi';
import { getProviderToken } from '@/lib/providerAuth';
import Link from 'next/link';

export default function ProviderBookingsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = getProviderToken();
      
      if (!token) {
        setError('Please login to view bookings');
        return;
      }

      const response = await fetch('/api/provider/bookings', {
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

  const getBookingsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.startTime).toISOString().split('T')[0];
      return bookingDate === dateStr;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
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
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelectedDate = (date) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const hasBookings = (date) => {
    if (!date) return false;
    return getBookingsForDate(date).length > 0;
  };

  const getDateColorClass = (date) => {
    if (!date) return '';
    const dateBookings = getBookingsForDate(date);
    if (dateBookings.length === 0) return '';
    
    const hasCancelled = dateBookings.some(b => b.status === 'cancelled');
    const hasActive = dateBookings.some(b => ['pending', 'confirmed', 'in-progress'].includes(b.status));
    const hasCompleted = dateBookings.some(b => b.status === 'completed');
    
    // Priority: cancelled > active > completed
    if (hasCancelled) return 'border-red-400 bg-red-50 text-gray-900';
    if (hasActive) return 'border-blue-400 bg-blue-50 text-gray-900';
    if (hasCompleted) return 'border-green-400 bg-green-50 text-gray-900';
    
    return 'border-gray-300 bg-gray-50 text-gray-900';
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const activeBookings = bookings.filter(b => 
    ['pending', 'confirmed', 'in-progress'].includes(b.status)
  );
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  const handleAcceptBooking = async (bookingId) => {
    try {
      setProcessing(true);
      const token = getProviderToken();
      
      const response = await fetch(`/api/provider/bookings/${bookingId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Booking accepted successfully!');
        fetchBookings();
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setError(data.message || 'Failed to accept booking');
      }
    } catch (err) {
      setError('Failed to accept booking');
      console.error('Error accepting booking:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectBooking = async (bookingId, reason = '') => {
    if (!confirm('Are you sure you want to reject this booking? The client will receive a full refund.')) {
      return;
    }

    try {
      setProcessing(true);
      const token = getProviderToken();
      
      const response = await fetch(`/api/provider/bookings/${bookingId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Booking rejected successfully. Refund has been processed.');
        fetchBookings();
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setError(data.message || 'Failed to reject booking');
      }
    } catch (err) {
      setError('Failed to reject booking');
      console.error('Error rejecting booking:', err);
    } finally {
      setProcessing(false);
    }
  };

  const selectedDateBookings = getBookingsForDate(selectedDate);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FiLoader className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  const calendarDays = getDaysInMonth(currentMonth);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-1">Manage and track your service bookings</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('calendar')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'calendar' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Calendar View"
          >
            <FiCalendar className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="List View"
          >
            <FiList className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm text-green-800">{successMessage}</p>
          <button
            onClick={() => setSuccessMessage('')}
            className="text-green-600 hover:text-green-800"
          >
            <FiXCircle className="w-5 h-5" />
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
            <FiXCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm border border-yellow-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-yellow-600 uppercase tracking-wide">Pending</p>
              <p className="text-3xl font-bold text-yellow-900 mt-2">{pendingBookings.length}</p>
            </div>
            <div className="bg-yellow-500 rounded-full p-3">
              <FiAlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
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
              <p className="text-3xl font-bold text-green-900 mt-2">{completedBookings.length}</p>
            </div>
            <div className="bg-green-500 rounded-full p-3">
              <FiCheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm border border-red-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Cancelled</p>
              <p className="text-3xl font-bold text-red-900 mt-2">{cancelledBookings.length}</p>
            </div>
            <div className="bg-red-500 rounded-full p-3">
              <FiXCircle className="w-6 h-6 text-white" />
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

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-gray-900">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day Headers */}
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const dateBookings = getBookingsForDate(date);
                const hasBooking = dateBookings.length > 0;
                const isSelected = isSelectedDate(date);
                const isTodayDate = isToday(date);
                const dateColorClass = getDateColorClass(date);

                // Determine status indicator color
                const getStatusIndicatorColor = () => {
                  if (!hasBooking) return '';
                  const hasCancelled = dateBookings.some(b => b.status === 'cancelled');
                  const hasActive = dateBookings.some(b => ['pending', 'confirmed', 'in-progress'].includes(b.status));
                  const hasCompleted = dateBookings.some(b => b.status === 'completed');
                  
                  if (isSelected) return 'text-gray-700';
                  if (hasCancelled) return 'text-red-600 font-semibold';
                  if (hasActive) return 'text-blue-600 font-semibold';
                  if (hasCompleted) return 'text-green-600 font-semibold';
                  return 'text-gray-600 font-semibold';
                };

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-gray-400 bg-gray-200 text-gray-900 shadow-md'
                        : isTodayDate && !hasBooking
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : isTodayDate && hasBooking
                        ? `${dateColorClass} border-blue-500`
                        : hasBooking
                        ? `${dateColorClass} hover:shadow-md`
                        : 'border-gray-200 hover:bg-gray-50 text-gray-900'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className="text-sm font-medium">
                        {date.getDate()}
                      </span>
                      {hasBooking && (
                        <span className={`text-xs mt-1 ${getStatusIndicatorColor()}`}>
                          {dateBookings.length}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Bookings */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              
              {selectedDateBookings.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No bookings on this date</p>
              ) : (
                <div className="space-y-3">
                  {selectedDateBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{booking.clientName}</h4>
                          <p className="text-sm text-gray-600">{booking.serviceName}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="space-y-1 mt-2">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <FiClock className="w-3 h-3" />
                          <span>
                            {new Date(booking.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - 
                            {new Date(booking.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {booking.workLocation && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <FiMapPin className="w-3 h-3" />
                            <span className="truncate">{booking.workLocation.address}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">Amount</span>
                          <span className="text-sm font-bold text-gray-900">${booking.amount?.toFixed(2) || '0.00'}</span>
                        </div>
                        {booking.status === 'pending' && (
                          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200">
                            <button
                              onClick={() => handleAcceptBooking(booking.id)}
                              disabled={processing}
                              className="flex-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-1"
                            >
                              <FiCheckCircle className="w-3 h-3" />
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectBooking(booking.id)}
                              disabled={processing}
                              className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-1"
                            >
                              <FiXCircle className="w-3 h-3" />
                              Reject
                            </button>
                          </div>
                        )}
                        {booking.status !== 'pending' && (
                          <div className="flex items-center justify-end mt-2">
                            <Link
                              href={`/provider/messages?clientId=${booking.clientId}`}
                              className="p-2 border border-gray-300 rounded-lg hover:bg-white transition-colors"
                              title="Message Client"
                            >
                              <FiMessageCircle className="w-4 h-4 text-gray-600" />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {bookings.length === 0 ? (
              <div className="p-12 text-center">
                <FiCalendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No bookings found</p>
              </div>
            ) : (
              bookings.map((booking) => {
                const startDate = new Date(booking.startTime);
                const endDate = new Date(booking.endTime);
                
                return (
                  <div
                    key={booking.id}
                    className="p-5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Client & Service Info */}
                        <div className="md:col-span-2">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-600 font-medium text-sm">
                                {booking.clientName?.charAt(0).toUpperCase() || 'C'}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">{booking.clientName}</h3>
                              <p className="text-sm text-gray-600">{booking.serviceName}</p>
                            </div>
                          </div>
                          {booking.clientPhone && (
                            <p className="text-xs text-gray-500 ml-[52px]">{booking.clientPhone}</p>
                          )}
                        </div>

                        {/* Date & Time */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FiCalendar className="w-4 h-4" />
                            <span>{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FiClock className="w-4 h-4" />
                            <span>
                              {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - 
                              {endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{booking.duration} hours</p>
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

                        {/* Status & Amount */}
                        <div className="flex items-center justify-between md:justify-end gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-2 justify-end">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                                {booking.paymentStatus || 'pending'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-1">Amount</p>
                            <p className="text-lg font-bold text-gray-900">
                              ${booking.amount?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {booking.status === 'pending' && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleAcceptBooking(booking.id)}
                                  disabled={processing}
                                  className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-1"
                                >
                                  <FiCheckCircle className="w-3 h-3" />
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleRejectBooking(booking.id)}
                                  disabled={processing}
                                  className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-1"
                                >
                                  <FiXCircle className="w-3 h-3" />
                                  Reject
                                </button>
                              </div>
                            )}
                            {booking.status !== 'pending' && (
                              <Link
                                href={`/provider/messages?clientId=${booking.clientId}`}
                                className="p-2 border border-gray-300 rounded-lg hover:bg-white transition-colors"
                                title="Message Client"
                              >
                                <FiMessageCircle className="w-4 h-4 text-gray-600" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

