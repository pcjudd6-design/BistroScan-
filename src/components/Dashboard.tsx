import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { Invoice, ProfitLossData } from '../types';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface DashboardProps {
  invoices: Invoice[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];

export default function Dashboard({ invoices }: DashboardProps) {
  // Calculate category breakdown
  const categoryData = invoices.reduce((acc: any[], invoice) => {
    const existing = acc.find(item => item.name === invoice.category);
    if (existing) {
      existing.value += invoice.totalAmount;
    } else {
      acc.push({ name: invoice.category, value: invoice.totalAmount });
    }
    return acc;
  }, []);

  // Calculate monthly spending
  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const date = subMonths(new Date(), i);
    const monthStr = format(date, 'MMM');
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    
    const monthlyExpenses = invoices
      .filter(inv => isWithinInterval(new Date(inv.date), { start, end }))
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    return {
      month: monthStr,
      expenses: monthlyExpenses,
      // Mock revenue for P&L visualization
      revenue: monthlyExpenses * 1.4, 
      profit: (monthlyExpenses * 1.4) - monthlyExpenses
    };
  }).reverse();

  const totalExpenses = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const avgInvoice = invoices.length > 0 ? totalExpenses / invoices.length : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Expenses (YTD)</p>
          <p className="text-3xl font-bold mt-1 text-gray-900">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avg. Invoice Amount</p>
          <p className="text-3xl font-bold mt-1 text-gray-900">${avgInvoice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Invoices</p>
          <p className="text-3xl font-bold mt-1 text-gray-900">{invoices.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Profit & Loss (Estimated)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last6Months}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="top" height={36}/>
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Spending by Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
