'use client';

import { useState } from 'react';
import { FiSearch, FiCheck, FiX, FiEye, FiDownload, FiFile } from 'react-icons/fi';

export default function DocumentVerificationPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const documents = [
    {
      id: 1,
      provider: 'John Doe',
      documentType: 'ID',
      status: 'pending',
      uploadedAt: '2024-01-20',
      expiryDate: '2025-12-31'
    },
    {
      id: 2,
      provider: 'Jane Smith',
      documentType: 'Certification',
      status: 'approved',
      uploadedAt: '2024-01-15',
      expiryDate: '2026-06-30'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Document Verification</h1>
        <p className="text-gray-600 mt-1">Verify service provider documents and certifications</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 text-center text-gray-500">
          <FiFile className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Document verification queue will be displayed here</p>
          <p className="text-sm mt-2">Currently showing {documents.length} document(s) pending review</p>
        </div>
      </div>
    </div>
  );
}

