import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useTheme } from 'contexts/ThemeContext';
import { Chair, ServiceLog } from 'types/chair-care';
import { JobPartsUsage } from 'types/inventory';
import { Card } from 'components/ui/Card';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from 'lib/firebase';

interface ServiceHistoryTimelineProps {
  chair: Chair;
  showPhotos?: boolean;
  compact?: boolean;
}

const TimelineContainer = styled(Card)<{ theme: any }>`
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.8)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.xl};
  backdrop-filter: blur(10px);
`;

const TimelineHeader = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  background: ${props => props.theme.gradients.primary};
  color: white;
  border-radius: ${props => props.theme.borderRadius.xl} ${props => props.theme.borderRadius.xl} 0 0;
`;

const TimelineTitle = styled.h3<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const TimelineSubtitle = styled.p<{ theme: any }>`
  margin: 0;
  opacity: 0.9;
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const TimelineContent = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
`;

const Timeline = styled.div<{ theme: any }>`
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 20px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: ${props => props.theme.colors.border.primary};
  }
`;

const TimelineItem = styled.div<{ theme: any }>`
  position: relative;
  padding-left: 60px;
  margin-bottom: ${props => props.theme.spacing.xl};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const TimelineIcon = styled.div<{ theme: any; serviceType: string }>`
  position: absolute;
  left: 8px;
  top: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: white;
  z-index: 1;
  
  ${({ serviceType, theme }) => {
    switch (serviceType) {
      case 'cleaning':
        return `background: ${theme.colors.accent[500]};`;
      case 'repair':
        return `background: ${theme.colors.error[500]};`;
      case 'maintenance':
        return `background: ${theme.colors.warning[500]};`;
      case 'inspection':
        return `background: ${theme.colors.primary[500]};`;
      default:
        return `background: ${theme.colors.gray[500]};`;
    }
  }}
  
  &::after {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.theme.colors.background.primary};
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

const TimelineCard = styled.div<{ theme: any }>`
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(51, 65, 85, 0.5)' 
    : props.theme.colors.background.primary
  };
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const ServiceHeader = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ServiceInfo = styled.div<{ theme: any }>`
  flex: 1;
`;

const ServiceTitle = styled.h4<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const ServiceDate = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const ServiceTechnician = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const ServiceStatus = styled.span<{ theme: any; status: string }>`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  ${({ status, theme }) => {
    switch (status) {
      case 'completed':
        return `background: ${theme.colors.success[100]}; color: ${theme.colors.success[700]};`;
      case 'in-progress':
        return `background: ${theme.colors.primary[100]}; color: ${theme.colors.primary[700]};`;
      case 'pending':
        return `background: ${theme.colors.warning[100]}; color: ${theme.colors.warning[700]};`;
      default:
        return `background: ${theme.colors.gray[100]}; color: ${theme.colors.gray[700]};`;
    }
  }}
`;

const ServiceDescription = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ServiceDetails = styled.div<{ theme: any }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const DetailItem = styled.div<{ theme: any }>`
  text-align: center;
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(51, 65, 85, 0.5)' 
    : props.theme.colors.gray[50]
  };
  border-radius: ${props => props.theme.borderRadius.md};
`;

const DetailLabel = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const DetailValue = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const PartsUsed = styled.div<{ theme: any }>`
  margin-top: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(51, 65, 85, 0.3)' 
    : props.theme.colors.gray[50]
  };
  border-radius: ${props => props.theme.borderRadius.md};
  border-left: 3px solid ${props => props.theme.colors.primary[500]};
`;

const PartsTitle = styled.div<{ theme: any }>`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const PartsList = styled.div<{ theme: any }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const PartItem = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const PhotosSection = styled.div<{ theme: any }>`
  margin-top: ${props => props.theme.spacing.md};
`;

const PhotosGrid = styled.div<{ theme: any }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.sm};
`;

const PhotoThumbnail = styled.img<{ theme: any }>`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const EmptyState = styled.div<{ theme: any }>`
  text-align: center;
  padding: ${props => props.theme.spacing['4xl']};
  color: ${props => props.theme.colors.text.secondary};
  
  h4 {
    margin: 0 0 ${props => props.theme.spacing.lg} 0;
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.typography.fontSize.xl};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
  }
  
  p {
    margin: 0;
    font-size: ${props => props.theme.typography.fontSize.base};
    line-height: ${props => props.theme.typography.lineHeight.relaxed};
  }
`;

const LoadingState = styled.div<{ theme: any }>`
  text-align: center;
  padding: ${props => props.theme.spacing['4xl']};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const SummaryStats = styled.div<{ theme: any }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(51, 65, 85, 0.3)' 
    : props.theme.colors.gray[50]
  };
  border-radius: ${props => props.theme.borderRadius.lg};
`;

const StatItem = styled.div<{ theme: any }>`
  text-align: center;
`;

const StatValue = styled.div<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary[600]};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StatLabel = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

interface ServiceHistoryData extends ServiceLog {
  partsUsed?: JobPartsUsage[];
  photos?: string[];
}

export const ServiceHistoryTimeline: React.FC<ServiceHistoryTimelineProps> = ({
  chair,
  showPhotos = true,
  compact = false
}) => {
  const { theme } = useTheme();
  const [serviceHistory, setServiceHistory] = useState<ServiceHistoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServiceHistory();
  }, [chair.id]);

  const loadServiceHistory = async () => {
    try {
      setLoading(true);
      
      // Load service logs for this chair
      const serviceQuery = query(
        collection(db, 'serviceLogs'),
        where('chairId', '==', chair.id),
        orderBy('createdAt', 'desc')
      );
      
      const serviceSnapshot = await getDocs(serviceQuery);
      const services = serviceSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          scheduledDate: data.scheduledDate?.toDate(),
          completedAt: data.completedAt?.toDate()
        };
      }) as unknown as ServiceHistoryData[];
      
      // Load parts used for each service (if they have jobId)
      for (const service of services) {
        if (service.jobId) {
          try {
            const partsQuery = query(
              collection(db, 'jobPartsUsage'),
              where('jobId', '==', service.jobId),
              where('chairId', '==', chair.id)
            );
            
            const partsSnapshot = await getDocs(partsQuery);
            service.partsUsed = partsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as unknown as JobPartsUsage[];
          } catch (error) {
            console.error('Error loading parts for service:', service.id, error);
            service.partsUsed = [];
          }
        }
        
        // Load photos if available (placeholder for now)
        service.photos = []; // Would load from storage based on service ID
      }
      
      setServiceHistory(services);
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
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'cleaning': return '🧽';
      case 'repair': return '🔧';
      case 'maintenance': return '⚙️';
      case 'inspection': return '🔍';
      default: return '🛠️';
    }
  };

  const calculateStats = () => {
    const totalServices = serviceHistory.length;
    const totalCost = serviceHistory.reduce((sum, service) => sum + (service.cost || 0), 0);
    const completedServices = serviceHistory.filter(s => s.status === 'completed').length;
    const avgCost = totalServices > 0 ? totalCost / totalServices : 0;
    
    const serviceTypes = serviceHistory.reduce((acc, service) => {
      acc[service.serviceType] = (acc[service.serviceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonService = Object.entries(serviceTypes)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
    
    return {
      totalServices,
      totalCost,
      completedServices,
      avgCost,
      mostCommonService
    };
  };

  if (loading) {
    return (
      <TimelineContainer theme={theme}>
        <LoadingState theme={theme}>Loading service history...</LoadingState>
      </TimelineContainer>
    );
  }

  if (serviceHistory.length === 0) {
    return (
      <TimelineContainer theme={theme}>
        <TimelineHeader theme={theme}>
          <TimelineTitle theme={theme}>📋 Service History</TimelineTitle>
          <TimelineSubtitle theme={theme}>
            Complete service record for {chair.chairNumber}
          </TimelineSubtitle>
        </TimelineHeader>
        
        <EmptyState theme={theme}>
          <h4>No Service History</h4>
          <p>This chair hasn't been serviced yet. Service records will appear here once work is completed.</p>
        </EmptyState>
      </TimelineContainer>
    );
  }

  const stats = calculateStats();

  return (
    <TimelineContainer theme={theme}>
      <TimelineHeader theme={theme}>
        <TimelineTitle theme={theme}>📋 Service History</TimelineTitle>
        <TimelineSubtitle theme={theme}>
          Complete service record for {chair.chairNumber}
        </TimelineSubtitle>
      </TimelineHeader>

      <TimelineContent theme={theme}>
        {!compact && (
          <SummaryStats theme={theme}>
            <StatItem theme={theme}>
              <StatValue theme={theme}>{stats.totalServices}</StatValue>
              <StatLabel theme={theme}>Total Services</StatLabel>
            </StatItem>
            <StatItem theme={theme}>
              <StatValue theme={theme}>{stats.completedServices}</StatValue>
              <StatLabel theme={theme}>Completed</StatLabel>
            </StatItem>
            <StatItem theme={theme}>
              <StatValue theme={theme}>{formatCurrency(stats.totalCost)}</StatValue>
              <StatLabel theme={theme}>Total Cost</StatLabel>
            </StatItem>
            <StatItem theme={theme}>
              <StatValue theme={theme}>{formatCurrency(stats.avgCost)}</StatValue>
              <StatLabel theme={theme}>Avg Cost</StatLabel>
            </StatItem>
            <StatItem theme={theme}>
              <StatValue theme={theme}>{stats.mostCommonService}</StatValue>
              <StatLabel theme={theme}>Most Common</StatLabel>
            </StatItem>
          </SummaryStats>
        )}

        <Timeline theme={theme}>
          {serviceHistory.map((service, index) => (
            <TimelineItem key={service.id} theme={theme}>
              <TimelineIcon theme={theme} serviceType={service.serviceType}>
                {getServiceIcon(service.serviceType)}
              </TimelineIcon>
              
              <TimelineCard theme={theme}>
                <ServiceHeader theme={theme}>
                  <ServiceInfo theme={theme}>
                    <ServiceTitle theme={theme}>
                      {service.serviceType.charAt(0).toUpperCase() + service.serviceType.slice(1)} Service
                    </ServiceTitle>
                    <ServiceDate theme={theme}>
                      📅 {formatDate(service.createdAt)} at {formatTime(service.createdAt)}
                    </ServiceDate>
                    <ServiceTechnician theme={theme}>
                      👨‍🔧 {(service as any).technicianName || 'Professional Technician'}
                    </ServiceTechnician>
                  </ServiceInfo>
                  
                  <ServiceStatus theme={theme} status={service.status}>
                    {service.status}
                  </ServiceStatus>
                </ServiceHeader>

                {service.description && (
                  <ServiceDescription theme={theme}>
                    {service.description}
                  </ServiceDescription>
                )}

                <ServiceDetails theme={theme}>
                  <DetailItem theme={theme}>
                    <DetailLabel theme={theme}>Cost</DetailLabel>
                    <DetailValue theme={theme}>{formatCurrency(service.cost || 0)}</DetailValue>
                  </DetailItem>
                  
                  <DetailItem theme={theme}>
                    <DetailLabel theme={theme}>Duration</DetailLabel>
                    <DetailValue theme={theme}>
                      {service.completedAt && service.createdAt 
                        ? `${Math.round((service.completedAt.getTime() - service.createdAt.getTime()) / (1000 * 60))} min`
                        : 'N/A'
                      }
                    </DetailValue>
                  </DetailItem>
                  
                  <DetailItem theme={theme}>
                    <DetailLabel theme={theme}>Parts Used</DetailLabel>
                    <DetailValue theme={theme}>{service.partsUsed?.length || 0}</DetailValue>
                  </DetailItem>
                  
                  {showPhotos && (
                    <DetailItem theme={theme}>
                      <DetailLabel theme={theme}>Photos</DetailLabel>
                      <DetailValue theme={theme}>{service.photos?.length || 0}</DetailValue>
                    </DetailItem>
                  )}
                </ServiceDetails>

                {service.partsUsed && service.partsUsed.length > 0 && (
                  <PartsUsed theme={theme}>
                    <PartsTitle theme={theme}>🔧 Parts & Materials Used</PartsTitle>
                    <PartsList theme={theme}>
                      {service.partsUsed.map((part, partIndex) => (
                        <PartItem key={partIndex} theme={theme}>
                          <span>{part.itemId} × {part.quantityUsed}</span>
                          <span>{formatCurrency(part.totalCost)}</span>
                        </PartItem>
                      ))}
                    </PartsList>
                  </PartsUsed>
                )}

                {showPhotos && service.photos && service.photos.length > 0 && (
                  <PhotosSection theme={theme}>
                    <PartsTitle theme={theme}>📷 Service Photos</PartsTitle>
                    <PhotosGrid theme={theme}>
                      {service.photos.map((photo, photoIndex) => (
                        <PhotoThumbnail
                          key={photoIndex}
                          theme={theme}
                          src={photo}
                          alt={`Service photo ${photoIndex + 1}`}
                          onClick={() => {/* Open photo modal */}}
                        />
                      ))}
                    </PhotosGrid>
                  </PhotosSection>
                )}
              </TimelineCard>
            </TimelineItem>
          ))}
        </Timeline>
      </TimelineContent>
    </TimelineContainer>
  );
};