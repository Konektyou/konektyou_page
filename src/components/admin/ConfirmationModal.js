'use client';

import { Fragment } from 'react';
import { FiAlertCircle, FiX } from 'react-icons/fi';

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonColor = 'bg-black',
  icon: Icon = FiAlertCircle,
  iconColor = 'text-red-500'
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              iconColor.includes('red') ? 'bg-red-100' :
              iconColor.includes('blue') ? 'bg-blue-100' :
              iconColor.includes('green') ? 'bg-green-100' :
              iconColor.includes('yellow') ? 'bg-yellow-100' :
              iconColor.includes('orange') ? 'bg-orange-100' :
              'bg-gray-100'
            }`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-sm text-gray-600 text-center mb-6">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="cursor-pointer flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`cursor-pointer flex-1 px-4 py-2 ${confirmButtonColor} text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

