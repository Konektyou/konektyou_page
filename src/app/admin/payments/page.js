'use client';

import { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiFilter, 
  FiRefreshCw, 
  FiDollarSign, 
  FiLoader,
  FiCalendar,
  FiClock,
  FiUser,
  FiStar,
  FiCheckCircle,
  FiXCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiSend,
  FiAlertCircle
} from 'react-icons/fi';
import { getAdminToken } from '@/lib/adminAuth';

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [releasing, setReleasing] = useState(false);
  const [releasingId, setReleasingId] = useState(null);
  const [commissionRate, setCommissionRate] = useState(10);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = getAdminToken();
      
      if (!token) {
        setError('Please login to view payments');
        return;
      }

      const response = await fetch('/api/admin/payments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions || []);
        setSummary(data.summary || {});
        // Get commission rate from first transaction if available
        if (data.transactions && data.transactions.length > 0 && data.transactions[0].commissionRate) {
          setCommissionRate(data.transactions[0].commissionRate);
        }
      } else {
        setError(data.message || 'Failed to load transactions');
      }
    } catch (err) {
      setError('Failed to load transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.providerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.serviceName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || transaction.paymentStatus === filterStatus;
    const matchesType = filterType === 'all' || transaction.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'refunded':
        return 'bg-red-100 text-red-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getBookingStatusColor = (status) => {
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

  const handleReleasePayment = async (bookingId) => {
    if (!confirm('Are you sure you want to release this payment to the provider?')) {
      return;
    }

    try {
      setReleasing(true);
      setReleasingId(bookingId);
      setError('');
      const token = getAdminToken();
      
      const response = await fetch('/api/admin/payments/release', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingIds: [bookingId]
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Payment released successfully! Amount: ${formatCurrency(data.releasedPayments[0]?.amount || 0)}`);
        fetchTransactions(); // Refresh the list
      } else {
        setError(data.message || 'Failed to release payment');
      }
    } catch (err) {
      console.error('Error releasing payment:', err);
      setError('Failed to release payment');
    } finally {
      setReleasing(false);
      setReleasingId(null);
    }
  };

  const handleReleaseAllEligible = async () => {
    const eligibleIds = transactions
      .filter(t => t.eligibleForRelease)
      .map(t => t.id);

    if (eligibleIds.length === 0) {
      alert('No eligible payments to release');
      return;
    }

    if (!confirm(`Are you sure you want to release ${eligibleIds.length} payment(s)?`)) {
      return;
    }

    try {
      setReleasing(true);
      setError('');
      const token = getAdminToken();
      
      const response = await fetch('/api/admin/payments/release', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingIds: eligibleIds
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Released ${data.summary.totalReleased} payment(s) successfully! Total amount: ${formatCurrency(data.summary.totalAmountReleased)}`);
        fetchTransactions(); // Refresh the list
      } else {
        setError(data.message || 'Failed to release payments');
      }
    } catch (err) {
      console.error('Error releasing payments:', err);
      setError('Failed to release payments');
    } finally {
      setReleasing(false);
    }
  };

  const eligibleCount = transactions.filter(t => t.eligibleForRelease).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FiLoader className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment & Revenue</h1>
          <p className="text-gray-600 mt-1">View all transactions and admin earnings</p>
        </div>
        <button 
          onClick={fetchTransactions}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Total Revenue</p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  {formatCurrency(summary.totalRevenue)}
                </p>
                <p className="text-xs text-green-700 mt-1">(Including tax)</p>
              </div>
              <div className="bg-green-500 rounded-full p-3">
                <FiTrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl shadow-sm border border-purple-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Total Tax</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">
                  {formatCurrency(summary.totalTax || 0)}
                </p>
              </div>
              <div className="bg-purple-500 rounded-full p-3">
                <FiDollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Admin Commission</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">
                  {formatCurrency(summary.totalAdminCommission)}
                </p>
                <p className="text-xs text-blue-700 mt-1">({commissionRate}% rate)</p>
              </div>
              <div className="bg-blue-500 rounded-full p-3">
                <FiDollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm border border-red-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Total Refunds</p>
                <p className="text-3xl font-bold text-red-900 mt-2">
                  {formatCurrency(summary.totalRefunds)}
                </p>
              </div>
              <div className="bg-red-500 rounded-full p-3">
                <FiTrendingDown className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Completed Jobs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{summary.completedBookings}</p>
              </div>
              <div className="bg-gray-500 rounded-full p-3">
                <FiCheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Release Payments Banner */}
      {eligibleCount > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="w-6 h-6 text-yellow-600" />
            <div>
              <p className="font-semibold text-yellow-900">
                {eligibleCount} payment(s) ready to be released
              </p>
              <p className="text-sm text-yellow-700">
                Payments completed 7+ days ago can now be released to providers
              </p>
            </div>
          </div>
          <button
            onClick={handleReleaseAllEligible}
            disabled={releasing}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {releasing ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                Releasing...
              </>
            ) : (
              <>
                <FiSend className="w-4 h-4" />
                Release All Eligible
              </>
            )}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by transaction ID, client, provider, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FiFilter className="text-gray-600 w-5 h-5" />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm font-medium transition-all cursor-pointer"
            >
              <option value="all">All Payment Status</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm font-medium transition-all cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="booking">Booking</option>
              <option value="refund">Refund</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <FiDollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Booking Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Admin Commission</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Provider Earnings</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Released At</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Review</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">#{transaction.id?.slice(-8) || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        transaction.type === 'booking' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            {transaction.clientName?.charAt(0).toUpperCase() || 'C'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{transaction.clientName}</div>
                          {transaction.clientEmail && (
                            <div className="text-xs text-gray-500">{transaction.clientEmail}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-300 to-blue-400 flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            {transaction.providerName?.charAt(0).toUpperCase() || 'P'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{transaction.providerName}</div>
                          {transaction.providerEmail && (
                            <div className="text-xs text-gray-500">{transaction.providerEmail}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-lg">
                        {transaction.serviceName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-700">
                        {formatCurrency(transaction.baseAmount || transaction.bookingAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-purple-700">
                        {formatCurrency(transaction.taxAmount || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold ${
                        transaction.type === 'refund' ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {transaction.type === 'refund' ? '-' : ''}{formatCurrency(transaction.bookingAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-blue-900">
                        {formatCurrency(transaction.adminCommission)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-700">
                        {formatCurrency(transaction.providerEarnings)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.paymentStatus)}`}>
                        {transaction.paymentStatus}
                      </span>
                      <div className="mt-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getBookingStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.paymentReleasedAt ? (
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center gap-1 mb-1">
                            <FiCalendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>{formatDate(transaction.paymentReleasedAt).split(',')[0]}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <FiClock className="w-3 h-3 text-gray-400" />
                            <span>{formatDate(transaction.paymentReleasedAt).split(',')[1]?.trim()}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not released</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {transaction.rating ? (
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                className={`w-3 h-3 ${
                                  i < transaction.rating
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-xs text-gray-600 ml-1">{transaction.rating}/5</span>
                          </div>
                          {transaction.review && (
                            <p className="text-xs text-gray-600 italic mt-1 max-w-xs truncate">
                              "{transaction.review}"
                            </p>
                          )}
                          {transaction.ratedAt && (
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(transaction.ratedAt)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No review</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.eligibleForRelease ? (
                        <button
                          onClick={() => handleReleasePayment(transaction.id)}
                          disabled={releasing && releasingId === transaction.id}
                          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          {releasing && releasingId === transaction.id ? (
                            <>
                              <FiLoader className="w-3 h-3 animate-spin" />
                              Releasing...
                            </>
                          ) : (
                            <>
                              <FiSend className="w-3 h-3" />
                              Release Payment
                            </>
                          )}
                        </button>
                      ) : transaction.isPaymentReleased ? (
                        <span className="text-xs text-green-600 font-medium">Released</span>
                      ) : transaction.status === 'completed' && transaction.paymentStatus === 'paid' ? (
                        <span className="text-xs text-yellow-600 font-medium">Waiting period</span>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
