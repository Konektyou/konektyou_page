'use client';

import { FiCheckCircle, FiCircle, FiAlertCircle } from 'react-icons/fi';

export default function BusinessOnboardingStatus() {
  const steps = [
    {
      id: 1,
      title: 'Account Created',
      description: 'Your business account has been created',
      status: 'completed',
      completedAt: '2025-01-05'
    },
    {
      id: 2,
      title: 'Business Information',
      description: 'Complete your business profile details',
      status: 'completed',
      completedAt: '2025-01-06'
    },
    {
      id: 3,
      title: 'Upload Documents',
      description: 'Upload verification documents (Business License, Tax ID, Insurance)',
      status: 'in-progress',
      progress: 2,
      total: 3
    },
    {
      id: 4,
      title: 'Admin Verification',
      description: 'Wait for admin approval of your documents',
      status: 'pending'
    },
    {
      id: 5,
      title: 'Subscribe to Service',
      description: 'Subscribe to a plan to start booking providers',
      status: 'pending'
    },
    {
      id: 6,
      title: 'Sign Waiver',
      description: 'Accept business waiver requirements',
      status: 'pending'
    },
    {
      id: 7,
      title: 'Account Activated',
      description: 'Your account will be activated after all steps are complete',
      status: 'pending'
    },
  ];

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="w-6 h-6 text-green-600" />;
      case 'in-progress':
        return <FiAlertCircle className="w-6 h-6 text-yellow-600" />;
      default:
        return <FiCircle className="w-6 h-6 text-gray-300" />;
    }
  };

  const getStepLine = (status) => {
    if (status === 'completed') {
      return 'bg-green-600';
    }
    return 'bg-gray-200';
  };

  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Onboarding Status</h1>
        <p className="text-gray-600 mt-1">Track your business onboarding progress</p>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Overall Progress</h2>
          <span className="text-2xl font-bold text-gray-900">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {completedSteps} of {steps.length} steps completed
        </p>
      </div>

      {/* Steps Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Onboarding Steps</h2>
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex gap-4">
              {/* Icon & Line */}
              <div className="flex flex-col items-center">
                <div className={`${step.status === 'completed' ? 'bg-green-100' : step.status === 'in-progress' ? 'bg-yellow-100' : 'bg-gray-100'} p-2 rounded-full`}>
                  {getStepIcon(step.status)}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-0.5 h-full min-h-[60px] mt-2 ${getStepLine(step.status)}`}></div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`font-medium ${step.status === 'completed' ? 'text-gray-900' : step.status === 'in-progress' ? 'text-yellow-900' : 'text-gray-500'}`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    {step.status === 'completed' && step.completedAt && (
                      <p className="text-xs text-gray-500 mt-1">Completed on {step.completedAt}</p>
                    )}
                    {step.status === 'in-progress' && step.progress && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 mb-1">
                          {step.progress} of {step.total} documents uploaded
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-600 h-2 rounded-full"
                            style={{ width: `${(step.progress / step.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  {step.status === 'in-progress' && (
                    <a
                      href="/business/verification/documents"
                      className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Continue
                    </a>
                  )}
                  {step.status === 'pending' && (
                    <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-medium text-blue-900 mb-2">Need Help?</h3>
        <p className="text-sm text-blue-800 mb-3">
          If you have questions about any onboarding step, please contact our support team.
        </p>
        <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Contact Support
        </button>
      </div>
    </div>
  );
}

