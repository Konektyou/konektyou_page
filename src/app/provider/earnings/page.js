'use client';

import { FiDollarSign, FiCheckCircle, FiClock, FiLoader, FiPlus, FiEdit, FiX, FiXCircle, FiCalendar, FiStar, FiUser } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { getProviderToken } from '@/lib/providerAuth';

export default function EarningsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [earningsData, setEarningsData] = useState(null);
  const [bankAccount, setBankAccount] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'completed', 'cancelled'
  const [showBankModal, setShowBankModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bankFormData, setBankFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountHolderName: ''
  });

  useEffect(() => {
    fetchEarnings();
    fetchBankAccount();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const token = getProviderToken();
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/provider/earnings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setEarningsData(data);
      } else {
        setError(data.message || 'Failed to fetch earnings');
      }
    } catch (err) {
      console.error('Error fetching earnings:', err);
      setError('Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  const fetchBankAccount = async () => {
    try {
      const token = getProviderToken();
      if (!token) return;

      const response = await fetch('/api/provider/bank-account', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success && data.bankAccount) {
        setBankAccount(data.bankAccount);
        setBankFormData({
          bankName: data.bankAccount.bankName || '',
          accountNumber: '',
          accountHolderName: data.bankAccount.accountHolderName || ''
        });
      }
    } catch (err) {
      console.error('Error fetching bank account:', err);
    }
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    if (!bankFormData.bankName || !bankFormData.accountNumber) {
      alert('Please fill in bank name and account number');
      return;
    }

    try {
      setSubmitting(true);
      const token = getProviderToken();
      const response = await fetch('/api/provider/bank-account', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bankFormData)
      });

      const data = await response.json();
      if (data.success) {
        setShowBankModal(false);
        fetchBankAccount();
        alert(data.message || 'Bank account saved successfully');
      } else {
        alert(data.message || 'Failed to save bank account');
      }
    } catch (err) {
      console.error('Error saving bank account:', err);
      alert('Failed to save bank account');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount || 0);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

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

  const summary = earningsData?.summary || {
    totalEarnings: 0,
    activeEarnings: 0,
    completedEarnings: 0,
    cancelledEarnings: 0,
    activeCount: 0,
    completedCount: 0,
    cancelledCount: 0
  };

  const payments = earningsData?.payments || [];
  const bookings = earningsData?.bookings || [];

  // Filter bookings based on selected filter
  const filteredBookings = bookings.filter(booking => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'completed') return booking.status === 'completed';
    if (filterStatus === 'cancelled') return booking.status === 'cancelled';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-600 mt-1">View your total earnings, completed and pending payments</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Active</p>
              <p className="text-2xl font-bold text-blue-900 mt-2">{formatCurrency(summary.activeEarnings)}</p>
              <p className="text-xs text-blue-700 mt-1">{summary.activeCount} bookings</p>
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
              <p className="text-2xl font-bold text-green-900 mt-2">{formatCurrency(summary.completedEarnings)}</p>
              <p className="text-xs text-green-700 mt-1">{summary.completedCount} bookings</p>
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
              <p className="text-2xl font-bold text-red-900 mt-2">{formatCurrency(summary.cancelledEarnings)}</p>
              <p className="text-xs text-red-700 mt-1">{summary.cancelledCount} bookings</p>
            </div>
            <div className="bg-red-500 rounded-full p-3">
              <FiXCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(summary.totalEarnings)}</p>
              <p className="text-xs text-gray-700 mt-1">{bookings.length} total</p>
            </div>
            <div className="bg-gray-500 rounded-full p-3">
              <FiDollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Bank Account Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Bank Account</h2>
          <button
            onClick={() => {
              if (bankAccount) {
                setBankFormData({
                  bankName: bankAccount.bankName || '',
                  accountNumber: '',
                  accountHolderName: bankAccount.accountHolderName || ''
                });
              }
              setShowBankModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
          >
            {bankAccount ? <FiEdit className="w-4 h-4" /> : <FiPlus className="w-4 h-4" />}
            {bankAccount ? 'Update' : 'Add'} Bank Account
          </button>
        </div>
        {bankAccount ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Bank Name:</span>
              <span className="text-sm font-medium text-gray-900">{bankAccount.bankName}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Account Number:</span>
              <span className="text-sm font-medium text-gray-900">{bankAccount.accountNumber}</span>
            </div>
            {bankAccount.accountHolderName && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Account Holder:</span>
                <span className="text-sm font-medium text-gray-900">{bankAccount.accountHolderName}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No bank account added. Add your bank account to receive payouts.</p>
        )}
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Order History</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                filterStatus === 'all'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                filterStatus === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilterStatus('cancelled')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                filterStatus === 'cancelled'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>

        {filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const startDate = booking.startTime ? new Date(booking.startTime) : null;
              
              return (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Client & Service Info */}
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {booking.clientName?.charAt(0).toUpperCase() || 'C'}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{booking.clientName}</h3>
                            <p className="text-sm text-gray-600">{booking.serviceName}</p>
                          </div>
                        </div>
                        
                        {/* Rating & Review */}
                        {booking.rating && (
                          <div className="ml-[52px] mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <FiStar
                                    key={i}
                                    className={`w-3.5 h-3.5 ${
                                      i < booking.rating
                                        ? 'text-yellow-500 fill-yellow-500'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs font-semibold text-gray-900">{booking.rating}/5</span>
                            </div>
                            {booking.review && (
                              <p className="text-xs text-gray-700 italic">"{booking.review}"</p>
                            )}
                          </div>
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
                              <span>{startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </>
                        )}
                        {booking.duration && (
                          <p className="text-xs text-gray-500">{booking.duration} hours</p>
                        )}
                      </div>

                      {/* Status & Amount */}
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">Amount</p>
                          <p className="text-xl font-bold text-gray-900">
                            {formatCurrency(booking.amount)}
                          </p>
                        </div>
                        {booking.completedAt && (
                          <p className="text-xs text-gray-500">
                            Completed: {formatDate(booking.completedAt)}
                          </p>
                        )}
                        {booking.cancelledAt && (
                          <p className="text-xs text-red-600">
                            Cancelled: {formatDate(booking.cancelledAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <FiCalendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No {filterStatus === 'all' ? '' : filterStatus} orders found.</p>
          </div>
        )}
      </div>

      {/* Bank Account Modal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {bankAccount ? 'Update Bank Account' : 'Add Bank Account'}
              </h2>
              <button
                onClick={() => setShowBankModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleBankSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bankFormData.bankName}
                  onChange={(e) => setBankFormData({ ...bankFormData, bankName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="e.g., TD Canada Trust, RBC, BMO"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bankFormData.accountNumber}
                  onChange={(e) => setBankFormData({ ...bankFormData, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter your account number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Holder Name (Optional)
                </label>
                <input
                  type="text"
                  value={bankFormData.accountHolderName}
                  onChange={(e) => setBankFormData({ ...bankFormData, accountHolderName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Account holder name"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : bankAccount ? 'Update' : 'Add'} Bank Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
