import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import { getAccountingSummary } from '../services/accounting';
import { Loader2, PlusCircle, DollarSign, TrendingUp } from 'lucide-react';
import { supabase } from '../services/supabase';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [user, setUser] = useState(null);

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
          // In a real app, get restaurant_id from user metadata
          const data = await getAccountingSummary(user.id, period);
          setSummary(data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchSummary();
    }
  }, [user, period]);

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
            <button className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Add Revenue
            </button>
            <button className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              New Scan
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
    </div>
  );
}
