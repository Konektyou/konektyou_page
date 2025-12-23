'use client';

import Link from 'next/link';
import { FiFileText, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

export default function BusinessVerificationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account & Verification</h1>
        <p className="text-gray-600 mt-1">Complete your business account verification</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/business/verification/documents"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiFileText className="w-6 h-6 text-blue-600" />
            </div>
            <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Documents</h3>
          <p className="text-gray-600 text-sm">
            Upload your business verification documents including license, tax ID, and insurance
          </p>
        </Link>

        <Link
          href="/business/verification/onboarding"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Onboarding Status</h3>
          <p className="text-gray-600 text-sm">
            Track your business onboarding progress and see which steps are completed
          </p>
        </Link>
      </div>
    </div>
  );
}

