import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { useTheme } from 'contexts/ThemeContext';
import { Job, Chair } from 'types/chair-care';
import { JobPartsUsage as JobPartsUsageType } from 'types/inventory';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { JobPartsUsage } from 'components/inventory/JobPartsUsage';
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from 'lib/firebase';

const JobContainer = styled.div<{ theme: any }>`
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

const JobDetailsSection = styled(Card)<{ theme: any }>`
  margin-bottom: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.8)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.xl};
  backdrop-filter: blur(10px);
`;

const JobDetailsHeader = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  background: ${props => props.theme.gradients.primary};
  color: white;
  border-radius: ${props => props.theme.borderRadius.xl} ${props => props.theme.borderRadius.xl} 0 0;
`;

const JobDetailsTitle = styled.h2<{ theme: any }>`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const JobDetailsContent = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
`;

const DetailRow = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.md} 0;
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  
  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const DetailValue = styled.span<{ theme: any }>`
  color: ${props => props.theme.colors.text.primary};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const ChairsSection = styled.div<{ theme: any }>`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const ChairsGrid = styled.div<{ theme: any }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const ChairCard = styled(Card)<{ theme: any }>`
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.8)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.xl};
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const ChairHeader = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
`;

const ChairName = styled.h3<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const ChairDetails = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const StatusBadge = styled.span<{ theme: any; status: string }>`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  ${({ status, theme }) => {
    switch (status) {
      case 'completed':
        return `background: ${theme.colors.success[100]}; color: ${theme.colors.success[700]};`;
      case 'in-progress':
        return `background: ${theme.colors.primary[100]}; color: ${theme.colors.primary[700]};`;
      default:
        return `background: ${theme.colors.gray[100]}; color: ${theme.colors.gray[700]};`;
    }
  }}
`;

const ActionButtons = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.xl};
`;

const LoadingState = styled.div<{ theme: any }>`
  text-align: center;
  padding: ${props => props.theme.spacing['4xl']};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const TechnicianJobPage: NextPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = router.query;
  
  const [job, setJob] = useState<Job | null>(null);
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [selectedChair, setSelectedChair] = useState<Chair | null>(null);
  const [showPartsUsage, setShowPartsUsage] = useState(false);
  const [usedParts, setUsedParts] = useState<JobPartsUsageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'technician') {
      router.push('/dashboard');
      return;
    }
    
    if (id) {
      loadJobData();
    }
  }, [id, user, router]);

  const loadJobData = async () => {
    try {
      setLoading(true);
      
      // Load job details
      const jobDoc = await getDoc(doc(db, 'jobs', id as string));
      if (!jobDoc.exists()) {
        router.push('/dashboard');
        return;
      }
      
      const jobData = {
        id: jobDoc.id,
        ...jobDoc.data(),
        scheduledDate: jobDoc.data().scheduledDate?.toDate(),
        createdAt: jobDoc.data().createdAt?.toDate(),
        completedAt: jobDoc.data().completedAt?.toDate()
      } as Job;
      
      // Verify technician is assigned to this job
      if (jobData.assignedTechnicianId !== user?.id) {
        router.push('/dashboard');
        return;
      }
      
      // Load chairs for this job
      if (jobData.chairs && jobData.chairs.length > 0) {
        const chairsQuery = query(
          collection(db, 'chairs'),
          where('__name__', 'in', jobData.chairs)
        );
        
        const chairsSnapshot = await getDocs(chairsQuery);
        const chairsData = chairsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        })) as Chair[];
        
        setChairs(chairsData);
      }
      
      setJob(jobData);
    } catch (error) {
      console.error('Error loading job data:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStartJob = async () => {
    if (!job) return;
    
    try {
      await updateDoc(doc(db, 'jobs', job.id), {
        status: 'In Progress',
        startedAt: new Date(),
        updatedAt: new Date()
      });
      
      setJob(prev => prev ? { ...prev, status: 'In Progress' } : null);
    } catch (error) {
      console.error('Error starting job:', error);
      alert('Failed to start job. Please try again.');
    }
  };

  const handlePartsUsed = (parts: JobPartsUsageType[]) => {
    setUsedParts(prev => [...prev, ...parts]);
    setShowPartsUsage(false);
  };

  const handleCompleteJob = async () => {
    if (!job) return;
    
    setCompleting(true);
    try {
      await updateDoc(doc(db, 'jobs', job.id), {
        status: 'Completed',
        completedAt: new Date(),
        updatedAt: new Date(),
        partsUsed: usedParts.length,
        totalPartsCost: usedParts.reduce((sum, part) => sum + part.totalCost, 0)
      });
      
      // Redirect back to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing job:', error);
      alert('Failed to complete job. Please try again.');
    } finally {
      setCompleting(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not specified';
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  if (!user || user.role !== 'technician') {
    return null;
  }

  if (loading) {
    return (
      <Layout>
        <JobContainer theme={theme}>
          <LoadingState theme={theme}>Loading job details...</LoadingState>
        </JobContainer>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout>
        <JobContainer theme={theme}>
          <LoadingState theme={theme}>Job not found</LoadingState>
        </JobContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <JobContainer theme={theme}>
        <HeaderSection theme={theme}>
          <HeaderTitle theme={theme}>Job #{job.jobId}</HeaderTitle>
          <HeaderSubtitle theme={theme}>
            {job.jobType} service for {job.clientName}
          </HeaderSubtitle>
        </HeaderSection>

        <JobDetailsSection theme={theme}>
          <JobDetailsHeader theme={theme}>
            <JobDetailsTitle theme={theme}>Job Details</JobDetailsTitle>
          </JobDetailsHeader>
          
          <JobDetailsContent theme={theme}>
            <DetailRow theme={theme}>
              <DetailLabel theme={theme}>Client:</DetailLabel>
              <DetailValue theme={theme}>{job.clientName}</DetailValue>
            </DetailRow>
            
            <DetailRow theme={theme}>
              <DetailLabel theme={theme}>Service Type:</DetailLabel>
              <DetailValue theme={theme}>{job.jobType}</DetailValue>
            </DetailRow>
            
            <DetailRow theme={theme}>
              <DetailLabel theme={theme}>Scheduled Date:</DetailLabel>
              <DetailValue theme={theme}>{formatDate(job.scheduledDate || null)}</DetailValue>
            </DetailRow>
            
            <DetailRow theme={theme}>
              <DetailLabel theme={theme}>Location:</DetailLabel>
              <DetailValue theme={theme}>{job.location || 'Client site'}</DetailValue>
            </DetailRow>
            
            <DetailRow theme={theme}>
              <DetailLabel theme={theme}>Number of Chairs:</DetailLabel>
              <DetailValue theme={theme}>{chairs.length} chairs</DetailValue>
            </DetailRow>
            
            <DetailRow theme={theme}>
              <DetailLabel theme={theme}>Status:</DetailLabel>
              <DetailValue theme={theme}>
                <StatusBadge theme={theme} status={job.status.toLowerCase().replace(' ', '-')}>
                  {job.status}
                </StatusBadge>
              </DetailValue>
            </DetailRow>
            
            {job.adminNotes && (
              <DetailRow theme={theme}>
                <DetailLabel theme={theme}>Admin Notes:</DetailLabel>
                <DetailValue theme={theme}>{job.adminNotes}</DetailValue>
              </DetailRow>
            )}
            
            {usedParts.length > 0 && (
              <DetailRow theme={theme}>
                <DetailLabel theme={theme}>Parts Cost:</DetailLabel>
                <DetailValue theme={theme}>
                  {formatCurrency(usedParts.reduce((sum, part) => sum + part.totalCost, 0))}
                </DetailValue>
              </DetailRow>
            )}
          </JobDetailsContent>
        </JobDetailsSection>

        {chairs.length > 0 && (
          <ChairsSection theme={theme}>
            <h2 style={{ 
              margin: `0 0 ${theme.spacing.lg} 0`,
              color: theme.colors.text.primary,
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.bold
            }}>
              Chairs to Service ({chairs.length})
            </h2>
            
            <ChairsGrid theme={theme}>
              {chairs.map((chair) => (
                <ChairCard key={chair.id} theme={theme}>
                  <ChairHeader theme={theme}>
                    <ChairName theme={theme}>
                      Chair {chair.chairNumber}
                    </ChairName>
                    <ChairDetails theme={theme}>
                      📍 {chair.location}<br />
                      🏷️ QR: {chair.qrCode}<br />
                      {chair.model && `📋 Model: ${chair.model}`}
                    </ChairDetails>
                  </ChairHeader>
                  
                  <div style={{ padding: theme.spacing.lg }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedChair(chair);
                        setShowPartsUsage(true);
                      }}
                      disabled={job.status === 'Completed'}
                    >
                      Record Parts Used
                    </Button>
                  </div>
                </ChairCard>
              ))}
            </ChairsGrid>
          </ChairsSection>
        )}

        {showPartsUsage && selectedChair && (
          <JobPartsUsage
            job={job}
            chairId={selectedChair.id}
            onPartsUsed={handlePartsUsed}
          />
        )}

        <ActionButtons theme={theme}>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
          
          {job.status === 'Scheduled' && (
            <Button
              variant="primary"
              onClick={handleStartJob}
            >
              Start Job
            </Button>
          )}
          
          {job.status === 'In Progress' && (
            <Button
              variant="primary"
              onClick={handleCompleteJob}
              loading={completing}
            >
              {completing ? 'Completing...' : 'Complete Job'}
            </Button>
          )}
        </ActionButtons>
      </JobContainer>
    </Layout>
  );
};

export default TechnicianJobPage;