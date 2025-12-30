// Invoice-related types

export interface Invoice {
  id: string;
  invoiceNumber: string; // INV-2025-001 format
  jobId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  clientVatNumber?: string;
  
  // Invoice details
  issueDate: Date;
  dueDate: Date;
  paymentTerms: number; // days
  
  // Line items
  lineItems: InvoiceLineItem[];
  
  // Pricing
  subtotal: number;
  vatRate: number; // 0.15 for 15%
  vatAmount: number;
  total: number;
  
  // Discounts
  discountPercentage?: number;
  discountAmount?: number;
  discountReason?: string;
  
  // Status
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
  sentDate?: Date;
  paidDate?: Date;
  paymentReference?: string;
  paymentMethod?: 'EFT' | 'Cash' | 'Card' | 'Other';
  
  // Notes
  notes?: string;
  terms?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface InvoiceLineItem {
  id: string;
  type: 'service' | 'part' | 'callout' | 'discount';
  description: string;
  chairId?: string; // For chair-specific items
  chairNumber?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface InvoiceSettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyVatNumber?: string;
  companyRegistration?: string;
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branchCode: string;
  };
  defaultPaymentTerms: number;
  defaultVatRate: number;
  invoicePrefix: string; // 'INV' or 'CCSA'
  logoUrl?: string;
}

export interface CreateInvoiceRequest {
  jobId: string;
  pricingMethod: 'itemized' | 'bundled';
  bundledAmount?: number;
  discountPercentage?: number;
  discountReason?: string;
  notes?: string;
  paymentTerms?: number;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  htmlTemplate: string;
  isDefault: boolean;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'EFT' | 'Cash' | 'Card' | 'Other';
  reference?: string;
  notes?: string;
  createdAt: Date;
  createdBy: string;
}