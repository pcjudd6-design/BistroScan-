import { scanWithGemini } from './geminiScanner';
import { scanWithClaude } from './claudeScanner';
import { supabase } from './supabase';

export const scanInvoice = async (base64Image, restaurantId) => {
  let result = null;
  let provider = 'gemini';

  try {
    // Try Gemini first
    result = await scanWithGemini(base64Image);
  } catch (geminiError) {
    console.warn("Gemini failed, trying Claude fallback...", geminiError);
    try {
      // Try Claude fallback
      result = await scanWithClaude(base64Image);
      provider = 'claude';
    } catch (claudeError) {
      console.error("Both AI scanners failed, adding to queue...", claudeError);
      
      // Save to scan_queue if both fail
      const { error: queueError } = await supabase
        .from('scan_queue')
        .insert([{
          restaurant_id: restaurantId,
          image_url: base64Image, // In a real app, upload to storage first
          status: 'failed',
          error_message: `Gemini: ${geminiError.message}, Claude: ${claudeError.message}`
        }]);
      
      if (queueError) throw queueError;
      return { status: 'queued', message: 'Invoice added to retry queue' };
    }
  }

  // If we have a result, save it to the database
  if (result) {
    const status = result.confidence >= 80 ? 'auto-approved' : 'needs-review';
    
    // 1. Insert into invoices table
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert([{
        restaurant_id: restaurantId,
        vendor_name: result.vendor_name,
        invoice_date: result.invoice_date,
        total_amount: result.total_amount,
        tax_amount: result.tax_amount,
        category: result.category,
        status: status,
        ai_confidence: result.confidence,
        ai_provider: provider,
        image_url: base64Image // In a real app, upload to storage first
      }])
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // 2. Insert line items
    if (result.line_items && result.line_items.length > 0) {
      const lineItems = result.line_items.map(item => ({
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

    return { status: 'success', invoice, provider };
  }
};
