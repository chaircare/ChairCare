// Business Intelligence Service for Chair Care
import { 
  KPIMetric, 
  CustomerLifetimeValue, 
  TechnicianEfficiency,
  ChairReliabilityScore,
  PredictiveMaintenanceAlert,
  ROIAnalysis,
  DateRange
} from 'types/business-intelligence';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export class BusinessIntelligenceService {
  
  /**
   * Calculate key performance indicators
   */
  static async calculateKPIs(period: DateRange): Promise<KPIMetric[]> {
    const kpis: KPIMetric[] = [];
    
    try {
      // Revenue KPIs
      const revenueKPI = await this.calculateRevenueKPI(period);
      kpis.push(revenueKPI);
      
      // Job completion KPIs
      const jobCompletionKPI = await this.calculateJobCompletionKPI(period);
      kpis.push(jobCompletionKPI);
      
      // Customer satisfaction KPI
      const customerSatisfactionKPI = await this.calculateCustomerSatisfactionKPI(period);
      kpis.push(customerSatisfactionKPI);
      
      // Technician utilization KPI
      const technicianUtilizationKPI = await this.calculateTechnicianUtilizationKPI(period);
      kpis.push(technicianUtilizationKPI);
      
      // Profit margin KPI
      const profitMarginKPI = await this.calculateProfitMarginKPI(period);
      kpis.push(profitMarginKPI);
      
      // First-time fix rate KPI
      const firstTimeFixKPI = await this.calculateFirstTimeFixKPI(period);
      kpis.push(firstTimeFixKPI);
      
    } catch (error) {
      console.error('Error calculating KPIs:', error);
    }
    
    return kpis;
  }
  
  private static async calculateRevenueKPI(period: DateRange): Promise<KPIMetric> {
    // Get jobs in period
    const jobsQuery = query(
      collection(db, 'jobs'),
      where('completedAt', '>=', period.startDate),
      where('completedAt', '<=', period.endDate),
      where('status', '==', 'completed')
    );
    
    const jobsSnapshot = await getDocs(jobsQuery);
    const totalRevenue = jobsSnapshot.docs.reduce((sum, doc) => {
      const job = doc.data();
      return sum + (job.totalAmount || 0);
    }, 0);
    
    // Calculate previous period for trend
    const previousPeriod = this.getPreviousPeriod(period);
    const previousJobsQuery = query(
      collection(db, 'jobs'),
      where('completedAt', '>=', previousPeriod.startDate),
      where('completedAt', '<=', previousPeriod.endDate),
      where('status', '==', 'completed')
    );
    
    const previousJobsSnapshot = await getDocs(previousJobsQuery);
    const previousRevenue = previousJobsSnapshot.docs.reduce((sum, doc) => {
      const job = doc.data();
      return sum + (job.totalAmount || 0);
    }, 0);
    
    const trendPercentage = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;
    
    return {
      id: 'revenue',
      name: 'Total Revenue',
      value: totalRevenue,
      previousValue: previousRevenue,
      target: 100000, // R100k target
      unit: 'ZAR',
      trend: trendPercentage > 0 ? 'up' : trendPercentage < 0 ? 'down' : 'stable',
      trendPercentage,
      category: 'financial',
      period: 'monthly',
      calculatedAt: new Date()
    };
  }
  
  private static async calculateJobCompletionKPI(period: DateRange): Promise<KPIMetric> {
    const allJobsQuery = query(
      collection(db, 'jobs'),
      where('createdAt', '>=', period.startDate),
      where('createdAt', '<=', period.endDate)
    );
    
    const completedJobsQuery = query(
      collection(db, 'jobs'),
      where('createdAt', '>=', period.startDate),
      where('createdAt', '<=', period.endDate),
      where('status', '==', 'completed')
    );
    
    const [allJobsSnapshot, completedJobsSnapshot] = await Promise.all([
      getDocs(allJobsQuery),
      getDocs(completedJobsQuery)
    ]);
    
    const totalJobs = allJobsSnapshot.size;
    const completedJobs = completedJobsSnapshot.size;
    const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;
    
    return {
      id: 'job_completion_rate',
      name: 'Job Completion Rate',
      value: completionRate,
      target: 95, // 95% target
      unit: '%',
      trend: 'stable', // Would calculate from previous period
      trendPercentage: 0,
      category: 'operational',
      period: 'monthly',
      calculatedAt: new Date()
    };
  }
  
  private static async calculateCustomerSatisfactionKPI(period: DateRange): Promise<KPIMetric> {
    // This would integrate with a feedback system
    // For now, return a placeholder
    return {
      id: 'customer_satisfaction',
      name: 'Customer Satisfaction',
      value: 4.2,
      target: 4.5,
      unit: '/5',
      trend: 'up',
      trendPercentage: 5.0,
      category: 'customer',
      period: 'monthly',
      calculatedAt: new Date()
    };
  }
  
  private static async calculateTechnicianUtilizationKPI(period: DateRange): Promise<KPIMetric> {
    // Calculate technician utilization based on scheduled vs available hours
    // Simplified calculation - would need more detailed time tracking
    const utilizationRate = 75; // Placeholder
    
    return {
      id: 'technician_utilization',
      name: 'Technician Utilization',
      value: utilizationRate,
      target: 80,
      unit: '%',
      trend: 'stable',
      trendPercentage: 0,
      category: 'operational',
      period: 'monthly',
      calculatedAt: new Date()
    };
  }
  
  private static async calculateProfitMarginKPI(period: DateRange): Promise<KPIMetric> {
    // Calculate profit margin from completed jobs
    const jobsQuery = query(
      collection(db, 'jobs'),
      where('completedAt', '>=', period.startDate),
      where('completedAt', '<=', period.endDate),
      where('status', '==', 'completed')
    );
    
    const jobsSnapshot = await getDocs(jobsQuery);
    let totalRevenue = 0;
    let totalCosts = 0;
    
    jobsSnapshot.docs.forEach(doc => {
      const job = doc.data();
      totalRevenue += job.totalAmount || 0;
      totalCosts += job.totalCosts || 0;
    });
    
    const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0;
    
    return {
      id: 'profit_margin',
      name: 'Profit Margin',
      value: profitMargin,
      target: 35, // 35% target
      unit: '%',
      trend: 'up',
      trendPercentage: 2.5,
      category: 'financial',
      period: 'monthly',
      calculatedAt: new Date()
    };
  }
  
  private static async calculateFirstTimeFixKPI(period: DateRange): Promise<KPIMetric> {
    // Calculate first-time fix rate
    const jobsQuery = query(
      collection(db, 'jobs'),
      where('completedAt', '>=', period.startDate),
      where('completedAt', '<=', period.endDate),
      where('status', '==', 'completed')
    );
    
    const jobsSnapshot = await getDocs(jobsQuery);
    let totalJobs = 0;
    let firstTimeFixes = 0;
    
    jobsSnapshot.docs.forEach(doc => {
      const job = doc.data();
      totalJobs++;
      if (job.firstTimeFix === true) {
        firstTimeFixes++;
      }
    });
    
    const firstTimeFixRate = totalJobs > 0 ? (firstTimeFixes / totalJobs) * 100 : 0;
    
    return {
      id: 'first_time_fix_rate',
      name: 'First Time Fix Rate',
      value: firstTimeFixRate,
      target: 85, // 85% target
      unit: '%',
      trend: 'stable',
      trendPercentage: 0,
      category: 'operational',
      period: 'monthly',
      calculatedAt: new Date()
    };
  }
  
  /**
   * Calculate customer lifetime value for all clients
   */
  static async calculateCustomerLifetimeValues(): Promise<CustomerLifetimeValue[]> {
    const clvs: CustomerLifetimeValue[] = [];
    
    try {
      // Get all clients
      const clientsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'client')
      );
      
      const clientsSnapshot = await getDocs(clientsQuery);
      
      for (const clientDoc of clientsSnapshot.docs) {
        const client = clientDoc.data();
        const clv = await this.calculateSingleCustomerLTV(clientDoc.id, client.name);
        clvs.push(clv);
      }
      
      // Sort by total revenue descending
      clvs.sort((a, b) => b.totalRevenue - a.totalRevenue);
      
    } catch (error) {
      console.error('Error calculating customer lifetime values:', error);
    }
    
    return clvs;
  }
  
  private static async calculateSingleCustomerLTV(
    clientId: string, 
    clientName: string
  ): Promise<CustomerLifetimeValue> {
    // Get all jobs for this client
    const jobsQuery = query(
      collection(db, 'jobs'),
      where('clientId', '==', clientId),
      where('status', '==', 'completed'),
      orderBy('completedAt')
    );
    
    const jobsSnapshot = await getDocs(jobsQuery);
    const jobs = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (jobs.length === 0) {
      return {
        clientId,
        clientName,
        totalRevenue: 0,
        totalJobs: 0,
        averageJobValue: 0,
        firstJobDate: new Date(),
        lastJobDate: new Date(),
        monthsActive: 0,
        monthlyAverageRevenue: 0,
        predictedLifetimeValue: 0,
        riskScore: 100,
        tier: 'bronze'
      };
    }
    
    const totalRevenue = jobs.reduce((sum, job) => sum + (job.finalPrice || job.priceBreakdown?.total || 0), 0);
    const totalJobs = jobs.length;
    const averageJobValue = totalRevenue / totalJobs;
    const firstJobDate = new Date(jobs[0].completedAt);
    const lastJobDate = new Date(jobs[jobs.length - 1].completedAt);
    
    const monthsActive = Math.max(1, 
      (lastJobDate.getTime() - firstJobDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    
    const monthlyAverageRevenue = totalRevenue / monthsActive;
    
    // Simple LTV prediction (12 months forward)
    const predictedLifetimeValue = monthlyAverageRevenue * 12;
    
    // Risk score calculation (simplified)
    const daysSinceLastJob = (new Date().getTime() - lastJobDate.getTime()) / (1000 * 60 * 60 * 24);
    const riskScore = Math.min(100, Math.max(0, daysSinceLastJob / 90 * 100));
    
    // Tier calculation
    let tier: 'bronze' | 'silver' | 'gold' | 'platinum' = 'bronze';
    if (totalRevenue >= 100000) tier = 'platinum';
    else if (totalRevenue >= 50000) tier = 'gold';
    else if (totalRevenue >= 20000) tier = 'silver';
    
    return {
      clientId,
      clientName,
      totalRevenue,
      totalJobs,
      averageJobValue,
      firstJobDate,
      lastJobDate,
      monthsActive,
      monthlyAverageRevenue,
      predictedLifetimeValue,
      riskScore,
      tier
    };
  }
  
  /**
   * Calculate technician efficiency metrics
   */
  static async calculateTechnicianEfficiency(period: DateRange): Promise<TechnicianEfficiency[]> {
    const efficiencyMetrics: TechnicianEfficiency[] = [];
    
    try {
      // Get all technicians
      const techniciansQuery = query(
        collection(db, 'users'),
        where('role', '==', 'technician')
      );
      
      const techniciansSnapshot = await getDocs(techniciansQuery);
      
      for (const techDoc of techniciansSnapshot.docs) {
        const technician = techDoc.data();
        const efficiency = await this.calculateSingleTechnicianEfficiency(
          techDoc.id, 
          technician.name, 
          period
        );
        efficiencyMetrics.push(efficiency);
      }
      
      // Sort by efficiency score descending
      efficiencyMetrics.sort((a, b) => b.efficiencyScore - a.efficiencyScore);
      
    } catch (error) {
      console.error('Error calculating technician efficiency:', error);
    }
    
    return efficiencyMetrics;
  }
  
  private static async calculateSingleTechnicianEfficiency(
    technicianId: string,
    technicianName: string,
    period: DateRange
  ): Promise<TechnicianEfficiency> {
    // Get jobs for this technician in the period
    const jobsQuery = query(
      collection(db, 'jobs'),
      where('assignedTechnicianId', '==', technicianId),
      where('createdAt', '>=', period.startDate),
      where('createdAt', '<=', period.endDate)
    );
    
    const jobsSnapshot = await getDocs(jobsQuery);
    const jobs = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const totalJobs = jobs.length;
    const completedJobs = jobs.filter(job => job.status === 'completed').length;
    
    // Calculate average job duration
    const completedJobsWithDuration = jobs.filter(job => 
      job.status === 'completed' && job.startTime && job.endTime
    );
    
    const averageJobDuration = completedJobsWithDuration.length > 0
      ? completedJobsWithDuration.reduce((sum, job) => {
          const duration = new Date(job.endTime).getTime() - new Date(job.startTime).getTime();
          return sum + (duration / (1000 * 60)); // Convert to minutes
        }, 0) / completedJobsWithDuration.length
      : 0;
    
    // Calculate on-time completion (simplified)
    const onTimeJobs = jobs.filter(job => job.onTime === true).length;
    const onTimeCompletion = totalJobs > 0 ? (onTimeJobs / totalJobs) * 100 : 0;
    
    // Calculate revenue and costs
    const revenueGenerated = jobs.reduce((sum, job) => sum + (job.totalAmount || 0), 0);
    const costsIncurred = jobs.reduce((sum, job) => sum + (job.totalCosts || 0), 0);
    const profitability = revenueGenerated - costsIncurred;
    
    // Calculate efficiency score (0-100)
    const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;
    const efficiencyScore = Math.round(
      (completionRate * 0.4) + 
      (onTimeCompletion * 0.3) + 
      (Math.min(100, (profitability / revenueGenerated) * 100) * 0.3)
    );
    
    return {
      technicianId,
      technicianName,
      period,
      totalJobs,
      completedJobs,
      averageJobDuration,
      onTimeCompletion,
      customerSatisfaction: 4.2, // Would come from feedback system
      revenueGenerated,
      costsIncurred,
      profitability,
      skillRating: 4.0, // Would come from assessment system
      certifications: [], // Would come from technician profile
      specializations: [], // Would come from technician profile
      efficiencyScore
    };
  }
  
  /**
   * Calculate chair reliability scores
   */
  static async calculateChairReliabilityScores(): Promise<ChairReliabilityScore[]> {
    const reliabilityScores: ChairReliabilityScore[] = [];
    
    try {
      // Get all chairs
      const chairsQuery = query(collection(db, 'chairs'));
      const chairsSnapshot = await getDocs(chairsQuery);
      
      for (const chairDoc of chairsSnapshot.docs) {
        const chair = chairDoc.data();
        const score = await this.calculateSingleChairReliability(chairDoc.id, chair);
        reliabilityScores.push(score);
      }
      
      // Sort by reliability score ascending (worst first)
      reliabilityScores.sort((a, b) => a.reliabilityScore - b.reliabilityScore);
      
    } catch (error) {
      console.error('Error calculating chair reliability scores:', error);
    }
    
    return reliabilityScores;
  }
  
  private static async calculateSingleChairReliability(
    chairId: string,
    chairData: any
  ): Promise<ChairReliabilityScore> {
    // Get service history for this chair
    const servicesQuery = query(
      collection(db, 'jobs'),
      where('chairIds', 'array-contains', chairId),
      where('status', '==', 'completed'),
      orderBy('completedAt')
    );
    
    const servicesSnapshot = await getDocs(servicesQuery);
    const services = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const totalServices = services.length;
    const ageInMonths = chairData.purchaseDate 
      ? Math.max(1, (new Date().getTime() - new Date(chairData.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 30))
      : 12; // Default to 12 months if no purchase date
    
    // Calculate average time between services
    let averageTimeBetweenServices = 0;
    if (services.length > 1) {
      const intervals = [];
      for (let i = 1; i < services.length; i++) {
        const interval = (new Date(services[i].completedAt).getTime() - 
                         new Date(services[i-1].completedAt).getTime()) / (1000 * 60 * 60 * 24);
        intervals.push(interval);
      }
      averageTimeBetweenServices = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    }
    
    // Calculate maintenance cost
    const maintenanceCost = services.reduce((sum, service) => sum + (service.totalAmount || 0), 0);
    
    // Calculate reliability score (0-100, higher = more reliable)
    const serviceFrequency = totalServices / ageInMonths; // services per month
    const costPerMonth = maintenanceCost / ageInMonths;
    
    let reliabilityScore = 100;
    reliabilityScore -= Math.min(50, serviceFrequency * 20); // Penalty for frequent services
    reliabilityScore -= Math.min(30, costPerMonth / 100); // Penalty for high costs
    reliabilityScore = Math.max(0, Math.round(reliabilityScore));
    
    // Determine if replacement is recommended
    const replacementRecommendation = reliabilityScore < 30 || 
                                    (ageInMonths > 60 && costPerMonth > 500);
    
    // Predict next service (simplified)
    const predictedNextService = averageTimeBetweenServices > 0
      ? new Date(Date.now() + averageTimeBetweenServices * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // Default 90 days
    
    return {
      chairId,
      chairModel: chairData.model || 'Unknown',
      manufacturer: chairData.manufacturer,
      ageInMonths,
      totalServices,
      totalDowntime: 0, // Would need to track downtime
      averageTimeBetweenServices,
      commonIssues: [], // Would analyze service descriptions
      reliabilityScore,
      maintenanceCost,
      replacementRecommendation,
      predictedNextService
    };
  }
  
  /**
   * Generate predictive maintenance alerts
   */
  static async generatePredictiveMaintenanceAlerts(): Promise<PredictiveMaintenanceAlert[]> {
    const alerts: PredictiveMaintenanceAlert[] = [];
    
    try {
      const reliabilityScores = await this.calculateChairReliabilityScores();
      
      for (const score of reliabilityScores) {
        // Generate alerts for chairs with low reliability or predicted issues
        if (score.reliabilityScore < 50) {
          alerts.push({
            id: `alert_${score.chairId}_${Date.now()}`,
            chairId: score.chairId,
            chairModel: score.chairModel,
            location: 'Unknown', // Would get from chair data
            predictedIssue: 'General maintenance required',
            probability: 100 - score.reliabilityScore,
            estimatedTimeframe: 30, // 30 days
            recommendedAction: score.replacementRecommendation 
              ? 'Consider replacement' 
              : 'Schedule preventive maintenance',
            estimatedCost: score.maintenanceCost / score.totalServices || 500,
            priority: score.reliabilityScore < 20 ? 'critical' : 
                     score.reliabilityScore < 35 ? 'high' : 'medium',
            createdAt: new Date(),
            acknowledged: false
          });
        }
      }
      
    } catch (error) {
      console.error('Error generating predictive maintenance alerts:', error);
    }
    
    return alerts;
  }
  
  /**
   * Helper method to get previous period for trend calculations
   */
  private static getPreviousPeriod(period: DateRange): DateRange {
    const periodLength = period.endDate.getTime() - period.startDate.getTime();
    return {
      startDate: new Date(period.startDate.getTime() - periodLength),
      endDate: new Date(period.startDate.getTime())
    };
  }
  
  /**
   * Calculate ROI for various business initiatives
   */
  static async calculateROI(
    analysisType: string,
    initialInvestment: number,
    period: DateRange,
    costs: any[],
    benefits: any[]
  ): Promise<ROIAnalysis> {
    // Calculate total costs and benefits over the period
    const totalCosts = costs.reduce((sum, cost) => {
      const frequency = cost.frequency;
      let multiplier = 1;
      
      const periodMonths = (period.endDate.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      
      switch (frequency) {
        case 'monthly': multiplier = periodMonths; break;
        case 'quarterly': multiplier = periodMonths / 3; break;
        case 'yearly': multiplier = periodMonths / 12; break;
      }
      
      return sum + (cost.amount * multiplier);
    }, initialInvestment);
    
    const totalBenefits = benefits.reduce((sum, benefit) => {
      const frequency = benefit.frequency;
      let multiplier = 1;
      
      const periodMonths = (period.endDate.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      
      switch (frequency) {
        case 'monthly': multiplier = periodMonths; break;
        case 'quarterly': multiplier = periodMonths / 3; break;
        case 'yearly': multiplier = periodMonths / 12; break;
      }
      
      return sum + (benefit.amount * multiplier);
    }, 0);
    
    const netBenefit = totalBenefits - totalCosts;
    const roi = totalCosts > 0 ? (netBenefit / totalCosts) * 100 : 0;
    
    // Calculate payback period (simplified)
    const monthlyNetBenefit = netBenefit / ((period.endDate.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const paybackPeriod = monthlyNetBenefit > 0 ? initialInvestment / monthlyNetBenefit : 0;
    
    return {
      id: `roi_${Date.now()}`,
      analysisType: analysisType as any,
      name: `ROI Analysis - ${analysisType}`,
      description: `ROI analysis for ${analysisType}`,
      initialInvestment,
      period,
      costs,
      benefits,
      totalCosts,
      totalBenefits,
      netBenefit,
      roi,
      paybackPeriod,
      npv: netBenefit, // Simplified NPV
      irr: roi, // Simplified IRR
      riskFactors: [],
      assumptions: [],
      calculatedAt: new Date(),
      calculatedBy: 'system'
    };
  }
}