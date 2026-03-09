import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import InvoiceUpload from '../components/InvoiceUpload';
import InvoiceTable from '../components/InvoiceTable';
import ScanQueue from '../components/ScanQueue';
import ManualInvoiceForm from '../components/ManualInvoiceForm';
import { supabase } from '../services/supabase';
import { Loader2, PlusCircle, FileText, Search, Filter } from 'lucide-react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showManualForm, setShowManualForm] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch invoices
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('restaurant_id', user.id)
        .order('invoice_date', { ascending: false });

      if (invoiceError) throw invoiceError;
      setInvoices(invoiceData);

      // Fetch scan queue
      const { data: queueData, error: queueError } = await supabase
        .from('scan_queue')
        .select('*')
        .eq('restaurant_id', user.id)
        .eq('status', 'failed');

      if (queueError) throw queueError;
      setQueue(queueData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleManualSave = async (formData) => {
    try {
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([formData])
        .select()
        .single();

      if (invoiceError) throw invoiceError;
      
      // Save line items
      if (formData.line_items && formData.line_items.length > 0) {
        const lineItems = formData.line_items.map(item => ({
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total
        }));

        const { error: itemsError } = await supabase
          .from('line_items')
          .insert(lineItems);

        if (itemsError) throw itemsError;
      }

      setShowManualForm(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQueue = async (id) => {
    try {
      const { error } = await supabase.from('scan_queue').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-12 max-w-7xl mx-auto space-y-12">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-500 mt-2">Upload and manage your restaurant's expenses.</p>
          </div>
          <button 
            onClick={() => setShowManualForm(true)}
            className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Manual Entry
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ScanQueue 
              queue={queue} 
              onRetry={(item) => alert('Retrying scan...')} 
              onDelete={handleDeleteQueue} 
            />
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search invoices, vendors, categories..." 
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
              <button className="p-3 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-all">
                <Filter className="w-5 h-5" />
              </button>
            </div>

            {loading ? (
              <div className="p-20 flex justify-center">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
              </div>
            ) : (
              <InvoiceTable invoices={invoices} onDelete={handleDeleteInvoice} />
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-emerald-600 p-8 rounded-3xl text-white shadow-xl shadow-emerald-200">
              <h3 className="text-xl font-bold mb-2">Smart Scan</h3>
              <p className="text-emerald-100 text-sm mb-6">Upload a photo and our AI will automatically extract all items and totals.</p>
              <InvoiceUpload restaurantId={user?.id} onComplete={fetchData} />
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 space-y-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Need Help?</h3>
              <p className="text-sm text-gray-500">If the AI makes a mistake, you can always edit the invoice manually or flag it for review.</p>
              <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700">View Tutorial</button>
            </div>
          </div>
        </div>

        {showManualForm && (
          <ManualInvoiceForm 
            restaurantId={user?.id} 
            onSave={handleManualSave} 
            onCancel={() => setShowManualForm(false)} 
          />
        )}
      </main>
    </div>
  );
}
