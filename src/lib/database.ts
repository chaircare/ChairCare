// Database utilities and mock data for development
// In production, this would connect to Firebase

import { 
  User, Chair, ServiceLog, Quote, ServicePricing, BulkDiscount,
  DashboardStats, CreateChairForm, ServiceRequestForm, CreateUserForm
} from 'types/chair-care';

// Mock data for development
let mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@chaircare.co.za',
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    email: 'client@company.co.za',
    name: 'John Smith',
    companyName: 'ABC Corporation',
    role: 'client',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

let mockChairs: Chair[] = [
  {
    id: '1',
    qrCode: 'CHAIRCARE:1:CH-001',
    chairNumber: 'CH-001',
    location: 'Office Floor 1 - Desk 5',
    model: 'Executive Chair Model X',
    userId: '2',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    qrCode: 'CHAIRCARE:2:CH-002',
    chairNumber: 'CH-002',
    location: 'Office Floor 1 - Desk 8',
    model: 'Task Chair Model Y',
    userId: '2',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

let mockServiceLogs: ServiceLog[] = [
  {
    id: '1',
    chairId: '1',
    userId: '2',
    serviceType: 'cleaning',
    description: 'Deep cleaning and sanitization',
    cost: 150,
    status: 'completed',
    beforePhotos: [],
    afterPhotos: [],
    technicianNotes: 'Chair cleaned thoroughly, fabric treated',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
  }
];

let mockQuotes: Quote[] = [];

let mockServicePricing: ServicePricing[] = [
  {
    id: '1',
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
    id: '2',
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

// Helper functions
const generateId = () => Math.random().toString(36).substr(2, 9);
const generateQRCode = (chairId: string, chairNumber: string) => `CHAIRCARE:${chairId}:${chairNumber}`;

// User operations
export const getUsers = async (): Promise<User[]> => {
  return mockUsers;
};

export const getUserById = async (id: string): Promise<User | null> => {
  return mockUsers.find(user => user.id === id) || null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  return mockUsers.find(user => user.email === email) || null;
};

export const createUser = async (data: CreateUserForm): Promise<User> => {
  const user: User = {
    id: generateId(),
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  mockUsers.push(user);
  return user;
};

// Chair operations
export const getChairs = async (userId?: string): Promise<Chair[]> => {
  let chairs = mockChairs.map(chair => ({
    ...chair,
    user: mockUsers.find(u => u.id === chair.userId)
  }));
  
  if (userId) {
    chairs = chairs.filter(chair => chair.userId === userId);
  }
  
  return chairs;
};

export const getChairById = async (id: string): Promise<Chair | null> => {
  const chair = mockChairs.find(chair => chair.id === id);
  if (!chair) return null;
  
  return {
    ...chair,
    user: mockUsers.find(u => u.id === chair.userId)
  };
};

export const getChairByQRCode = async (qrCode: string): Promise<Chair | null> => {
  const chair = mockChairs.find(chair => chair.qrCode === qrCode);
  if (!chair) return null;
  
  return {
    ...chair,
    user: mockUsers.find(u => u.id === chair.userId)
  };
};

export const createChair = async (data: CreateChairForm, userId: string): Promise<Chair> => {
  const chairId = generateId();
  const chair: Chair = {
    id: chairId,
    qrCode: generateQRCode(chairId, data.chairNumber),
    userId,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  mockChairs.push(chair);
  return chair;
};

// Service Log operations
export const getServiceLogs = async (userId?: string, chairId?: string): Promise<ServiceLog[]> => {
  let logs = mockServiceLogs.map(log => ({
    ...log,
    chair: mockChairs.find(c => c.id === log.chairId),
    user: mockUsers.find(u => u.id === log.userId)
  }));
  
  if (userId) {
    logs = logs.filter(log => log.userId === userId);
  }
  
  if (chairId) {
    logs = logs.filter(log => log.chairId === chairId);
  }
  
  return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const createServiceLog = async (chairId: string, userId: string, serviceType: 'cleaning' | 'repair', description: string): Promise<ServiceLog> => {
  const pricing = mockServicePricing.find(p => p.serviceType === serviceType);
  const cost = pricing?.basePrice || 0;
  
  const serviceLog: ServiceLog = {
    id: generateId(),
    chairId,
    userId,
    serviceType,
    description,
    cost,
    status: 'pending',
    beforePhotos: [],
    afterPhotos: [],
    createdAt: new Date()
  };
  
  mockServiceLogs.push(serviceLog);
  return serviceLog;
};

// Quote operations
export const createQuote = async (userId: string, chairIds: string[], serviceType: 'cleaning' | 'repair'): Promise<Quote> => {
  const pricing = mockServicePricing.find(p => p.serviceType === serviceType);
  if (!pricing) throw new Error('Service pricing not found');
  
  const totalChairs = chairIds.length;
  const pricePerChair = pricing.basePrice;
  const totalCost = totalChairs * pricePerChair;
  
  // Apply bulk discount
  let discount = 0;
  const applicableDiscount = pricing.bulkDiscounts
    .filter(d => totalChairs >= d.minChairs)
    .sort((a, b) => b.discountPercentage - a.discountPercentage)[0];
  
  if (applicableDiscount) {
    discount = (totalCost * applicableDiscount.discountPercentage) / 100;
  }
  
  const finalCost = totalCost - discount;
  
  const quote: Quote = {
    id: generateId(),
    userId,
    chairIds,
    serviceType,
    totalChairs,
    pricePerChair,
    totalCost,
    discount,
    finalCost,
    status: 'pending',
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    createdAt: new Date()
  };
  
  mockQuotes.push(quote);
  return quote;
};

export const getQuotes = async (userId?: string): Promise<Quote[]> => {
  let quotes = mockQuotes.map(quote => ({
    ...quote,
    user: mockUsers.find(u => u.id === quote.userId),
    chairs: quote.chairIds.map(id => mockChairs.find(c => c.id === id)).filter(Boolean) as Chair[]
  }));
  
  if (userId) {
    quotes = quotes.filter(quote => quote.userId === userId);
  }
  
  return quotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Dashboard operations
export const getDashboardStats = async (userId?: string): Promise<DashboardStats> => {
  const chairs = await getChairs(userId);
  const serviceLogs = await getServiceLogs(userId);
  
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
};

// Service Pricing operations
export const getServicePricing = async (): Promise<ServicePricing[]> => {
  return mockServicePricing.filter(pricing => pricing.active);
};