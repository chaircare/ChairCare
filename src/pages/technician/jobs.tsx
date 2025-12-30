import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { Job, Chair, User } from 'types/chair-care';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { theme } from 'styles/theme';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from 'lib/firebase';

const JobsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const HeaderSection = styled(Card)`
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
  background: linear-gradient(135deg, ${theme.colors.primary[50]} 0%, ${theme.colors.accent[50]} 100%);
  border: 1px solid ${theme.colors.primary[200]};
`;

const HeaderTitle = styled.h1`
  margin: 0 0 ${theme.spacing.sm} 0;
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
`;

const FilterSection = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active?: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  background: ${props => props.active ? theme.colors.primary[500] : theme.colors.background.primary};
  color: ${props => props.active ? 'white' : theme.colors.text.primary};
  cursor: pointer;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? theme.colors.primary[600] : theme.colors.gray[50]};
  }
`;

const JobsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const JobCard = styled(Card)`
  padding: ${theme.spacing.lg};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }
`;

const JobHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.md};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${theme.spacing.sm};
  }
`;

const JobTitle = styled.h3`
  margin: 0;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
`;

const JobStatusBadge = styled.span<{ status: string }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  ${props => {
    switch (props.status) {
      case 'New':
        return `background: ${theme.colors.primary[100]}; color: ${theme.colors.primary[700]};`;
      case 'Scheduled':
        return `background: ${theme.colors.warning[100]}; color: ${theme.colors.warning[700]};`;
      case 'In Progress':
        return `background: ${theme.colors.accent[100]}; color: ${theme.colors.accent[700]};`;
      case 'Completed':
        return `background: ${theme.colors.success[100]}; color: ${theme.colors.success[700]};`;
      default:
        return `background: ${theme.colors.gray[100]}; color: ${theme.colors.gray[700]};`;
    }
  }}
`;

const JobDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const DetailLabel = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const DetailValue = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.primary};
`;

const JobNotes = styled.div`
  margin-top: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const JobActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const ClientContactSection = styled.div`
  background: ${theme.colors.primary[50]};
  border: 1px solid ${theme.colors.primary[200]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin: ${theme.spacing.md} 0;
`;

const ContactHeader = styled.h4`
  margin: 0 0 ${theme.spacing.sm} 0;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.primary[700]};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ContactInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.sm};
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const ContactButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${theme.colors.primary[500]};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${theme.colors.primary[600]};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const LocationButton = styled(ContactButton)`
  background: ${theme.colors.success[500]};
  
  &:hover {
    background: ${theme.colors.success[600]};
  }
`;

const ChairsSummary = styled.div`
  background: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin: ${theme.spacing.md} 0;
`;

const ChairsHeader = styled.h4`
  margin: 0 0 ${theme.spacing.sm} 0;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`;

const ChairsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.xs};
`;

const ChairTag = styled.span`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${theme.colors.accent[100]};
  color: ${theme.colors.accent[700]};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const StartJobButton = styled(Button)<{ loading?: boolean }>`
  position: relative;
  
  ${props => props.loading && `
    opacity: 0.7;
    cursor: not-allowed;
  `}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing['3xl']};
  color: ${theme.colors.text.secondary};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${theme.spacing['3xl']};
  color: ${theme.colors.text.secondary};
`;

type JobFilter = 'all' | 'scheduled' | 'in-progress' | 'completed';

interface JobWithDetails extends Job {
  client?: User;
  chairsData?: Chair[];
}

const TechnicianJobsPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  const [jobs, setJobs] = useState<JobWithDetails[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<JobFilter>('all');
  const [startingJob, setStartingJob] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== 'technician') {
      router.push('/dashboard');
      return;
    }
    
    if (user) {
      loadJobs();
    }
  }, [user, router]);

  useEffect(() => {
    filterJobs();
  }, [jobs, activeFilter]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      
      const jobsQuery = query(
        collection(db, 'jobs'),
        where('assignedTechnicianId', '==', user!.id),
        orderBy('createdAt', 'desc')
      );
      
      const jobsSnapshot = await getDocs(jobsQuery);
      const jobsWithDetails: JobWithDetails[] = [];
      
      for (const jobDoc of jobsSnapshot.docs) {
        const jobData = jobDoc.data();
        
        // Get client details
        let client: User | undefined;
        if (jobData.clientId) {
          const clientDoc = await getDoc(doc(db, 'users', jobData.clientId));
          if (clientDoc.exists()) {
            client = { id: clientDoc.id, ...clientDoc.data() } as User;
          }
        }
        
        // Get chair details
        let chairsData: Chair[] = [];
        if (jobData.chairs && jobData.chairs.length > 0) {
          for (const chairId of jobData.chairs) {
            const chairDoc = await getDoc(doc(db, 'chairs', chairId));
            if (chairDoc.exists()) {
              chairsData.push({ id: chairDoc.id, ...chairDoc.data() } as Chair);
            }
          }
        }
        
        jobsWithDetails.push({
          id: jobDoc.id,
          ...jobData,
          scheduledDate: jobData.scheduledDate?.toDate(),
          createdAt: jobData.createdAt?.toDate(),
          completedAt: jobData.completedAt?.toDate(),
          client,
          chairsData
        } as JobWithDetails);
      }
      
      setJobs(jobsWithDetails);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const startJob = async (jobId: string) => {
    try {
      setStartingJob(jobId);
      
      // Update job status to "In Progress"
      await updateDoc(doc(db, 'jobs', jobId), {
        status: 'In Progress',
        startedAt: new Date(),
        updatedAt: new Date()
      });
      
      // Refresh jobs list
      await loadJobs();
      
      // Navigate to job interface
      router.push(`/jobs/${jobId}/technician`);
      
    } catch (error) {
      console.error('Error starting job:', error);
      alert('Failed to start job. Please try again.');
    } finally {
      setStartingJob(null);
    }
  };

  const makePhoneCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const openMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    // Try to open in Google Maps app first, fallback to web
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
  };

  const filterJobs = () => {
    let filtered = jobs;
    
    switch (activeFilter) {
      case 'scheduled':
        filtered = jobs.filter(job => job.status === 'Scheduled');
        break;
      case 'in-progress':
        filtered = jobs.filter(job => job.status === 'In Progress');
        break;
      case 'completed':
        filtered = jobs.filter(job => job.status === 'Completed');
        break;
      default:
        filtered = jobs;
    }
    
    setFilteredJobs(filtered);
  };
    let filtered = jobs;
    
    switch (activeFilter) {
      case 'scheduled':
        filtered = jobs.filter(job => job.status === 'Scheduled');
        break;
      case 'in-progress':
        filtered = jobs.filter(job => job.status === 'In Progress');
        break;
      case 'completed':
        filtered = jobs.filter(job => job.status === 'Completed');
        break;
      default:
        filtered = jobs;
    }
    
    setFilteredJobs(filtered);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not scheduled';
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (date: Date | null, time?: string) => {
    if (!date) return 'Not scheduled';
    const dateStr = formatDate(date);
    return time ? `${dateStr} at ${time}` : dateStr;
  };

  const getJobCounts = () => {
    return {
      all: jobs.length,
      scheduled: jobs.filter(job => job.status === 'Scheduled').length,
      inProgress: jobs.filter(job => job.status === 'In Progress').length,
      completed: jobs.filter(job => job.status === 'Completed').length
    };
  };

  if (!user || user.role !== 'technician') {
    return null;
  }

  if (loading) {
    return (
      <Layout>
        <JobsContainer>
          <LoadingState>Loading your jobs...</LoadingState>
        </JobsContainer>
      </Layout>
    );
  }

  const counts = getJobCounts();

  return (
    <Layout>
      <JobsContainer>
        <HeaderSection>
          <HeaderTitle>My Jobs</HeaderTitle>
          <p>Manage and track your assigned service jobs</p>
        </HeaderSection>

        <FilterSection>
          <FilterButton
            active={activeFilter === 'all'}
            onClick={() => setActiveFilter('all')}
          >
            All Jobs ({counts.all})
          </FilterButton>
          <FilterButton
            active={activeFilter === 'scheduled'}
            onClick={() => setActiveFilter('scheduled')}
          >
            Scheduled ({counts.scheduled})
          </FilterButton>
          <FilterButton
            active={activeFilter === 'in-progress'}
            onClick={() => setActiveFilter('in-progress')}
          >
            In Progress ({counts.inProgress})
          </FilterButton>
          <FilterButton
            active={activeFilter === 'completed'}
            onClick={() => setActiveFilter('completed')}
          >
            Completed ({counts.completed})
          </FilterButton>
        </FilterSection>

        {filteredJobs.length === 0 ? (
          <EmptyState>
            {activeFilter === 'all' 
              ? 'No jobs assigned yet. Check back later or contact your supervisor.'
              : `No ${activeFilter.replace('-', ' ')} jobs found.`
            }
          </EmptyState>
        ) : (
          <JobsList>
            {filteredJobs.map(job => (
              <JobCard key={job.id}>
                <JobHeader>
                  <JobTitle>Job #{job.jobId} - {job.clientName}</JobTitle>
                  <JobStatusBadge status={job.status}>{job.status}</JobStatusBadge>
                </JobHeader>
                
                {/* Client Contact Information */}
                {job.client && (
                  <ClientContactSection>
                    <ContactHeader>Client Contact</ContactHeader>
                    <ContactInfo>
                      <ContactItem>
                        <span>📧 {job.client.email}</span>
                      </ContactItem>
                      {job.client.phone && (
                        <ContactItem>
                          <span>📞 {job.client.phone}</span>
                          <ContactButton onClick={() => makePhoneCall(job.client!.phone!)}>
                            📞 Call
                          </ContactButton>
                        </ContactItem>
                      )}
                      {job.client.companyName && (
                        <ContactItem>
                          <span>🏢 {job.client.companyName}</span>
                        </ContactItem>
                      )}
                      {job.location && (
                        <ContactItem>
                          <span>📍 {job.location}</span>
                          <LocationButton onClick={() => openMaps(job.location!)}>
                            🗺️ Navigate
                          </LocationButton>
                        </ContactItem>
                      )}
                    </ContactInfo>
                  </ClientContactSection>
                )}
                
                <JobDetails>
                  <DetailItem>
                    <DetailLabel>Job Type</DetailLabel>
                    <DetailValue>{job.jobType}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Scheduled</DetailLabel>
                    <DetailValue>{formatDateTime(job.scheduledDate, job.scheduledTime)}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Chairs to Service</DetailLabel>
                    <DetailValue>{job.chairs?.length || 0} chairs</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Created</DetailLabel>
                    <DetailValue>{formatDate(job.createdAt)}</DetailValue>
                  </DetailItem>
                  {job.completedAt && (
                    <DetailItem>
                      <DetailLabel>Completed</DetailLabel>
                      <DetailValue>{formatDate(job.completedAt)}</DetailValue>
                    </DetailItem>
                  )}
                </JobDetails>

                {/* Chairs Summary */}
                {job.chairsData && job.chairsData.length > 0 && (
                  <ChairsSummary>
                    <ChairsHeader>Chairs to Service ({job.chairsData.length})</ChairsHeader>
                    <ChairsList>
                      {job.chairsData.map((chair, index) => (
                        <ChairTag key={chair.id}>
                          {chair.chairId || `Chair ${index + 1}`} - {chair.location}
                        </ChairTag>
                      ))}
                    </ChairsList>
                  </ChairsSummary>
                )}

                {/* Admin Notes */}
                {job.adminNotes && (
                  <JobNotes>
                    <strong>📝 Admin Notes:</strong> {job.adminNotes}
                  </JobNotes>
                )}

                {/* Technician Notes */}
                {job.technicianNotes && (
                  <JobNotes>
                    <strong>🔧 My Notes:</strong> {job.technicianNotes}
                  </JobNotes>
                )}

                <JobActions>
                  {job.status === 'Scheduled' && (
                    <>
                      <StartJobButton
                        variant="primary"
                        size="lg"
                        loading={startingJob === job.id}
                        onClick={() => router.push(`/jobs/${job.id}/arrival`)}
                        disabled={startingJob === job.id}
                      >
                        📍 Arrive at Job Site
                      </StartJobButton>
                      <Button
                        variant="outline"
                        onClick={() => startJob(job.id)}
                        disabled={startingJob === job.id}
                      >
                        🚀 Quick Start
                      </Button>
                    </>
                  )}
                  {job.status === 'In Progress' && (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => router.push(`/jobs/${job.id}/technician`)}
                    >
                      🔧 Continue Job
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/admin/jobs/${job.id}`)}
                  >
                    👁️ View Details
                  </Button>
                </JobActions>
              </JobCard>
            ))}
          </JobsList>
        )}
      </JobsContainer>
    </Layout>
  );
};

export default TechnicianJobsPage;