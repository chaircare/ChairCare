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
  createdAt: Date;
  completedAt?: Date;
  createdBy: string;
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