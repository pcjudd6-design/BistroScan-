import { supabase } from './supabase';

export const getAccountingSummary = async (restaurantId, period = 'month') => {
  try {
    // 1. Get all revenue entries
    const { data: revenueEntries, error: revenueError } = await supabase
      .from('revenue_entries')
      .select('amount, entry_date')
      .eq('restaurant_id', restaurantId);

    if (revenueError) throw revenueError;

    // 2. Get all invoices (excluding rejected ones)
    const { data: invoices, error: invoiceError } = await supabase
      .from('invoices')
      .select('total_amount, invoice_date, category, ai_provider')
      .eq('restaurant_id', restaurantId)
      .neq('status', 'rejected');

    if (invoiceError) throw invoiceError;

    // 3. Calculate totals
    const totalRevenue = revenueEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalCosts = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
    const netProfit = totalRevenue - totalCosts;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // 4. Calculate cost breakdown by category
    const costByCategory = invoices.reduce((acc, inv) => {
      const category = inv.category || 'Other';
      acc[category] = (acc[category] || 0) + inv.total_amount;
      return acc;
    }, {});

    const costBreakdown = Object.entries(costByCategory).map(([name, value]) => ({
      name,
      value,
      percentage: totalCosts > 0 ? (value / totalCosts) * 100 : 0
    }));

    // 5. Calculate AI provider stats
    const aiStats = invoices.reduce((acc, inv) => {
      const provider = inv.ai_provider || 'manual';
      acc[provider] = (acc[provider] || 0) + 1;
      return acc;
    }, { gemini: 0, claude: 0, manual: 0 });

    return {
      totalRevenue,
      totalCosts,
      netProfit,
      margin,
      costBreakdown,
      aiStats,
      revenueEntries,
      invoices
    };
  } catch (error) {
    console.error("Accounting Error:", error);
    throw error;
  }
};
