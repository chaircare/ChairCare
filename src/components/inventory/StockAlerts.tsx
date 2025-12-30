import React from 'react';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useTheme } from 'contexts/ThemeContext';
import { StockAlert } from 'types/inventory';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';

interface StockAlertsProps {
  alerts: StockAlert[];
  onAlertUpdate: () => void;
}

const AlertsList = styled.div<{ theme: any }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const AlertCard = styled(Card)<{ theme: any; severity: string }>`
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.8)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  border-left: 4px solid ${props => {
    switch (props.severity) {
      case 'critical': return props.theme.colors.error[500];
      case 'high': return props.theme.colors.warning[500];
      case 'medium': return props.theme.colors.primary[500];
      default: return props.theme.colors.gray[400];
    }
  }};
  border-radius: ${props => props.theme.borderRadius.xl};
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const AlertHeader = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const AlertInfo = styled.div<{ theme: any }>`
  flex: 1;
`;

const AlertMessage = styled.h3<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const AlertDetails = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
`;

const SeverityBadge = styled.span<{ theme: any; severity: string }>`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  ${({ severity, theme }) => {
    switch (severity) {
      case 'critical':
        return `background: ${theme.colors.error[100]}; color: ${theme.colors.error[700]};`;
      case 'high':
        return `background: ${theme.colors.warning[100]}; color: ${theme.colors.warning[700]};`;
      case 'medium':
        return `background: ${theme.colors.primary[100]}; color: ${theme.colors.primary[700]};`;
      default:
        return `background: ${theme.colors.gray[100]}; color: ${theme.colors.gray[700]};`;
    }
  }}
`;

const AlertActions = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.lg};
  padding-top: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border.primary};
`;

const EmptyState = styled.div<{ theme: any }>`
  text-align: center;
  padding: ${props => props.theme.spacing['4xl']};
  color: ${props => props.theme.colors.text.secondary};
  
  h3 {
    margin: 0 0 ${props => props.theme.spacing.lg} 0;
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.typography.fontSize['2xl']};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
  }
  
  p {
    margin: 0;
    font-size: ${props => props.theme.typography.fontSize.lg};
    line-height: ${props => props.theme.typography.lineHeight.relaxed};
  }
`;

export const StockAlerts: React.FC<StockAlertsProps> = ({ alerts, onAlertUpdate }) => {
  const { theme } = useTheme();
  const router = useRouter();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '📋';
      default: return 'ℹ️';
    }
  };

  const getAlertTypeLabel = (alertType: string) => {
    switch (alertType) {
      case 'low_stock': return 'Low Stock';
      case 'out_of_stock': return 'Out of Stock';
      case 'overstock': return 'Overstock';
      case 'expiring': return 'Expiring Soon';
      default: return 'Alert';
    }
  };

  if (alerts.length === 0) {
    return (
      <EmptyState theme={theme}>
        <h3>No Active Alerts</h3>
        <p>All inventory items are within normal stock levels.</p>
      </EmptyState>
    );
  }

  return (
    <AlertsList theme={theme}>
      {alerts.map((alert) => (
        <AlertCard key={alert.id} theme={theme} severity={alert.severity}>
          <AlertHeader theme={theme}>
            <AlertInfo theme={theme}>
              <AlertMessage theme={theme}>
                {getSeverityIcon(alert.severity)} {alert.message}
              </AlertMessage>
              <AlertDetails theme={theme}>
                <strong>Item:</strong> {alert.item?.name || 'Unknown Item'}<br />
                <strong>Type:</strong> {getAlertTypeLabel(alert.alertType)}<br />
                <strong>Created:</strong> {formatDate(alert.createdAt)}<br />
                {alert.item && (
                  <>
                    <strong>Current Stock:</strong> {alert.item.currentStock}<br />
                    <strong>Reorder Point:</strong> {alert.item.reorderPoint}
                  </>
                )}
              </AlertDetails>
            </AlertInfo>
            <SeverityBadge theme={theme} severity={alert.severity}>
              {alert.severity}
            </SeverityBadge>
          </AlertHeader>

          <AlertActions theme={theme}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/admin/inventory/item/${alert.item?.id || alert.itemId}`)}
            >
              View Item
            </Button>
            {alert.alertType === 'low_stock' || alert.alertType === 'out_of_stock' ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.alert('Reorder functionality coming soon!')}
              >
                Reorder Now
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.alert('Acknowledge functionality coming soon!')}
              >
                Acknowledge
              </Button>
            )}
          </AlertActions>
        </AlertCard>
      ))}
    </AlertsList>
  );
};