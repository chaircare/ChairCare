import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { useTheme } from 'contexts/ThemeContext';
import { Job } from 'types/chair-care';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { JobCalendar } from 'components/admin/JobCalendar';
import { JobAssignment } from 'components/admin/JobAssignment';

const CalendarPageContainer = styled.div<{ theme: any }>`
  max-width: 1600px;
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
  font-size: ${props => props.theme.typography.fontSize['4xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const HeaderSubtitle = styled.p<{ theme: any }>`
  margin: 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xl};
`;

const ActionsSection = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.xl};
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ActionButtons = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const StatsSection = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const StatCard = styled(Card)<{ theme: any }>`
  text-align: center;
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.8)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.xl};
  backdrop-filter: blur(10px);
  min-width: 120px;
`;

const StatValue = styled.div<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  background: ${props => props.theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StatLabel = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: ${props => props.theme.typography.letterSpacing.wide};
`;

const JobDetailsModal = styled.div<{ theme: any; isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${props => props.theme.spacing.xl};
`;

const JobDetailsCard = styled(Card)<{ theme: any }>`
  width: 100%;
  max-width: 600px;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.95)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius['2xl']};
  box-shadow: ${props => props.theme.shadows['2xl']};
  backdrop-filter: blur(20px);
`;

const JobDetailsHeader = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  background: ${props => props.theme.gradients.primary};
  color: white;
  border-radius: ${props => props.theme.borderRadius['2xl']} ${props => props.theme.borderRadius['2xl']} 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const JobDetailsTitle = styled.h2<{ theme: any }>`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const CloseButton = styled.button<{ theme: any }>`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.typography.fontSize.lg};
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
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

const JobDetailsActions = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
  padding-top: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border.primary};
`;

const CalendarPage: NextPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showAssignment, setShowAssignment] = useState(false);

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setShowJobDetails(true);
  };

  const handleCloseDetails = () => {
    setShowJobDetails(false);
    setSelectedJob(null);
  };

  const handleAssignJob = () => {
    setShowJobDetails(false);
    setShowAssignment(true);
  };

  const handleAssignmentComplete = () => {
    setShowAssignment(false);
    setSelectedJob(null);
    // Refresh calendar data
    window.location.reload();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not scheduled';
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user || user.role !== 'admin') {
    router.push('/dashboard');
    return null;
  }

  return (
    <Layout>
      <CalendarPageContainer theme={theme}>
        <HeaderSection theme={theme}>
          <HeaderTitle theme={theme}>Job Schedule Calendar</HeaderTitle>
          <HeaderSubtitle theme={theme}>
            Visual overview of all scheduled technician jobs
          </HeaderSubtitle>
        </HeaderSection>

        <ActionsSection theme={theme}>
          <StatsSection theme={theme}>
            <StatCard theme={theme}>
              <StatValue theme={theme}>24</StatValue>
              <StatLabel theme={theme}>This Month</StatLabel>
            </StatCard>
            <StatCard theme={theme}>
              <StatValue theme={theme}>8</StatValue>
              <StatLabel theme={theme}>This Week</StatLabel>
            </StatCard>
            <StatCard theme={theme}>
              <StatValue theme={theme}>3</StatValue>
              <StatLabel theme={theme}>Today</StatLabel>
            </StatCard>
            <StatCard theme={theme}>
              <StatValue theme={theme}>5</StatValue>
              <StatLabel theme={theme}>Unassigned</StatLabel>
            </StatCard>
          </StatsSection>
          
          <ActionButtons theme={theme}>
            <Button
              variant="outline"
              onClick={() => router.push('/admin/job-progress')}
            >
              Job Progress
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push('/admin/user-management')}
            >
              Manage Users
            </Button>
            <Button
              variant="primary"
              onClick={() => router.push('/admin/jobs')}
            >
              Manage Jobs
            </Button>
          </ActionButtons>
        </ActionsSection>

        <JobCalendar onJobClick={handleJobClick} />

        {/* Job Details Modal */}
        <JobDetailsModal theme={theme} isOpen={showJobDetails}>
          <JobDetailsCard theme={theme}>
            <JobDetailsHeader theme={theme}>
              <JobDetailsTitle theme={theme}>
                Job #{selectedJob?.jobId} Details
              </JobDetailsTitle>
              <CloseButton theme={theme} onClick={handleCloseDetails}>
                ×
              </CloseButton>
            </JobDetailsHeader>
            
            <JobDetailsContent theme={theme}>
              {selectedJob && (
                <>
                  <DetailRow theme={theme}>
                    <DetailLabel theme={theme}>Client:</DetailLabel>
                    <DetailValue theme={theme}>{selectedJob.clientName}</DetailValue>
                  </DetailRow>
                  
                  <DetailRow theme={theme}>
                    <DetailLabel theme={theme}>Service Type:</DetailLabel>
                    <DetailValue theme={theme}>{selectedJob.jobType}</DetailValue>
                  </DetailRow>
                  
                  <DetailRow theme={theme}>
                    <DetailLabel theme={theme}>Scheduled Date:</DetailLabel>
                    <DetailValue theme={theme}>{formatDate(selectedJob.scheduledDate)}</DetailValue>
                  </DetailRow>
                  
                  <DetailRow theme={theme}>
                    <DetailLabel theme={theme}>Location:</DetailLabel>
                    <DetailValue theme={theme}>{selectedJob.location || 'Client site'}</DetailValue>
                  </DetailRow>
                  
                  <DetailRow theme={theme}>
                    <DetailLabel theme={theme}>Number of Chairs:</DetailLabel>
                    <DetailValue theme={theme}>{selectedJob.chairs?.length || 0} chairs</DetailValue>
                  </DetailRow>
                  
                  <DetailRow theme={theme}>
                    <DetailLabel theme={theme}>Status:</DetailLabel>
                    <DetailValue theme={theme}>{selectedJob.status}</DetailValue>
                  </DetailRow>
                  
                  <DetailRow theme={theme}>
                    <DetailLabel theme={theme}>Assigned Technician:</DetailLabel>
                    <DetailValue theme={theme}>
                      {selectedJob.assignedTechnicianName || 'Unassigned'}
                    </DetailValue>
                  </DetailRow>
                  
                  {selectedJob.description && (
                    <DetailRow theme={theme}>
                      <DetailLabel theme={theme}>Description:</DetailLabel>
                      <DetailValue theme={theme}>{selectedJob.description}</DetailValue>
                    </DetailRow>
                  )}
                  
                  <JobDetailsActions theme={theme}>
                    <Button
                      variant="outline"
                      onClick={handleCloseDetails}
                    >
                      Close
                    </Button>
                    {!selectedJob.assignedTechnicianId && (
                      <Button
                        variant="primary"
                        onClick={handleAssignJob}
                      >
                        Assign Technician
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() => router.push(`/admin/jobs/${selectedJob.id}`)}
                    >
                      View Full Details
                    </Button>
                  </JobDetailsActions>
                </>
              )}
            </JobDetailsContent>
          </JobDetailsCard>
        </JobDetailsModal>

        {/* Job Assignment Modal */}
        {showAssignment && selectedJob && (
          <JobAssignment
            job={selectedJob}
            onAssignmentComplete={handleAssignmentComplete}
            onClose={() => setShowAssignment(false)}
          />
        )}
      </CalendarPageContainer>
    </Layout>
  );
};

export default CalendarPage;