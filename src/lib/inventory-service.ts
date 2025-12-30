// Inventory Management Service for Chair Care
import { 
  InventoryItem, 
  StockMovement, 
  StockAlert, 
  ReorderSuggestion,
  InventoryMetrics,
  UsageAnalytics
} from 'types/inventory';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export class InventoryService {
  
  /**
   * Get current stock levels for all items
   */
  static async getStockLevels(): Promise<InventoryItem[]> {
    try {
      const itemsQuery = query(
        collection(db, 'inventoryItems'),
        where('isActive', '==', true),
        orderBy('name')
      );
      
      const snapshot = await getDocs(itemsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as InventoryItem));
    } catch (error) {
      console.error('Error getting stock levels:', error);
      return [];
    }
  }
  
  /**
   * Record stock movement (in/out/adjustment)
   */
  static async recordStockMovement(movement: Omit<StockMovement, 'id'>): Promise<string> {
    try {
      // Add movement record
      const movementRef = await addDoc(collection(db, 'stockMovements'), {
        ...movement,
        performedAt: new Date()
      });
      
      // Update item stock quantity
      const itemRef = doc(db, 'inventoryItems', movement.itemId);
      const itemDoc = await getDoc(itemRef);
      
      if (itemDoc.exists()) {
        const currentStock = itemDoc.data().currentStock || 0;
        let newStock = currentStock;
        
        switch (movement.movementType) {
          case 'in':
            newStock = currentStock + movement.quantity;
            break;
          case 'out':
            newStock = Math.max(0, currentStock - movement.quantity);
            break;
          case 'adjustment':
            newStock = movement.quantity; // Adjustment sets absolute quantity
            break;
        }
        
        await updateDoc(itemRef, {
          currentStock: newStock,
          updatedAt: new Date()
        });
        
        // Check for stock alerts after movement
        await this.checkStockAlerts(movement.itemId);
      }
      
      return movementRef.id;
    } catch (error) {
      console.error('Error recording stock movement:', error);
      throw error;
    }
  }
  
  /**
   * Check and create stock alerts for low/out of stock items
   */
  static async checkStockAlerts(itemId?: string): Promise<void> {
    try {
      let itemsQuery;
      
      if (itemId) {
        // Check specific item
        itemsQuery = query(
          collection(db, 'inventoryItems'),
          where('id', '==', itemId)
        );
      } else {
        // Check all active items
        itemsQuery = query(
          collection(db, 'inventoryItems'),
          where('isActive', '==', true)
        );
      }
      
      const itemsSnapshot = await getDocs(itemsQuery);
      
      for (const itemDoc of itemsSnapshot.docs) {
        const item = itemDoc.data() as InventoryItem;
        
        // Check for low stock
        if (item.currentStock <= item.reorderPoint && item.currentStock > 0) {
          await this.createStockAlert({
            itemId: item.id,
            item,
            alertType: 'low_stock',
            severity: 'medium',
            message: `${item.name} is running low (${item.currentStock} remaining, reorder at ${item.reorderPoint})`,
            isActive: true,
            createdAt: new Date()
          });
        }
        
        // Check for out of stock
        if (item.currentStock <= 0) {
          await this.createStockAlert({
            itemId: item.id,
            item,
            alertType: 'out_of_stock',
            severity: 'high',
            message: `${item.name} is out of stock`,
            isActive: true,
            createdAt: new Date()
          });
        }
        
        // Check for overstock (more than 3x reorder quantity)
        const overstockThreshold = item.reorderQuantity * 3;
        if (item.currentStock > overstockThreshold) {
          await this.createStockAlert({
            itemId: item.id,
            item,
            alertType: 'overstock',
            severity: 'low',
            message: `${item.name} may be overstocked (${item.currentStock} units)`,
            isActive: true,
            createdAt: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Error checking stock alerts:', error);
    }
  }
  
  /**
   * Create stock alert (avoid duplicates)
   */
  private static async createStockAlert(alert: Omit<StockAlert, 'id'>): Promise<void> {
    try {
      // Check if similar alert already exists
      const existingAlertsQuery = query(
        collection(db, 'stockAlerts'),
        where('itemId', '==', alert.itemId),
        where('alertType', '==', alert.alertType),
        where('isActive', '==', true)
      );
      
      const existingAlerts = await getDocs(existingAlertsQuery);
      
      // Only create if no active alert of same type exists
      if (existingAlerts.empty) {
        await addDoc(collection(db, 'stockAlerts'), alert);
      }
    } catch (error) {
      console.error('Error creating stock alert:', error);
    }
  }
  
  /**
   * Get active stock alerts
   */
  static async getActiveAlerts(): Promise<StockAlert[]> {
    try {
      const alertsQuery = query(
        collection(db, 'stockAlerts'),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(alertsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StockAlert));
    } catch (error) {
      console.error('Error getting active alerts:', error);
      return [];
    }
  }
  
  /**
   * Generate reorder suggestions based on usage patterns
   */
  static async generateReorderSuggestions(): Promise<ReorderSuggestion[]> {
    try {
      const suggestions: ReorderSuggestion[] = [];
      
      // Get items that need reordering
      const itemsQuery = query(
        collection(db, 'inventoryItems'),
        where('isActive', '==', true)
      );
      
      const itemsSnapshot = await getDocs(itemsQuery);
      
      for (const itemDoc of itemsSnapshot.docs) {
        const item = itemDoc.data() as InventoryItem;
        
        // Calculate usage analytics for the item
        const usage = await this.calculateUsageAnalytics(item.id, 'month');
        
        // Determine if reorder is needed
        if (item.currentStock <= item.reorderPoint) {
          let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
          let suggestedQuantity = item.reorderQuantity;
          
          // Adjust urgency based on stock level and usage
          if (item.currentStock <= 0) {
            urgency = 'critical';
            suggestedQuantity = Math.max(item.reorderQuantity, usage.quantityUsed * 2);
          } else if (item.currentStock <= item.minimumStock) {
            urgency = 'high';
            suggestedQuantity = Math.max(item.reorderQuantity, usage.quantityUsed * 1.5);
          } else if (usage.trend === 'increasing') {
            urgency = 'medium';
            suggestedQuantity = Math.max(item.reorderQuantity, usage.forecastedUsage);
          }
          
          suggestions.push({
            itemId: item.id,
            item,
            currentStock: item.currentStock,
            suggestedQuantity,
            urgency,
            reasoning: this.generateReorderReasoning(item, usage, urgency),
            estimatedCost: suggestedQuantity * item.unitCost,
            leadTime: 7, // Default lead time, should come from supplier
            calculatedAt: new Date()
          });
        }
      }
      
      // Sort by urgency (critical first)
      return suggestions.sort((a, b) => {
        const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      });
      
    } catch (error) {
      console.error('Error generating reorder suggestions:', error);
      return [];
    }
  }
  
  /**
   * Calculate usage analytics for an item
   */
  static async calculateUsageAnalytics(
    itemId: string, 
    period: 'week' | 'month' | 'quarter' | 'year'
  ): Promise<UsageAnalytics> {
    try {
      const now = new Date();
      const startDate = new Date();
      
      // Calculate period start date
      switch (period) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      // Get stock movements for the period
      const movementsQuery = query(
        collection(db, 'stockMovements'),
        where('itemId', '==', itemId),
        where('movementType', '==', 'out'),
        where('performedAt', '>=', startDate),
        where('performedAt', '<=', now)
      );
      
      const movementsSnapshot = await getDocs(movementsQuery);
      const movements = movementsSnapshot.docs.map(doc => doc.data() as StockMovement);
      
      // Calculate usage metrics
      const quantityUsed = movements.reduce((sum, movement) => sum + movement.quantity, 0);
      const totalJobs = new Set(movements.map(m => m.reference)).size;
      const averageUsagePerJob = totalJobs > 0 ? quantityUsed / totalJobs : 0;
      const costOfUsage = movements.reduce((sum, movement) => sum + (movement.totalCost || 0), 0);
      
      // Simple trend calculation (compare with previous period)
      const previousPeriodStart = new Date(startDate);
      const previousPeriodEnd = new Date(startDate);
      
      switch (period) {
        case 'week':
          previousPeriodStart.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          previousPeriodStart.setMonth(startDate.getMonth() - 1);
          break;
        case 'quarter':
          previousPeriodStart.setMonth(startDate.getMonth() - 3);
          break;
        case 'year':
          previousPeriodStart.setFullYear(startDate.getFullYear() - 1);
          break;
      }
      
      const previousMovementsQuery = query(
        collection(db, 'stockMovements'),
        where('itemId', '==', itemId),
        where('movementType', '==', 'out'),
        where('performedAt', '>=', previousPeriodStart),
        where('performedAt', '<=', previousPeriodEnd)
      );
      
      const previousMovementsSnapshot = await getDocs(previousMovementsQuery);
      const previousQuantityUsed = previousMovementsSnapshot.docs
        .reduce((sum, doc) => sum + (doc.data() as StockMovement).quantity, 0);
      
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (quantityUsed > previousQuantityUsed * 1.1) {
        trend = 'increasing';
      } else if (quantityUsed < previousQuantityUsed * 0.9) {
        trend = 'decreasing';
      }
      
      // Forecast usage for next period (simple linear projection)
      const forecastedUsage = trend === 'increasing' 
        ? Math.ceil(quantityUsed * 1.2)
        : trend === 'decreasing' 
          ? Math.ceil(quantityUsed * 0.8)
          : quantityUsed;
      
      // Get item details
      const itemDoc = await getDoc(doc(db, 'inventoryItems', itemId));
      const item = itemDoc.exists() ? { id: itemDoc.id, ...itemDoc.data() } as InventoryItem : null;
      
      return {
        itemId,
        item: item!,
        period,
        startDate,
        endDate: now,
        quantityUsed,
        averageUsagePerJob,
        totalJobs,
        costOfUsage,
        trend,
        forecastedUsage
      };
      
    } catch (error) {
      console.error('Error calculating usage analytics:', error);
      throw error;
    }
  }
  
  /**
   * Generate reasoning text for reorder suggestions
   */
  private static generateReorderReasoning(
    item: InventoryItem, 
    usage: UsageAnalytics, 
    urgency: string
  ): string {
    const reasons = [];
    
    if (item.currentStock <= 0) {
      reasons.push('Out of stock');
    } else if (item.currentStock <= item.minimumStock) {
      reasons.push(`Below minimum stock level (${item.minimumStock})`);
    }
    
    if (usage.trend === 'increasing') {
      reasons.push('Usage trending upward');
    }
    
    if (usage.averageUsagePerJob > 0) {
      const daysOfStock = Math.floor(item.currentStock / (usage.quantityUsed / 30));
      reasons.push(`Approximately ${daysOfStock} days of stock remaining`);
    }
    
    return reasons.join('. ') || 'Regular reorder point reached';
  }
  
  /**
   * Get inventory dashboard metrics
   */
  static async getInventoryMetrics(): Promise<InventoryMetrics> {
    try {
      // Get all active items
      const itemsQuery = query(
        collection(db, 'inventoryItems'),
        where('isActive', '==', true)
      );
      const itemsSnapshot = await getDocs(itemsQuery);
      const items = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
      
      // Calculate basic metrics
      const totalItems = items.length;
      const totalValue = items.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0);
      const lowStockItems = items.filter(item => item.currentStock <= item.reorderPoint && item.currentStock > 0).length;
      const outOfStockItems = items.filter(item => item.currentStock <= 0).length;
      const overstockItems = items.filter(item => item.currentStock > item.reorderQuantity * 3).length;
      
      // Get active alerts count
      const alertsQuery = query(
        collection(db, 'stockAlerts'),
        where('isActive', '==', true)
      );
      const alertsSnapshot = await getDocs(alertsQuery);
      const activeAlerts = alertsSnapshot.size;
      
      // Calculate monthly usage value (simplified)
      const monthlyUsageValue = 0; // Would need to calculate from movements
      const averageStockTurnover = 0; // Would need historical data
      
      return {
        totalItems,
        totalValue,
        lowStockItems,
        outOfStockItems,
        overstockItems,
        activeAlerts,
        monthlyUsageValue,
        averageStockTurnover,
        topUsedItems: [], // Would calculate from usage analytics
        supplierPerformance: [] // Would calculate from purchase orders
      };
      
    } catch (error) {
      console.error('Error getting inventory metrics:', error);
      throw error;
    }
  }
  
  /**
   * Record parts usage for a job
   */
  static async recordJobPartsUsage(
    jobId: string,
    chairId: string,
    partsUsed: Array<{ itemId: string; quantity: number; notes?: string }>
  ): Promise<void> {
    try {
      for (const part of partsUsed) {
        // Record stock movement
        await this.recordStockMovement({
          itemId: part.itemId,
          movementType: 'out',
          quantity: part.quantity,
          reason: 'Job usage',
          reference: jobId,
          performedBy: 'technician', // Should be actual technician ID
          performedAt: new Date(),
          notes: part.notes
        });
        
        // Record job parts usage for warranty tracking
        await addDoc(collection(db, 'jobPartsUsage'), {
          jobId,
          chairId,
          itemId: part.itemId,
          quantityUsed: part.quantity,
          installedAt: new Date(),
          notes: part.notes
        });
      }
    } catch (error) {
      console.error('Error recording job parts usage:', error);
      throw error;
    }
  }
  
  /**
   * Mobile stock check - for technicians to verify stock levels
   */
  static async performMobileStockCheck(
    itemId: string,
    countedQuantity: number,
    condition: 'good' | 'damaged' | 'expired',
    notes?: string,
    photoUrl?: string
  ): Promise<void> {
    try {
      // Get current system quantity
      const itemDoc = await getDoc(doc(db, 'inventoryItems', itemId));
      if (!itemDoc.exists()) {
        throw new Error('Item not found');
      }
      
      const item = itemDoc.data() as InventoryItem;
      const systemQuantity = item.currentStock;
      
      // Record the stock check
      await addDoc(collection(db, 'mobileStockChecks'), {
        itemId,
        scannedQuantity: countedQuantity,
        condition,
        notes,
        photoUrl,
        checkedBy: 'technician', // Should be actual technician ID
        checkedAt: new Date()
      });
      
      // If there's a significant variance, create an adjustment
      const variance = Math.abs(countedQuantity - systemQuantity);
      const varianceThreshold = Math.max(1, systemQuantity * 0.1); // 10% or minimum 1 unit
      
      if (variance >= varianceThreshold) {
        await addDoc(collection(db, 'stockAdjustments'), {
          itemId,
          previousQuantity: systemQuantity,
          newQuantity: countedQuantity,
          adjustmentQuantity: countedQuantity - systemQuantity,
          reason: 'correction',
          notes: `Mobile stock check variance: ${notes || 'No notes'}`,
          performedBy: 'technician',
          performedAt: new Date(),
          approved: false // Requires admin approval
        });
      }
      
    } catch (error) {
      console.error('Error performing mobile stock check:', error);
      throw error;
    }
  }
}