import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard.jsx';
import { getAccountingSummary } from '../services/accounting';
import { Loader2, PlusCircle, DollarSign, TrendingUp, CheckCircle2, XCircle, X } from 'lucide-react';
import { supabase } from '../services/supabase';

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-white text-sm font-semibold ${type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
      {type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
      {message}
    </div>
  );
}

function AddRevenueModal({ onSave, onCancel }) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ amount: parseFloat(amount), entry_date: date, description });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">Add Revenue Entry</h2>
          <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Amount ($)</label>
            <input required type="number" step="0.01" min="0" value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="e.g. 4500.00" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Date</label>
            <input required type="date" value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Description (optional)</label>
            <input type="text" value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="e.g. Saturday night service" />
          </div>
          <div className="flex gap-4 pt-2">
            <button type="button" onClick={onCancel}
              className="flex-1 px-6 py-4 border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 px-6 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">
              Save Revenue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [user, setUser] = useState(null);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });
  const hideToast = () => setToast(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchSummary = async () => {
        setLoading(true);
        try {
          const data = await getAccountingSummary(user.id, period);
          setSummary(data);
        } catch (err) {
          showToast('Failed to load dashboard data.', 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchSummary();
    }
  }, [user, period]);

  const handleAddRevenue = async (formData) => {
    try {
      const { error } = await supabase.from('revenue_entries').insert([{
        ...formData,
        restaurant_id: user.id,
      }]);
      if (error) throw error;
      setShowRevenueModal(false);
      showToast('Revenue added successfully!', 'success');
      // Refresh summary
      const data = await getAccountingSummary(user.id, period);
      setSummary(data);
    } catch (err) {
      showToast('Failed to add revenue. Please try again.', 'error');
    }
  };

  if (loading && !summary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-12 max-w-7xl mx-auto space-y-12">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-gray-500 mt-2">Here's how your restaurant is performing this {period}.</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setShowRevenueModal(true)}
              className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> Add Revenue
            </button>
          </div>
        </header>

        {summary ? (
          <Dashboard summary={summary} period={period} setPeriod={setPeriod} />
        ) : (
          <div className="p-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No data yet</h3>
            <p className="text-gray-500 mt-2">Start scanning invoices to see your financial insights.</p>
          </div>
        )}
      </main>

      {showRevenueModal && (
        <AddRevenueModal onSave={handleAddRevenue} onCancel={() => setShowRevenueModal(false)} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
