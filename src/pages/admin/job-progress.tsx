import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { useTheme } from 'contexts/ThemeContext';
import { Job, User } from 'types/chair-care';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from 'lib/firebase';

const ProgressContainer = styled.div<{ theme: any }>`
  max-width: 1400px;
  margin: 0 auto;
`;

const HeaderSection = styled(Card)<{ theme: any }>`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.mode === 'dark' 
    ? props.theme.gradients.darkSubtle
    : `linear-gradient(135deg, ${props.theme.colors.primary[50]} 0%, ${props.theme.colors.accent[50]} 100%)`
  };
  border: 1px solid ${props => props.theme.colors.border.primary};
`;

const HeaderTitle = styled.h1<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const FilterSection = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.xl};
  flex-wrap: wrap;
  align-items: center;
`;

const FilterSelect = styled.select<{ theme: any }>`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
  }
`;

const StatsGrid = styled.div<{ theme: any }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const StatCard = styled(Card)<{ theme: any }>`
  text-align: center;
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.primary};
`;

const StatValue = styled.div<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary[600]};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const StatLabel = styled.div<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const JobsGrid = styled.div<{ theme: any }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const JobCard = styled(Card)<{ theme: any }>`
  padding: ${props => props.theme.spacing.lg};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const JobHeader = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const JobTitle = styled.h3<{ theme: any }>`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const JobStatusBadge = styled.span<{ theme: any; status: string }>`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  ${props => {
    switch (props.status) {
      case 'New':
        return `background: ${props.theme.colors.primary[100]}; color: ${props.theme.colors.primary[700]};`;
      case 'Scheduled':
        return `background: ${props.theme.colors.warning[100]}; color: ${props.theme.colors.warning[700]};`;
      case 'In Progress':
        return `background: ${props.theme.colors.accent[100]}; color: ${props.theme.colors.accent[700]};`;
      case 'Completed':
        return `background: ${props.theme.colors.success[100]}; color: ${props.theme.colors.success[700]};`;
      default:
        return `background: ${props.theme.colors.gray[100]}; color: ${props.theme.colors.gray[700]};`;
    }
  }}
`;

const JobDetails = styled.div<{ theme: any }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const TechnicianInfo = styled.div<{ theme: any }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.gray[50]};
  border-radius: ${props => props.theme.borderRadius.sm};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const TechnicianAvatar = styled.div<{ theme: any }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary[500]};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const ProgressBar = styled.div<{ theme: any }>`
  width: 100%;
  height: 8px;
  background: ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.borderRadius.full};
  overflow: hidden;
  margin: ${props => props.theme.spacing.sm} 0;
`;

const ProgressFill = styled.div<{ theme: any; progress: number }>`
  height: 100%;
  background: ${props => props.theme.colors.primary[500]};
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const JobActions = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.md};
`;

const EmptyState = styled.div<{ theme: any }>`
  text-align: center;
  padding: ${props => props.theme.spacing['3xl']};
  color: ${props => props.theme.colors.text.secondary};
  grid-column: 1 / -1;
`;

const LoadingState = styled.div<{ theme: any }>`
  text-align: center;
  padding: ${props => props.theme.spacing['3xl']};
  color: ${props => props.theme.colors.text.secondary};
`;

const JobProgressPage: NextPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTechnician, setSelectedTechnician] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    if (user) {
      loadData();
    }
  }, [user, router]);

  useEffect(() => {
    filterJobs();
  }, [jobs, selectedTechnician, selectedStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all jobs with assigned technicians
      const jobsQuery = query(
        collection(db, 'jobs'),
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
      
      // Load all technicians
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
      
      setJobs(jobsData);
      setTechnicians(techniciansData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;
    
    if (selectedTechnician !== 'all') {
      filtered = filtered.filter(job => job.assignedTechnicianId === selectedTechnician);
    }
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(job => job.status === selectedStatus);
    }
    
    setFilteredJobs(filtered);
  };

  const getJobProgress = (job: Job): number => {
    switch (job.status) {
      case 'New': return 10;
      case 'Scheduled': return 25;
      case 'In Progress': return 75;
      case 'Completed': return 100;
      default: return 0;
    }
  };

  const getStats = () => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(job => ['Scheduled', 'In Progress'].includes(job.status)).length;
    const completedJobs = jobs.filter(job => job.status === 'Completed').length;
    const unassignedJobs = jobs.filter(job => !job.assignedTechnicianId).length;
    
    return { totalJobs, activeJobs, completedJobs, unassignedJobs };
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not scheduled';
    return date.toLocaleDateString('en-ZA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTechnicianInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <Layout>
        <ProgressContainer theme={theme}>
          <LoadingState theme={theme}>Loading job progress data...</LoadingState>
        </ProgressContainer>
      </Layout>
    );
  }

  const stats = getStats();

  return (
    <Layout>
      <ProgressContainer theme={theme}>
        <HeaderSection theme={theme}>
          <HeaderTitle theme={theme}>Job Progress Tracking</HeaderTitle>
          <p>Monitor real-time progress of all technician jobs</p>
        </HeaderSection>

        <StatsGrid theme={theme}>
          <StatCard theme={theme}>
            <StatValue theme={theme}>{stats.totalJobs}</StatValue>
            <StatLabel theme={theme}>Total Jobs</StatLabel>
          </StatCard>
          <StatCard theme={theme}>
            <StatValue theme={theme}>{stats.activeJobs}</StatValue>
            <StatLabel theme={theme}>Active Jobs</StatLabel>
          </StatCard>
          <StatCard theme={theme}>
            <StatValue theme={theme}>{stats.completedJobs}</StatValue>
            <StatLabel theme={theme}>Completed Jobs</StatLabel>
          </StatCard>
          <StatCard theme={theme}>
            <StatValue theme={theme}>{stats.unassignedJobs}</StatValue>
            <StatLabel theme={theme}>Unassigned Jobs</StatLabel>
          </StatCard>
        </StatsGrid>

        <FilterSection theme={theme}>
          <div>
            <label style={{ marginRight: theme.spacing.sm, fontSize: theme.typography.fontSize.sm }}>
              Technician:
            </label>
            <FilterSelect
              theme={theme}
              value={selectedTechnician}
              onChange={(e) => setSelectedTechnician(e.target.value)}
            >
              <option value="all">All Technicians</option>
              <option value="">Unassigned</option>
              {technicians.map(tech => (
                <option key={tech.id} value={tech.id}>
                  {tech.name}
                </option>
              ))}
            </FilterSelect>
          </div>
          
          <div>
            <label style={{ marginRight: theme.spacing.sm, fontSize: theme.typography.fontSize.sm }}>
              Status:
            </label>
            <FilterSelect
              theme={theme}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="New">New</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </FilterSelect>
          </div>
          
          <Button
            variant="outline"
            onClick={() => router.push('/admin/jobs')}
          >
            Manage Jobs
          </Button>
        </FilterSection>

        {filteredJobs.length === 0 ? (
          <JobsGrid theme={theme}>
            <EmptyState theme={theme}>
              No jobs found matching the selected filters.
            </EmptyState>
          </JobsGrid>
        ) : (
          <JobsGrid theme={theme}>
            {filteredJobs.map(job => {
              const technician = technicians.find(t => t.id === job.assignedTechnicianId);
              const progress = getJobProgress(job);
              
              return (
                <JobCard key={job.id} theme={theme}>
                  <JobHeader theme={theme}>
                    <JobTitle theme={theme}>Job #{job.jobId}</JobTitle>
                    <JobStatusBadge theme={theme} status={job.status}>{job.status}</JobStatusBadge>
                  </JobHeader>
                  
                  <JobDetails theme={theme}>
                    <div><strong>Client:</strong> {job.clientName}</div>
                    <div><strong>Type:</strong> {job.jobType}</div>
                    <div><strong>Scheduled:</strong> {formatDate(job.scheduledDate || null)}</div>
                    <div><strong>Chairs:</strong> {job.chairs?.length || 0}</div>
                    {job.location && <div><strong>Location:</strong> {job.location}</div>}
                  </JobDetails>

                  {technician ? (
                    <TechnicianInfo theme={theme}>
                      <TechnicianAvatar theme={theme}>
                        {getTechnicianInitials(technician.name)}
                      </TechnicianAvatar>
                      <div>
                        <div style={{ fontWeight: theme.typography.fontWeight.medium }}>
                          {technician.name}
                        </div>
                        <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>
                          {technician.specialization || 'General Technician'}
                        </div>
                      </div>
                    </TechnicianInfo>
                  ) : (
                    <TechnicianInfo theme={theme}>
                      <TechnicianAvatar theme={theme}>?</TechnicianAvatar>
                      <div>
                        <div style={{ fontWeight: theme.typography.fontWeight.medium, color: theme.colors.warning[600] }}>
                          Unassigned
                        </div>
                        <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>
                          No technician assigned
                        </div>
                      </div>
                    </TechnicianInfo>
                  )}

                  <div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      fontSize: theme.typography.fontSize.sm,
                      marginBottom: theme.spacing.xs
                    }}>
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <ProgressBar theme={theme}>
                      <ProgressFill theme={theme} progress={progress} />
                    </ProgressBar>
                  </div>

                  {job.adminNotes && (
                    <div style={{ 
                      marginTop: theme.spacing.md,
                      padding: theme.spacing.sm,
                      background: theme.colors.gray[50],
                      borderRadius: theme.borderRadius.sm,
                      fontSize: theme.typography.fontSize.sm
                    }}>
                      <strong>Notes:</strong> {job.adminNotes}
                    </div>
                  )}

                  <JobActions theme={theme}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/jobs/${job.id}`)}
                    >
                      View Details
                    </Button>
                    {technician && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => router.push(`/admin/technicians/${technician.id}`)}
                      >
                        View Technician
                      </Button>
                    )}
                  </JobActions>
                </JobCard>
              );
            })}
          </JobsGrid>
        )}
      </ProgressContainer>
    </Layout>
  );
};

export default JobProgressPage;