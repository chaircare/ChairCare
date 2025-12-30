import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useTheme } from 'contexts/ThemeContext';
import { Card } from 'components/ui/Card';
import { Button } from 'components/ui/Button';
import { Job } from 'types/chair-care';
import { formatCurrency } from 'utils/pricing';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from 'lib/firebase';

interface ServiceProgressTrackerProps {
  clientId: string;
}

const ProgressContainer = styled.div<{ theme: any }>`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const SectionHeader = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SectionTitle = styled.h2<{ theme: any }>`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const JobsGrid = styled.div<{ theme: any }>`
  display: grid;
  gap: ${props => props.theme.spacing.lg};
`;

const JobCard = styled(Card)<{ theme: any }>`
  padding: ${props => props.theme.spacing.lg};
  border-left: 4px solid ${props => props.theme.colors.primary[500]};
`;

const JobHeader = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const JobInfo = styled.div<{ theme: any }>`
  flex: 1;
`;

const JobId = styled.div<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary[600]};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const JobTitle = styled.div<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.base};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const JobMeta = styled.div<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const StatusBadge = styled.span<{ status: string; theme: any }>`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
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

const ProgressBar = styled.div<{ theme: any }>`
  margin: ${props => props.theme.spacing.md} 0;
`;

const ProgressTrack = styled.div<{ theme: any }>`
  width: 100%;
  height: 8px;
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
  display: flex;
  justify-content: space-between;
  margin-top: ${props => props.theme.spacing.sm};
`;

const ProgressStep = styled.div<{ active: boolean; completed: boolean; theme: any }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => {
    if (props.completed) return props.theme.colors.success[600];
    if (props.active) return props.theme.colors.primary[600];
    return props.theme.colors.text.secondary;
  }};
  font-weight: ${props => props.active || props.completed ? props.theme.typography.fontWeight.semibold : props.theme.typography.fontWeight.medium};
`;

const StepIcon = styled.div<{ active: boolean; completed: boolean; theme: any }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSize.xs};
  
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

const JobDetails = styled.div<{ theme: any }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.md};
  margin: ${props => props.theme.spacing.md} 0;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : props.theme.colors.gray[50]
  };
  border-radius: ${props => props.theme.borderRadius.md};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const DetailLabel = styled.span<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const DetailValue = styled.span<{ theme: any }>`
  color: ${props => props.theme.colors.text.primary};
  margin-left: ${props => props.theme.spacing.xs};
`;

const EmptyState = styled.div<{ theme: any }>`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.text.secondary};
`;

const LoadingState = styled.div<{ theme: any }>`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.text.secondary};
`;

const PROGRESS_STEPS = [
  { key: 'New', label: 'Requested', icon: '📝' },
  { key: 'Scheduled', label: 'Scheduled', icon: '📅' },
  { key: 'In Progress', label: 'In Progress', icon: '🔧' },
  { key: 'Completed', label: 'Completed', icon: '✅' },
  { key: 'Invoiced', label: 'Invoiced', icon: '💰' },
  { key: 'Paid', label: 'Paid', icon: '✨' }
];

function getProgressPercentage(status: string): number {
  const stepIndex = PROGRESS_STEPS.findIndex(step => step.key === status);
  return stepIndex >= 0 ? ((stepIndex + 1) / PROGRESS_STEPS.length) * 100 : 0;
}

function getActiveStepIndex(status: string): number {
  return PROGRESS_STEPS.findIndex(step => step.key === status);
}

export const ServiceProgressTracker: React.FC<ServiceProgressTrackerProps> = ({ clientId }) => {
  const { theme, mode } = useTheme();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveJobs();
  }, [clientId]);

  const loadActiveJobs = async () => {
    try {
      setLoading(true);
      
      // Load active jobs for the client
      const jobsQuery = query(
        collection(db, 'jobs'),
        where('clientId', '==', clientId),
        where('status', 'in', ['New', 'Scheduled', 'In Progress', 'Completed', 'Invoiced']),
        orderBy('createdAt', 'desc')
      );
      
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
      console.error('Error loading active jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Not set';
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (date: Date | undefined) => {
    if (!date) return 'Not set';
    return date.toLocaleString('en-ZA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <ProgressContainer theme={theme}>
        <SectionTitle theme={theme}>Service Progress</SectionTitle>
        <LoadingState theme={theme}>Loading service progress...</LoadingState>
      </ProgressContainer>
    );
  }

  if (jobs.length === 0) {
    return (
      <ProgressContainer theme={theme}>
        <SectionHeader theme={theme}>
          <SectionTitle theme={theme}>Service Progress</SectionTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/client/service-progress')}
          >
            View All Services
          </Button>
        </SectionHeader>
        <EmptyState theme={theme}>
          <h3>No Active Services</h3>
          <p>You don't have any active service requests at the moment.</p>
        </EmptyState>
      </ProgressContainer>
    );
  }

  return (
    <ProgressContainer theme={theme}>
      <SectionHeader theme={theme}>
        <SectionTitle theme={theme}>Service Progress ({jobs.length})</SectionTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push('/client/service-progress')}
        >
          View All Services
        </Button>
      </SectionHeader>
      
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

              <ProgressBar theme={theme}>
                <ProgressTrack theme={theme}>
                  <ProgressFill progress={progressPercentage} theme={theme} />
                </ProgressTrack>
                
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
                      <span>{step.label}</span>
                    </ProgressStep>
                  ))}
                </ProgressSteps>
              </ProgressBar>

              <JobDetails theme={theme}>
                <DetailItem theme={theme}>
                  <DetailLabel theme={theme}>Technician:</DetailLabel>
                  <DetailValue theme={theme}>
                    {job.assignedTechnicianName || 'Not assigned'}
                  </DetailValue>
                </DetailItem>
                
                <DetailItem theme={theme}>
                  <DetailLabel theme={theme}>Scheduled:</DetailLabel>
                  <DetailValue theme={theme}>
                    {job.scheduledDate ? formatDate(job.scheduledDate) : 'Not scheduled'}
                  </DetailValue>
                </DetailItem>
                
                {job.estimatedPrice && (
                  <DetailItem theme={theme}>
                    <DetailLabel theme={theme}>Estimated Price:</DetailLabel>
                    <DetailValue theme={theme}>
                      {formatCurrency(job.estimatedPrice)}
                    </DetailValue>
                  </DetailItem>
                )}
                
                {job.finalPrice && (
                  <DetailItem theme={theme}>
                    <DetailLabel theme={theme}>Final Price:</DetailLabel>
                    <DetailValue theme={theme}>
                      {formatCurrency(job.finalPrice)}
                    </DetailValue>
                  </DetailItem>
                )}
                
                <DetailItem theme={theme}>
                  <DetailLabel theme={theme}>Location:</DetailLabel>
                  <DetailValue theme={theme}>
                    {job.location || 'Client site'}
                  </DetailValue>
                </DetailItem>
                
                {job.completedAt && (
                  <DetailItem theme={theme}>
                    <DetailLabel theme={theme}>Completed:</DetailLabel>
                    <DetailValue theme={theme}>
                      {formatDateTime(job.completedAt)}
                    </DetailValue>
                  </DetailItem>
                )}
              </JobDetails>

              {job.adminNotes && (
                <div style={{ 
                  marginTop: theme.spacing.md,
                  padding: theme.spacing.md,
                  background: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : theme.colors.primary[50],
                  borderRadius: theme.borderRadius.md,
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.primary
                }}>
                  <strong>Notes:</strong> {job.adminNotes}
                </div>
              )}
            </JobCard>
          );
        })}
      </JobsGrid>
    </ProgressContainer>
  );
};