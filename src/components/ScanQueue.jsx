import React from 'react';
import { RefreshCw, AlertCircle, Trash2 } from 'lucide-react';

export default function ScanQueue({ queue, onRetry, onDelete }) {
  if (!queue || queue.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900">Scan Queue</h3>
            <p className="text-sm text-amber-700">{queue.length} invoices waiting for retry</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {queue.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-xl border border-amber-200 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                <img src={item.image_url} alt="Queue item" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">
                  {item.error_message || 'Unknown error'}
                </p>
                <p className="text-xs text-gray-500">Queued on {new Date(item.created_at).toLocaleTimeString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onRetry(item)}
                className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
              <button 
                onClick={() => onDelete(item.id)}
                className="p-2 text-amber-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
