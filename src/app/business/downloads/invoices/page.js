'use client';

import { FiDownload, FiFileText, FiCalendar, FiDollarSign } from 'react-icons/fi';

export default function InvoicesPage() {
  const invoices = [
    {
      id: 'INV-2025-001',
      date: '2025-01-01',
      amount: 299.00,
      status: 'paid',
      description: 'Monthly Subscription - Basic Plan'
    },
    {
      id: 'INV-2025-002',
      date: '2024-12-01',
      amount: 299.00,
      status: 'paid',
      description: 'Monthly Subscription - Basic Plan'
    },
    {
      id: 'INV-2024-011',
      date: '2024-11-01',
      amount: 299.00,
      status: 'paid',
      description: 'Monthly Subscription - Basic Plan'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-600 mt-1">Download and view your invoices</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Invoice ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Description</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">{invoice.id}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{invoice.date}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{invoice.description}</td>
                  <td className="py-4 px-4 text-sm font-bold text-gray-900">${invoice.amount.toFixed(2)}</td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <FiDownload className="w-4 h-4" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

