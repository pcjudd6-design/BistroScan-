import React, { useState } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';

export default function ManualInvoiceForm({ restaurantId, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    vendor_name: '',
    invoice_date: new Date().toISOString().split('T')[0],
    total_amount: 0,
    tax_amount: 0,
    category: 'Food',
    line_items: [{ description: '', quantity: 1, unit_price: 0, total: 0 }]
  });

  const categories = ['Food', 'Beverage', 'Supplies', 'Utilities', 'Labor', 'Other'];

  const handleAddItem = () => {
    setFormData({
      ...formData,
      line_items: [...formData.line_items, { description: '', quantity: 1, unit_price: 0, total: 0 }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.line_items.filter((_, i) => i !== index);
    setFormData({ ...formData, line_items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.line_items];
    newItems[index][field] = value;
    
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total = newItems[index].quantity * newItems[index].unit_price;
    }
    
    const newTotal = newItems.reduce((sum, item) => sum + item.total, 0);
    setFormData({ ...formData, line_items: newItems, total_amount: newTotal });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      restaurant_id: restaurantId,
      ai_provider: 'manual',
      status: 'auto-approved',
      ai_confidence: 100
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">Manual Invoice Entry</h2>
          <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Vendor Name</label>
              <input 
                required
                type="text" 
                value={formData.vendor_name}
                onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. Sysco Food Services"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Invoice Date</label>
              <input 
                required
                type="date" 
                value={formData.invoice_date}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Tax Amount</label>
              <input 
                type="number" 
                step="0.01"
                value={formData.tax_amount}
                onChange={(e) => setFormData({ ...formData, tax_amount: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Line Items</h3>
              <button 
                type="button"
                onClick={handleAddItem}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-bold flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {formData.line_items.map((item, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <div className="flex-1 space-y-1">
                    <input 
                      required
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="w-20 space-y-1">
                    <input 
                      required
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <input 
                      required
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-emerald-50 rounded-2xl flex justify-between items-center">
            <span className="text-emerald-900 font-bold">Total Amount</span>
            <span className="text-2xl font-bold text-emerald-900">${formData.total_amount.toFixed(2)}</span>
          </div>

          <div className="flex gap-4">
            <button 
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-4 border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-6 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" /> Save Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
