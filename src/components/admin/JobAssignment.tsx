import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useTheme } from 'contexts/ThemeContext';
import { Job, User } from 'types/chair-care';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from 'lib/firebase';

interface JobAssignmentProps {
  job: Job;
  onAssignmentComplete: () => void;
  onClose: () => void;
}

const AssignmentModal = styled.div<{ theme: any }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${props => props.theme.spacing.xl};
`;

const AssignmentCard = styled(Card)<{ theme: any }>`
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

const AssignmentHeader = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  background: ${props => props.theme.gradients.primary};
  color: white;
  border-radius: ${props => props.theme.borderRadius['2xl']} ${props => props.theme.borderRadius['2xl']} 0 0;
`;

const AssignmentTitle = styled.h2<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const JobInfo = styled.div<{ theme: any }>`
  opacity: 0.9;
  font-size: ${props => props.theme.typography.fontSize.base};
`;

const AssignmentContent = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
`;

const JobDetails = styled.div<{ theme: any }>`
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(51, 65, 85, 0.5)' 
    : props.theme.colors.gray[50]
  };
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const DetailRow = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.sm};
  
  &:last-child {
    margin-bottom: 0;
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

const TechnicianSection = styled.div<{ theme: any }>`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const SectionTitle = styled.h3<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
`;

const TechnicianGrid = styled.div<{ theme: any }>`
  display: grid;
  gap: ${props => props.theme.spacing.md};
  max-height: 300px;
  overflow-y: auto;
`;

const TechnicianCard = styled.div<{ theme: any; selected: boolean }>`
  padding: ${props => props.theme.spacing.lg};
  border: 2px solid ${props => props.selected 
    ? props.theme.colors.primary[500] 
    : props.theme.colors.border.primary
  };
  border-radius: ${props => props.theme.borderRadius.xl};
  background: ${props => props.selected 
    ? (props.theme.mode === 'dark' 
      ? 'rgba(20, 184, 166, 0.1)' 
      : props.theme.colors.primary[50]
    )
    : (props.theme.mode === 'dark' 
      ? 'rgba(51, 65, 85, 0.5)' 
      : props.theme.colors.background.primary
    )
  };
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
    border-color: ${props => props.theme.colors.primary[400]};
  }
`;

const TechnicianHeader = styled.div<{ theme: any }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const TechnicianAvatar = styled.div<{ theme: any }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.theme.gradients.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const TechnicianInfo = styled.div<{ theme: any }>`
  flex: 1;
`;

const TechnicianName = styled.div<{ theme: any }>`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const TechnicianDetails = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const TechnicianStats = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  margin-top: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const StatItem = styled.div<{ theme: any }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const StatValue = styled.span<{ theme: any }>`
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary[600]};
`;

const StatLabel = styled.span<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xs};
`;

const AssignmentActions = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
  padding-top: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border.primary};
`;

const LoadingState = styled.div<{ theme: any }>`
  text-align: center;
  padding: ${props => props.theme.spacing['2xl']};
  color: ${props => props.theme.colors.text.secondary};
`;

export const JobAssignment: React.FC<JobAssignmentProps> = ({
  job,
  onAssignmentComplete,
  onClose
}) => {
  const { theme } = useTheme();
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadTechnicians();
  }, []);

  const loadTechnicians = async () => {
    try {
      const techniciansQuery = query(
        collection(db, 'users'),
        where('role', '==', 'technician')
      );
      
      const techniciansSnapshot = await getDocs(techniciansQuery);
      const techniciansData = techniciansSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as User[];
      
      setTechnicians(techniciansData);
    } catch (error) {
      console.error('Error loading technicians:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignment = async () => {
    if (!selectedTechnician) return;
    
    setAssigning(true);
    try {
      const selectedTech = technicians.find(t => t.id === selectedTechnician);
      
      await updateDoc(doc(db, 'jobs', job.id), {
        assignedTechnicianId: selectedTechnician,
        assignedTechnicianName: selectedTech?.name,
        status: 'Scheduled',
        updatedAt: new Date()
      });
      
      onAssignmentComplete();
    } catch (error) {
      console.error('Error assigning job:', error);
    } finally {
      setAssigning(false);
    }
  };

  const getTechnicianInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Not scheduled';
    return date.toLocaleDateString('en-ZA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AssignmentModal theme={theme}>
      <AssignmentCard theme={theme}>
        <AssignmentHeader theme={theme}>
          <AssignmentTitle theme={theme}>Assign Technician</AssignmentTitle>
          <JobInfo theme={theme}>
            Job #{job.jobId} - {job.clientName}
          </JobInfo>
        </AssignmentHeader>
        
        <AssignmentContent theme={theme}>
          <JobDetails theme={theme}>
            <DetailRow theme={theme}>
              <DetailLabel theme={theme}>Service Type:</DetailLabel>
              <DetailValue theme={theme}>{job.jobType}</DetailValue>
            </DetailRow>
            <DetailRow theme={theme}>
              <DetailLabel theme={theme}>Scheduled Date:</DetailLabel>
              <DetailValue theme={theme}>{formatDate(job.scheduledDate)}</DetailValue>
            </DetailRow>
            <DetailRow theme={theme}>
              <DetailLabel theme={theme}>Location:</DetailLabel>
              <DetailValue theme={theme}>{job.location || 'Client site'}</DetailValue>
            </DetailRow>
            <DetailRow theme={theme}>
              <DetailLabel theme={theme}>Chairs:</DetailLabel>
              <DetailValue theme={theme}>{job.chairs?.length || 0} chairs</DetailValue>
            </DetailRow>
          </JobDetails>
          
          <TechnicianSection theme={theme}>
            <SectionTitle theme={theme}>Select Technician</SectionTitle>
            
            {loading ? (
              <LoadingState theme={theme}>Loading technicians...</LoadingState>
            ) : (
              <TechnicianGrid theme={theme}>
                {technicians.map((technician) => (
                  <TechnicianCard
                    key={technician.id}
                    theme={theme}
                    selected={selectedTechnician === technician.id}
                    onClick={() => setSelectedTechnician(technician.id)}
                  >
                    <TechnicianHeader theme={theme}>
                      <TechnicianAvatar theme={theme}>
                        {getTechnicianInitials(technician.name)}
                      </TechnicianAvatar>
                      <TechnicianInfo theme={theme}>
                        <TechnicianName theme={theme}>{technician.name}</TechnicianName>
                        <TechnicianDetails theme={theme}>
                          {technician.specialization || 'General Technician'}
                        </TechnicianDetails>
                      </TechnicianInfo>
                    </TechnicianHeader>
                    
                    <TechnicianStats theme={theme}>
                      <StatItem theme={theme}>
                        <StatValue theme={theme}>4.8</StatValue>
                        <StatLabel theme={theme}>Rating</StatLabel>
                      </StatItem>
                      <StatItem theme={theme}>
                        <StatValue theme={theme}>12</StatValue>
                        <StatLabel theme={theme}>Active Jobs</StatLabel>
                      </StatItem>
                      <StatItem theme={theme}>
                        <StatValue theme={theme}>98%</StatValue>
                        <StatLabel theme={theme}>Success Rate</StatLabel>
                      </StatItem>
                    </TechnicianStats>
                  </TechnicianCard>
                ))}
              </TechnicianGrid>
            )}
          </TechnicianSection>
          
          <AssignmentActions theme={theme}>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={assigning}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAssignment}
              disabled={!selectedTechnician || assigning}
              loading={assigning}
            >
              {assigning ? 'Assigning...' : 'Assign Technician'}
            </Button>
          </AssignmentActions>
        </AssignmentContent>
      </AssignmentCard>
    </AssignmentModal>
  );
};