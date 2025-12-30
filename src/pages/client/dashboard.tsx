import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { ServiceProgressTracker } from 'components/client/ServiceProgressTracker';
import { theme } from 'styles/theme';
import { Chair, ServiceLog } from 'types/chair-care';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from 'lib/firebase';
import { generateQRCodeDataURL } from 'lib/qr-utils';

const Container = styled.div`
  padding: ${theme.spacing.xl};
`;

const Header = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const Title = styled.h1`
  margin: 0 0 ${theme.spacing.md} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.lg};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

const StatCard = styled(Card)`
  padding: ${theme.spacing.lg};
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary[600]};
  margin-bottom: ${theme.spacing.sm};
`;

const StatLabel = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: ${theme.typography.fontWeight.medium};
`;

const SectionTitle = styled.h2`
  margin: 0 0 ${theme.spacing.lg} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const ChairsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

const ChairCard = styled(Card)`
  padding: ${theme.spacing.lg};
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${theme.colors.gray[200]};
  
  &:hover {
    border-color: ${theme.colors.primary[300]};
    box-shadow: ${theme.shadows.lg};
    transform: translateY(-2px);
  }
`;

const ChairHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.md};
`;

const ChairInfo = styled.div`
  flex: 1;
`;

const ChairNumber = styled.h3`
  margin: 0 0 ${theme.spacing.xs} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const ChairLocation = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`;

const ConditionBadge = styled.span<{ condition: string }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: uppercase;
  
  ${props => {
    switch (props.condition?.toLowerCase()) {
      case 'excellent':
        return `background: ${theme.colors.success[100]}; color: ${theme.colors.success[700]};`;
      case 'good':
        return `background: ${theme.colors.primary[100]}; color: ${theme.colors.primary[700]};`;
      case 'fair':
        return `background: ${theme.colors.warning[100]}; color: ${theme.colors.warning[700]};`;
      case 'poor':
        return `background: ${theme.colors.error[100]}; color: ${theme.colors.error[700]};`;
      default:
        return `background: ${theme.colors.gray[100]}; color: ${theme.colors.gray[700]};`;
    }
  }}
`;

const ChairDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
  margin: ${theme.spacing.md} 0;
  padding: ${theme.spacing.md};
  background: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.md};
`;

const DetailItem = styled.div`
  font-size: ${theme.typography.fontSize.sm};
`;

const DetailLabel = styled.span`
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const DetailValue = styled.span`
  color: ${theme.colors.text.primary};
  margin-left: ${theme.spacing.xs};
`;

const ChairActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
`;

const RecentRequestsSection = styled.div`
  margin-top: ${theme.spacing.xl};
`;

const RequestsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const RequestCard = styled(Card)`
  padding: ${theme.spacing.lg};
  border-left: 4px solid ${theme.colors.warning[500]};
`;

const RequestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.md};
`;

const RequestInfo = styled.div`
  flex: 1;
`;

const RequestTitle = styled.h4`
  margin: 0 0 ${theme.spacing.xs} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const RequestMeta = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: uppercase;
  
  ${props => {
    switch (props.status) {
      case 'pending':
        return `background: ${theme.colors.warning[100]}; color: ${theme.colors.warning[700]};`;
      case 'assigned':
        return `background: ${theme.colors.primary[100]}; color: ${theme.colors.primary[700]};`;
      case 'in_progress':
        return `background: ${theme.colors.accent[100]}; color: ${theme.colors.accent[700]};`;
      case 'completed':
        return `background: ${theme.colors.success[100]}; color: ${theme.colors.success[700]};`;
      default:
        return `background: ${theme.colors.gray[100]}; color: ${theme.colors.gray[700]};`;
    }
  }}
`;

const RequestDescription = styled.div`
  color: ${theme.colors.text.primary};
  margin-top: ${theme.spacing.sm};
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
`;

const QRCodeSection = styled.div`
  margin-top: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.md};
  text-align: center;
`;

const QRCodeImage = styled.img`
  max-width: 120px;
  height: auto;
  border-radius: ${theme.borderRadius.sm};
  background: white;
  padding: ${theme.spacing.xs};
  box-shadow: ${theme.shadows.sm};
`;

const QRCodeText = styled.div`
  font-family: 'JetBrains Mono', monospace;
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  margin-top: ${theme.spacing.sm};
  word-break: break-all;
`;

const QRCodeActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  justify-content: center;
  margin-top: ${theme.spacing.sm};
`;

const QRCodeLoading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`;

const ClientDashboard: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [recentRequests, setRecentRequests] = useState<ServiceLog[]>([]);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [loadingQR, setLoadingQR] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalChairs: 0,
    pendingRequests: 0,
    completedServices: 0,
    chairsNeedingAttention: 0
  });

  useEffect(() => {
    if (user?.role === 'client') {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load client's chairs
      const chairsQuery = query(
        collection(db, 'chairs'),
        where('clientId', '==', user?.id),
        orderBy('chairNumber')
      );
      
      const chairsSnapshot = await getDocs(chairsQuery);
      const chairsData = chairsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
      })) as Chair[];
      
      console.log('Client Dashboard - Loaded chairs:', chairsData.map(chair => ({
        id: chair.id,
        chairNumber: chair.chairNumber,
        qrCode: chair.qrCode,
        hasQrCode: !!chair.qrCode,
        qrCodeLength: chair.qrCode?.length || 0
      })));
      
      setChairs(chairsData);
      
      // Generate QR code images for chairs that have QR codes
      generateQRCodes(chairsData);
      
      // Load recent service requests
      const requestsQuery = query(
        collection(db, 'serviceLogs'),
        where('clientId', '==', user?.id),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      
      const requestsSnapshot = await getDocs(requestsQuery);
      const requestsData = requestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        completedAt: doc.data().completedAt?.toDate?.() || null
      })) as ServiceLog[];
      
      setRecentRequests(requestsData);
      
      // Calculate stats
      const totalChairs = chairsData.length;
      const pendingRequests = requestsData.filter(req => req.status === 'pending').length;
      const completedServices = requestsData.filter(req => req.status === 'completed').length;
      const chairsNeedingAttention = chairsData.filter(chair => 
        chair.condition === 'poor' || chair.condition === 'fair'
      ).length;
      
      setStats({
        totalChairs,
        pendingRequests,
        completedServices,
        chairsNeedingAttention
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCodes = async (chairsData: Chair[]) => {
    console.log('Generating QR codes for chairs:', chairsData.filter(chair => chair.qrCode).map(chair => ({
      id: chair.id,
      chairNumber: chair.chairNumber,
      qrCode: chair.qrCode
    })));
    
    const qrCodePromises = chairsData
      .filter(chair => chair.qrCode) // Only generate for chairs with QR codes
      .map(async (chair) => {
        try {
          console.log(`Generating QR code for chair ${chair.chairNumber}:`, chair.qrCode);
          setLoadingQR(prev => ({ ...prev, [chair.id]: true }));
          const qrDataURL = await generateQRCodeDataURL(chair.qrCode);
          console.log(`QR code generated successfully for chair ${chair.chairNumber}`);
          return { chairId: chair.id, qrDataURL };
        } catch (error) {
          console.error(`Failed to generate QR code for chair ${chair.chairNumber}:`, error);
          return { chairId: chair.id, qrDataURL: '' };
        } finally {
          setLoadingQR(prev => ({ ...prev, [chair.id]: false }));
        }
      });
    
    const qrResults = await Promise.all(qrCodePromises);
    const qrCodesMap = qrResults.reduce((acc, { chairId, qrDataURL }) => {
      if (qrDataURL) {
        acc[chairId] = qrDataURL;
      }
      return acc;
    }, {} as Record<string, string>);
    
    console.log('QR codes generated:', Object.keys(qrCodesMap).length, 'out of', chairsData.length, 'chairs');
    setQrCodes(qrCodesMap);
  };

  const downloadQRCode = (chair: Chair) => {
    const qrDataURL = qrCodes[chair.id];
    if (!qrDataURL) return;
    
    const link = document.createElement('a');
    link.href = qrDataURL;
    link.download = `ChairCare-QR-${chair.chairNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printQRCode = (chair: Chair) => {
    const qrDataURL = qrCodes[chair.id];
    if (!qrDataURL) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Chair Care QR Code - ${chair.chairNumber}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px;
                background: white;
              }
              .qr-container {
                border: 2px solid #0ea5e9;
                border-radius: 12px;
                padding: 20px;
                display: inline-block;
                margin: 20px;
                background: white;
              }
              .qr-code img {
                border-radius: 8px;
                background: white;
                padding: 10px;
              }
              .chair-info {
                margin-bottom: 15px;
                font-size: 18px;
                font-weight: bold;
                color: #0ea5e9;
              }
              .qr-text {
                font-family: monospace;
                font-size: 12px;
                color: #666;
                margin-top: 10px;
                word-break: break-all;
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="chair-info">Chair ${chair.chairNumber}</div>
              <div class="chair-info">${chair.location}</div>
              <div class="qr-code">
                <img src="${qrDataURL}" alt="QR Code" width="200" height="200" />
              </div>
              <div class="qr-text">${chair.qrCode}</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleChairClick = (chairId: string) => {
    router.push(`/client/chair-history/${chairId}`);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-ZA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (user?.role !== 'client') {
    return (
      <Layout>
        <Container>
          <div>Access denied. Client access required.</div>
        </Container>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <Container>
          <LoadingState>Loading your dashboard...</LoadingState>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <Header>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Title>Welcome, {user.name}</Title>
              <Subtitle>
                Manage your office chairs and service requests
              </Subtitle>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadDashboardData}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : '🔄 Refresh'}
            </Button>
          </div>
        </Header>

        <StatsGrid>
          <StatCard>
            <StatValue>{stats.totalChairs}</StatValue>
            <StatLabel>Total Chairs</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatValue>{stats.pendingRequests}</StatValue>
            <StatLabel>Pending Requests</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatValue>{stats.completedServices}</StatValue>
            <StatLabel>Completed Services</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatValue>{stats.chairsNeedingAttention}</StatValue>
            <StatLabel>Need Attention</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Service Progress Tracker */}
        <ServiceProgressTracker clientId={user.id} />

        <div>
          <SectionTitle>Your Chairs</SectionTitle>
          
          {chairs.length === 0 ? (
            <EmptyState>
              No chairs found. Contact your administrator to add chairs to your account.
            </EmptyState>
          ) : (
            <ChairsGrid>
              {chairs.map(chair => (
                <ChairCard key={chair.id} onClick={() => handleChairClick(chair.id)}>
                  <ChairHeader>
                    <ChairInfo>
                      <ChairNumber>Chair {chair.chairNumber}</ChairNumber>
                      <ChairLocation>{chair.location}</ChairLocation>
                    </ChairInfo>
                    <ConditionBadge condition={chair.condition || 'unknown'}>
                      {chair.condition || 'Unknown'}
                    </ConditionBadge>
                  </ChairHeader>
                  
                  <ChairDetails>
                    <DetailItem>
                      <DetailLabel>Model:</DetailLabel>
                      <DetailValue>{chair.model || 'Standard'}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Location:</DetailLabel>
                      <DetailValue>{chair.location}</DetailValue>
                    </DetailItem>
                  </ChairDetails>
                  
                  {/* QR Code Section */}
                  {chair.qrCode ? (
                    <QRCodeSection>
                      <div style={{ marginBottom: theme.spacing.sm, fontWeight: 600, color: theme.colors.text.primary }}>
                        📱 Scan QR Code
                      </div>
                      {loadingQR[chair.id] ? (
                        <QRCodeLoading>Generating QR code...</QRCodeLoading>
                      ) : qrCodes[chair.id] ? (
                        <>
                          <QRCodeImage 
                            src={qrCodes[chair.id]} 
                            alt={`QR Code for ${chair.chairNumber}`} 
                          />
                          <QRCodeText>{chair.qrCode}</QRCodeText>
                          <QRCodeActions>
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadQRCode(chair);
                              }}
                            >
                              📥 Download
                            </Button>
                            <Button 
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                printQRCode(chair);
                              }}
                            >
                              🖨️ Print
                            </Button>
                          </QRCodeActions>
                        </>
                      ) : (
                        <QRCodeLoading>Failed to generate QR code</QRCodeLoading>
                      )}
                    </QRCodeSection>
                  ) : (
                    <QRCodeSection>
                      <div style={{ 
                        textAlign: 'center', 
                        color: theme.colors.text.secondary,
                        padding: theme.spacing.lg
                      }}>
                        ⚠️ No QR Code Available<br />
                        <small>Contact admin to generate QR code</small>
                      </div>
                    </QRCodeSection>
                  )}
                  
                  <ChairActions>
                    <Button 
                      size="sm" 
                      variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChairClick(chair.id);
                      }}
                    >
                      View History
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/client/chair-history/${chair.id}?request=true`);
                      }}
                    >
                      Request Service
                    </Button>
                  </ChairActions>
                </ChairCard>
              ))}
            </ChairsGrid>
          )}
        </div>

        {recentRequests.length > 0 && (
          <RecentRequestsSection>
            <SectionTitle>Recent Service Requests</SectionTitle>
            
            <RequestsList>
              {recentRequests.map(request => (
                <RequestCard key={request.id}>
                  <RequestHeader>
                    <RequestInfo>
                      <RequestTitle>
                        Chair {request.chairNumber} - {request.serviceType}
                      </RequestTitle>
                      <RequestMeta>
                        {request.location} • {formatDate(request.createdAt)}
                      </RequestMeta>
                    </RequestInfo>
                    <StatusBadge status={request.status}>
                      {request.status.replace('_', ' ')}
                    </StatusBadge>
                  </RequestHeader>
                  
                  <RequestDescription>
                    {request.description}
                  </RequestDescription>
                </RequestCard>
              ))}
            </RequestsList>
          </RecentRequestsSection>
        )}

        {/* Invoices Section */}
        <RecentRequestsSection>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SectionTitle>Your Invoices</SectionTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push('/client/invoices')}
            >
              View All Invoices
            </Button>
          </div>
          
          <RequestsList>
            {/* This will be populated with recent invoices */}
            <RequestCard>
              <RequestHeader>
                <RequestInfo>
                  <RequestTitle>
                    Recent invoices will appear here
                  </RequestTitle>
                  <RequestMeta>
                    Check your email for invoice notifications
                  </RequestMeta>
                </RequestInfo>
              </RequestHeader>
            </RequestCard>
          </RequestsList>
        </RecentRequestsSection>
      </Container>
    </Layout>
  );
};

export default ClientDashboard;