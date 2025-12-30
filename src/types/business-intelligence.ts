// Business Intelligence Types for Chair Care

export interface KPIMetric {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  target?: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  category: 'financial' | 'operational' | 'customer' | 'technician';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  calculatedAt: Date;
}

export interface CustomerLifetimeValue {
  clientId: string;
  clientName: string;
  totalRevenue: number;
  totalJobs: number;
  averageJobValue: number;
  firstJobDate: Date;
  lastJobDate: Date;
  monthsActive: number;
  monthlyAverageRevenue: number;
  predictedLifetimeValue: number;
  riskScore: number; // 0-100, higher = more likely to churn
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface TechnicianEfficiency {
  technicianId: string;
  technicianName: string;
  period: DateRange;
  totalJobs: number;
  completedJobs: number;
  averageJobDuration: number; // minutes
  onTimeCompletion: number; // percentage
  customerSatisfaction: number; // 1-5 rating
  revenueGenerated: number;
  costsIncurred: number;
  profitability: number;
  skillRating: number; // 1-5
  certifications: string[];
  specializations: string[];
  efficiencyScore: number; // 0-100
}

export interface ChairReliabilityScore {
  chairId: string;
  chairModel: string;
  manufacturer?: string;
  ageInMonths: number;
  totalServices: number;
  totalDowntime: number; // hours
  averageTimeBetweenServices: number; // days
  commonIssues: Array<{
    issue: string;
    frequency: number;
    averageCost: number;
  }>;
  reliabilityScore: number; // 0-100, higher = more reliable
  maintenanceCost: number;
  replacementRecommendation: boolean;
  predictedNextService: Date;
}

export interface PredictiveMaintenanceAlert {
  id: string;
  chairId: string;
  chairModel: string;
  location: string;
  predictedIssue: string;
  probability: number; // 0-100
  estimatedTimeframe: number; // days
  recommendedAction: string;
  estimatedCost: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface ROIAnalysis {
  id: string;
  analysisType: 'service_contract' | 'equipment_purchase' | 'technician_hire' | 'process_improvement';
  name: string;
  description: string;
  initialInvestment: number;
  period: DateRange;
  costs: Array<{
    category: string;
    amount: number;
    frequency: 'one_time' | 'monthly' | 'quarterly' | 'yearly';
  }>;
  benefits: Array<{
    category: string;
    amount: number;
    frequency: 'one_time' | 'monthly' | 'quarterly' | 'yearly';
  }>;
  totalCosts: number;
  totalBenefits: number;
  netBenefit: number;
  roi: number; // percentage
  paybackPeriod: number; // months
  npv: number; // Net Present Value
  irr: number; // Internal Rate of Return
  riskFactors: string[];
  assumptions: string[];
  calculatedAt: Date;
  calculatedBy: string;
}

export interface MarketAnalysis {
  id: string;
  analysisDate: Date;
  marketSegment: string;
  competitors: Array<{
    name: string;
    marketShare: number;
    averagePricing: number;
    strengths: string[];
    weaknesses: string[];
  }>;
  ourMarketShare: number;
  ourAveragePricing: number;
  pricingPosition: 'premium' | 'competitive' | 'budget';
  marketTrends: Array<{
    trend: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }>;
  opportunities: string[];
  threats: string[];
  recommendations: string[];
}

export interface CustomerSatisfactionMetrics {
  period: DateRange;
  totalResponses: number;
  averageRating: number; // 1-5
  nps: number; // Net Promoter Score -100 to 100
  responseRate: number; // percentage
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  commonComplaints: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  commonPraises: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  improvementAreas: string[];
  actionItems: Array<{
    item: string;
    priority: 'low' | 'medium' | 'high';
    assignedTo?: string;
    dueDate?: Date;
  }>;
}

export interface FinancialMetrics {
  period: DateRange;
  revenue: {
    total: number;
    recurring: number;
    oneTime: number;
    byService: Array<{
      service: string;
      amount: number;
      percentage: number;
    }>;
    byClient: Array<{
      clientId: string;
      clientName: string;
      amount: number;
      percentage: number;
    }>;
  };
  costs: {
    total: number;
    labor: number;
    materials: number;
    overhead: number;
    byCategory: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
  };
  profitability: {
    grossProfit: number;
    grossMargin: number; // percentage
    netProfit: number;
    netMargin: number; // percentage
    ebitda: number;
  };
  cashFlow: {
    operating: number;
    investing: number;
    financing: number;
    net: number;
  };
  receivables: {
    total: number;
    current: number;
    overdue: number;
    averageCollectionPeriod: number; // days
  };
}

export interface OperationalMetrics {
  period: DateRange;
  productivity: {
    jobsCompleted: number;
    averageJobDuration: number;
    utilizationRate: number; // percentage
    firstTimeFixRate: number; // percentage
  };
  quality: {
    customerSatisfaction: number;
    complaintRate: number; // percentage
    reworkRate: number; // percentage
    warrantyClaimRate: number; // percentage
  };
  efficiency: {
    costPerJob: number;
    revenuePerTechnician: number;
    inventoryTurnover: number;
    equipmentUtilization: number; // percentage
  };
  scheduling: {
    onTimeArrival: number; // percentage
    scheduleAdherence: number; // percentage
    emergencyCallouts: number;
    plannedVsUnplanned: number; // ratio
  };
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'gauge' | 'trend';
  title: string;
  description?: string;
  dataSource: string;
  configuration: any;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  refreshInterval?: number; // minutes
  permissions: string[]; // roles that can view this widget
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  layout: 'grid' | 'flexible';
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  permissions: {
    view: string[];
    edit: string[];
  };
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'operational' | 'customer' | 'technician' | 'inventory';
  parameters: Array<{
    name: string;
    type: 'date' | 'dateRange' | 'select' | 'multiSelect' | 'number' | 'text';
    label: string;
    required: boolean;
    defaultValue?: any;
    options?: Array<{ value: any; label: string }>;
  }>;
  sections: Array<{
    title: string;
    type: 'summary' | 'table' | 'chart' | 'text';
    configuration: any;
  }>;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    recipients: string[];
    format: 'pdf' | 'excel' | 'email';
  };
  createdBy: string;
  createdAt: Date;
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  templateName: string;
  parameters: Record<string, any>;
  generatedAt: Date;
  generatedBy: string;
  format: 'pdf' | 'excel' | 'html';
  fileUrl?: string;
  status: 'generating' | 'completed' | 'failed';
  error?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'percentage_change';
  threshold: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
  recipients: string[];
  channels: Array<'email' | 'sms' | 'push' | 'dashboard'>;
  isActive: boolean;
  lastTriggered?: Date;
  createdBy: string;
  createdAt: Date;
}

export interface BusinessAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  triggeredAt: Date;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  data: any;
}