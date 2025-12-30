// Chair Care Application Types

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'client' | 'technician';
  companyName?: string;
  phone?: string;
  employeeId?: string;
  specialization?: string;
  status?: 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'suspended';
  tempPassword?: string;
  passwordResetRequired?: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface Chair {
  id: string;
  chairId: string; // CC-XXXXXX format (unique identifier)
  qrCode: string;
  chairNumber: string;
  location: string;
  category: ChairCategory;
  model?: string;
  assetTag?: string;
  purchaseDate?: Date;
  clientId: string; // Owner of the chair (client ID)
  user?: User;
  status: 'Pending Service' | 'Active' | 'In Progress' | 'In Workshop' | 'Completed' | 'Unrepairable' | 'Retired';
  serviceHistory: ChairServiceEntry[];
  totalServices: number;
  totalSpent: number;
  lastServiceDate?: Date;
  nextServiceDue?: Date;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  retiredAt?: Date;
  qrCodeGenerated: boolean;
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  serialNumber?: string;
  manufacturer?: string;
  warrantyExpiry?: Date;
}

export interface ChairCategory {
  id: string;
  name: string;
  description?: string;
}

// Job Management Types
export interface Job {
  id: string;
  jobId: string; // Auto-generated (e.g., JOB-2025-001)
  clientId: string;
  clientName: string;
  jobType: 'On-site' | 'Workshop' | 'Assessment';
  status: 'New' | 'Scheduled' | 'In Progress' | 'Completed' | 'Invoiced' | 'Paid';
  scheduledDate?: Date;
  scheduledTime?: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  location?: string;
  adminNotes?: string;
  technicianNotes?: string;
  chairs: string[]; // Array of chair IDs
  
  // Pricing fields
  serviceType: 'cleaning' | 'repair' | 'maintenance' | 'inspection' | 'assessment';
  estimatedPrice?: number;
  finalPrice?: number;
  priceBreakdown?: PriceBreakdown;
  
  createdAt: Date;
  completedAt?: Date;
  updatedAt?: Date;
  createdBy: string;
}

export interface PriceBreakdown {
  baseServiceFee: number;
  chairCount: number;
  pricePerChair: number;
  additionalServices?: AdditionalService[];
  partsAndMaterials?: number;
  travelFee?: number;
  urgencyFee?: number;
  discount?: number;
  subtotal: number;
  tax?: number;
  total: number;
}

export interface AdditionalService {
  name: string;
  description?: string;
  price: number;
  quantity?: number;
}

export interface ChairServiceEntry {
  id: string;
  chairId: string;
  jobId: string;
  serviceDate: Date;
  technicianId: string;
  technicianName: string;
  issueReported?: string;
  issueFound?: string;
  servicesPerformed: string[];
  partsUsed: PartUsed[];
  outcome: 'Repaired Successfully' | 'Requires Workshop' | 'Unrepairable';
  workNotes?: string;
  beforePhotos: string[];
  afterPhotos: string[];
  cost?: number;
}

export interface PartUsed {
  partId: string;
  partName: string;
  quantity: number;
  unitPrice?: number;
}

export interface Service {
  id: string;
  name: string;
  defaultPrice: number;
  active: boolean;
}

export interface Part {
  id: string;
  name: string;
  sellPrice: number;
  costPrice?: number;
  stockLevel?: number;
  active: boolean;
}

export interface Invoice {
  id: string;
  invoiceId: string; // INV-2025-001
  jobId: string;
  clientId: string;
  clientName: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  dateSent?: Date;
  datePaid?: Date;
  paymentReference?: string;
  paymentMethod?: string;
  createdAt: Date;
  dueDate: Date;
  pricingMethod?: 'itemized' | 'bundled';
  serviceEntries?: string[]; // Array of service entry IDs
  notes?: string;
}

// Predefined chair categories updated to match BRD
export const CHAIR_CATEGORIES: ChairCategory[] = [
  { id: 'executive', name: 'Executive Chair', description: 'High-end chairs for executive offices' },
  { id: 'task', name: 'Task Chair', description: 'Standard office chairs for individual workstations' },
  { id: 'draftsman', name: 'Draftsman Chair', description: 'Height-adjustable chairs for standing desks' },
  { id: 'boardroom', name: 'Boardroom Chair', description: 'Professional chairs for conference and meeting rooms' },
  { id: 'visitor', name: 'Visitor Chair', description: 'Chairs for client and visitor seating' },
  { id: 'other', name: 'Other', description: 'Miscellaneous chair types' }
];

export interface ServiceLog {
  id: string;
  chairId: string;
  chair?: Chair;
  clientId: string; // Use clientId for consistency
  user?: User;
  serviceType: 'cleaning' | 'repair' | 'maintenance';
  description: string;
  issueDetails?: string;
  urgency?: 'low' | 'medium' | 'high';
  cost: number;
  status: 'pending' | 'assigned' | 'completed' | 'billed' | 'reviewed';
  beforePhotos: string[];
  afterPhotos: string[];
  technicianNotes?: string;
  createdAt: Date;
  completedAt?: Date;
  chairNumber?: string;
  location?: string;
  contactEmail?: string;
  contactPhone?: string;
  clientName?: string;
  companyName?: string;
  requestedBy?: string;
  jobId?: string;
  updatedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface Quote {
  id: string;
  userId: string;
  user?: User;
  chairIds: string[];
  chairs?: Chair[];
  serviceType: 'cleaning' | 'repair';
  totalChairs: number;
  pricePerChair: number;
  totalCost: number;
  discount?: number;
  finalCost: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  validUntil: Date;
  createdAt: Date;
  acceptedAt?: Date;
}

export interface ServicePricing {
  id: string;
  serviceType: 'cleaning' | 'repair';
  basePrice: number;
  bulkDiscounts: BulkDiscount[];
  active: boolean;
}

export interface BulkDiscount {
  minChairs: number;
  discountPercentage: number;
}

// Form types
export interface CreateChairForm {
  chairNumber: string;
  location: string;
  category: string; // Category ID
  model?: string;
}

export interface ServiceRequestForm {
  chairIds: string[];
  serviceType: 'cleaning' | 'repair';
  description: string;
}

export interface CreateUserForm {
  email: string;
  name: string;
  companyName?: string;
  role: 'admin' | 'client' | 'technician';
}

// Dashboard types
export interface DashboardStats {
  totalChairs: number;
  pendingServices: number;
  completedThisMonth: number;
  totalRevenue: number;
  servicesByType: Record<'cleaning' | 'repair', number>;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}