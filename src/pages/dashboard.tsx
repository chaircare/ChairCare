import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { useTheme } from 'contexts/ThemeContext';
import { DashboardStats, Chair, ServiceLog, Job } from 'types/chair-care';
import { getDashboardStats, getChairs, getServiceLogs } from 'lib/firebase-database';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from 'lib/firebase';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { HeroSection } from 'components/ui/HeroSection';
import { CompactHero } from 'components/ui/CompactHero';
import { ChatBot } from 'components/ui/ChatBot';

const StatsGrid = styled.div<{ theme: any }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${props => props.theme.spacing['2xl']};
  margin-bottom: ${props => props.theme.spacing['3xl']};
  padding: 0 ${props => props.theme.spacing.xl};
`;

const StatCard = styled(Card)<{ theme: any }>`
  text-align: center;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.8)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius['2xl']};
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.theme.gradients.accent};
  }
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: ${props => props.theme.shadows['2xl']};
    border-color: ${props => props.theme.colors.primary[300]};
  }
`;

const StatValue = styled.div<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize['5xl']};
  font-weight: ${props => props.theme.typography.fontWeight.extrabold};
  background: ${props => props.theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: ${props => props.theme.spacing.md};
  font-family: ${props => props.theme.typography.fontFamily.sans.join(', ')};
  line-height: 1;
`;

const StatLabel = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: ${props => props.theme.typography.letterSpacing.wide};
`;

const Section = styled(Card)<{ theme: any }>`
  margin-bottom: ${props => props.theme.spacing['2xl']};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.8)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius['2xl']};
  backdrop-filter: blur(10px);
`;

const SectionHeader = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.xl};
  padding-bottom: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
`;

const SectionTitle = styled.h2<{ theme: any }>`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const ItemsList = styled.div<{ theme: any }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const ItemCard = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(51, 65, 85, 0.5)' 
    : props.theme.colors.gray[50]
  };
  border-radius: ${props => props.theme.borderRadius.xl};
  border: 1px solid ${props => props.theme.colors.border.primary};
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(51, 65, 85, 0.8)' 
      : props.theme.colors.background.primary
    };
    box-shadow: ${props => props.theme.shadows.lg};
    transform: translateY(-2px);
  }
`;

const ItemInfo = styled.div<{ theme: any }>`
  flex: 1;
`;

const ItemTitle = styled.div<{ theme: any }>`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.lg};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ItemDetails = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
`;

const StatusBadge = styled.span<{ status: string; theme: any }>`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  ${({ status, theme }) => {
    switch (status) {
      case 'pending':
        return `
          background: ${theme.gradients.primary};
          color: white;
          box-shadow: ${theme.shadows.professional};
        `;
      case 'completed':
        return `
          background-color: ${theme.colors.success[500]};
          color: white;
          box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
        `;
      case 'billed':
        return `
          background: ${theme.gradients.accent};
          color: white;
          box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3);
        `;
      default:
        return `
          background-color: ${theme.colors.gray[500]};
          color: white;
          box-shadow: ${theme.shadows.sm};
        `;
    }
  }}
`;

const ActionButton = styled(Button)<{ theme: any }>`
  margin-left: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.full};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const LoadingContainer = styled.div<{ theme: any }>`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const EmptyState = styled.div<{ theme: any }>`
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
  padding: ${props => props.theme.spacing['4xl']};
  
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

const DashboardPage: NextPage = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [serviceLogs, setServiceLogs] = useState<ServiceLog[]>([]);
  const [assignedJobs, setAssignedJobs] = useState<Job[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHero, setShowHero] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    
    // Redirect clients to their specific dashboard
    if (user?.role === 'client') {
      router.push('/client/dashboard');
      return;
    }
    
    if (user) {
      loadDashboardData();
    }
  }, [user, authLoading, router]);

  const loadDashboardData = async () => {
    try {
      if (user?.role === 'technician') {
        // Load technician-specific data
        await loadTechnicianData();
      } else {
        // Load admin/client data
        const clientId = user?.role === 'client' ? user.id : undefined;
        
        const [stats, chairsData, serviceLogsData] = await Promise.all([
          getDashboardStats(clientId),
          getChairs(clientId),
          getServiceLogs(clientId)
        ]);

        setStats(stats);
        setChairs(chairsData);
        setServiceLogs(serviceLogsData);

        // Load pending service requests for admin
        if (user?.role === 'admin') {
          try {
            const requestsQuery = query(
              collection(db, 'serviceLogs'),
              where('status', '==', 'pending')
            );
            
            const requestsSnapshot = await getDocs(requestsQuery);
            const requestsWithDetails = [];
            
            for (const requestDoc of requestsSnapshot.docs) {
              const requestData = requestDoc.data();
              
              // Get chair details
              let chair = null;
              if (requestData.chairId) {
                const chairDoc = await getDoc(doc(db, 'chairs', requestData.chairId));
                if (chairDoc.exists()) {
                  chair = { id: chairDoc.id, ...chairDoc.data() };
                }
              }
              
              requestsWithDetails.push({
                id: requestDoc.id,
                ...requestData,
                chair,
                createdAt: requestData.createdAt?.toDate() || new Date()
              });
            }
            
            setPendingRequests(requestsWithDetails);
          } catch (error) {
            console.error('Error loading pending requests:', error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTechnicianData = async () => {
    try {
      // Load jobs assigned to this technician
      const jobsQuery = query(
        collection(db, 'jobs'),
        where('assignedTechnicianId', '==', user!.id)
      );
      
      const jobsSnapshot = await getDocs(jobsQuery);
      const jobsData = jobsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledDate: doc.data().scheduledDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate()
      })) as Job[];
      
      setAssignedJobs(jobsData);
      
      // Calculate technician stats
      const totalJobs = jobsData.length;
      const activeJobs = jobsData.filter(job => job.status && ['Scheduled', 'In Progress'].includes(job.status)).length;
      const completedJobs = jobsData.filter(job => job.status === 'Completed').length;
      
      setStats({
        totalChairs: totalJobs,
        pendingServices: activeJobs,
        completedThisMonth: completedJobs,
        totalRevenue: 0,
        servicesByType: { cleaning: 0, repair: 0 }
      });
    } catch (error) {
      console.error('Error loading technician data:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-ZA');
  };

  if (authLoading || loading) {
    return (
      <>
        <Head>
          <title>Dashboard - Chair Care</title>
          <meta name="description" content="Chair Care dashboard - manage your office chair maintenance and repair services" />
        </Head>
        <Layout>
          <LoadingContainer theme={theme}>Loading your dashboard...</LoadingContainer>
        </Layout>
      </>
    );
  }

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'GOOD MORNING!';
    if (hour < 17) return 'GOOD AFTERNOON!';
    return 'GOOD EVENING!';
  };

  const getHeroTitle = () => {
    switch (user?.role) {
      case 'admin':
        return "Here's Why Cape Town's Corporate And Home Office Professionals Rely On Us For";
      case 'technician':
        return "Professional Chair Service Excellence Starts With";
      case 'client':
        return "Your Office Chair Care Solution For";
      default:
        return "Professional Chair Care Management For";
    }
  };

  const getHeroAccent = () => {
    switch (user?.role) {
      case 'admin':
        return "THE BEST SEATING SOLUTIONS";
      case 'technician':
        return "EXPERT TECHNICAL SERVICE";
      case 'client':
        return "PREMIUM OFFICE COMFORT";
      default:
        return "PROFESSIONAL SERVICE";
    }
  };

  const getHeroDescription = () => {
    // Only show description for clients, keep it compact for management
    if (user?.role === 'client') {
      return "Track your chair maintenance, request services, and monitor the health of your office seating with our client dashboard.";
    }
    return undefined; // No description for admin/technician to keep it compact
  };

  const shouldShowFullHero = () => {
    // Only show full hero for clients, compact version for management
    return user?.role === 'client';
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Dashboard - Chair Care</title>
        <meta name="description" content="Chair Care dashboard - manage your office chair maintenance and repair services" />
      </Head>
      <Layout>
      {showHero && shouldShowFullHero() && (
        <HeroSection
          title={getHeroTitle()}
          subtitle={getWelcomeMessage()}
          accentText={getHeroAccent()}
          description={getHeroDescription()}
          primaryAction={{
            text: user.role === 'admin' ? 'View Calendar' : user.role === 'technician' ? 'Available Jobs' : 'Request Service',
            onClick: () => {
              setShowHero(false);
              if (user.role === 'admin') router.push('/admin/calendar');
              else if (user.role === 'technician') router.push('/technician/available-jobs');
              else router.push('/scan');
            }
          }}
          secondaryAction={{
            text: user.role === 'admin' ? 'Manage Jobs' : 'View Analytics',
            onClick: () => {
              setShowHero(false);
              if (user.role === 'admin') router.push('/admin/job-progress');
            }
          }}
          showDecorative={true}
        />
      )}

      {showHero && !shouldShowFullHero() && (
        <CompactHero
          title={getHeroTitle()}
          subtitle={getWelcomeMessage()}
          accentText={getHeroAccent()}
          primaryAction={{
            text: user.role === 'admin' ? 'View Calendar' : 'Available Jobs',
            onClick: () => {
              setShowHero(false);
              if (user.role === 'admin') router.push('/admin/calendar');
              else router.push('/technician/available-jobs');
            }
          }}
          secondaryAction={{
            text: user.role === 'admin' ? 'Job Progress' : 'My Jobs',
            onClick: () => {
              setShowHero(false);
              if (user.role === 'admin') router.push('/admin/job-progress');
              else router.push('/dashboard');
            }
          }}
        />
      )}

      {!showHero && stats && (
        <StatsGrid theme={theme}>
          <StatCard theme={theme} hover>
            <StatValue theme={theme}>{stats.totalChairs}</StatValue>
            <StatLabel theme={theme}>{user.role === 'technician' ? 'Total Jobs' : 'Total Chairs'}</StatLabel>
          </StatCard>
          <StatCard theme={theme} hover>
            <StatValue theme={theme}>{stats.pendingServices}</StatValue>
            <StatLabel theme={theme}>{user.role === 'technician' ? 'Active Jobs' : 'Pending Services'}</StatLabel>
          </StatCard>
          <StatCard theme={theme} hover>
            <StatValue theme={theme}>{stats.completedThisMonth}</StatValue>
            <StatLabel theme={theme}>{user.role === 'technician' ? 'Completed Jobs' : 'Completed This Month'}</StatLabel>
          </StatCard>
          {user.role !== 'technician' && (
            <StatCard theme={theme} hover>
              <StatValue theme={theme}>{formatCurrency(stats.totalRevenue)}</StatValue>
              <StatLabel theme={theme}>Total Revenue</StatLabel>
            </StatCard>
          )}
        </StatsGrid>
      )}

      {/* Rest of dashboard content */}
      {user.role === 'technician' ? (
        // Technician Dashboard
        <Section theme={theme}>
          <SectionHeader theme={theme}>
            <SectionTitle theme={theme}>My Assigned Jobs</SectionTitle>
          </SectionHeader>
          
          {assignedJobs.length === 0 ? (
            <EmptyState theme={theme}>
              <h3>No Jobs Assigned</h3>
              <p>You don't have any jobs assigned yet. Check back later or contact your supervisor.</p>
            </EmptyState>
          ) : (
            <ItemsList theme={theme}>
              {assignedJobs.map((job) => (
                <ItemCard key={job.id} theme={theme}>
                  <ItemInfo theme={theme}>
                    <ItemTitle theme={theme}>
                      Job #{job.jobId} - {job.clientName}
                    </ItemTitle>
                    <ItemDetails theme={theme}>
                      📍 {job.location || 'Client site'}<br />
                      📅 {job.scheduledDate ? formatDate(job.scheduledDate) : 'Not scheduled'} {job.scheduledTime || ''}<br />
                      🔧 {job.jobType} • {job.chairs?.length || 0} chairs
                    </ItemDetails>
                  </ItemInfo>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm, alignItems: 'flex-end' }}>
                    <StatusBadge status={job.status.toLowerCase()} theme={theme}>
                      {job.status}
                    </StatusBadge>
                    {job.status === 'Scheduled' && (
                      <ActionButton
                        theme={theme}
                        variant="primary"
                        size="sm"
                        onClick={() => router.push(`/jobs/${job.id}/technician`)}
                      >
                        Start Job
                      </ActionButton>
                    )}
                    {job.status === 'In Progress' && (
                      <ActionButton
                        theme={theme}
                        variant="secondary"
                        size="sm"
                        onClick={() => router.push(`/jobs/${job.id}/technician`)}
                      >
                        Continue Job
                      </ActionButton>
                    )}
                  </div>
                </ItemCard>
              ))}
            </ItemsList>
          )}
        </Section>
      ) : (
        // Admin/Client Dashboard
        <>
          {user.role === 'admin' && (
            <>
              <Section theme={theme}>
                <SectionHeader theme={theme}>
                  <SectionTitle theme={theme}>Quick Actions</SectionTitle>
                  <div style={{ display: 'flex', gap: theme.spacing.md, flexWrap: 'wrap' }}>
                    <ActionButton
                      theme={theme}
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/admin/inventory')}
                    >
                      Manage Inventory
                    </ActionButton>
                    <ActionButton
                      theme={theme}
                      variant="secondary"
                      size="sm"
                      onClick={() => router.push('/admin/calendar')}
                    >
                      View Calendar
                    </ActionButton>
                    <ActionButton
                      theme={theme}
                      variant="secondary"
                      size="sm"
                      onClick={() => router.push('/chairs/qr-generator')}
                    >
                      QR Codes
                    </ActionButton>
                    <ActionButton
                      theme={theme}
                      variant="secondary"
                      size="sm"
                      onClick={() => router.push('/admin/logo-upload')}
                    >
                      Custom Logo
                    </ActionButton>
                    <ActionButton
                      theme={theme}
                      variant="warning"
                      size="sm"
                      onClick={() => router.push('/admin/fix-chairs')}
                    >
                      Fix QR Codes
                    </ActionButton>
                    <ActionButton
                      theme={theme}
                      variant="primary"
                      size="sm"
                      onClick={() => router.push('/admin/job-progress')}
                    >
                      Job Progress
                    </ActionButton>
                  </div>
                </SectionHeader>
              </Section>

              <Section theme={theme}>
                <SectionHeader theme={theme}>
                  <SectionTitle theme={theme}>Pending Service Requests</SectionTitle>
                  <ActionButton
                    theme={theme}
                    variant="primary"
                    size="sm"
                    onClick={() => router.push('/admin/service-requests')}
                  >
                    View All
                  </ActionButton>
                </SectionHeader>
                
                {pendingRequests.length === 0 ? (
                  <EmptyState theme={theme}>
                    <h3>No Pending Requests</h3>
                    <p>All service requests have been processed.</p>
                  </EmptyState>
                ) : (
                  <ItemsList theme={theme}>
                    {pendingRequests.slice(0, 5).map((request) => (
                      <ItemCard key={request.id} theme={theme}>
                        <ItemInfo theme={theme}>
                          <ItemTitle theme={theme}>
                            {request.chair?.chairId || 'Unknown Chair'} - {request.serviceType}
                          </ItemTitle>
                          <ItemDetails theme={theme}>
                            📍 {request.chair?.location || 'Unknown location'}<br />
                            📝 {request.description}<br />
                            💰 R{request.cost?.toFixed(2) || '0.00'}
                          </ItemDetails>
                        </ItemInfo>
                        <ActionButton
                          theme={theme}
                          variant="primary"
                          size="sm"
                          onClick={() => router.push('/admin/service-requests')}
                        >
                          Review
                        </ActionButton>
                      </ItemCard>
                    ))}
                  </ItemsList>
                )}
              </Section>
            </>
          )}

          <Section theme={theme}>
            <SectionHeader theme={theme}>
              <SectionTitle theme={theme}>My Chairs</SectionTitle>
              <div style={{ display: 'flex', gap: theme.spacing.md }}>
                <ActionButton
                  theme={theme}
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push('/chairs/qr-generator')}
                >
                  View QR Codes
                </ActionButton>
                <ActionButton
                  theme={theme}
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/scan')}
                >
                  Request Service
                </ActionButton>
              </div>
            </SectionHeader>
            
            {chairs.length === 0 ? (
              <EmptyState theme={theme}>
                <h3>No Chairs Registered</h3>
                <p>Get started by adding your first chair to the system.</p>
              </EmptyState>
            ) : (
              <ItemsList theme={theme}>
                {chairs.slice(0, 10).map((chair) => (
                  <ItemCard key={chair.id} theme={theme}>
                    <ItemInfo theme={theme}>
                      <ItemTitle theme={theme}>
                        {chair.chairNumber} - {chair.model || 'Office Chair'}
                      </ItemTitle>
                      <ItemDetails theme={theme}>
                        📍 {chair.location}<br />
                        🏷️ QR Code: {chair.qrCode}
                      </ItemDetails>
                    </ItemInfo>
                    <ActionButton
                      theme={theme}
                      variant="secondary"
                      size="sm"
                      onClick={() => router.push(`/chairs/${chair.id}/history`)}
                    >
                      View History
                    </ActionButton>
                  </ItemCard>
                ))}
              </ItemsList>
            )}
          </Section>

          <Section theme={theme}>
            <SectionHeader theme={theme}>
              <SectionTitle theme={theme}>Recent Service Activity</SectionTitle>
            </SectionHeader>
            
            {serviceLogs.length === 0 ? (
              <EmptyState theme={theme}>
                <h3>No Service History</h3>
                <p>Service requests will appear here once you start using the system.</p>
              </EmptyState>
            ) : (
              <ItemsList theme={theme}>
                {serviceLogs.slice(0, 5).map((log) => (
                  <ItemCard key={log.id} theme={theme}>
                    <ItemInfo theme={theme}>
                      <ItemTitle theme={theme}>
                        {log.serviceType.toUpperCase()} - {log.chair?.chairNumber}
                      </ItemTitle>
                      <ItemDetails theme={theme}>
                        {log.description}<br />
                        💰 {formatCurrency(log.cost)} • 📅 {formatDate(log.createdAt)}
                      </ItemDetails>
                    </ItemInfo>
                    <StatusBadge status={log.status} theme={theme}>
                      {log.status}
                    </StatusBadge>
                  </ItemCard>
                ))}
              </ItemsList>
            )}
          </Section>
        </>
      )}

      {/* Chatbot - only show for clients */}
      {user.role === 'client' && <ChatBot />}
    </Layout>
    </>
  );
};

export default DashboardPage;