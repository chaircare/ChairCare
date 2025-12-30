// Firebase Firestore database operations
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Chair, 
  ServiceLog, 
  Quote, 
  ServicePricing, 
  DashboardStats,
  CreateChairForm,
  User
} from 'types/chair-care';

// Helper function to generate ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper function to convert Firestore timestamp to Date
const timestampToDate = (timestamp: any): Date => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate();
  }
  return new Date();
};

// Chair operations
export const getChairs = async (clientId?: string): Promise<Chair[]> => {
  try {
    let chairsQuery = collection(db, 'chairs');
    
    if (clientId) {
      chairsQuery = query(collection(db, 'chairs'), where('clientId', '==', clientId));
    }
    
    const querySnapshot = await getDocs(chairsQuery);
    const chairs: Chair[] = [];
    
    for (const docSnap of querySnapshot.docs) {
      const chairData = docSnap.data();
      
      // Get user data if needed
      let user = undefined;
      if (chairData.clientId) {
        const userDoc = await getDoc(doc(db, 'users', chairData.clientId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          user = {
            id: userDoc.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            companyName: userData.companyName,
            createdAt: timestampToDate(userData.createdAt),
            updatedAt: timestampToDate(userData.updatedAt)
          } as User;
        }
      }
      
      chairs.push({
        id: docSnap.id,
        ...chairData,
        user,
        createdAt: timestampToDate(chairData.createdAt),
        updatedAt: timestampToDate(chairData.updatedAt)
      } as Chair);
    }
    
    return chairs;
  } catch (error) {
    console.error('Error getting chairs:', error);
    return [];
  }
};

export const getChairById = async (id: string): Promise<Chair | null> => {
  try {
    const chairDoc = await getDoc(doc(db, 'chairs', id));
    if (!chairDoc.exists()) return null;
    
    const chairData = chairDoc.data();
    
    // Get user data
    let user = undefined;
    if (chairData.clientId) {
      const userDoc = await getDoc(doc(db, 'users', chairData.clientId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        user = {
          id: userDoc.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          companyName: userData.companyName,
          createdAt: timestampToDate(userData.createdAt),
          updatedAt: timestampToDate(userData.updatedAt)
        } as User;
      }
    }
    
    return {
      id: chairDoc.id,
      ...chairData,
      user,
      createdAt: timestampToDate(chairData.createdAt),
      updatedAt: timestampToDate(chairData.updatedAt)
    } as Chair;
  } catch (error) {
    console.error('Error getting chair by ID:', error);
    return null;
  }
};

export const getChairByQRCode = async (qrCode: string): Promise<Chair | null> => {
  try {
    const chairsQuery = query(
      collection(db, 'chairs'),
      where('qrCode', '==', qrCode),
      limit(1)
    );
    const querySnapshot = await getDocs(chairsQuery);
    
    if (querySnapshot.empty) return null;
    
    const chairDoc = querySnapshot.docs[0];
    const chairData = chairDoc.data();
    
    // Get user data
    let user = undefined;
    if (chairData.clientId) {
      const userDoc = await getDoc(doc(db, 'users', chairData.clientId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        user = {
          id: userDoc.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          companyName: userData.companyName,
          createdAt: timestampToDate(userData.createdAt),
          updatedAt: timestampToDate(userData.updatedAt)
        } as User;
      }
    }
    
    return {
      id: chairDoc.id,
      ...chairData,
      user,
      createdAt: timestampToDate(chairData.createdAt),
      updatedAt: timestampToDate(chairData.updatedAt)
    } as Chair;
  } catch (error) {
    console.error('Error getting chair by QR code:', error);
    return null;
  }
};

export const createChair = async (data: CreateChairForm, clientId: string): Promise<Chair> => {
  try {
    const chairId = generateId();
    const qrCode = `CHAIRCARE:${chairId}:${data.chairNumber}`;
    
    const chairData = {
      qrCode,
      clientId,
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const chairRef = doc(db, 'chairs', chairId);
    await setDoc(chairRef, chairData);
    
    return {
      id: chairId,
      ...chairData,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Chair;
  } catch (error) {
    console.error('Error creating chair:', error);
    throw error;
  }
};

// Service Log operations
export const getServiceLogs = async (clientId?: string, chairId?: string): Promise<ServiceLog[]> => {
  try {
    let logsQuery = collection(db, 'serviceLogs');
    
    if (clientId && chairId) {
      logsQuery = query(
        collection(db, 'serviceLogs'),
        where('clientId', '==', clientId),
        where('chairId', '==', chairId),
        orderBy('createdAt', 'desc')
      );
    } else if (clientId) {
      logsQuery = query(
        collection(db, 'serviceLogs'),
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc')
      );
    } else if (chairId) {
      logsQuery = query(
        collection(db, 'serviceLogs'),
        where('chairId', '==', chairId),
        orderBy('createdAt', 'desc')
      );
    } else {
      logsQuery = query(
        collection(db, 'serviceLogs'),
        orderBy('createdAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(logsQuery);
    const serviceLogs: ServiceLog[] = [];
    
    for (const docSnap of querySnapshot.docs) {
      const logData = docSnap.data();
      
      // Get chair data
      let chair = undefined;
      if (logData.chairId) {
        chair = await getChairById(logData.chairId);
      }
      
      // Get user data
      let user = undefined;
      if (logData.clientId) {
        const userDoc = await getDoc(doc(db, 'users', logData.clientId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          user = {
            id: userDoc.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            companyName: userData.companyName,
            createdAt: timestampToDate(userData.createdAt),
            updatedAt: timestampToDate(userData.updatedAt)
          } as User;
        }
      }
      
      serviceLogs.push({
        id: docSnap.id,
        ...logData,
        chair,
        user,
        createdAt: timestampToDate(logData.createdAt),
        completedAt: logData.completedAt ? timestampToDate(logData.completedAt) : undefined
      } as ServiceLog);
    }
    
    return serviceLogs;
  } catch (error) {
    console.error('Error getting service logs:', error);
    return [];
  }
};

export const createServiceLog = async (
  chairId: string, 
  clientId: string, 
  serviceType: 'cleaning' | 'repair', 
  description: string
): Promise<ServiceLog> => {
  try {
    // Get pricing
    const pricingQuery = query(
      collection(db, 'servicePricing'),
      where('serviceType', '==', serviceType),
      where('active', '==', true),
      limit(1)
    );
    const pricingSnapshot = await getDocs(pricingQuery);
    
    let cost = serviceType === 'cleaning' ? 150 : 350; // Default prices
    if (!pricingSnapshot.empty) {
      const pricingData = pricingSnapshot.docs[0].data();
      cost = pricingData.basePrice;
    }
    
    const logData = {
      chairId,
      clientId,
      serviceType,
      description,
      cost,
      status: 'pending' as const,
      beforePhotos: [],
      afterPhotos: [],
      createdAt: serverTimestamp()
    };
    
    const logRef = doc(collection(db, 'serviceLogs'));
    await setDoc(logRef, logData);
    
    return {
      id: logRef.id,
      ...logData,
      createdAt: new Date()
    } as ServiceLog;
  } catch (error) {
    console.error('Error creating service log:', error);
    throw error;
  }
};

// Quote operations
export const createQuote = async (
  userId: string, 
  chairIds: string[], 
  serviceType: 'cleaning' | 'repair'
): Promise<Quote> => {
  try {
    // Get pricing
    const pricingQuery = query(
      collection(db, 'servicePricing'),
      where('serviceType', '==', serviceType),
      where('active', '==', true),
      limit(1)
    );
    const pricingSnapshot = await getDocs(pricingQuery);
    
    let basePrice = serviceType === 'cleaning' ? 150 : 350;
    let bulkDiscounts = serviceType === 'cleaning' 
      ? [
          { minChairs: 5, discountPercentage: 10 },
          { minChairs: 10, discountPercentage: 15 },
          { minChairs: 20, discountPercentage: 20 }
        ]
      : [
          { minChairs: 3, discountPercentage: 5 },
          { minChairs: 5, discountPercentage: 10 },
          { minChairs: 10, discountPercentage: 15 }
        ];
    
    if (!pricingSnapshot.empty) {
      const pricingData = pricingSnapshot.docs[0].data();
      basePrice = pricingData.basePrice;
      bulkDiscounts = pricingData.bulkDiscounts || bulkDiscounts;
    }
    
    const totalChairs = chairIds.length;
    const totalCost = totalChairs * basePrice;
    
    // Apply bulk discount
    let discount = 0;
    const applicableDiscount = bulkDiscounts
      .filter(d => totalChairs >= d.minChairs)
      .sort((a, b) => b.discountPercentage - a.discountPercentage)[0];
    
    if (applicableDiscount) {
      discount = (totalCost * applicableDiscount.discountPercentage) / 100;
    }
    
    const finalCost = totalCost - discount;
    
    const quoteData = {
      userId,
      chairIds,
      serviceType,
      totalChairs,
      pricePerChair: basePrice,
      totalCost,
      discount,
      finalCost,
      status: 'pending' as const,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: serverTimestamp()
    };
    
    const quoteRef = doc(collection(db, 'quotes'));
    await setDoc(quoteRef, quoteData);
    
    return {
      id: quoteRef.id,
      ...quoteData,
      createdAt: new Date()
    } as Quote;
  } catch (error) {
    console.error('Error creating quote:', error);
    throw error;
  }
};

export const getQuotes = async (userId?: string): Promise<Quote[]> => {
  try {
    let quotesQuery = collection(db, 'quotes');
    
    if (userId) {
      quotesQuery = query(
        collection(db, 'quotes'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    } else {
      quotesQuery = query(
        collection(db, 'quotes'),
        orderBy('createdAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(quotesQuery);
    const quotes: Quote[] = [];
    
    for (const docSnap of querySnapshot.docs) {
      const quoteData = docSnap.data();
      
      // Get user data
      let user = undefined;
      if (quoteData.userId) {
        const userDoc = await getDoc(doc(db, 'users', quoteData.userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          user = {
            id: userDoc.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            companyName: userData.companyName,
            createdAt: timestampToDate(userData.createdAt),
            updatedAt: timestampToDate(userData.updatedAt)
          } as User;
        }
      }
      
      // Get chairs data
      const chairs: Chair[] = [];
      if (quoteData.chairIds && Array.isArray(quoteData.chairIds)) {
        for (const chairId of quoteData.chairIds) {
          const chair = await getChairById(chairId);
          if (chair) chairs.push(chair);
        }
      }
      
      quotes.push({
        id: docSnap.id,
        ...quoteData,
        user,
        chairs,
        createdAt: timestampToDate(quoteData.createdAt),
        acceptedAt: quoteData.acceptedAt ? timestampToDate(quoteData.acceptedAt) : undefined
      } as Quote);
    }
    
    return quotes;
  } catch (error) {
    console.error('Error getting quotes:', error);
    return [];
  }
};

// Dashboard operations
export const getDashboardStats = async (clientId?: string): Promise<DashboardStats> => {
  try {
    const chairs = await getChairs(clientId);
    const serviceLogs = await getServiceLogs(clientId);
    
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const completedThisMonth = serviceLogs.filter(log => 
      log.status === 'completed' && 
      log.completedAt && 
      log.completedAt >= monthStart
    ).length;
    
    const totalRevenue = serviceLogs
      .filter(log => log.status === 'completed')
      .reduce((sum, log) => sum + log.cost, 0);
    
    const pendingServices = serviceLogs.filter(log => log.status === 'pending').length;
    
    const servicesByType = serviceLogs.reduce((acc, log) => {
      acc[log.serviceType] = (acc[log.serviceType] || 0) + 1;
      return acc;
    }, {} as Record<'cleaning' | 'repair', number>);
    
    return {
      totalChairs: chairs.length,
      pendingServices,
      completedThisMonth,
      totalRevenue,
      servicesByType
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      totalChairs: 0,
      pendingServices: 0,
      completedThisMonth: 0,
      totalRevenue: 0,
      servicesByType: { cleaning: 0, repair: 0 }
    };
  }
};

// Initialize default service pricing
export const initializeServicePricing = async (): Promise<void> => {
  try {
    const pricingData = [
      {
        id: 'cleaning',
        serviceType: 'cleaning',
        basePrice: 150,
        bulkDiscounts: [
          { minChairs: 5, discountPercentage: 10 },
          { minChairs: 10, discountPercentage: 15 },
          { minChairs: 20, discountPercentage: 20 }
        ],
        active: true
      },
      {
        id: 'repair',
        serviceType: 'repair',
        basePrice: 350,
        bulkDiscounts: [
          { minChairs: 3, discountPercentage: 5 },
          { minChairs: 5, discountPercentage: 10 },
          { minChairs: 10, discountPercentage: 15 }
        ],
        active: true
      }
    ];
    
    for (const pricing of pricingData) {
      const pricingRef = doc(db, 'servicePricing', pricing.id);
      const pricingDoc = await getDoc(pricingRef);
      
      if (!pricingDoc.exists()) {
        await setDoc(pricingRef, pricing);
      }
    }
  } catch (error) {
    console.error('Error initializing service pricing:', error);
  }
};