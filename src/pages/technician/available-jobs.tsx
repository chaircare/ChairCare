import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { useTheme } from 'contexts/ThemeContext';
import { Job } from 'types/chair-care';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from 'lib/firebase';

const AvailableJobsContainer = styled.div<{ theme: any }>`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl};
`;

const HeaderSection = styled(Card)<{ theme: any }>`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.mode === 'dark' 
    ? props.theme.gradients.darkSubtle
    : `linear-gradient(135deg, ${props.theme.colors.primary[50]} 0%, ${props.theme.colors.accent[50]} 100%)`
  };
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius['2xl']};
`;

const HeaderTitle = styled.h1<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const HeaderSubtitle = styled.p<{ theme: any }>`
  margin: 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const FilterSection = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
  align-items: center;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select<{ theme: any }>`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
  }
`;

const JobsGrid = styled.div<{ theme: any }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: ${props => props.theme.spacing.xl};
`;

const JobCard = styled(Card)<{ theme: any }>`
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.8)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius['2xl']};
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows['2xl']};
  }
`;

const JobHeader = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  background: ${props => props.theme.gradients.primary};
  color: white;
  border-radius: ${props => props.theme.borderRadius['2xl']} ${props => props.theme.borderRadius['2xl']} 0 0;
`;

const JobTitle = styled.h3<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const JobClient = styled.div<{ theme: any }>`
  opacity: 0.9;
  font-size: ${props => props.theme.typography.fontSize.base};
`;

const JobDetails = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const DetailRow = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.sm} 0;
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  
  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const DetailValue = styled.span<{ theme: any }>`
  color: ${props => props.theme.colors.text.primary};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const JobDescription = styled.div<{ theme: any }>`
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(51, 65, 85, 0.5)' 
    : props.theme.colors.gray[50]
  };
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.xl};
  margin: ${props => props.theme.spacing.md} 0;
`;

const JobActions = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.xl};
  border-top: 1px solid ${props => props.theme.colors.border.primary};
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
`;

const PriorityBadge = styled.span<{ theme: any; priority: string }>`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  ${({ priority, theme }) => {
    switch (priority) {
      case 'high':
        return `background: ${theme.colors.error[100]}; color: ${theme.colors.error[700]};`;
      case 'medium':
        return `background: ${theme.colors.warning[100]}; color: ${theme.colors.warning[700]};`;
      case 'low':
        return `background: ${theme.colors.success[100]}; color: ${theme.colors.success[700]};`;
      default:
        return `background: ${theme.colors.gray[100]}; color: ${theme.colors.gray[700]};`;
    }
  }}
`;

const EmptyState = styled.div<{ theme: any }>`
  text-align: center;
  padding: ${props => props.theme.spacing['4xl']};
  color: ${props => props.theme.colors.text.secondary};
  grid-column: 1 / -1;
  
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
  text-align: center;
  padding: ${props => props.theme.spacing['4xl']};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const AvailableJobsPage: NextPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== 'technician') {
      router.push('/dashboard');
      return;
    }
    
    if (user) {
      loadAvailableJobs();
    }
  }, [user, router]);

  useEffect(() => {
    filterJobs();
  }, [jobs, selectedType, selectedPriority]);

  const loadAvailableJobs = async () => {
    try {
      setLoading(true);
      
      // Load unassigned jobs
      const jobsQuery = query(
        collection(db, 'jobs'),
        where('status', '==', 'New'),
        orderBy('createdAt', 'desc')
      );
      
      const jobsSnapshot = await getDocs(jobsQuery);
      const jobsData = jobsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledDate: doc.data().scheduledDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate()
      })) as Job[];
      
      // Filter out jobs that are already assigned
      const unassignedJobs = jobsData.filter(job => !job.assignedTechnicianId);
      
      setJobs(unassignedJobs);
    } catch (error) {
      console.error('Error loading available jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(job => job.jobType === selectedType);
    }
    
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(job => job.priority === selectedPriority);
    }
    
    setFilteredJobs(filtered);
  };

  const claimJob = async (jobId: string) => {
    if (!user) return;
    
    setClaiming(jobId);
    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        assignedTechnicianId: user.id,
        assignedTechnicianName: user.name,
        status: 'Scheduled',
        claimedAt: new Date(),
        updatedAt: new Date()
      });
      
      // Remove job from available jobs
      setJobs(prev => prev.filter(job => job.id !== jobId));
      
      // Show success message or redirect
      router.push('/dashboard');
    } catch (error) {
      console.error('Error claiming job:', error);
      alert('Failed to claim job. Please try again.');
    } finally {
      setClaiming(null);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not specified';
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getJobPriority = (job: Job): string => {
    // Simple priority logic - can be enhanced
    if (job.jobType === 'repair') return 'high';
    if (job.chairs && job.chairs.length > 5) return 'medium';
    return 'low';
  };

  if (!user || user.role !== 'technician') {
    return null;
  }

  if (loading) {
    return (
      <Layout>
        <AvailableJobsContainer theme={theme}>
          <LoadingState theme={theme}>Loading available jobs...</LoadingState>
        </AvailableJobsContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <AvailableJobsContainer theme={theme}>
        <HeaderSection theme={theme}>
          <HeaderTitle theme={theme}>Available Jobs</HeaderTitle>
          <HeaderSubtitle theme={theme}>
            Select jobs that match your skills and schedule
          </HeaderSubtitle>
        </HeaderSection>

        <FilterSection theme={theme}>
          <div>
            <label style={{ 
              marginRight: theme.spacing.sm, 
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary
            }}>
              Job Type:
            </label>
            <FilterSelect
              theme={theme}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="cleaning">Cleaning</option>
              <option value="repair">Repair</option>
              <option value="maintenance">Maintenance</option>
              <option value="inspection">Inspection</option>
            </FilterSelect>
          </div>
          
          <div>
            <label style={{ 
              marginRight: theme.spacing.sm, 
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary
            }}>
              Priority:
            </label>
            <FilterSelect
              theme={theme}
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </FilterSelect>
          </div>
          
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </FilterSection>

        {filteredJobs.length === 0 ? (
          <JobsGrid theme={theme}>
            <EmptyState theme={theme}>
              <h3>No Available Jobs</h3>
              <p>There are currently no jobs available that match your filters. Check back later!</p>
            </EmptyState>
          </JobsGrid>
        ) : (
          <JobsGrid theme={theme}>
            {filteredJobs.map((job) => {
              const priority = getJobPriority(job);
              
              return (
                <JobCard key={job.id} theme={theme}>
                  <JobHeader theme={theme}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <JobTitle theme={theme}>Job #{job.jobId}</JobTitle>
                        <JobClient theme={theme}>{job.clientName}</JobClient>
                      </div>
                      <PriorityBadge theme={theme} priority={priority}>
                        {priority} priority
                      </PriorityBadge>
                    </div>
                  </JobHeader>
                  
                  <JobDetails theme={theme}>
                    <DetailRow theme={theme}>
                      <DetailLabel theme={theme}>Service Type:</DetailLabel>
                      <DetailValue theme={theme}>{job.jobType}</DetailValue>
                    </DetailRow>
                    
                    <DetailRow theme={theme}>
                      <DetailLabel theme={theme}>Number of Chairs:</DetailLabel>
                      <DetailValue theme={theme}>{job.chairs?.length || 0} chairs</DetailValue>
                    </DetailRow>
                    
                    <DetailRow theme={theme}>
                      <DetailLabel theme={theme}>Location:</DetailLabel>
                      <DetailValue theme={theme}>{job.location || 'Client site'}</DetailValue>
                    </DetailRow>
                    
                    <DetailRow theme={theme}>
                      <DetailLabel theme={theme}>Preferred Date:</DetailLabel>
                      <DetailValue theme={theme}>{formatDate(job.scheduledDate)}</DetailValue>
                    </DetailRow>
                    
                    <DetailRow theme={theme}>
                      <DetailLabel theme={theme}>Created:</DetailLabel>
                      <DetailValue theme={theme}>{formatDate(job.createdAt)}</DetailValue>
                    </DetailRow>
                    
                    {job.description && (
                      <JobDescription theme={theme}>
                        <strong>Description:</strong><br />
                        {job.description}
                      </JobDescription>
                    )}
                    
                    {job.specialRequirements && (
                      <JobDescription theme={theme}>
                        <strong>Special Requirements:</strong><br />
                        {job.specialRequirements}
                      </JobDescription>
                    )}
                  </JobDetails>
                  
                  <JobActions theme={theme}>
                    <Button
                      variant="primary"
                      size="sm"
                      loading={claiming === job.id}
                      disabled={claiming !== null}
                      onClick={() => claimJob(job.id)}
                    >
                      {claiming === job.id ? 'Claiming...' : 'Claim Job'}
                    </Button>
                  </JobActions>
                </JobCard>
              );
            })}
          </JobsGrid>
        )}
      </AvailableJobsContainer>
    </Layout>
  );
};

export default AvailableJobsPage;