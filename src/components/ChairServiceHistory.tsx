import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { theme } from 'styles/theme';
import { Chair, ChairServiceEntry, ServiceLog } from 'types/chair-care';
import { Card } from 'components/ui/Card';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from 'lib/firebase';

const HistoryContainer = styled.div`
  margin-top: ${theme.spacing.xl};
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
`;

const HistoryTitle = styled.h3`
  margin: 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const HistoryStats = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary[600]};
`;

const StatLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const HistoryItem = styled(Card)<{ type: 'request' | 'service' }>`
  padding: ${theme.spacing.lg};
  border-left: 4px solid ${props => 
    props.type === 'service' ? theme.colors.success[500] : theme.colors.warning[500]
  };
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.md};
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemType = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.xs};
`;

const TypeBadge = styled.span<{ type: string }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  ${({ type }) => {
    switch (type) {
      case 'cleaning':
        return `
          background: ${theme.colors.accent[100]};
          color: ${theme.colors.accent[800]};
        `;
      case 'repair':
        return `
          background: ${theme.colors.error[100]};
          color: ${theme.colors.error[800]};
        `;
      case 'service':
        return `
          background: ${theme.colors.success[100]};
          color: ${theme.colors.success[800]};
        `;
      default:
        return `
          background: ${theme.colors.gray[100]};
          color: ${theme.colors.gray[800]};
        `;
    }
  }}
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: uppercase;
  
  ${({ status }) => {
    switch (status) {
      case 'pending':
        return `
          background: ${theme.colors.warning[100]};
          color: ${theme.colors.warning[800]};
        `;
      case 'completed':
        return `
          background: ${theme.colors.success[100]};
          color: ${theme.colors.success[800]};
        `;
      case 'assigned':
        return `
          background: ${theme.colors.primary[100]};
          color: ${theme.colors.primary[800]};
        `;
      default:
        return `
          background: ${theme.colors.gray[100]};
          color: ${theme.colors.gray[800]};
        `;
    }
  }}
`;

const ItemDate = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  margin-bottom: ${theme.spacing.xs};
`;

const ItemDescription = styled.div`
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.md};
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const ServiceDetails = styled.div`
  background: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
`;

const ServiceDetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.sm};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ServiceDetailLabel = styled.span`
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const ServiceDetailValue = styled.span`
  color: ${theme.colors.text.primary};
`;

const ServicesPerformed = styled.div`
  margin-top: ${theme.spacing.sm};
`;

const ServicesList = styled.ul`
  margin: ${theme.spacing.xs} 0 0 0;
  padding-left: ${theme.spacing.lg};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
`;

const CostDisplay = styled.div`
  text-align: right;
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.success[600]};
  font-size: ${theme.typography.fontSize.lg};
`;

interface ChairServiceHistoryProps {
  chair: Chair;
}

interface HistoryEntry {
  id: string;
  type: 'request' | 'service';
  date: Date;
  description: string;
  status?: string;
  serviceType?: string;
  cost?: number;
  technician?: string;
  servicesPerformed?: string[];
  outcome?: string;
  workNotes?: string;
}

export const ChairServiceHistory: React.FC<ChairServiceHistoryProps> = ({ chair }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalServices: 0,
    totalCost: 0,
    lastServiceDate: null as Date | null
  });

  useEffect(() => {
    loadServiceHistory();
  }, [chair.id]);

  const loadServiceHistory = async () => {
    try {
      setLoading(true);
      
      // Load service requests (ServiceLog)
      const requestsQuery = query(
        collection(db, 'serviceLogs'),
        where('chairId', '==', chair.id),
        orderBy('createdAt', 'desc')
      );
      
      const requestsSnapshot = await getDocs(requestsQuery);
      const requests: HistoryEntry[] = requestsSnapshot.docs.map(doc => {
        const data = doc.data() as ServiceLog;
        return {
          id: doc.id,
          type: 'request' as const,
          date: data.createdAt,
          description: data.description,
          status: data.status,
          serviceType: data.serviceType,
          cost: data.cost
        };
      });

      // Load completed services (ChairServiceEntry)
      const servicesQuery = query(
        collection(db, 'chairServices'),
        where('chairId', '==', chair.id),
        orderBy('serviceDate', 'desc')
      );
      
      const servicesSnapshot = await getDocs(servicesQuery);
      const services: HistoryEntry[] = servicesSnapshot.docs.map(doc => {
        const data = doc.data() as ChairServiceEntry;
        return {
          id: doc.id,
          type: 'service' as const,
          date: data.serviceDate,
          description: data.issueFound || data.issueReported || 'Service completed',
          technician: data.technicianName,
          servicesPerformed: data.servicesPerformed,
          outcome: data.outcome,
          workNotes: data.workNotes,
          cost: data.cost
        };
      });

      // Combine and sort all history
      const allHistory = [...requests, ...services].sort((a, b) => 
        b.date.getTime() - a.date.getTime()
      );
      
      setHistory(allHistory);

      // Calculate stats
      const completedServices = services.length;
      const totalCost = allHistory.reduce((sum, entry) => sum + (entry.cost || 0), 0);
      const lastServiceDate = services.length > 0 ? services[0].date : null;
      
      setStats({
        totalServices: completedServices,
        totalCost,
        lastServiceDate
      });

    } catch (error) {
      console.error('Error loading service history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <HistoryContainer>
        <Card>
          <div style={{ padding: theme.spacing.xl, textAlign: 'center' }}>
            Loading service history...
          </div>
        </Card>
      </HistoryContainer>
    );
  }

  return (
    <HistoryContainer>
      <HistoryHeader>
        <HistoryTitle>Service History</HistoryTitle>
        <HistoryStats>
          <StatItem>
            <StatNumber>{stats.totalServices}</StatNumber>
            <StatLabel>Services</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber>{formatCurrency(stats.totalCost)}</StatNumber>
            <StatLabel>Total Cost</StatLabel>
          </StatItem>
          {stats.lastServiceDate && (
            <StatItem>
              <StatNumber>{Math.floor((Date.now() - stats.lastServiceDate.getTime()) / (1000 * 60 * 60 * 24))}</StatNumber>
              <StatLabel>Days Ago</StatLabel>
            </StatItem>
          )}
        </HistoryStats>
      </HistoryHeader>

      {history.length === 0 ? (
        <Card>
          <div style={{ padding: theme.spacing.xl, textAlign: 'center' }}>
            No service history found for this chair.
          </div>
        </Card>
      ) : (
        <HistoryList>
          {history.map((entry) => (
            <HistoryItem key={entry.id} type={entry.type}>
              <ItemHeader>
                <ItemInfo>
                  <ItemType>
                    <TypeBadge type={entry.serviceType || entry.type}>
                      {entry.serviceType || (entry.type === 'service' ? 'Completed Service' : 'Service Request')}
                    </TypeBadge>
                    {entry.status && (
                      <StatusBadge status={entry.status}>
                        {entry.status}
                      </StatusBadge>
                    )}
                  </ItemType>
                  <ItemDate>{formatDate(entry.date)}</ItemDate>
                </ItemInfo>
                {entry.cost && (
                  <CostDisplay>{formatCurrency(entry.cost)}</CostDisplay>
                )}
              </ItemHeader>

              <ItemDescription>{entry.description}</ItemDescription>

              {entry.type === 'service' && (
                <ServiceDetails>
                  {entry.technician && (
                    <ServiceDetailRow>
                      <ServiceDetailLabel>Technician:</ServiceDetailLabel>
                      <ServiceDetailValue>{entry.technician}</ServiceDetailValue>
                    </ServiceDetailRow>
                  )}
                  {entry.outcome && (
                    <ServiceDetailRow>
                      <ServiceDetailLabel>Outcome:</ServiceDetailLabel>
                      <ServiceDetailValue>{entry.outcome}</ServiceDetailValue>
                    </ServiceDetailRow>
                  )}
                  {entry.servicesPerformed && entry.servicesPerformed.length > 0 && (
                    <ServicesPerformed>
                      <ServiceDetailLabel>Services Performed:</ServiceDetailLabel>
                      <ServicesList>
                        {entry.servicesPerformed.map((service, index) => (
                          <li key={index}>{service}</li>
                        ))}
                      </ServicesList>
                    </ServicesPerformed>
                  )}
                  {entry.workNotes && (
                    <ServiceDetailRow>
                      <ServiceDetailLabel>Notes:</ServiceDetailLabel>
                      <ServiceDetailValue>{entry.workNotes}</ServiceDetailValue>
                    </ServiceDetailRow>
                  )}
                </ServiceDetails>
              )}
            </HistoryItem>
          ))}
        </HistoryList>
      )}
    </HistoryContainer>
  );
};