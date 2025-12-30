import { PriceBreakdown, AdditionalService } from 'types/chair-care';

// Base pricing structure
export const SERVICE_PRICING = {
  cleaning: {
    baseServiceFee: 50,
    pricePerChair: 25,
    description: 'Professional chair cleaning service'
  },
  repair: {
    baseServiceFee: 75,
    pricePerChair: 40,
    description: 'Chair repair and restoration'
  },
  maintenance: {
    baseServiceFee: 60,
    pricePerChair: 30,
    description: 'Preventive maintenance service'
  },
  inspection: {
    baseServiceFee: 40,
    pricePerChair: 20,
    description: 'Comprehensive chair inspection'
  },
  assessment: {
    baseServiceFee: 35,
    pricePerChair: 15,
    description: 'Chair condition assessment'
  }
};

export const ADDITIONAL_SERVICES = {
  urgentService: {
    name: 'Urgent Service (Same Day)',
    price: 100,
    description: 'Priority same-day service'
  },
  weekendService: {
    name: 'Weekend Service',
    price: 75,
    description: 'Weekend or holiday service'
  },
  afterHoursService: {
    name: 'After Hours Service',
    price: 50,
    description: 'Service outside business hours'
  },
  deepCleaning: {
    name: 'Deep Cleaning',
    price: 15,
    description: 'Per chair deep cleaning upgrade'
  },
  fabricProtection: {
    name: 'Fabric Protection',
    price: 12,
    description: 'Per chair fabric protection treatment'
  },
  pickupDelivery: {
    name: 'Pickup & Delivery',
    price: 80,
    description: 'Chair pickup and delivery service'
  }
};

export const TRAVEL_FEES = {
  local: 0,        // Within 10km
  regional: 25,    // 10-25km
  extended: 50,    // 25-50km
  remote: 100      // 50km+
};

export const TAX_RATE = 0.15; // 15% VAT

export interface PricingOptions {
  serviceType: keyof typeof SERVICE_PRICING;
  chairCount: number;
  additionalServices?: string[];
  travelDistance?: keyof typeof TRAVEL_FEES;
  urgency?: 'normal' | 'urgent';
  discount?: number;
  partsAndMaterials?: number;
}

export function calculateJobPricing(options: PricingOptions): PriceBreakdown {
  const {
    serviceType,
    chairCount,
    additionalServices = [],
    travelDistance = 'local',
    urgency = 'normal',
    discount = 0,
    partsAndMaterials = 0
  } = options;

  const servicePricing = SERVICE_PRICING[serviceType];
  const baseServiceFee = servicePricing.baseServiceFee;
  const pricePerChair = servicePricing.pricePerChair;
  
  // Calculate additional services
  const additionalServiceItems: AdditionalService[] = additionalServices.map(serviceKey => {
    const service = ADDITIONAL_SERVICES[serviceKey as keyof typeof ADDITIONAL_SERVICES];
    return {
      name: service.name,
      description: service.description,
      price: service.price,
      quantity: serviceKey.includes('PerChair') ? chairCount : 1
    };
  });

  const additionalServicesTotal = additionalServiceItems.reduce((total, service) => {
    return total + (service.price * (service.quantity || 1));
  }, 0);

  // Calculate travel fee
  const travelFee = TRAVEL_FEES[travelDistance];

  // Calculate urgency fee
  const urgencyFee = urgency === 'urgent' ? ADDITIONAL_SERVICES.urgentService.price : 0;

  // Calculate subtotal
  const chairsTotal = chairCount * pricePerChair;
  const subtotal = baseServiceFee + chairsTotal + additionalServicesTotal + travelFee + urgencyFee + partsAndMaterials - discount;

  // Calculate tax
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return {
    baseServiceFee,
    chairCount,
    pricePerChair,
    additionalServices: additionalServiceItems,
    partsAndMaterials: partsAndMaterials > 0 ? partsAndMaterials : undefined,
    travelFee: travelFee > 0 ? travelFee : undefined,
    urgencyFee: urgencyFee > 0 ? urgencyFee : undefined,
    discount: discount > 0 ? discount : undefined,
    subtotal,
    tax,
    total
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR'
  }).format(amount);
}

export function getServiceDescription(serviceType: keyof typeof SERVICE_PRICING): string {
  return SERVICE_PRICING[serviceType].description;
}

export function getEstimatedPrice(serviceType: keyof typeof SERVICE_PRICING, chairCount: number): number {
  const pricing = SERVICE_PRICING[serviceType];
  const subtotal = pricing.baseServiceFee + (pricing.pricePerChair * chairCount);
  const tax = subtotal * TAX_RATE;
  return subtotal + tax;
}