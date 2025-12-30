import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { useTheme } from 'contexts/ThemeContext';
import { Chair, ServiceLog } from 'types/chair-care';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from 'lib/firebase';

const Container = styled.div<{ theme: any }>`
  min-height: 100vh;
  background: ${props => props.theme.mode === 'dark' 
    ? props.theme.colors.background.dark
    : props.theme.colors.background.secondary
  };
`;

const ChairInfoCard = styled(Card)<{ theme: any }>`
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.8)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius['2xl']};
  backdrop-filter: blur(10px);
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const ChairHeader = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.gradients.primary};
  color: white;
  border-radius: ${props => props.theme.borderRadius['2xl']} ${props => props.theme.borderRadius['2xl']} 0 0;
  text-align: center;
`;

const ChairTitle = styled.h1<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const ChairSubtitle = styled.p<{ theme: any }>`
  margin: 0;
  opacity: 0.9;
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const StatsGrid = styled.div<{ theme: any }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  padding: ${props => props.theme.spacing.xl};
`;

const StatItem = styled.div<{ theme: any }>`
  text-align: center;
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(51, 65, 85, 0.5)' 
    : props.theme.colors.gray[50]
  };
  border-radius: ${props => props.theme.borderRadius.xl};
  border: 1px solid ${props => props.theme.colors.border.primary};
`;

const StatValue = styled.div<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  background: ${props => props.theme.gradients.accent};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const StatLabel = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: ${props => props.theme.typography.letterSpacing.wide};
`;

const ServiceHistoryCard = styled(Card)<{ theme: any }>`
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.8)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius['2xl']};
  backdrop-filter: blur(10px);
`;

const SectionHeader = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h2<{ theme: any }>`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const ServiceLogsList = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const ServiceLogItem = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(51, 65, 85, 0.5)' 
    : props.theme.colors.gray[50]
  };
  border-radius: ${props => props.theme.borderRadius.xl};
  border: 1px solid ${props => props.theme.colors.border.primary};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const ServiceLogHeader = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ServiceType = styled.span<{ theme: any; type: string }>`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${props => props.type === 'cleaning' 
    ? props.theme.gradients.accent
    : props.theme.gradients.primary
  };
  color: white;
`;

const ServiceStatus = styled.span<{ theme: any; status: string }>`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  ${({ status, theme }) => {
    switch (status) {
      case 'pending':
        return `background: ${theme.colors.warning[500]}; color: white;`;
      case 'completed':
        return `background: ${theme.colors.success[500]}; color: white;`;
      case 'billed':
        return `background: ${theme.gradients.accent}; color: white;`;
      default:
        return `background: ${theme.colors.gray[500]}; color: white;`;
    }
  }}
`;

const ServiceDescription = styled.p<{ theme: any }>`
  margin: ${props => props.theme.spacing.md} 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.base};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
`;

const ServiceDetails = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin-top: ${props => props.theme.spacing.md};
  padding-top: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.border.primary};
`;

const ServiceCost = styled.span<{ theme: any }>`
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  font-size: ${props => props.theme.typography.fontSize.lg};
  background: ${props => props.theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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

const LoadingState = styled.div<{ theme: any }>`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const ChairHistoryPage: NextPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = router.query;
  const [chair, setChair] = useState<Chair | null>(null);
  const [serviceLogs, setServiceLogs] = useState<ServiceLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (id && typeof id === 'string') {
      loadChairHistory(id);
    }
  }, [user, id, router]);

  const loadChairHistory = async (chairId: string) => {
    try {
      setLoading(true);
      
      // Load chair details
      const chairDoc = await getDoc(doc(db, 'chairs', chairId));
      if (chairDoc.exists()) {
        setChair({ id: chairDoc.id, ...chairDoc.data() } as Chair);
      }
      
      // Load service logs for this chair
      const serviceLogsQuery = query(
        collection(db, 'serviceLogs'),
        where('chairId', '==', chairId),
        orderBy('createdAt', 'desc')
      );
      
      const serviceLogsSnapshot = await getDocs(serviceLogsQuery);
      const serviceLogsData = serviceLogsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as ServiceLog[];
      
      setServiceLogs(serviceLogsData);
    } catch (error) {
      console.error('Failed to load chair history:', error);
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

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChairStats = () => {
    const totalServices = serviceLogs.length;
    const completedServices = serviceLogs.filter(log => log.status === 'completed' || log.status === 'billed').length;
    const totalSpent = serviceLogs
      .filter(log => log.status === 'completed' || log.status === 'billed')
      .reduce((sum, log) => sum + (log.cost || 0), 0);
    const lastServiceDate = serviceLogs.length > 0 ? serviceLogs[0].createdAt : null;
    
    return { totalServices, completedServices, totalSpent, lastServiceDate };
  };

  if (loading) {
    return (
      <Layout>
        <Container theme={theme}>
          <LoadingState theme={theme}>Loading chair history...</LoadingState>
        </Container>
      </Layout>
    );
  }

  if (!chair) {
    return (
      <Layout>
        <Container theme={theme}>
          <EmptyState theme={theme}>
            <h3>Chair Not Found</h3>
            <p>The requested chair could not be found in the system.</p>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </EmptyState>
        </Container>
      </Layout>
    );
  }

  const stats = getChairStats();

  return (
    <Layout>
      <Container theme={theme}>
        <ChairInfoCard theme={theme}>
          <ChairHeader theme={theme}>
            <ChairTitle theme={theme}>{chair.chairNumber}</ChairTitle>
            <ChairSubtitle theme={theme}>{chair.location}</ChairSubtitle>
          </ChairHeader>
          
          <StatsGrid theme={theme}>
            <StatItem theme={theme}>
              <StatValue theme={theme}>{stats.totalServices}</StatValue>
              <StatLabel theme={theme}>Total Services</StatLabel>
            </StatItem>
            <StatItem theme={theme}>
              <StatValue theme={theme}>{stats.completedServices}</StatValue>
              <StatLabel theme={theme}>Completed</StatLabel>
            </StatItem>
            <StatItem theme={theme}>
              <StatValue theme={theme}>{formatCurrency(stats.totalSpent)}</StatValue>
              <StatLabel theme={theme}>Total Spent</StatLabel>
            </StatItem>
            <StatItem theme={theme}>
              <StatValue theme={theme}>
                {stats.lastServiceDate ? formatDate(stats.lastServiceDate).split(',')[0] : 'Never'}
              </StatValue>
              <StatLabel theme={theme}>Last Service</StatLabel>
            </StatItem>
          </StatsGrid>
        </ChairInfoCard>

        <ServiceHistoryCard theme={theme}>
          <SectionHeader theme={theme}>
            <SectionTitle theme={theme}>Service History</SectionTitle>
            <Button
              variant="primary"
              onClick={() => router.push('/scan')}
            >
              Request Service
            </Button>
          </SectionHeader>
          
          {serviceLogs.length === 0 ? (
            <EmptyState theme={theme}>
              <h3>No Service History</h3>
              <p>This chair hasn't had any services yet. Start by requesting a service!</p>
            </EmptyState>
          ) : (
            <ServiceLogsList theme={theme}>
              {serviceLogs.map((log) => (
                <ServiceLogItem key={log.id} theme={theme}>
                  <ServiceLogHeader theme={theme}>
                    <ServiceType theme={theme} type={log.serviceType}>
                      {log.serviceType}
                    </ServiceType>
                    <ServiceStatus theme={theme} status={log.status}>
                      {log.status}
                    </ServiceStatus>
                  </ServiceLogHeader>
                  
                  <ServiceDescription theme={theme}>
                    {log.description}
                  </ServiceDescription>
                  
                  {log.technicianNotes && (
                    <ServiceDescription theme={theme} style={{ fontStyle: 'italic', opacity: 0.8 }}>
                      <strong>Technician Notes:</strong> {log.technicianNotes}
                    </ServiceDescription>
                  )}
                  
                  <ServiceDetails theme={theme}>
                    <span>
                      📅 {formatDate(log.createdAt)}
                      {log.user && (
                        <span style={{ marginLeft: theme.spacing.md }}>
                          👨‍🔧 Technician: {log.user?.name || 'Assigned'}
                        </span>
                      )}
                    </span>
                    <ServiceCost theme={theme}>
                      {formatCurrency(log.cost || 0)}
                    </ServiceCost>
                  </ServiceDetails>
                </ServiceLogItem>
              ))}
            </ServiceLogsList>
          )}
        </ServiceHistoryCard>
      </Container>
    </Layout>
  );
};

export default ChairHistoryPage;