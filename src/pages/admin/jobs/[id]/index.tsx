import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { useTheme } from 'contexts/ThemeContext';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { Job } from 'types/chair-care';
import { formatCurrency } from 'utils/pricing';
import { doc, getDoc } from 'firebase/firestore';
import { db } from 'lib/firebase';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl};
`;

const JobHeader = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.xl};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${props => props.theme.spacing.lg};
  }
`;

const JobTitle = styled.h1<{ theme: any }>`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const JobId = styled.div<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.colors.primary[600]};
  margin-bottom: ${props => props.theme.spacing.sm};
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
          background: ${theme.colors.primary[100]};
          color: ${theme.colors.primary[800]};
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

const ActionButtons = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  
  @media (max-width: 768px) {
    width: 100%;
    flex-wrap: wrap;
  }
`;

const DetailsGrid = styled.div<{ theme: any }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing.xl};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DetailCard = styled(Card)<{ theme: any }>`
  height: fit-content;
`;

const DetailSection = styled.div<{ theme: any }>`
  margin-bottom: ${props => props.theme.spacing.lg};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.div<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  margin-bottom: ${props => props.theme.spacing.xs};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const DetailValue = styled.div<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.base};
  color: ${props => props.theme.colors.text.primary};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const NotesSection = styled.div<{ theme: any }>`
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : props.theme.colors.gray[50]
  };
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border.primary};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
`;

const LoadingContainer = styled.div<{ theme: any }>`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: ${props => props.theme.colors.text.secondary};
`;

const ErrorMessage = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.error[50]};
  color: ${props => props.theme.colors.error[700]};
  border: 1px solid ${props => props.theme.colors.error[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  text-align: center;
`;

const JobDetailsPage: NextPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = router.query;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (id) {
      loadJobData();
    }
  }, [user, router, id]);

  const loadJobData = async () => {
    try {
      setLoading(true);
      const jobDoc = await getDoc(doc(db, 'jobs', id as string));
      
      if (!jobDoc.exists()) {
        setError('Job not found');
        return;
      }

      const jobData = { id: jobDoc.id, ...jobDoc.data() } as Job;
      setJob(jobData);

    } catch (error) {
      console.error('Error loading job:', error);
      setError('Failed to load job data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'Not set';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (date: any) => {
    if (!date) return 'Not set';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <Layout showBackButton={true} backButtonText="Back to Jobs" onBackClick={() => router.push('/admin/jobs')}>
        <Container theme={theme}>
          <LoadingContainer theme={theme}>Loading job details...</LoadingContainer>
        </Container>
      </Layout>
    );
  }

  if (error || !job) {
    return (
      <Layout showBackButton={true} backButtonText="Back to Jobs" onBackClick={() => router.push('/admin/jobs')}>
        <Container theme={theme}>
          <ErrorMessage theme={theme}>
            {error || 'Job not found'}
          </ErrorMessage>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout showBackButton={true} backButtonText="Back to Jobs" onBackClick={() => router.push('/admin/jobs')}>
      <Container theme={theme}>
        <JobHeader theme={theme}>
          <div>
            <JobId theme={theme}>{job.jobId}</JobId>
            <JobTitle theme={theme}>Job Details</JobTitle>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: theme.spacing.md }}>
            <StatusBadge status={job.status} theme={theme}>
              {job.status}
            </StatusBadge>
            <ActionButtons theme={theme}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/admin/jobs/${job.id}/edit`)}
              >
                Edit Job
              </Button>
              {job.status === 'Completed' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push(`/admin/jobs/${job.id}/invoice`)}
                >
                  Generate Invoice
                </Button>
              )}
            </ActionButtons>
          </div>
        </JobHeader>

        <DetailsGrid theme={theme}>
          <DetailCard theme={theme}>
            <Card.Header>
              <Card.Title>Job Information</Card.Title>
            </Card.Header>
            <Card.Content>
              <DetailSection theme={theme}>
                <DetailLabel theme={theme}>Client Name</DetailLabel>
                <DetailValue theme={theme}>{job.clientName || 'Not specified'}</DetailValue>
              </DetailSection>

              <DetailSection theme={theme}>
                <DetailLabel theme={theme}>Job Type</DetailLabel>
                <DetailValue theme={theme}>{job.jobType || 'Not specified'}</DetailValue>
              </DetailSection>

              <DetailSection theme={theme}>
                <DetailLabel theme={theme}>Location</DetailLabel>
                <DetailValue theme={theme}>{job.location || 'Not specified'}</DetailValue>
              </DetailSection>

              <DetailSection theme={theme}>
                <DetailLabel theme={theme}>Created Date</DetailLabel>
                <DetailValue theme={theme}>{formatDateTime(job.createdAt)}</DetailValue>
              </DetailSection>

              {job.updatedAt && (
                <DetailSection theme={theme}>
                  <DetailLabel theme={theme}>Last Updated</DetailLabel>
                  <DetailValue theme={theme}>{formatDateTime(job.updatedAt)}</DetailValue>
                </DetailSection>
              )}
            </Card.Content>
          </DetailCard>

          <DetailCard theme={theme}>
            <Card.Header>
              <Card.Title>Scheduling & Assignment</Card.Title>
            </Card.Header>
            <Card.Content>
              <DetailSection theme={theme}>
                <DetailLabel theme={theme}>Scheduled Date</DetailLabel>
                <DetailValue theme={theme}>{formatDate(job.scheduledDate)}</DetailValue>
              </DetailSection>

              <DetailSection theme={theme}>
                <DetailLabel theme={theme}>Scheduled Time</DetailLabel>
                <DetailValue theme={theme}>{job.scheduledTime || 'Not set'}</DetailValue>
              </DetailSection>

              <DetailSection theme={theme}>
                <DetailLabel theme={theme}>Assigned Technician</DetailLabel>
                <DetailValue theme={theme}>{job.assignedTechnicianName || 'Not assigned'}</DetailValue>
              </DetailSection>

              {job.completedAt && (
                <DetailSection theme={theme}>
                  <DetailLabel theme={theme}>Completed Date</DetailLabel>
                  <DetailValue theme={theme}>{formatDateTime(job.completedAt)}</DetailValue>
                </DetailSection>
              )}
            </Card.Content>
          </DetailCard>

          {(job.serviceType || job.estimatedPrice || job.finalPrice) && (
            <DetailCard theme={theme}>
              <Card.Header>
                <Card.Title>Pricing Information</Card.Title>
              </Card.Header>
              <Card.Content>
                {job.serviceType && (
                  <DetailSection theme={theme}>
                    <DetailLabel theme={theme}>Service Type</DetailLabel>
                    <DetailValue theme={theme}>{job.serviceType}</DetailValue>
                  </DetailSection>
                )}

                {job.estimatedPrice && (
                  <DetailSection theme={theme}>
                    <DetailLabel theme={theme}>Estimated Price</DetailLabel>
                    <DetailValue theme={theme}>{formatCurrency(job.estimatedPrice)}</DetailValue>
                  </DetailSection>
                )}

                {job.finalPrice && (
                  <DetailSection theme={theme}>
                    <DetailLabel theme={theme}>Final Price</DetailLabel>
                    <DetailValue theme={theme}>{formatCurrency(job.finalPrice)}</DetailValue>
                  </DetailSection>
                )}

                <DetailSection theme={theme}>
                  <DetailLabel theme={theme}>Chair Count</DetailLabel>
                  <DetailValue theme={theme}>{job.chairs?.length || 0} chairs</DetailValue>
                </DetailSection>
              </Card.Content>
            </DetailCard>
          )}
        </DetailsGrid>

        {job.adminNotes && (
          <DetailCard theme={theme}>
            <Card.Header>
              <Card.Title>Admin Notes</Card.Title>
            </Card.Header>
            <Card.Content>
              <NotesSection theme={theme}>
                {job.adminNotes}
              </NotesSection>
            </Card.Content>
          </DetailCard>
        )}

        {job.chairs && job.chairs.length > 0 && (
          <DetailCard theme={theme}>
            <Card.Header>
              <Card.Title>Chairs ({job.chairs.length})</Card.Title>
            </Card.Header>
            <Card.Content>
              {job.chairs.map((chair: any, index: number) => (
                <DetailSection key={index} theme={theme}>
                  <DetailLabel theme={theme}>Chair {index + 1}</DetailLabel>
                  <DetailValue theme={theme}>
                    {chair.chairNumber} - {chair.location}
                    {chair.model && ` (${chair.model})`}
                  </DetailValue>
                </DetailSection>
              ))}
            </Card.Content>
          </DetailCard>
        )}
      </Container>
    </Layout>
  );
};

export default JobDetailsPage;