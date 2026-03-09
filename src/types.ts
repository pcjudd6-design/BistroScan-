export type InvoiceCategory = 'Food' | 'Beverage' | 'Supplies' | 'Equipment' | 'Utilities' | 'Other';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  vendorName: string;
  invoiceNumber: string;
  date: string;
  category: InvoiceCategory;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  status: 'Pending' | 'Paid';
  imageUrl?: string;
}

export interface ProfitLossData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}
