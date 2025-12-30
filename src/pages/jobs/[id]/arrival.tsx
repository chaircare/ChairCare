import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { Job, Chair, User } from 'types/chair-care';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { theme } from 'styles/theme';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from 'lib/firebase';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${theme.colors.primary[50]} 0%, ${theme.colors.accent[50]} 100%);
  padding: ${theme.spacing.md};
  
  @media (max-width: 768px) {
    padding: ${theme.spacing.sm};
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
  padding: ${theme.spacing.lg};
  background: white;
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.lg};
`;

const JobTitle = styled.h1`
  margin: 0 0 ${theme.spacing.sm} 0;
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
`;

const JobSubtitle = styled.p`
  margin: 0;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.lg};
`;

const StatusBadge = styled.div<{ status: string }>`
  display: inline-block;
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.bold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: ${theme.spacing.md};
  
  ${props => {
    switch (props.status) {
      case 'Scheduled':
        return `background: ${theme.colors.warning[100]}; color: ${theme.colors.warning[700]};`;
      case 'In Progress':
        return `background: ${theme.colors.primary[100]}; color: ${theme.colors.primary[700]};`;
      case 'Completed':
        return `background: ${theme.colors.success[100]}; color: ${theme.colors.success[700]};`;
      default:
        return `background: ${theme.colors.gray[100]}; color: ${theme.colors.gray[700]};`;
    }
  }}
`;

const ContentGrid = styled.div`
  display: grid;
  gap: ${theme.spacing.lg};
  max-width: 800px;
  margin: 0 auto;
`;

const SectionCard = styled(Card)`
  padding: ${theme.spacing.xl};
`;

const SectionTitle = styled.h2`
  margin: 0 0 ${theme.spacing.lg} 0;
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const ClientContactGrid = styled.div`
  display: grid;
  gap: ${theme.spacing.md};
`;

const ContactItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md};
  background: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.gray[200]};
`;

const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const ContactLabel = styled.span`
  font-size: ${theme.typography.fontSize.lg};
  margin-right: ${theme.spacing.sm};
`;

const ContactValue = styled.span`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`;

const ActionButton = styled(Button)`
  min-width: 120px;
`;

const CallButton = styled(ActionButton)`
  background: ${theme.colors.success[500]};
  
  &:hover {
    background: ${theme.colors.success[600]};
  }
`;

const NavigateButton = styled(ActionButton)`
  background: ${theme.colors.primary[500]};
  
  &:hover {
    background: ${theme.colors.primary[600]};
  }
`;

const JobDetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.lg};
`;

const DetailCard = styled.div`
  text-align: center;
  padding: ${theme.spacing.lg};
  background: ${theme.colors.primary[50]};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.primary[200]};
`;

const DetailNumber = styled.div`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary[600]};
  margin-bottom: ${theme.spacing.sm};
`;

const DetailLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: ${theme.typography.fontWeight.medium};
`;

const ChairsList = styled.div`
  display: grid;
  gap: ${theme.spacing.sm};
`;

const ChairItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md};
  background: ${theme.colors.accent[50]};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.accent[200]};
`;

const ChairInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const ChairId = styled.span`
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
`;

const ChairLocation = styled.span`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`;

const AdminNotes = styled.div`
  background: ${theme.colors.warning[50]};
  border: 1px solid ${theme.colors.warning[200]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.lg};
  margin-top: ${theme.spacing.lg};
`;

const NotesTitle = styled.h3`
  margin: 0 0 ${theme.spacing.sm} 0;
  color: ${theme.colors.warning[700]};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const NotesContent = styled.p`
  margin: 0;
  color: ${theme.colors.text.primary};
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const StartJobSection = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  background: linear-gradient(135deg, ${theme.colors.success[50]} 0%, ${theme.colors.primary[50]} 100%);
  border-radius: ${theme.borderRadius.xl};
  border: 2px solid ${theme.colors.success[200]};
`;

const StartJobTitle = styled.h2`
  margin: 0 0 ${theme.spacing.md} 0;
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.success[700]};
`;

const StartJobDescription = styled.p`
  margin: 0 0 ${theme.spacing.xl} 0;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.lg};
`;

const StartJobButton = styled(Button)`
  font-size: ${theme.typography.fontSize.xl};
  padding: ${theme.spacing.lg} ${theme.spacing['2xl']};
  min-height: 60px;
  background: ${theme.colors.success[500]};
  
  &:hover {
    background: ${theme.colors.success[600]};
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
`;

const JobArrivalPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  
  const [job, setJob] = useState<Job | null>(null);
  const [client, setClient] = useState<User | null>(null);
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingJob, setStartingJob] = useState(false);

  useEffect(() => {
    if (id && user) {
      loadJobData();
    }
  }, [id, user]);

  const loadJobData = async () => {
    try {
      setLoading(true);
      
      // Load job data
      const jobDoc = await getDoc(doc(db, 'jobs', id as string));
      if (!jobDoc.exists()) {
        router.push('/technician/jobs');
        return;
      }
      
      const jobData = {
        id: jobDoc.id,
        ...jobDoc.data(),
        scheduledDate: jobDoc.data().scheduledDate?.toDate(),
        createdAt: jobDoc.data().createdAt?.toDate(),
        completedAt: jobDoc.data().completedAt?.toDate()
      } as Job;
      
      // Verify this job is assigned to the current technician
      if (jobData.assignedTechnicianId !== user?.id) {
        router.push('/technician/jobs');
        return;
      }
      
      setJob(jobData);
      
      // Load client data
      if (jobData.clientId) {
        const clientDoc = await getDoc(doc(db, 'users', jobData.clientId));
        if (clientDoc.exists()) {
          setClient({ id: clientDoc.id, ...clientDoc.data() } as User);
        }
      }
      
      // Load chairs data
      if (jobData.chairs && jobData.chairs.length > 0) {
        const chairsData: Chair[] = [];
        for (const chairId of jobData.chairs) {
          const chairDoc = await getDoc(doc(db, 'chairs', chairId));
          if (chairDoc.exists()) {
            chairsData.push({ id: chairDoc.id, ...chairDoc.data() } as Chair);
          }
        }
        setChairs(chairsData);
      }
      
    } catch (error) {
      console.error('Error loading job data:', error);
      router.push('/technician/jobs');
    } finally {
      setLoading(false);
    }
  };

  const makePhoneCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const openMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
  };

  const startJob = async () => {
    if (!job) return;
    
    try {
      setStartingJob(true);
      
      // Update job status to "In Progress"
      await updateDoc(doc(db, 'jobs', job.id), {
        status: 'In Progress',
        startedAt: new Date(),
        updatedAt: new Date()
      });
      
      // Navigate to the technician job interface
      router.push(`/jobs/${job.id}/technician`);
      
    } catch (error) {
      console.error('Error starting job:', error);
      alert('Failed to start job. Please try again.');
      setStartingJob(false);
    }
  };

  const formatDateTime = (date: Date | null, time?: string) => {
    if (!date) return 'Not scheduled';
    const dateStr = date.toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return time ? `${dateStr} at ${time}` : dateStr;
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>Loading job details...</LoadingState>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container>
        <LoadingState>Job not found</LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <JobTitle>Job #{job.jobId}</JobTitle>
        <JobSubtitle>{job.clientName}</JobSubtitle>
        <StatusBadge status={job.status}>{job.status}</StatusBadge>
      </Header>

      <ContentGrid>
        {/* Client Contact Information */}
        {client && (
          <SectionCard>
            <SectionTitle>
              👤 Client Contact
            </SectionTitle>
            <ClientContactGrid>
              <ContactItem>
                <ContactInfo>
                  <ContactLabel>📧</ContactLabel>
                  <ContactValue>{client.email}</ContactValue>
                </ContactInfo>
              </ContactItem>
              
              {client.phone && (
                <ContactItem>
                  <ContactInfo>
                    <ContactLabel>📞</ContactLabel>
                    <ContactValue>{client.phone}</ContactValue>
                  </ContactInfo>
                  <CallButton onClick={() => makePhoneCall(client.phone!)}>
                    📞 Call
                  </CallButton>
                </ContactItem>
              )}
              
              {client.companyName && (
                <ContactItem>
                  <ContactInfo>
                    <ContactLabel>🏢</ContactLabel>
                    <ContactValue>{client.companyName}</ContactValue>
                  </ContactInfo>
                </ContactItem>
              )}
              
              {job.location && (
                <ContactItem>
                  <ContactInfo>
                    <ContactLabel>📍</ContactLabel>
                    <ContactValue>{job.location}</ContactValue>
                  </ContactInfo>
                  <NavigateButton onClick={() => openMaps(job.location!)}>
                    🗺️ Navigate
                  </NavigateButton>
                </ContactItem>
              )}
            </ClientContactGrid>
          </SectionCard>
        )}

        {/* Job Details */}
        <SectionCard>
          <SectionTitle>
            📋 Job Details
          </SectionTitle>
          <JobDetailsGrid>
            <DetailCard>
              <DetailNumber>{chairs.length}</DetailNumber>
              <DetailLabel>Chairs to Service</DetailLabel>
            </DetailCard>
            <DetailCard>
              <DetailNumber>{job.jobType}</DetailNumber>
              <DetailLabel>Job Type</DetailLabel>
            </DetailCard>
            <DetailCard>
              <DetailNumber>{formatDateTime(job.scheduledDate, job.scheduledTime)}</DetailNumber>
              <DetailLabel>Scheduled</DetailLabel>
            </DetailCard>
          </JobDetailsGrid>
        </SectionCard>

        {/* Chairs List */}
        {chairs.length > 0 && (
          <SectionCard>
            <SectionTitle>
              🪑 Chairs to Service ({chairs.length})
            </SectionTitle>
            <ChairsList>
              {chairs.map((chair, index) => (
                <ChairItem key={chair.id}>
                  <ChairInfo>
                    <span style={{ fontSize: '1.2em' }}>🪑</span>
                    <div>
                      <ChairId>{chair.chairId || `Chair ${index + 1}`}</ChairId>
                      <br />
                      <ChairLocation>📍 {chair.location}</ChairLocation>
                    </div>
                  </ChairInfo>
                </ChairItem>
              ))}
            </ChairsList>
          </SectionCard>
        )}

        {/* Admin Notes */}
        {job.adminNotes && (
          <SectionCard>
            <SectionTitle>
              📝 Admin Notes
            </SectionTitle>
            <AdminNotes>
              <NotesTitle>Important Information:</NotesTitle>
              <NotesContent>{job.adminNotes}</NotesContent>
            </AdminNotes>
          </SectionCard>
        )}

        {/* Start Job Section */}
        {job.status === 'Scheduled' && (
          <StartJobSection>
            <StartJobTitle>🚀 Ready to Start?</StartJobTitle>
            <StartJobDescription>
              Review all the information above, then click "Start Job" to begin working.
              This will change the job status to "In Progress".
            </StartJobDescription>
            <StartJobButton
              onClick={startJob}
              disabled={startingJob}
              size="lg"
            >
              {startingJob ? '🚀 Starting Job...' : '🚀 Start Job'}
            </StartJobButton>
          </StartJobSection>
        )}

        {job.status === 'In Progress' && (
          <StartJobSection>
            <StartJobTitle>🔧 Job In Progress</StartJobTitle>
            <StartJobDescription>
              This job is currently in progress. Continue working on the chairs.
            </StartJobDescription>
            <StartJobButton
              onClick={() => router.push(`/jobs/${job.id}/technician`)}
              size="lg"
            >
              🔧 Continue Job
            </StartJobButton>
          </StartJobSection>
        )}
      </ContentGrid>
    </Container>
  );
};

export default JobArrivalPage;