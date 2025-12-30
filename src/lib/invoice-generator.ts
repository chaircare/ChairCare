// Invoice generation utilities
import { 
  Invoice, 
  InvoiceLineItem, 
  InvoiceSettings, 
  CreateInvoiceRequest 
} from 'types/invoice';
import { Job, ChairServiceEntry, Service } from 'types/chair-care';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Generate next invoice number
 */
export const generateInvoiceNumber = async (prefix = 'INV'): Promise<string> => {
  const year = new Date().getFullYear();
  const yearPrefix = `${prefix}-${year}`;
  
  // Get the last invoice for this year
  const invoicesQuery = query(
    collection(db, 'invoices'),
    where('invoiceNumber', '>=', `${yearPrefix}-000`),
    where('invoiceNumber', '<', `${yearPrefix}-999`),
    orderBy('invoiceNumber', 'desc'),
    limit(1)
  );
  
  const querySnapshot = await getDocs(invoicesQuery);
  
  if (querySnapshot.empty) {
    return `${yearPrefix}-001`;
  }
  
  const lastInvoice = querySnapshot.docs[0].data();
  const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
  const nextNumber = (lastNumber + 1).toString().padStart(3, '0');
  
  return `${yearPrefix}-${nextNumber}`;
};

/**
 * Get default invoice settings
 */
export const getInvoiceSettings = async (): Promise<InvoiceSettings> => {
  try {
    const settingsDoc = await getDoc(doc(db, 'settings', 'invoice'));
    
    if (settingsDoc.exists()) {
      return settingsDoc.data() as InvoiceSettings;
    }
    
    // Return default settings if none exist
    const defaultSettings: InvoiceSettings = {
      companyName: 'Chair Care',
      companyAddress: 'Cape Town, South Africa',
      companyPhone: '+27 21 XXX XXXX',
      companyEmail: 'admin@chaircare.co.za',
      companyVatNumber: '4XXXXXXXXX',
      defaultPaymentTerms: 30,
      defaultVatRate: 0.15,
      invoicePrefix: 'INV',
      bankDetails: {
        bankName: 'Standard Bank',
        accountName: 'Chair Care (Pty) Ltd',
        accountNumber: 'XXXXXXXXXX',
        branchCode: 'XXXXXX'
      }
    };
    
    // Save default settings
    await setDoc(doc(db, 'settings', 'invoice'), defaultSettings);
    
    return defaultSettings;
  } catch (error) {
    console.error('Error getting invoice settings:', error);
    throw error;
  }
};

/**
 * Create line items from job data
 */
export const createLineItemsFromJob = async (
  job: Job,
  pricingMethod: 'itemized' | 'bundled',
  bundledAmount?: number
): Promise<InvoiceLineItem[]> => {
  const lineItems: InvoiceLineItem[] = [];
  
  if (pricingMethod === 'bundled' && bundledAmount) {
    // Single bundled line item
    lineItems.push({
      id: `bundled-${Date.now()}`,
      type: 'service',
      description: `Office chair services - ${job.chairs.length} chair${job.chairs.length > 1 ? 's' : ''}`,
      quantity: 1,
      unitPrice: bundledAmount,
      totalPrice: bundledAmount
    });
  } else {
    // Itemized line items
    // Get chair service entries for this job
    const chairServiceEntries = await getChairServiceEntriesForJob(job.id);
    
    // Group services and parts
    const serviceMap = new Map<string, { count: number; price: number }>();
    const partMap = new Map<string, { count: number; price: number }>();
    
    for (const entry of chairServiceEntries) {
      // Process services
      for (const serviceName of entry.servicesPerformed) {
        const service = await getServiceByName(serviceName);
        if (service) {
          const key = `${serviceName}-${entry.chairId}`;
          serviceMap.set(key, {
            count: 1,
            price: service.defaultPrice
          });
        }
      }
      
      // Process parts
      for (const partUsed of entry.partsUsed) {
        const key = `${partUsed.partName}-${entry.chairId}`;
        const existing = partMap.get(key);
        partMap.set(key, {
          count: (existing?.count || 0) + partUsed.quantity,
          price: partUsed.unitPrice || 0
        });
      }
    }
    
    // Create service line items
    let itemId = 1;
    const serviceKeys = Array.from(serviceMap.keys());
    for (const key of serviceKeys) {
      const data = serviceMap.get(key)!;
      const [serviceName, chairId] = key.split('-');
      const chair = await getChairById(chairId);
      
      lineItems.push({
        id: `service-${itemId++}`,
        type: 'service',
        description: `${serviceName} - ${chair?.chairId || chairId}`,
        chairId,
        chairNumber: chair?.chairId,
        quantity: data.count,
        unitPrice: data.price,
        totalPrice: data.count * data.price
      });
    }
    
    // Create part line items
    for (const [key, data] of partMap) {
      const [partName, chairId] = key.split('-');
      const chair = await getChairById(chairId);
      
      lineItems.push({
        id: `part-${itemId++}`,
        type: 'part',
        description: `${partName} - ${chair?.chairId || chairId}`,
        chairId,
        chairNumber: chair?.chairId,
        quantity: data.count,
        unitPrice: data.price,
        totalPrice: data.count * data.price
      });
    }
  }
  
  return lineItems;
};

/**
 * Calculate invoice totals
 */
export const calculateInvoiceTotals = (
  lineItems: InvoiceLineItem[],
  vatRate: number,
  discountPercentage?: number
): {
  subtotal: number;
  discountAmount: number;
  vatAmount: number;
  total: number;
} => {
  const subtotal = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const discountAmount = discountPercentage ? (subtotal * discountPercentage / 100) : 0;
  const discountedSubtotal = subtotal - discountAmount;
  const vatAmount = discountedSubtotal * vatRate;
  const total = discountedSubtotal + vatAmount;
  
  return {
    subtotal,
    discountAmount,
    vatAmount,
    total
  };
};

/**
 * Sanitize invoice data to remove undefined values before saving to Firestore
 */
const sanitizeInvoiceData = (invoice: Invoice): any => {
  const sanitized: any = {};
  
  Object.keys(invoice).forEach(key => {
    const value = (invoice as any)[key];
    if (value !== undefined) {
      sanitized[key] = value;
    }
  });
  
  // Ensure required string fields are never empty
  if (!sanitized.notes) sanitized.notes = '';
  if (!sanitized.terms) sanitized.terms = 'Payment due within payment terms. Late payments may incur interest charges.';
  if (!sanitized.clientVatNumber) sanitized.clientVatNumber = '';
  if (!sanitized.discountReason) sanitized.discountReason = '';
  
  // Ensure numeric fields have default values
  if (sanitized.discountPercentage === undefined) sanitized.discountPercentage = 0;
  if (sanitized.discountAmount === undefined) sanitized.discountAmount = 0;
  
  return sanitized;
};

/**
 * Create invoice from job
 */
export const createInvoiceFromJob = async (
  jobId: string,
  request: CreateInvoiceRequest
): Promise<Invoice> => {
  try {
    // Get job data
    const jobDoc = await getDoc(doc(db, 'jobs', jobId));
    if (!jobDoc.exists()) {
      throw new Error('Job not found');
    }
    const job = { id: jobDoc.id, ...jobDoc.data() } as Job;
    
    // Get client data
    const clientDoc = await getDoc(doc(db, 'clients', job.clientId));
    if (!clientDoc.exists()) {
      throw new Error('Client not found');
    }
    const client = clientDoc.data();
    
    // Get invoice settings
    const settings = await getInvoiceSettings();
    
    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(settings.invoicePrefix);
    
    // Create line items
    const lineItems = await createLineItemsFromJob(
      job,
      request.pricingMethod,
      request.bundledAmount
    );
    
    // Add discount line item if applicable
    if (request.discountPercentage && request.discountPercentage > 0) {
      const subtotal = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const discountAmount = subtotal * request.discountPercentage / 100;
      
      lineItems.push({
        id: `discount-${Date.now()}`,
        type: 'discount',
        description: request.discountReason || `Discount (${request.discountPercentage}%)`,
        quantity: 1,
        unitPrice: -discountAmount,
        totalPrice: -discountAmount
      });
    }
    
    // Calculate totals
    const totals = calculateInvoiceTotals(
      lineItems,
      settings.defaultVatRate,
      request.discountPercentage
    );
    
    // Create invoice
    const invoice: Invoice = {
      id: '', // Will be set by Firestore
      invoiceNumber,
      jobId,
      clientId: job.clientId,
      clientName: client.companyName || client.contactPerson,
      clientEmail: client.email,
      clientAddress: client.physicalAddress,
      clientVatNumber: client.vatNumber || '',
      
      issueDate: new Date(),
      dueDate: new Date(Date.now() + (request.paymentTerms || settings.defaultPaymentTerms) * 24 * 60 * 60 * 1000),
      paymentTerms: request.paymentTerms || settings.defaultPaymentTerms,
      
      lineItems,
      
      subtotal: totals.subtotal,
      vatRate: settings.defaultVatRate,
      vatAmount: totals.vatAmount,
      total: totals.total,
      
      discountPercentage: request.discountPercentage || 0,
      discountAmount: totals.discountAmount || 0,
      discountReason: request.discountReason || '',
      
      status: 'Draft',
      
      notes: request.notes || '', // Fix: Ensure notes is never undefined
      terms: 'Payment due within payment terms. Late payments may incur interest charges.',
      
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin' // TODO: Get from auth context
    };
    
    // Save to Firestore
    const invoiceRef = doc(collection(db, 'invoices'));
    invoice.id = invoiceRef.id;
    const sanitizedInvoice = sanitizeInvoiceData(invoice);
    await setDoc(invoiceRef, sanitizedInvoice);
    
    // Update job status
    await updateDoc(doc(db, 'jobs', jobId), {
      status: 'Invoiced',
      updatedAt: new Date()
    });
    
    return invoice;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

/**
 * Update invoice status
 */
export const updateInvoiceStatus = async (
  invoiceId: string,
  status: Invoice['status'],
  paymentDetails?: {
    paymentDate?: Date;
    paymentReference?: string;
    paymentMethod?: string;
  }
): Promise<void> => {
  try {
    const updateData: any = {
      status,
      updatedAt: new Date()
    };
    
    if (status === 'Sent') {
      updateData.sentDate = new Date();
    }
    
    if (status === 'Paid' && paymentDetails) {
      updateData.paidDate = paymentDetails.paymentDate || new Date();
      updateData.paymentReference = paymentDetails.paymentReference;
      updateData.paymentMethod = paymentDetails.paymentMethod;
    }
    
    await updateDoc(doc(db, 'invoices', invoiceId), updateData);
    
    // If paid, update job status
    if (status === 'Paid') {
      const invoiceDoc = await getDoc(doc(db, 'invoices', invoiceId));
      if (invoiceDoc.exists()) {
        const invoice = invoiceDoc.data() as Invoice;
        await updateDoc(doc(db, 'jobs', invoice.jobId), {
          status: 'Paid',
          updatedAt: new Date()
        });
      }
    }
  } catch (error) {
    console.error('Error updating invoice status:', error);
    throw error;
  }
};

// Helper functions
const getChairServiceEntriesForJob = async (jobId: string): Promise<ChairServiceEntry[]> => {
  const entriesQuery = query(
    collection(db, 'chairServiceEntries'),
    where('jobId', '==', jobId)
  );
  
  const querySnapshot = await getDocs(entriesQuery);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChairServiceEntry));
};

const getServiceByName = async (serviceName: string): Promise<Service | null> => {
  const servicesQuery = query(
    collection(db, 'services'),
    where('name', '==', serviceName),
    limit(1)
  );
  
  const querySnapshot = await getDocs(servicesQuery);
  if (querySnapshot.empty) return null;
  
  return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Service;
};

const getChairById = async (chairId: string): Promise<any> => {
  const chairDoc = await getDoc(doc(db, 'chairs', chairId));
  return chairDoc.exists() ? { id: chairDoc.id, ...chairDoc.data() } : null;
};