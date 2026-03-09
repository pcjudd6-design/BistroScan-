import React, { useState, useRef } from 'react';
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { extractInvoiceData } from '../services/gemini';
import { Invoice } from '../types';
import { cn } from '../lib/utils';

interface InvoiceUploadProps {
  onUploadComplete: (invoice: Invoice) => void;
}

export default function InvoiceUpload({ onUploadComplete }: InvoiceUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image of the invoice (JPEG, PNG).');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        try {
          const data = await extractInvoiceData(base64);
          
          const newInvoice: Invoice = {
            id: Math.random().toString(36).substr(2, 9),
            vendorName: data.vendorName || 'Unknown Vendor',
            invoiceNumber: data.invoiceNumber || 'N/A',
            date: data.date || new Date().toISOString().split('T')[0],
            category: (data.category as any) || 'Other',
            items: data.items || [],
            subtotal: data.subtotal || 0,
            tax: data.tax || 0,
            totalAmount: data.totalAmount || 0,
            status: 'Pending',
            imageUrl: base64
          };
          
          onUploadComplete(newInvoice);
        } catch (err) {
          setError('AI processing failed. Please try again or enter manually.');
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to read file.');
      setIsProcessing(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-black/5">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer",
          isDragging ? "border-emerald-500 bg-emerald-50/50" : "border-gray-200 hover:border-emerald-400 hover:bg-gray-50",
          isProcessing && "pointer-events-none opacity-60"
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
          accept="image/*"
        />

        {isProcessing ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-900">AI is analyzing your invoice...</p>
            <p className="text-sm text-gray-500 mt-1">Extracting items, prices, and vendor details</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="text-lg font-medium text-gray-900">Drop your invoice here</p>
            <p className="text-sm text-gray-500 mt-1">or click to browse files (JPEG, PNG)</p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 rounded-xl flex items-start gap-3 text-red-700 border border-red-100">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex gap-4 items-center">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Auto-Extraction</p>
            <p className="text-xs text-gray-500 text-balance">Gemini AI reads items and totals automatically.</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Smart Categorization</p>
            <p className="text-xs text-gray-500 text-balance">Invoices are sorted into Food, Beverage, and more.</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Loader2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Real-time Insights</p>
            <p className="text-xs text-gray-500 text-balance">Instantly see how new costs affect your profit.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
