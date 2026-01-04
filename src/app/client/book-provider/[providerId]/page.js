'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { FiClock, FiMapPin, FiCalendar, FiLoader, FiArrowLeft, FiNavigation } from 'react-icons/fi';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getClientToken } from '@/lib/clientAuth';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51MAu7gI7BEvOC2zJHQ6bAypbKCS6wqdpfHsg6O4jSrKa1AbURh2ImaL2jLQsBQOWs5URL6lSZF87EmflygurzKFG00X5d2fGJ6');

function CheckoutForm({ bookingData, provider, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      
      // Create payment intent
      const response = await fetch('/api/client/create-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getClientToken()}`
        },
        body: JSON.stringify({
          ...bookingData,
          providerId: provider.id,
          baseAmount: bookingData.baseAmount, // Provider's base price (before tax)
          amount: bookingData.amount // Total amount including tax
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to create booking');
      }

      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: bookingData.clientName || 'Client'
            }
          }
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        // Update booking payment status
        const updateResponse = await fetch('/api/client/create-booking', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getClientToken()}`
          },
          body: JSON.stringify({
            bookingId: data.booking.id,
            paymentIntentId: paymentIntent.id,
            paymentStatus: 'succeeded'
          })
        });

        const updateData = await updateResponse.json();
        
        if (updateData.success) {
          onSuccess(data.booking);
        } else {
          throw new Error(updateData.message || 'Failed to confirm booking');
        }
      } else {
        throw new Error('Payment was not successful');
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
      onError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="p-4 border border-gray-300 rounded-lg bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <FiLoader className="w-4 h-4 animate-spin" />
            Processing Payment...
          </span>
        ) : (
          `Pay $${bookingData.amount.toFixed(2)}`
        )}
      </button>
    </form>
  );
}

export default function BookProviderPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const providerId = params.providerId;
  const serviceIdFromUrl = searchParams?.get('serviceId') || null;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [error, setError] = useState('');
  const [taxRate, setTaxRate] = useState(13); // Default 13% for Canada
  const [locationLoading, setLocationLoading] = useState(false);
  
  const [bookingData, setBookingData] = useState({
    duration: 2, // hours
    startDateTime: '',
    workLocation: {
      address: '',
      city: '',
      province: '',
      postalCode: ''
    },
    clientName: '',
    serviceId: serviceIdFromUrl
  });

  useEffect(() => {
    fetchProvider();
    fetchTaxRate();
    const clientAuth = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('clientAuth') || '{}') : null;
    if (clientAuth?.client?.name) {
      setBookingData(prev => ({ ...prev, clientName: clientAuth.client.name }));
    }
  }, [providerId]);

  const fetchTaxRate = async () => {
    try {
      // Fetch tax rate from public API endpoint
      const response = await fetch('/api/public/tax-rate');
      const data = await response.json();
      if (data.success && data.taxRate) {
        setTaxRate(data.taxRate);
      }
    } catch (err) {
      console.error('Error fetching tax rate:', err);
      // Use default 13% if fetch fails
    }
  };

  const fetchProvider = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/client/providers');
      const data = await response.json();

      if (data.success) {
        const foundProvider = data.providers.find(p => p.id === providerId);
        if (foundProvider) {
          setProvider(foundProvider);
          
          // Set selected service if serviceId is provided
          if (serviceIdFromUrl && foundProvider.services) {
            const service = foundProvider.services.find(s => s.id === serviceIdFromUrl);
            if (service) {
              setSelectedService(service);
              setBookingData(prev => ({ ...prev, serviceId: serviceIdFromUrl }));
            }
          } else if (foundProvider.services && foundProvider.services.length > 0) {
            // Default to first service if no serviceId provided
            setSelectedService(foundProvider.services[0]);
            setBookingData(prev => ({ ...prev, serviceId: foundProvider.services[0].id }));
          }
        } else {
          setError('Provider not found');
        }
      } else {
        setError('Failed to load provider details');
      }
    } catch (err) {
      setError('Failed to load provider details');
      console.error('Error fetching provider:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate booking amounts
  // baseAmount = provider's set price (before tax)
  // taxAmount = baseAmount × taxRate
  // totalAmount = baseAmount + taxAmount (what client pays)
  const calculateAmounts = () => {
    if (!selectedService) return { baseAmount: 0, taxAmount: 0, totalAmount: 0 };
    
    const baseAmount = selectedService.basePrice * bookingData.duration;
    const taxAmount = baseAmount * (taxRate / 100);
    const totalAmount = baseAmount + taxAmount;
    
    return { baseAmount, taxAmount, totalAmount };
  };

  const calculateAmount = () => {
    return calculateAmounts().totalAmount;
  };

  const handleContinue = () => {
    if (step === 1) {
      // Validate step 1
      if (!bookingData.duration || bookingData.duration < 0.5) {
        setError('Please enter a valid duration (minimum 0.5 hours)');
        return;
      }
      if (!bookingData.startDateTime) {
        setError('Please select a start date and time');
        return;
      }
      const startDate = new Date(bookingData.startDateTime);
      if (startDate < new Date()) {
        setError('Start time must be in the future');
        return;
      }
      setError('');
      setStep(2);
    } else if (step === 2) {
      // Validate step 2
      if (!bookingData.workLocation.address || !bookingData.workLocation.city || !bookingData.workLocation.province) {
        setError('Please fill in all required location fields');
        return;
      }
      setError('');
      setStep(3);
    }
  };

  const handleBookingSuccess = (booking) => {
    router.push(`/client/bookings?success=true&bookingId=${booking.id}&pending=true`);
  };

  const handleBookingError = (errorMessage) => {
    setError(errorMessage);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    setError('');

    const processLocation = async (latitude, longitude) => {
      try {
        // Reverse geocode to get address details
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch address data');
        }
        
        const data = await response.json();
        
        console.log('Reverse geocoding response:', data);
        
        if (data && data.address) {
          const address = data.address;
          
          // Extract address components - handle different response formats
          let streetAddress = '';
          
          // Try different combinations for street address
          if (address.house_number && address.road) {
            streetAddress = `${address.house_number} ${address.road}`;
          } else if (address.road) {
            streetAddress = address.road;
          } else if (address.street) {
            streetAddress = address.street;
          } else {
            // For areas without specific street names, use neighbourhood/suburb
            const addressParts = [];
            if (address.neighbourhood) addressParts.push(address.neighbourhood);
            if (address.suburb && address.suburb !== address.neighbourhood) {
              addressParts.push(address.suburb);
            }
            if (addressParts.length > 0) {
              streetAddress = addressParts.join(', ');
            } else if (data.display_name) {
              // Fallback to first part of display_name
              const parts = data.display_name.split(',');
              streetAddress = parts[0] || parts[1] || '';
            }
          }
          
          const city = address.city || address.town || address.village || address.municipality || address.subdistrict || '';
          const province = address.state || address.province || address.county || '';
          const postalCode = address.postcode || address.postal_code || '';
          
          console.log('Extracted values:', { streetAddress, city, province, postalCode });
          
          // Update form with fetched location data
          setBookingData(prev => ({
            ...prev,
            workLocation: {
              address: streetAddress.trim() || '',
              city: city.trim() || '',
              province: province.trim() || '',
              postalCode: postalCode.trim() || ''
            }
          }));
          
          setError('');
        } else {
          setError('Could not determine address from location. Please enter manually.');
        }
      } catch (geoError) {
        console.error('Reverse geocoding error:', geoError);
        setError('Could not determine address from location. Please enter manually.');
      } finally {
        setLocationLoading(false);
      }
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        processLocation(latitude, longitude);
      },
      (err) => {
        console.error('Location error:', err);
        let errorMessage = 'Unable to get your location. Please enter manually.';
        if (err.code === err.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied. Please allow location access and try again.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information unavailable. Please enter manually.';
        } else if (err.code === err.TIMEOUT) {
          errorMessage = 'Location request timed out. Please try again.';
        }
        setError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FiLoader className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error && !provider) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          Go Back
        </button>
      </div>
    );
  }

  const amount = calculateAmount();
  const endTime = bookingData.startDateTime 
    ? new Date(new Date(bookingData.startDateTime).getTime() + bookingData.duration * 60 * 60 * 1000)
    : null;

  return (
    <div className="max-w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Book Service</h1>
          <p className="text-gray-600 mt-1">{provider?.name} • {selectedService?.name || 'Service'}</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step >= s ? 'bg-black border-black text-white' : 'border-gray-300 text-gray-400'
            }`}>
              {s}
            </div>
            {s < 3 && (
              <div className={`flex-1 h-1 mx-2 ${
                step > s ? 'bg-black' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && step < 3 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Step 1: Time Selection */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Select Time & Duration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (Hours)
                </label>
                <div className="flex items-center gap-2">
                  <FiClock className="text-gray-400" />
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={bookingData.duration}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0.5;
                      setBookingData({ ...bookingData, duration: value });
                      setError('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <span className="text-gray-600">hours</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date & Time
                </label>
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-gray-400" />
                  <input
                    type="datetime-local"
                    value={bookingData.startDateTime}
                    onChange={(e) => {
                      setBookingData({ ...bookingData, startDateTime: e.target.value });
                      setError('');
                    }}
                    min={new Date().toISOString().slice(0, 16)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                {endTime && (
                  <p className="text-sm text-gray-500 mt-2">
                    End Time: {endTime.toLocaleString()}
                  </p>
                )}
              </div>

              {amount > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Estimated Amount</p>
                  <p className="text-2xl font-bold text-gray-900">${amount.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Work Location */}
      {step === 2 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Confirm Work Location</h2>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locationLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {locationLoading ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <FiNavigation className="w-4 h-4" />
                    Use My Current Location
                  </>
                )}
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <FiMapPin className="text-gray-400" />
                  <input
                    type="text"
                    value={bookingData.workLocation.address}
                    onChange={(e) => {
                      setBookingData({
                        ...bookingData,
                        workLocation: { ...bookingData.workLocation, address: e.target.value }
                      });
                      setError('');
                    }}
                    placeholder="Street address"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bookingData.workLocation.city}
                    onChange={(e) => {
                      setBookingData({
                        ...bookingData,
                        workLocation: { ...bookingData.workLocation, city: e.target.value }
                      });
                      setError('');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Province <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bookingData.workLocation.province}
                    onChange={(e) => {
                      setBookingData({
                        ...bookingData,
                        workLocation: { ...bookingData.workLocation, province: e.target.value }
                      });
                      setError('');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={bookingData.workLocation.postalCode}
                  onChange={(e) => {
                    setBookingData({
                      ...bookingData,
                      workLocation: { ...bookingData.workLocation, postalCode: e.target.value }
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Back
            </button>
            <button
              onClick={handleContinue}
              className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment</h2>
            
            {/* Booking Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Provider:</span>
                <span className="font-medium">{provider?.name}</span>
              </div>
              {selectedService && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{selectedService.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{bookingData.duration} hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Start Time:</span>
                <span className="font-medium">{new Date(bookingData.startDateTime).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium text-right">{bookingData.workLocation.address}, {bookingData.workLocation.city}</span>
              </div>
              {(() => {
                const amounts = calculateAmounts();
                return (
                  <>
                    <div className="flex justify-between pt-2 border-t border-gray-300">
                      <span className="text-gray-600">Service Price:</span>
                      <span className="font-medium">${amounts.baseAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax ({taxRate}%):</span>
                      <span className="font-medium">${amounts.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t-2 border-gray-400">
                      <span className="text-lg font-bold">Total:</span>
                      <span className="text-lg font-bold">${amounts.totalAmount.toFixed(2)}</span>
                    </div>
                  </>
                );
              })()}
            </div>

            <Elements stripe={stripePromise}>
              <CheckoutForm
                bookingData={{
                  ...bookingData,
                  baseAmount: calculateAmounts().baseAmount,
                  amount: calculateAmounts().totalAmount,
                  endTime: endTime.toISOString()
                }}
                provider={provider}
                onSuccess={handleBookingSuccess}
                onError={handleBookingError}
              />
            </Elements>

            <button
              onClick={() => setStep(2)}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

