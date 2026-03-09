import React, { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { scanInvoice } from '../services/invoiceScanner';

export default function InvoiceUpload({ restaurantId, onComplete }) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target.result;
        try {
          const result = await scanInvoice(base64, restaurantId);
          if (result.status === 'success') {
            onComplete(result.invoice);
          } else if (result.status === 'queued') {
            setError('AI failed, but invoice was queued for manual review.');
          }
        } catch (err) {
          setError('Failed to scan invoice. Please try again or enter manually.');
        } finally {
          setIsScanning(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Error reading file.');
      setIsScanning(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div 
        onClick={() => !isScanning && fileInputRef.current.click()}
        className={`
          border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer
          ${isScanning ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50'}
        `}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*,application/pdf"
        />
        
        {isScanning ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">AI is scanning your invoice...</p>
              <p className="text-sm text-gray-500">Extracting items, taxes, and totals</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <Upload className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">Upload Invoice</p>
              <p className="text-sm text-gray-500">Drop a photo or PDF here to scan</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-6 p-4 bg-amber-50 rounded-xl flex items-start gap-3 text-amber-800 border border-amber-100">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
