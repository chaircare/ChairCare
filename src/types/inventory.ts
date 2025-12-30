// Inventory Management Types for Chair Care

export interface InventoryItem {
  id: string;
  partNumber: string;
  name: string;
  description: string;
  category: InventoryCategory;
  supplier: Supplier;
  currentStock: number;
  minimumStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  unitPrice: number;
  location: string; // Warehouse location/bin
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastStockCheck: Date;
}

export interface InventoryCategory {
  id: string;
  name: string;
  description: string;
  parentCategoryId?: string;
  isActive: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  paymentTerms: number; // days
  leadTime: number; // days
  isActive: boolean;
  rating: number; // 1-5 stars
  notes: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  movementType: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  reason: string;
  reference: string; // Job ID, PO number, etc.
  unitCost?: number;
  totalCost?: number;
  performedBy: string;
  performedAt: Date;
  notes?: string;
}

export interface StockAdjustment {
  id: string;
  itemId: string;
  previousQuantity: number;
  newQuantity: number;
  adjustmentQuantity: number;
  reason: 'damaged' | 'lost' | 'found' | 'expired' | 'correction' | 'other';
  notes: string;
  performedBy: string;
  performedAt: Date;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplier: Supplier;
  status: 'draft' | 'sent' | 'confirmed' | 'partial' | 'received' | 'cancelled';
  orderDate: Date;
  expectedDelivery?: Date;
  actualDelivery?: Date;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

export interface PurchaseOrderItem {
  id: string;
  itemId: string;
  item: InventoryItem;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  totalCost: number;
  notes?: string;
}

export interface StockAlert {
  id: string;
  itemId: string;
  item: InventoryItem;
  alertType: 'low_stock' | 'out_of_stock' | 'overstock' | 'expiring';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  isActive: boolean;
  createdAt: Date;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface InventoryValuation {
  itemId: string;
  item: InventoryItem;
  quantity: number;
  unitCost: number;
  totalValue: number;
  valuationMethod: 'fifo' | 'lifo' | 'average';
  calculatedAt: Date;
}

export interface PartsCompatibility {
  id: string;
  partId: string;
  chairType: string;
  chairModel?: string;
  isCompatible: boolean;
  notes?: string;
  verifiedBy: string;
  verifiedAt: Date;
}

export interface InventoryReport {
  id: string;
  reportType: 'stock_levels' | 'movements' | 'valuation' | 'alerts' | 'usage';
  parameters: Record<string, any>;
  generatedAt: Date;
  generatedBy: string;
  data: any;
}

export interface UsageAnalytics {
  itemId: string;
  item: InventoryItem;
  period: 'week' | 'month' | 'quarter' | 'year';
  startDate: Date;
  endDate: Date;
  quantityUsed: number;
  averageUsagePerJob: number;
  totalJobs: number;
  costOfUsage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  forecastedUsage: number;
}

export interface StockTakeRecord {
  id: string;
  stockTakeDate: Date;
  performedBy: string;
  status: 'in_progress' | 'completed' | 'approved';
  items: StockTakeItem[];
  totalVariance: number;
  notes?: string;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface StockTakeItem {
  itemId: string;
  systemQuantity: number;
  countedQuantity: number;
  variance: number;
  varianceValue: number;
  notes?: string;
}

// Mobile inventory interfaces
export interface MobileStockCheck {
  itemId: string;
  scannedQuantity: number;
  location: string;
  condition: 'good' | 'damaged' | 'expired';
  notes?: string;
  photoUrl?: string;
  checkedBy: string;
  checkedAt: Date;
}

export interface JobPartsUsage {
  jobId: string;
  chairId: string;
  itemId: string;
  quantityUsed: number;
  unitCost: number;
  totalCost: number;
  installedBy: string;
  installedAt: Date;
  warrantyPeriod?: number; // days
  notes?: string;
}

// Reorder suggestions
export interface ReorderSuggestion {
  itemId: string;
  item: InventoryItem;
  currentStock: number;
  suggestedQuantity: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  reasoning: string;
  estimatedCost: number;
  leadTime: number;
  calculatedAt: Date;
}

// Inventory dashboard metrics
export interface InventoryMetrics {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  overstockItems: number;
  activeAlerts: number;
  monthlyUsageValue: number;
  averageStockTurnover: number;
  topUsedItems: Array<{
    itemId: string;
    name: string;
    quantityUsed: number;
    value: number;
  }>;
  supplierPerformance: Array<{
    supplierId: string;
    name: string;
    onTimeDelivery: number;
    averageLeadTime: number;
    rating: number;
  }>;
}