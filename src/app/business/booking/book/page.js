'use client';

import { FiCalendar, FiClock, FiMapPin, FiUser, FiSearch, FiCheckCircle } from 'react-icons/fi';
import { useState } from 'react';

export default function BookService() {
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [serviceType, setServiceType] = useState('');

  const availableProviders = [
    {
      id: 1,
      name: 'John Smith',
      service: 'PSW',
      rating: 4.8,
      price: 40,
      available: true
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      service: 'Office Support',
      rating: 4.9,
      price: 50,
      available: true
    },
  ];

  const timeSlots = [
    '8:00 AM - 12:00 PM',
    '12:00 PM - 4:00 PM',
    '4:00 PM - 8:00 PM',
    'Full Day (8:00 AM - 8:00 PM)'
  ];

  const handleBook = () => {
    if (!selectedProvider || !selectedDate || !selectedTime) {
      alert('Please fill in all required fields');
      return;
    }
    // Handle booking logic
    console.log('Booking:', { selectedProvider, selectedDate, selectedTime });
    alert('Booking request submitted successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Book Service Provider</h1>
        <p className="text-gray-600 mt-1">Book on-demand service providers for your business needs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Type */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Service Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type *
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">Select service type</option>
                  <option value="psw">PSW</option>
                  <option value="office">Office Support</option>
                  <option value="cleaning">Cleaning</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Slot *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedTime === slot
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Select Provider */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Select Provider</h2>
            <div className="space-y-3">
              {availableProviders.map((provider) => (
                <div
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedProvider === provider.id
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                        <FiUser className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{provider.name}</h3>
                        <p className="text-sm text-gray-600">{provider.service}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${provider.price}/hr</p>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <span>★</span>
                        <span>{provider.rating}</span>
                      </div>
                    </div>
                  </div>
                  {selectedProvider === provider.id && (
                    <div className="mt-3 flex items-center gap-2 text-green-600">
                      <FiCheckCircle className="w-4 h-4" />
                      <span className="text-sm">Selected</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Summary</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Service Type</p>
                <p className="font-medium text-gray-900">{serviceType || 'Not selected'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium text-gray-900">{selectedDate || 'Not selected'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-medium text-gray-900">{selectedTime || 'Not selected'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Provider</p>
                <p className="font-medium text-gray-900">
                  {selectedProvider ? availableProviders.find(p => p.id === selectedProvider)?.name : 'Not selected'}
                </p>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Estimated Cost</span>
                  <span className="font-bold text-gray-900">
                    ${selectedProvider && selectedTime ? 
                      (availableProviders.find(p => p.id === selectedProvider)?.price * 
                       (selectedTime.includes('Full Day') ? 12 : 4)).toFixed(2) 
                      : '0.00'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleBook}
                disabled={!selectedProvider || !selectedDate || !selectedTime}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  selectedProvider && selectedDate && selectedTime
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

