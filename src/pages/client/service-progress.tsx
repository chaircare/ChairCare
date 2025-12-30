import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { useTheme } from 'contexts/ThemeContext';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { Job, ServiceLog } from 'types/chair-care';
import { formatCurrency } from 'utils/pricing';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from 'lib/firebase';

const Container = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div<{ theme: any }>`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Title = styled.h1<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const Subtitle = styled.p<{ theme: any }>`
  margin: 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const FilterTabs = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.xl};
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
`;

const FilterTab = styled.button<{ active: boolean; theme: any }>`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border: none;
  background: none;
  color: ${props => props.active ? props.theme.colors.primary[600] : props.theme.colors.text.secondary};
  font-weight: ${props => props.active ? props.theme.typography.fontWeight.semibold : props.theme.typography.fontWeight.medium};
  border-bottom: 2px solid ${props => props.active ? props.theme.colors.primary[500] : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.theme.colors.primary[600]};
  }
`;

const JobsGrid = styled.div<{ theme: any }>`
  display: grid;
  gap: ${props => props.theme.spacing.lg};
`;

const JobCard = styled(Card)<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
`;

const JobHeader = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const JobInfo = styled.div<{ theme: any }>`
  flex: 1;
`;

const JobId = styled.div<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary[600]};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const JobTitle = styled.div<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const JobMeta = styled.div<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
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
      case 'New':
        return `
          background: ${theme.colors.primary[100]};
          color: ${theme.colors.primary[800]};
        `;
      case 'Scheduled':
        return `
          background: ${theme.colors.warning[100]};
          color: ${theme.colors.warning[800]};
        `;
      case 'In Progress':
        return `
          background: ${theme.colors.accent[100]};
          color: ${theme.colors.accent[800]};
        `;
      case 'Completed':
        return `
          background: ${theme.colors.success[100]};
          color: ${theme.colors.success[800]};
        `;
      case 'Invoiced':
        return `
          background: ${theme.colors.purple[100]};
          color: ${theme.colors.purple[800]};
        `;
      case 'Paid':
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

const ProgressSection = styled.div<{ theme: any }>`
  margin: ${props => props.theme.spacing.lg} 0;
`;

const ProgressBar = styled.div<{ theme: any }>`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ProgressTrack = styled.div<{ theme: any }>`
  width: 100%;
  height: 12px;
  background: ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.borderRadius.full};
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number; theme: any }>`
  height: 100%;
  width: ${props => props.progress}%;
  background: linear-gradient(90deg, ${props => props.theme.colors.primary[500]} 0%, ${props => props.theme.colors.accent[500]} 100%);
  border-radius: ${props => props.theme.borderRadius.full};
  transition: width 0.3s ease;
`;

const ProgressSteps = styled.div<{ theme: any }>`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: ${props => props.theme.spacing.sm};
  }
`;

const ProgressStep = styled.div<{ active: boolean; completed: boolean; theme: any }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => {
    if (props.completed) return props.theme.colors.success[50];
    if (props.active) return props.theme.colors.primary[50];
    return props.theme.colors.gray[50];
  }};
  border: 2px solid ${props => {
    if (props.completed) return props.theme.colors.success[200];
    if (props.active) return props.theme.colors.primary[200];
    return props.theme.colors.gray[200];
  }};
`;

const StepIcon = styled.div<{ active: boolean; completed: boolean; theme: any }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSize.xl};
  
  ${props => {
    if (props.completed) {
      return `
        background: ${props.theme.colors.success[500]};
        color: white;
      `;
    }
    if (props.active) {
      return `
        background: ${props.theme.colors.primary[500]};
        color: white;
      `;
    }
    return `
      background: ${props.theme.colors.gray[200]};
      color: ${props.theme.colors.text.secondary};
    `;
  }}
`;

const StepLabel = styled.div<{ active: boolean; completed: boolean; theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.active || props.completed ? props.theme.typography.fontWeight.semibold : props.theme.typography.fontWeight.medium};
  color: ${props => {
    if (props.completed) return props.theme.colors.success[700];
    if (props.active) return props.theme.colors.primary[700];
    return props.theme.colors.text.secondary;
  }};
`;

const JobDetails = styled.div<{ theme: any }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin: ${props => props.theme.spacing.lg} 0;
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : props.theme.colors.gray[50]
  };
  border-radius: ${props => props.theme.borderRadius.lg};
`;

const DetailItem = styled.div<{ theme: any }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const DetailLabel = styled.span<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  font-size: ${props => props.theme.typography.fontSize.sm};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const DetailValue = styled.span<{ theme: any }>`
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const EmptyState = styled.div<{ theme: any }>`
  text-align: center;
  padding: ${props => props.theme.spacing['2xl']};
  color: ${props => props.theme.colors.text.secondary};
`;

const LoadingState = styled.div<{ theme: any }>`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${props => props.theme.spacing['2xl']};
  color: ${props => props.theme.colors.text.secondary};
`;

const PROGRESS_STEPS = [
  { key: 'New', label: 'Service Requested', icon: '📝', description: 'Your service request has been submitted' },
  { key: 'Scheduled', label: 'Scheduled', icon: '📅', description: 'Service has been scheduled with a technician' },
  { key: 'In Progress', label: 'In Progress', icon: '🔧', description: 'Technician is working on your chairs' },
  { key: 'Completed', label: 'Work Complete', icon: '✅', description: 'Service work has been completed' },
  { key: 'Invoiced', label: 'Invoice Sent', icon: '💰', description: 'Invoice has been generated and sent' },
  { key: 'Paid', label: 'Payment Complete', icon: '✨', description: 'Payment received and service closed' }
];

function getProgressPercentage(status: string): number {
  const stepIndex = PROGRESS_STEPS.findIndex(step => step.key === status);
  return stepIndex >= 0 ? ((stepIndex + 1) / PROGRESS_STEPS.length) * 100 : 0;
}

function getActiveStepIndex(status: string): number {
  return PROGRESS_STEPS.findIndex(step => step.key === status);
}

const ServiceProgressPage: NextPage = () => {
  const { user } = useAuth();
  const { theme, mode } = useTheme();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.role !== 'client') {
      router.push('/dashboard');
      return;
    }

    loadJobs();
  }, [user, router, filter]);

  const loadJobs = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      let jobsQuery;
      if (filter === 'active') {
        jobsQuery = query(
          collection(db, 'jobs'),
          where('clientId', '==', user.id),
          where('status', 'in', ['New', 'Scheduled', 'In Progress']),
          orderBy('createdAt', 'desc')
        );
      } else if (filter === 'completed') {
        jobsQuery = query(
          collection(db, 'jobs'),
          where('clientId', '==', user.id),
          where('status', 'in', ['Completed', 'Invoiced', 'Paid']),
          orderBy('createdAt', 'desc')
        );
      } else {
        jobsQuery = query(
          collection(db, 'jobs'),
          where('clientId', '==', user.id),
          orderBy('createdAt', 'desc')
        );
      }
      
      const jobsSnapshot = await getDocs(jobsQuery);
      const jobsData = jobsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        scheduledDate: doc.data().scheduledDate?.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Job[];
      
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Not set';
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (date: Date | undefined) => {
    if (!date) return 'Not set';
    return date.toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user || user.role !== 'client') {
    return null;
  }

  return (
    <Layout showBackButton={true} backButtonText="Back to Dashboard" onBackClick={() => router.push('/client/dashboard')}>
      <Container theme={theme}>
        <Header theme={theme}>
          <Title theme={theme}>Service Progress</Title>
          <Subtitle theme={theme}>
            Track the progress of your chair service requests
          </Subtitle>
        </Header>

        <FilterTabs theme={theme}>
          <FilterTab 
            active={filter === 'active'} 
            theme={theme}
            onClick={() => setFilter('active')}
          >
            Active Services
          </FilterTab>
          <FilterTab 
            active={filter === 'completed'} 
            theme={theme}
            onClick={() => setFilter('completed')}
          >
            Completed Services
          </FilterTab>
          <FilterTab 
            active={filter === 'all'} 
            theme={theme}
            onClick={() => setFilter('all')}
          >
            All Services
          </FilterTab>
        </FilterTabs>

        {loading ? (
          <LoadingState theme={theme}>Loading service progress...</LoadingState>
        ) : jobs.length === 0 ? (
          <EmptyState theme={theme}>
            <h3>No Services Found</h3>
            <p>
              {filter === 'active' 
                ? "You don't have any active service requests at the moment."
                : filter === 'completed'
                ? "You don't have any completed services yet."
                : "You haven't requested any services yet."
              }
            </p>
            <Button 
              variant="primary" 
              onClick={() => router.push('/client/dashboard')}
            >
              Request Service
            </Button>
          </EmptyState>
        ) : (
          <JobsGrid theme={theme}>
            {jobs.map((job) => {
              const activeStepIndex = getActiveStepIndex(job.status);
              const progressPercentage = getProgressPercentage(job.status);
              
              return (
                <JobCard key={job.id} theme={theme}>
                  <JobHeader theme={theme}>
                    <JobInfo theme={theme}>
                      <JobId theme={theme}>{job.jobId}</JobId>
                      <JobTitle theme={theme}>
                        {job.serviceType ? `${job.serviceType.charAt(0).toUpperCase() + job.serviceType.slice(1)} Service` : 'Service Request'}
                      </JobTitle>
                      <JobMeta theme={theme}>
                        Created {formatDateTime(job.createdAt)} • {job.chairs?.length || 0} chairs
                      </JobMeta>
                    </JobInfo>
                    <StatusBadge status={job.status} theme={theme}>
                      {job.status}
                    </StatusBadge>
                  </JobHeader>

                  <ProgressSection theme={theme}>
                    <ProgressBar theme={theme}>
                      <ProgressTrack theme={theme}>
                        <ProgressFill progress={progressPercentage} theme={theme} />
                      </ProgressTrack>
                    </ProgressBar>
                    
                    <ProgressSteps theme={theme}>
                      {PROGRESS_STEPS.map((step, index) => (
                        <ProgressStep
                          key={step.key}
                          active={index === activeStepIndex}
                          completed={index < activeStepIndex}
                          theme={theme}
                        >
                          <StepIcon
                            active={index === activeStepIndex}
                            completed={index < activeStepIndex}
                            theme={theme}
                          >
                            {index < activeStepIndex ? '✓' : step.icon}
                          </StepIcon>
                          <StepLabel
                            active={index === activeStepIndex}
                            completed={index < activeStepIndex}
                            theme={theme}
                          >
                            {step.label}
                          </StepLabel>
                        </ProgressStep>
                      ))}
                    </ProgressSteps>
                  </ProgressSection>

                  <JobDetails theme={theme}>
                    <DetailItem theme={theme}>
                      <DetailLabel theme={theme}>Technician</DetailLabel>
                      <DetailValue theme={theme}>
                        {job.assignedTechnicianName || 'Not assigned yet'}
                      </DetailValue>
                    </DetailItem>
                    
                    <DetailItem theme={theme}>
                      <DetailLabel theme={theme}>Scheduled Date</DetailLabel>
                      <DetailValue theme={theme}>
                        {job.scheduledDate ? formatDate(job.scheduledDate) : 'Not scheduled yet'}
                      </DetailValue>
                    </DetailItem>
                    
                    <DetailItem theme={theme}>
                      <DetailLabel theme={theme}>Service Location</DetailLabel>
                      <DetailValue theme={theme}>
                        {job.location || 'Client site'}
                      </DetailValue>
                    </DetailItem>
                    
                    {job.estimatedPrice && (
                      <DetailItem theme={theme}>
                        <DetailLabel theme={theme}>Estimated Price</DetailLabel>
                        <DetailValue theme={theme}>
                          {formatCurrency(job.estimatedPrice)}
                        </DetailValue>
                      </DetailItem>
                    )}
                    
                    {job.finalPrice && (
                      <DetailItem theme={theme}>
                        <DetailLabel theme={theme}>Final Price</DetailLabel>
                        <DetailValue theme={theme}>
                          {formatCurrency(job.finalPrice)}
                        </DetailValue>
                      </DetailItem>
                    )}
                    
                    {job.completedAt && (
                      <DetailItem theme={theme}>
                        <DetailLabel theme={theme}>Completed Date</DetailLabel>
                        <DetailValue theme={theme}>
                          {formatDateTime(job.completedAt)}
                        </DetailValue>
                      </DetailItem>
                    )}
                  </JobDetails>

                  {job.adminNotes && (
                    <div style={{ 
                      marginTop: theme.spacing.lg,
                      padding: theme.spacing.lg,
                      background: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : theme.colors.primary[50],
                      borderRadius: theme.borderRadius.lg,
                      border: `1px solid ${theme.colors.primary[200]}`
                    }}>
                      <DetailLabel theme={theme}>Service Notes</DetailLabel>
                      <div style={{ 
                        marginTop: theme.spacing.sm,
                        color: theme.colors.text.primary,
                        lineHeight: theme.typography.lineHeight.relaxed
                      }}>
                        {job.adminNotes}
                      </div>
                    </div>
                  )}
                </JobCard>
              );
            })}
          </JobsGrid>
        )}
      </Container>
    </Layout>
  );
};

export default ServiceProgressPage;