import React from 'react';
import styled from '@emotion/styled';
import { useTheme } from 'contexts/ThemeContext';
import { InventoryMetrics } from 'types/inventory';

interface InventoryStatsProps {
  metrics: InventoryMetrics;
}

const StatsContainer = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const StatCard = styled.div<{ theme: any }>`
  text-align: center;
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.8)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.xl};
  backdrop-filter: blur(10px);
  min-width: 120px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const StatValue = styled.div<{ theme: any; warning?: boolean }>`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.warning 
    ? props.theme.colors.warning[600]
    : props.theme.colors.text.primary
  };
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StatLabel = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: ${props => props.theme.typography.letterSpacing.wide};
`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const InventoryStats: React.FC<InventoryStatsProps> = ({ metrics }) => {
  const { theme } = useTheme();

  return (
    <StatsContainer theme={theme}>
      <StatCard theme={theme}>
        <StatValue theme={theme}>{metrics.totalItems}</StatValue>
        <StatLabel theme={theme}>Total Items</StatLabel>
      </StatCard>
      
      <StatCard theme={theme}>
        <StatValue theme={theme}>{formatCurrency(metrics.totalValue)}</StatValue>
        <StatLabel theme={theme}>Total Value</StatLabel>
      </StatCard>
      
      <StatCard theme={theme}>
        <StatValue theme={theme} warning={metrics.lowStockItems > 0}>
          {metrics.lowStockItems}
        </StatValue>
        <StatLabel theme={theme}>Low Stock</StatLabel>
      </StatCard>
      
      <StatCard theme={theme}>
        <StatValue theme={theme} warning={metrics.outOfStockItems > 0}>
          {metrics.outOfStockItems}
        </StatValue>
        <StatLabel theme={theme}>Out of Stock</StatLabel>
      </StatCard>
      
      <StatCard theme={theme}>
        <StatValue theme={theme} warning={metrics.activeAlerts > 0}>
          {metrics.activeAlerts}
        </StatValue>
        <StatLabel theme={theme}>Active Alerts</StatLabel>
      </StatCard>
    </StatsContainer>
  );
};