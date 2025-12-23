'use client';

import { FiAlertCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '@/components/admin/ConfirmationModal';

export default function BusinessWaiver() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);

  const waiverRequirements = [
    {
      title: 'Talent is Independent Contractor',
      description: 'All service providers are independent contractors, not employees of your business.'
    },
    {
      title: 'First 30 Shifts Belong to Konektly',
      description: 'The first 30 shifts booked through the platform must be completed through Konektly. Direct hiring is not permitted during this period.'
    },
    {
      title: 'Business Cannot Hire Outside the Platform',
      description: 'You agree not to hire service providers directly outside of the Konektly platform for the duration of your subscription.'
    },
    {
      title: 'Must Provide Safe Environment',
      description: 'You must provide a safe working environment for all service providers and comply with all applicable health and safety regulations.'
    },
    {
      title: 'Payment Must Go Through Konektly',
      description: 'All payments for services must be processed through the Konektly platform. Direct payments to providers are not permitted.'
    },
    {
      title: 'No Direct Contracts',
      description: 'You agree not to enter into direct contracts or agreements with service providers outside of the Konektly platform.'
    },
  ];

  const handleAccept = () => {
    if (accepted) {
      // Save acceptance to database
      console.log('Waiver accepted');
      // Redirect or show success message
      router.push('/business/booking/catalog');
    }
  };

  const handleDecline = () => {
    setShowDeclineModal(true);
  };

  const confirmDecline = () => {
    setShowDeclineModal(false);
    // Handle decline - prevent booking access
    console.log('Waiver declined - booking access denied');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Business Waiver Requirements</h1>
        <p className="text-gray-600 mt-1">Please read and accept the following terms to continue booking services</p>
      </div>

      {/* Important Notice */}
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <FiAlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-900 mb-2">Important Notice</h3>
            <p className="text-sm text-red-800">
              You must accept all waiver requirements to book service providers through Konektly. 
              Declining these terms will prevent you from booking any services on the platform.
            </p>
          </div>
        </div>
      </div>

      {/* Waiver Requirements */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Waiver Requirements</h2>
        <div className="space-y-4">
          {waiverRequirements.map((requirement, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">{requirement.title}</h3>
                  <p className="text-sm text-gray-600">{requirement.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Acceptance Checkbox */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
          />
          <div>
            <p className="font-medium text-gray-900">
              I have read and agree to all the waiver requirements listed above
            </p>
            <p className="text-sm text-gray-600 mt-1">
              By checking this box, you acknowledge that you understand and agree to comply with all terms and conditions.
            </p>
          </div>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleAccept}
          disabled={!accepted}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
            accepted
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <FiCheckCircle className="w-5 h-5" />
            <span>Accept & Continue</span>
          </div>
        </button>
        <button
          onClick={handleDecline}
          className="px-6 py-3 border-2 border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FiXCircle className="w-5 h-5" />
            <span>Decline</span>
          </div>
        </button>
      </div>

      {/* Decline Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeclineModal}
        onClose={() => setShowDeclineModal(false)}
        onConfirm={confirmDecline}
        title="Decline Waiver Requirements"
        message="By declining the waiver requirements, you will not be able to book any service providers through Konektly. Are you sure you want to decline?"
        confirmText="Yes, Decline"
        cancelText="Cancel"
        confirmButtonColor="bg-red-600 hover:bg-red-700"
        icon={FiXCircle}
        iconColor="text-red-500"
      />
    </div>
  );
}

