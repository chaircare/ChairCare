// Dynamic Pricing Engine for Chair Care
import { 
  PricingContext, 
  PricingCalculation, 
  PricingDiscount, 
  SeasonalAdjustment,
  BulkDiscountRule,
  ClientPricingTier,
  SeasonalPricing,
  ServicePricing,
  PartPricing,
  ProfitAnalysis
} from 'types/pricing';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export class PricingEngine {
  
  /**
   * Calculate dynamic pricing for a job based on context
   */
  static async calculateJobPricing(
    context: PricingContext,
    services: ServicePricing[],
    parts: PartPricing[]
  ): Promise<PricingCalculation> {
    
    // 1. Calculate base pricing
    const baseServiceTotal = services.reduce((sum, service) => sum + service.basePrice, 0);
    const basePartsTotal = parts.reduce((sum, part) => sum + part.sellPrice, 0);
    const baseTotal = baseServiceTotal + basePartsTotal;
    
    // 2. Apply bulk discounts
    const bulkDiscounts = await this.calculateBulkDiscounts(context, services, parts);
    
    // 3. Apply client-specific pricing tiers
    const clientDiscounts = await this.calculateClientTierDiscounts(context.clientId, baseTotal);
    
    // 4. Apply seasonal adjustments
    const seasonalAdjustments = await this.calculateSeasonalAdjustments(context, services);
    
    // 5. Apply urgency surcharges
    const urgencyAdjustments = this.calculateUrgencyAdjustments(context, baseTotal);
    
    // 6. Apply distance/travel surcharges
    const travelSurcharges = this.calculateTravelSurcharges(context);
    
    // 7. Combine all adjustments
    const allDiscounts = [...bulkDiscounts, ...clientDiscounts, ...urgencyAdjustments];
    const totalDiscountAmount = allDiscounts.reduce((sum, discount) => sum + discount.amount, 0);
    const totalSeasonalAdjustment = seasonalAdjustments.reduce((sum, adj) => sum + adj.adjustmentAmount, 0);
    const totalTravelSurcharge = travelSurcharges;
    
    const finalTotal = baseTotal - totalDiscountAmount + totalSeasonalAdjustment + totalTravelSurcharge;
    
    // 8. Calculate profit margin
    const totalCosts = services.reduce((sum, service) => sum + service.costPrice, 0) + 
                      parts.reduce((sum, part) => sum + part.costPrice, 0);
    const profitMargin = ((finalTotal - totalCosts) / finalTotal) * 100;
    
    return {
      jobId: '', // Will be set when job is created
      clientId: context.clientId,
      baseTotal,
      discounts: allDiscounts,
      seasonalAdjustments,
      finalTotal: Math.max(finalTotal, 0), // Ensure non-negative
      profitMargin,
      calculatedAt: new Date(),
      calculatedBy: 'system'
    };
  }
  
  /**
   * Calculate bulk discount based on quantity
   */
  private static async calculateBulkDiscounts(
    context: PricingContext,
    services: ServicePricing[],
    parts: PartPricing[]
  ): Promise<PricingDiscount[]> {
    const discounts: PricingDiscount[] = [];
    
    try {
      // Get active bulk discount rules
      const rulesQuery = query(
        collection(db, 'bulkDiscountRules'),
        where('isActive', '==', true)
      );
      const rulesSnapshot = await getDocs(rulesQuery);
      
      for (const ruleDoc of rulesSnapshot.docs) {
        const rule = ruleDoc.data() as BulkDiscountRule;
        
        // Check if rule applies
        if (this.doesBulkRuleApply(rule, context, services)) {
          const discountAmount = this.calculateBulkDiscountAmount(rule, context, services, parts);
          
          if (discountAmount > 0) {
            discounts.push({
              type: 'bulk',
              description: `Bulk discount: ${rule.description}`,
              amount: discountAmount,
              percentage: rule.discountPercentage,
              appliedTo: rule.serviceType === 'all' ? 'total' : 'services'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error calculating bulk discounts:', error);
    }
    
    return discounts;
  }
  
  /**
   * Calculate client tier discounts
   */
  private static async calculateClientTierDiscounts(
    clientId: string,
    baseTotal: number
  ): Promise<PricingDiscount[]> {
    const discounts: PricingDiscount[] = [];
    
    try {
      // Get client's pricing tier
      const tierQuery = query(
        collection(db, 'clientPricingTiers'),
        where('clientId', '==', clientId)
      );
      const tierSnapshot = await getDocs(tierQuery);
      
      if (!tierSnapshot.empty) {
        const clientTier = tierSnapshot.docs[0].data() as ClientPricingTier;
        
        // Get tier details
        const tierDoc = await getDoc(doc(db, 'pricingTiers', clientTier.tierId));
        if (tierDoc.exists()) {
          const tier = tierDoc.data();
          
          // Check if minimum job value is met
          if (!tier.minimumJobValue || baseTotal >= tier.minimumJobValue) {
            const discountAmount = (baseTotal * tier.discountPercentage) / 100;
            
            discounts.push({
              type: 'client_tier',
              description: `${tier.name} tier discount`,
              amount: discountAmount,
              percentage: tier.discountPercentage,
              appliedTo: 'total'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error calculating client tier discounts:', error);
    }
    
    return discounts;
  }
  
  /**
   * Calculate seasonal pricing adjustments
   */
  private static async calculateSeasonalAdjustments(
    context: PricingContext,
    services: ServicePricing[]
  ): Promise<SeasonalAdjustment[]> {
    const adjustments: SeasonalAdjustment[] = [];
    
    try {
      const now = context.scheduledDate;
      
      // Get active seasonal pricing
      const seasonalQuery = query(
        collection(db, 'seasonalPricing'),
        where('isActive', '==', true)
      );
      const seasonalSnapshot = await getDocs(seasonalQuery);
      
      for (const seasonalDoc of seasonalSnapshot.docs) {
        const seasonal = seasonalDoc.data() as SeasonalPricing;
        
        // Check if current date falls within seasonal period
        if (now >= seasonal.startDate && now <= seasonal.endDate) {
          let adjustmentAmount = 0;
          
          if (seasonal.appliesTo === 'all_services') {
            const serviceTotal = services.reduce((sum, service) => sum + service.basePrice, 0);
            adjustmentAmount = seasonal.adjustmentType === 'percentage' 
              ? (serviceTotal * seasonal.adjustmentValue) / 100
              : seasonal.adjustmentValue;
          } else if (seasonal.serviceIds) {
            // Apply to specific services only
            const applicableServices = services.filter(s => seasonal.serviceIds!.includes(s.id));
            const applicableTotal = applicableServices.reduce((sum, service) => sum + service.basePrice, 0);
            adjustmentAmount = seasonal.adjustmentType === 'percentage'
              ? (applicableTotal * seasonal.adjustmentValue) / 100
              : seasonal.adjustmentValue;
          }
          
          if (adjustmentAmount !== 0) {
            adjustments.push({
              seasonalPricingId: seasonalDoc.id,
              name: seasonal.name,
              adjustmentAmount,
              appliedTo: seasonal.appliesTo === 'all_services' ? ['all'] : seasonal.serviceIds || []
            });
          }
        }
      }
    } catch (error) {
      console.error('Error calculating seasonal adjustments:', error);
    }
    
    return adjustments;
  }
  
  /**
   * Calculate urgency surcharges
   */
  private static calculateUrgencyAdjustments(
    context: PricingContext,
    baseTotal: number
  ): PricingDiscount[] {
    const adjustments: PricingDiscount[] = [];
    
    switch (context.urgency) {
      case 'urgent':
        adjustments.push({
          type: 'manual',
          description: 'Urgent service surcharge (25%)',
          amount: -(baseTotal * 0.25), // Negative because it's a surcharge
          percentage: 25,
          appliedTo: 'total'
        });
        break;
      case 'emergency':
        adjustments.push({
          type: 'manual',
          description: 'Emergency service surcharge (50%)',
          amount: -(baseTotal * 0.50),
          percentage: 50,
          appliedTo: 'total'
        });
        break;
    }
    
    return adjustments;
  }
  
  /**
   * Calculate travel/distance surcharges
   */
  private static calculateTravelSurcharges(context: PricingContext): number {
    if (!context.distanceFromBase) return 0;
    
    // Free travel within 20km, R50 per additional 10km
    const freeDistance = 20;
    const chargePerBlock = 50;
    const blockSize = 10;
    
    if (context.distanceFromBase <= freeDistance) return 0;
    
    const chargeableDistance = context.distanceFromBase - freeDistance;
    const blocks = Math.ceil(chargeableDistance / blockSize);
    
    return blocks * chargePerBlock;
  }
  
  /**
   * Helper: Check if bulk discount rule applies
   */
  private static doesBulkRuleApply(
    rule: BulkDiscountRule,
    context: PricingContext,
    services: ServicePricing[]
  ): boolean {
    if (rule.serviceType === 'all') {
      return context.chairCount >= rule.minimumQuantity;
    }
    
    const applicableServices = services.filter(s => s.category === rule.serviceType);
    return applicableServices.length >= rule.minimumQuantity;
  }
  
  /**
   * Helper: Calculate bulk discount amount
   */
  private static calculateBulkDiscountAmount(
    rule: BulkDiscountRule,
    context: PricingContext,
    services: ServicePricing[],
    parts: PartPricing[]
  ): number {
    let applicableTotal = 0;
    
    if (rule.serviceType === 'all') {
      applicableTotal = services.reduce((sum, service) => sum + service.basePrice, 0);
    } else {
      const applicableServices = services.filter(s => s.category === rule.serviceType);
      applicableTotal = applicableServices.reduce((sum, service) => sum + service.basePrice, 0);
    }
    
    if (rule.discountType === 'percentage') {
      return (applicableTotal * rule.discountPercentage) / 100;
    } else {
      return rule.discountValue;
    }
  }
  
  /**
   * Calculate profit analysis for a completed job
   */
  static calculateProfitAnalysis(
    jobId: string,
    totalRevenue: number,
    services: ServicePricing[],
    parts: PartPricing[],
    laborHours: number,
    hourlyRate: number = 350 // Default technician hourly rate
  ): ProfitAnalysis {
    
    const laborCosts = laborHours * hourlyRate;
    const partsCosts = parts.reduce((sum, part) => sum + part.costPrice, 0);
    const serviceCosts = services.reduce((sum, service) => sum + service.costPrice, 0);
    
    // Overhead costs (estimated at 15% of revenue)
    const overheadCosts = totalRevenue * 0.15;
    
    const totalCosts = laborCosts + partsCosts + serviceCosts + overheadCosts;
    const grossProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    
    return {
      jobId,
      totalRevenue,
      totalCosts,
      laborCosts,
      partsCosts: partsCosts + serviceCosts,
      overheadCosts,
      grossProfit,
      profitMargin,
      calculatedAt: new Date()
    };
  }
  
  /**
   * Get pricing recommendations based on market analysis
   */
  static async getPricingRecommendations(
    serviceId: string,
    currentPrice: number
  ): Promise<{
    recommendedPrice: number;
    confidence: number;
    reasoning: string;
    marketPosition: 'below' | 'at' | 'above';
  }> {
    // This would integrate with market data APIs or manual competitor analysis
    // For now, return basic recommendations based on profit margins
    
    const targetMargin = 0.35; // 35% target profit margin
    const recommendedPrice = currentPrice * 1.1; // Simple 10% increase suggestion
    
    return {
      recommendedPrice,
      confidence: 0.7,
      reasoning: 'Based on target profit margin of 35% and market positioning',
      marketPosition: 'at'
    };
  }
}