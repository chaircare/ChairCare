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
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from 'lib/firebase';

const JobsContainer = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
`;

const Header = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Title = styled.h1<{ theme: any }>`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const JobsGrid = styled.div<{ theme: any }>`
  display: grid;
  gap: ${props => props.theme.spacing.lg};
`;

const JobCard = styled(Card)<{ theme: any }>`
  padding: ${props => props.theme.spacing.lg};
`;

const JobHeader = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const JobId = styled.div<{ theme: any }>`
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary[600]};
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const StatusBadge = styled.span<{ status: string; theme: any }>`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  background: ${props => {
    switch (props.status) {
      case 'New': return props.theme.colors.primary[100];
      case 'Scheduled': return props.theme.colors.warning[100];
      case 'In Progress': return props.theme.colors.accent[100];
      case 'Completed': return props.theme.colors.success[100];
      case 'Invoiced': return props.theme.colors.primary[100];
      case 'Paid': return props.theme.colors.success[100];
      default: return props.theme.colors.gray[100];
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'New': return props.theme.colors.primary[800];
      case 'Scheduled': return props.theme.colors.warning[800];
      case 'In Progress': return props.theme.colors.accent[800];
      case 'Completed': return props.theme.colors.success[800];
      case 'Invoiced': return props.theme.colors.primary[800];
      case 'Paid': return props.theme.colors.success[800];
      default: return props.theme.colors.gray[800];
    }
  }};
`;

const JobInfo = styled.div<{ theme: any }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const InfoItem = styled.div<{ theme: any }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const InfoLabel = styled.span<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const InfoValue = styled.span<{ theme: any }>`
  color: ${props => props.theme.colors.text.primary};
`;

const JobActions = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.md};
`;

const EmptyState = styled.div<{ theme: any }>`
  text-align: center;
  padding: ${props => props.theme.spacing['2xl']};
  color: ${props => props.theme.colors.text.secondary};
`;

const Jobs: NextPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const jobsQuery = query(
        collection(db, 'jobs'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(jobsQuery);
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[];
      
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'Not set';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString();
  };

  if (!user || user.role !== 'admin') {
    return <div>Access denied</div>;
  }

  if (loading) {
    return (
      <Layout>
        <JobsContainer theme={theme}>
          <div>Loading jobs...</div>
        </JobsContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <JobsContainer theme={theme}>
        <Header theme={theme}>
          <Title theme={theme}>Job Management</Title>
          <Button variant="primary" onClick={() => router.push('/admin/jobs/create')}>
            Create New Job
          </Button>
        </Header>

        {jobs.length === 0 ? (
          <EmptyState theme={theme}>
            <h3>No jobs found</h3>
            <p>Create your first job to get started</p>
            <Button variant="primary" onClick={() => router.push('/admin/jobs/create')}>
              Create Job
            </Button>
          </EmptyState>
        ) : (
          <JobsGrid theme={theme}>
            {jobs.map((job) => (
              <JobCard key={job.id} theme={theme}>
                <JobHeader theme={theme}>
                  <JobId theme={theme}>{job.jobId}</JobId>
                  <StatusBadge status={job.status} theme={theme}>{job.status}</StatusBadge>
                </JobHeader>

                <JobInfo theme={theme}>
                  <InfoItem theme={theme}>
                    <InfoLabel theme={theme}>Client</InfoLabel>
                    <InfoValue theme={theme}>{job.clientName}</InfoValue>
                  </InfoItem>
                  <InfoItem theme={theme}>
                    <InfoLabel theme={theme}>Job Type</InfoLabel>
                    <InfoValue theme={theme}>{job.jobType}</InfoValue>
                  </InfoItem>
                  <InfoItem theme={theme}>
                    <InfoLabel theme={theme}>Scheduled Date</InfoLabel>
                    <InfoValue theme={theme}>{formatDate(job.scheduledDate)}</InfoValue>
                  </InfoItem>
                  <InfoItem theme={theme}>
                    <InfoLabel theme={theme}>Technician</InfoLabel>
                    <InfoValue theme={theme}>{job.assignedTechnicianName || 'Not assigned'}</InfoValue>
                  </InfoItem>
                  {(job.estimatedPrice || job.finalPrice) && (
                    <InfoItem theme={theme}>
                      <InfoLabel theme={theme}>Price</InfoLabel>
                      <InfoValue theme={theme}>
                        {job.finalPrice ? formatCurrency(job.finalPrice) : 
                         job.estimatedPrice ? `Est. ${formatCurrency(job.estimatedPrice)}` : 
                         'Not set'}
                      </InfoValue>
                    </InfoItem>
                  )}
                </JobInfo>

                {job.adminNotes && (
                  <InfoItem theme={theme}>
                    <InfoLabel theme={theme}>Notes</InfoLabel>
                    <InfoValue theme={theme}>{job.adminNotes}</InfoValue>
                  </InfoItem>
                )}

                <JobActions theme={theme}>
                  <Button variant="outline" size="sm" onClick={() => router.push(`/admin/jobs/${job.id}`)}>
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => router.push(`/admin/jobs/${job.id}/edit`)}>
                    Edit
                  </Button>
                  {job.status === 'Completed' && (
                    <Button variant="primary" size="sm" onClick={() => router.push(`/admin/jobs/${job.id}/invoice`)}>
                      Generate Invoice
                    </Button>
                  )}
                </JobActions>
              </JobCard>
            ))}
          </JobsGrid>
        )}
      </JobsContainer>
    </Layout>
  );
};

export default Jobs;