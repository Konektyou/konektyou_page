'use client';

import { FiUpload, FiFile, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { useState } from 'react';

export default function BusinessVerificationDocuments() {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      type: 'Business License',
      status: 'approved',
      uploadedAt: '2025-01-10',
      file: 'business_license.pdf'
    },
    {
      id: 2,
      type: 'Tax ID / Business Number',
      status: 'pending',
      uploadedAt: '2025-01-12',
      file: 'tax_id.pdf'
    },
    {
      id: 3,
      type: 'Insurance Certificate',
      status: 'rejected',
      uploadedAt: '2025-01-08',
      file: 'insurance.pdf',
      rejectionReason: 'Certificate expired. Please upload a valid certificate.'
    },
  ]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <FiCheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <FiXCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FiAlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Verification Documents</h1>
        <p className="text-gray-600 mt-1">Upload and manage your business verification documents</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Upload New Document</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Drag and drop your document here, or click to browse</p>
          <p className="text-sm text-gray-500 mb-4">Supported formats: PDF, JPG, PNG (Max 5MB)</p>
          <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
            Select File
          </button>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Uploaded Documents</h2>
        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <FiFile className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{doc.type}</h3>
                    <p className="text-sm text-gray-500 mt-1">File: {doc.file}</p>
                    <p className="text-sm text-gray-500">Uploaded: {doc.uploadedAt}</p>
                    {doc.rejectionReason && (
                      <p className="text-sm text-red-600 mt-2">{doc.rejectionReason}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(doc.status)}
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(doc.status)}`}>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                  </div>
                  {doc.status === 'rejected' && (
                    <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                      Re-upload
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Requirements Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-medium text-blue-900 mb-2">Document Requirements</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Valid business license or registration certificate</li>
          <li>• Tax ID or Business Number (CRA Business Number for Canadian businesses)</li>
          <li>• Insurance certificate (liability insurance)</li>
          <li>• All documents must be clear, legible, and valid</li>
        </ul>
      </div>
    </div>
  );
}

