import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { User, Job } from 'types/chair-care';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { theme } from 'styles/theme';
import { sendPasswordResetEmail } from 'utils/emailUtils';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from 'lib/firebase';

const TechnicianDetailContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const HeaderSection = styled(Card)`
  margin-bottom: ${theme.spacing.xl};
  background: linear-gradient(135deg, ${theme.colors.primary[50]} 0%, ${theme.colors.accent[50]} 100%);
  border: 1px solid ${theme.colors.primary[200]};
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${theme.spacing.xl};
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const TechnicianInfo = styled.div`
  flex: 1;
`;

const TechnicianName = styled.h1`
  margin: 0 0 ${theme.spacing.md} 0;
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const InfoLabel = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const InfoValue = styled.span`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.primary};
`;

const StatusBadge = styled.span<{ status: 'active' | 'inactive' }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  ${props => props.status === 'active' 
    ? `
      background: ${theme.colors.success[100]};
      color: ${theme.colors.success[700]};
      border: 1px solid ${theme.colors.success[200]};
    `
    : `
      background: ${theme.colors.gray[100]};
      color: ${theme.colors.gray[700]};
      border: 1px solid ${theme.colors.gray[200]};
    `
  }
`;

const ActionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  align-items: flex-end;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

const StatCard = styled(Card)`
  text-align: center;
  padding: ${theme.spacing.lg};
  background: ${theme.colors.background.primary};
  border: 1px solid ${theme.colors.border.primary};
`;

const StatValue = styled.div`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary[600]};
  margin-bottom: ${theme.spacing.sm};
`;

const StatLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const JobsSection = styled(Card)`
  margin-bottom: ${theme.spacing.xl};
`;

const SectionTitle = styled.h2`
  margin: 0 0 ${theme.spacing.lg} 0;
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  padding-bottom: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border.primary};
`;

const JobsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const JobCard = styled.div`
  padding: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.background.primary};
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: ${theme.shadows.md};
  }
`;

const JobHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.md};
`;

const JobTitle = styled.h3`
  margin: 0;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`;

const JobStatusBadge = styled.span<{ status: string }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: uppercase;
  
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
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const JobActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing['2xl']};
  color: ${theme.colors.text.secondary};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${theme.spacing['2xl']};
  color: ${theme.colors.text.secondary};
`;

interface TechnicianStats {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  completionRate: number;
  avgJobTime: number;
}

const TechnicianDetailPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  
  const [technician, setTechnician] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<TechnicianStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    if (id) {
      loadTechnicianData();
    }
  }, [id, user, router]);

  const loadTechnicianData = async () => {
    try {
      setLoading(true);
      
      // Load technician profile
      const technicianDoc = await getDoc(doc(db, 'users', id as string));
      if (!technicianDoc.exists()) {
        router.push('/admin/technicians');
        return;
      }
      
      const technicianData = {
        id: technicianDoc.id,
        ...technicianDoc.data(),
        createdAt: technicianDoc.data().createdAt?.toDate(),
        updatedAt: technicianDoc.data().updatedAt?.toDate()
      } as User;
      
      if (technicianData.role !== 'technician') {
        router.push('/admin/technicians');
        return;
      }
      
      setTechnician(technicianData);
      
      // Load jobs assigned to this technician
      const jobsQuery = query(
        collection(db, 'jobs'),
        where('assignedTechnicianId', '==', id as string)
      );
      
      const jobsSnapshot = await getDocs(jobsQuery);
      const jobsData = jobsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledDate: doc.data().scheduledDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate()
      })) as Job[];
      
      setJobs(jobsData);
      
      // Calculate stats
      const totalJobs = jobsData.length;
      const activeJobs = jobsData.filter(job => ['Scheduled', 'In Progress'].includes(job.status)).length;
      const completedJobs = jobsData.filter(job => job.status === 'Completed').length;
      const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;
      
      // Calculate average job time (simplified)
      const completedJobsWithTime = jobsData.filter(job => 
        job.status === 'Completed' && job.createdAt && job.completedAt
      );
      
      const avgJobTime = completedJobsWithTime.length > 0
        ? completedJobsWithTime.reduce((sum, job) => {
            const timeDiff = job.completedAt!.getTime() - job.createdAt!.getTime();
            return sum + (timeDiff / (1000 * 60 * 60 * 24)); // Convert to days
          }, 0) / completedJobsWithTime.length
        : 0;
      
      setStats({
        totalJobs,
        activeJobs,
        completedJobs,
        completionRate,
        avgJobTime
      });
      
    } catch (error) {
      console.error('Error loading technician data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!technician) return;
    
    setUpdating(true);
    try {
      const newStatus = technician.status === 'active' ? 'inactive' : 'active';
      
      await updateDoc(doc(db, 'users', technician.id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      setTechnician(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (error) {
      console.error('Error updating technician status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const sendPasswordReset = async () => {
    if (!technician) return;
    
    setUpdating(true);
    try {
      // Generate new temporary password
      const tempPassword = generateTempPassword();
      
      // Send password reset email
      const emailSent = await sendPasswordResetEmail(
        technician.email,
        technician.name,
        tempPassword
      );

      if (emailSent) {
        alert('Password reset email sent successfully!');
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending password reset:', error);
      alert('Failed to send password reset email');
    } finally {
      setUpdating(false);
    }
  };

  const generateTempPassword = (): string => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password + '!';
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not set';
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return 'Not set';
    return date.toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'short',
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
      <Layout>
        <TechnicianDetailContainer>
          <LoadingState>Loading technician details...</LoadingState>
        </TechnicianDetailContainer>
      </Layout>
    );
  }

  if (!technician) {
    return (
      <Layout>
        <TechnicianDetailContainer>
          <EmptyState>Technician not found</EmptyState>
        </TechnicianDetailContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <TechnicianDetailContainer>
        {/* Header Section */}
        <HeaderSection>
          <HeaderContent>
            <TechnicianInfo>
              <TechnicianName>{technician.name}</TechnicianName>
              
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Email</InfoLabel>
                  <InfoValue>{technician.email}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Phone</InfoLabel>
                  <InfoValue>{technician.phone || 'Not provided'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Employee ID</InfoLabel>
                  <InfoValue>{technician.employeeId || 'Not set'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Specialization</InfoLabel>
                  <InfoValue>{technician.specialization || 'General'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Joined</InfoLabel>
                  <InfoValue>{formatDate(technician.createdAt)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Status</InfoLabel>
                  <StatusBadge status={technician.status as 'active' | 'inactive'}>
                    {technician.status || 'active'}
                  </StatusBadge>
                </InfoItem>
              </InfoGrid>
            </TechnicianInfo>
            
            <ActionsSection>
              <Button
                variant="outline"
                onClick={() => router.push('/admin/technicians')}
              >
                ← Back to Technicians
              </Button>
              <Button
                variant={technician.status === 'active' ? 'warning' : 'success'}
                onClick={handleStatusToggle}
                disabled={updating}
              >
                {technician.status === 'active' ? 'Deactivate' : 'Activate'}
              </Button>
              <Button
                variant="secondary"
                onClick={sendPasswordReset}
                disabled={updating}
              >
                Send Password Reset
              </Button>
            </ActionsSection>
          </HeaderContent>
        </HeaderSection>

        {/* Stats Section */}
        {stats && (
          <StatsGrid>
            <StatCard>
              <StatValue>{stats.totalJobs}</StatValue>
              <StatLabel>Total Jobs</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.activeJobs}</StatValue>
              <StatLabel>Active Jobs</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.completedJobs}</StatValue>
              <StatLabel>Completed Jobs</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.completionRate.toFixed(1)}%</StatValue>
              <StatLabel>Completion Rate</StatLabel>
            </StatCard>
          </StatsGrid>
        )}

        {/* Jobs Section */}
        <JobsSection>
          <SectionTitle>Assigned Jobs ({jobs.length})</SectionTitle>
          
          {jobs.length === 0 ? (
            <EmptyState>
              No jobs assigned to this technician yet.
            </EmptyState>
          ) : (
            <JobsList>
              {jobs.map(job => (
                <JobCard key={job.id}>
                  <JobHeader>
                    <JobTitle>Job #{job.jobId} - {job.clientName}</JobTitle>
                    <JobStatusBadge status={job.status}>{job.status}</JobStatusBadge>
                  </JobHeader>
                  
                  <JobDetails>
                    <div>
                      <strong>Type:</strong> {job.jobType}
                    </div>
                    <div>
                      <strong>Scheduled:</strong> {job.scheduledDate ? formatDateTime(job.scheduledDate) : 'Not scheduled'}
                    </div>
                    <div>
                      <strong>Location:</strong> {job.location || 'Client site'}
                    </div>
                    <div>
                      <strong>Chairs:</strong> {job.chairs?.length || 0}
                    </div>
                  </JobDetails>
                  
                  {job.adminNotes && (
                    <div style={{ 
                      marginTop: theme.spacing.md, 
                      padding: theme.spacing.md,
                      background: theme.colors.gray[50],
                      borderRadius: theme.borderRadius.sm,
                      fontSize: theme.typography.fontSize.sm
                    }}>
                      <strong>Admin Notes:</strong> {job.adminNotes}
                    </div>
                  )}
                  
                  <JobActions>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/jobs/${job.id}`)}
                    >
                      View Details
                    </Button>
                    {job.status === 'Scheduled' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => router.push(`/jobs/${job.id}/technician`)}
                      >
                        Start Job
                      </Button>
                    )}
                  </JobActions>
                </JobCard>
              ))}
            </JobsList>
          )}
        </JobsSection>
      </TechnicianDetailContainer>
    </Layout>
  );
};

export default TechnicianDetailPage;