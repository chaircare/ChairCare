// Pricing Strategy Types for Chair Care

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  discountPercentage: number;
  minimumJobValue?: number;
  validFrom: Date;
  validTo?: Date;
  isActive: boolean;
}

export interface ClientPricingTier {
  id: string;
  clientId: string;
  tierId: string;
  tier: PricingTier;
  assignedDate: Date;
  assignedBy: string;
  notes?: string;
}

export interface BulkDiscountRule {
  id: string;
  serviceType: 'cleaning' | 'repair' | 'all';
  minimumQuantity: number;
  discountPercentage: number;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  isActive: boolean;
  description: string;
}

export interface SeasonalPricing {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  adjustmentType: 'percentage' | 'fixed_amount';
  adjustmentValue: number;
  appliesTo: 'all_services' | 'specific_services';
  serviceIds?: string[];
  isActive: boolean;
  createdBy: string;
}

export interface ServicePricing {
  id: string;
  name: string;
  basePrice: number;
  costPrice: number; // For profit margin calculation
  category: 'repair' | 'cleaning' | 'maintenance' | 'assessment';
  estimatedDuration: number; // in minutes
  skillLevel: 'basic' | 'intermediate' | 'advanced';
  isActive: boolean;
  lastUpdated: Date;
  updatedBy: string;
}

export interface PartPricing {
  id: string;
  name: string;
  partNumber?: string;
  category: string;
  costPrice: number;
  sellPrice: number;
  markup: number; // Calculated: (sellPrice - costPrice) / costPrice * 100
  supplier: string;
  minimumStock: number;
  currentStock: number;
  reorderPoint: number;
  isActive: boolean;
  lastUpdated: Date;
}

export interface PricingCalculation {
  jobId: string;
  clientId: string;
  baseTotal: number;
  discounts: PricingDiscount[];
  seasonalAdjustments: SeasonalAdjustment[];
  finalTotal: number;
  profitMargin: number;
  calculatedAt: Date;
  calculatedBy: string;
}

export interface PricingDiscount {
  type: 'bulk' | 'client_tier' | 'manual' | 'promotional';
  description: string;
  amount: number;
  percentage?: number;
  appliedTo: 'total' | 'services' | 'parts';
}

export interface SeasonalAdjustment {
  seasonalPricingId: string;
  name: string;
  adjustmentAmount: number;
  appliedTo: string[];
}

export interface ProfitAnalysis {
  jobId: string;
  totalRevenue: number;
  totalCosts: number;
  laborCosts: number;
  partsCosts: number;
  overheadCosts: number;
  grossProfit: number;
  profitMargin: number; // Percentage
  calculatedAt: Date;
}

export interface CostCalculationFormula {
  id: string;
  name: string;
  description: string;
  formula: string; // Mathematical formula as string
  variables: FormulaVariable[];
  isActive: boolean;
  appliesTo: 'services' | 'parts' | 'jobs';
}

export interface FormulaVariable {
  name: string;
  description: string;
  type: 'number' | 'percentage' | 'currency';
  defaultValue?: number;
  source: 'user_input' | 'system_calculated' | 'database_lookup';
}

// Dynamic pricing context for calculations
export interface PricingContext {
  clientId: string;
  jobType: 'on-site' | 'workshop' | 'assessment';
  chairCount: number;
  services: string[];
  parts: string[];
  scheduledDate: Date;
  urgency: 'standard' | 'urgent' | 'emergency';
  location?: string;
  distanceFromBase?: number;
}

export interface PricingRule {
  id: string;
  name: string;
  description: string;
  conditions: PricingCondition[];
  action: PricingAction;
  priority: number;
  isActive: boolean;
  validFrom: Date;
  validTo?: Date;
}

export interface PricingCondition {
  field: string; // e.g., 'chairCount', 'clientTier', 'jobType'
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in_range';
  value: any;
}

export interface PricingAction {
  type: 'discount' | 'markup' | 'fixed_price' | 'formula';
  value: number;
  description: string;
}