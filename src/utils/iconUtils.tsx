import React from 'react';
import {
  DashboardIcon,
  ChairIcon,
  QRScannerIcon,
  TechnicianIcon,
  JobIcon,
  ServiceRequestIcon,
  UsersIcon,
  AnalyticsIcon,
  SettingsIcon,
  LogoutIcon,
  AddIcon,
  ListIcon,
  MoneyIcon,
  EmailIcon,
  BuildingIcon,
  InventoryIcon,
  BackIcon
} from 'components/icons/IconSystem';

export type IconType = 'custom' | 'emoji';

interface IconConfig {
  custom: React.ComponentType<any>;
  emoji: string;
}

/**
 * Icon mapping for different navigation items
 * Using modern custom SVG icons with emoji fallbacks
 */
export const navigationIcons: Record<string, IconConfig> = {
  dashboard: {
    custom: DashboardIcon,
    emoji: '🏠'
  },
  scanChair: {
    custom: QRScannerIcon,
    emoji: '📱'
  },
  addChair: {
    custom: AddIcon,
    emoji: '➕'
  },
  chairRegistry: {
    custom: ListIcon,
    emoji: '📋'
  },
  qrCodes: {
    custom: QRScannerIcon,
    emoji: '🏷️'
  },
  serviceRequests: {
    custom: ServiceRequestIcon,
    emoji: '📝'
  },
  jobManagement: {
    custom: JobIcon,
    emoji: '💼'
  },
  jobProgress: {
    custom: AnalyticsIcon,
    emoji: '📊'
  },
  technicians: {
    custom: UsersIcon,
    emoji: '👥'
  },
  clients: {
    custom: BuildingIcon,
    emoji: '🏢'
  },
  clientRequests: {
    custom: ServiceRequestIcon,
    emoji: '📋'
  },
  inventory: {
    custom: InventoryIcon,
    emoji: '📦'
  },
  pricing: {
    custom: MoneyIcon,
    emoji: '💰'
  },
  businessIntelligence: {
    custom: AnalyticsIcon,
    emoji: '📊'
  },
  offlineCapabilities: {
    custom: SettingsIcon,
    emoji: '⚙️'
  },
  invoices: {
    custom: MoneyIcon,
    emoji: '💰'
  },
  emailTest: {
    custom: EmailIcon,
    emoji: '📧'
  },
  myJobs: {
    custom: TechnicianIcon,
    emoji: '🔧'
  },
  clientDashboard: {
    custom: DashboardIcon,
    emoji: '🏠'
  },
  serviceProgress: {
    custom: AnalyticsIcon,
    emoji: '📈'
  },
  myChairs: {
    custom: ChairIcon,
    emoji: '🪑'
  },
  logout: {
    custom: LogoutIcon,
    emoji: '🚪'
  },
  back: {
    custom: BackIcon,
    emoji: '←'
  }
};

/**
 * Get icon for a navigation item
 * @param iconKey - Key from navigationIcons
 * @param iconType - Type of icon to use ('custom' or 'emoji')
 * @param props - Props to pass to custom icon components
 */
export const getNavigationIcon = (
  iconKey: string, 
  iconType: IconType = 'custom',
  props?: any
): string | React.ReactElement => {
  const iconConfig = navigationIcons[iconKey];
  
  if (!iconConfig) {
    return '❓'; // Fallback icon
  }

  switch (iconType) {
    case 'custom':
      if (iconConfig.custom) {
        const IconComponent = iconConfig.custom;
        return <IconComponent size={16} {...props} />;
      }
      return iconConfig.emoji || '❓';
    case 'emoji':
      return iconConfig.emoji || '❓';
    default:
      return iconConfig.emoji || '❓';
  }
};

/**
 * Render icon in navigation
 * Helper function for Layout component
 */
export const renderNavigationIcon = (
  iconKey: string,
  iconType: IconType = 'custom',
  size: number = 16
) => {
  const icon = getNavigationIcon(iconKey, iconType, { size });
  
  if (typeof icon === 'string') {
    // Emoji or text
    return <span style={{ fontSize: `${size}px` }}>{icon}</span>;
  }
  
  // React component
  return icon;
};