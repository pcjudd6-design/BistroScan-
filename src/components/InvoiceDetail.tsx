import React from 'react';
import { X, Printer, Download, CheckCircle2, Clock, FileText } from 'lucide-react';
import { Invoice } from '../types';
import { format } from 'date-fns';

interface InvoiceDetailProps {
  invoice: Invoice;
  onClose: () => void;
  onStatusChange: (id: string, status: 'Pending' | 'Paid') => void;
}

export default function InvoiceDetail({ invoice, onClose, onStatusChange }: InvoiceDetailProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-black/5 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{invoice.vendorName}</h2>
              <p className="text-sm text-gray-500">Invoice #{invoice.invoiceNumber} • {format(new Date(invoice.date), 'MMMM dd, yyyy')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <Printer className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <Download className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Line Items</h3>
                <div className="space-y-4">
                  {invoice.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start py-3 border-b border-black/5 last:border-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.description}</p>
                        <p className="text-xs text-gray-500">{item.quantity} x ${item.unitPrice.toFixed(2)}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">${item.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span><span>${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span><span>${invoice.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-black/5">
                  <span>Total Amount</span><span>${invoice.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-900">Payment Status</span>
                </div>
                <select value={invoice.status}
                  onChange={(e) => onStatusChange(invoice.id, e.target.value as any)}
                  className="bg-white border border-emerald-200 text-sm font-semibold text-emerald-900 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Original Document</h3>
              <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden border border-black/5 shadow-inner flex items-center justify-center">
                {invoice.imageUrl ? (
                  <img src={invoice.imageUrl} alt="Invoice Document"
                    className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <FileText className="w-12 h-12 mb-2" />
                    <p className="text-sm">No image available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
