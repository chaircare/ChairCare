import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useTheme } from 'contexts/ThemeContext';
import { Job, User } from 'types/chair-care';
import { Card } from 'components/ui/Card';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from 'lib/firebase';

interface JobCalendarProps {
  onJobClick?: (job: Job) => void;
}

const CalendarContainer = styled(Card)<{ theme: any }>`
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.8)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius['2xl']};
  backdrop-filter: blur(10px);
`;

const CalendarHeader = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => props.theme.gradients.primary};
  color: white;
  border-radius: ${props => props.theme.borderRadius['2xl']} ${props => props.theme.borderRadius['2xl']} 0 0;
`;

const CalendarTitle = styled.h2<{ theme: any }>`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const CalendarNavigation = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  align-items: center;
`;

const NavButton = styled.button<{ theme: any }>`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.lg};
  cursor: pointer;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
`;

const MonthYear = styled.div<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  margin: 0 ${props => props.theme.spacing.lg};
`;

const CalendarGrid = styled.div<{ theme: any }>`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: ${props => props.theme.colors.border.primary};
  margin: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
`;

const DayHeader = styled.div<{ theme: any }>`
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(51, 65, 85, 0.8)' 
    : props.theme.colors.gray[100]
  };
  padding: ${props => props.theme.spacing.md};
  text-align: center;
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const DayCell = styled.div<{ theme: any; isToday: boolean; isOtherMonth: boolean }>`
  background: ${props => props.theme.colors.background.primary};
  min-height: 120px;
  padding: ${props => props.theme.spacing.sm};
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.isToday && `
    background: ${props.theme.mode === 'dark' 
      ? 'rgba(20, 184, 166, 0.1)' 
      : props.theme.colors.primary[50]
    };
    border: 2px solid ${props.theme.colors.primary[500]};
  `}
  
  ${props => props.isOtherMonth && `
    opacity: 0.3;
  `}
  
  &:hover {
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(51, 65, 85, 0.5)' 
      : props.theme.colors.gray[50]
    };
  }
`;

const DayNumber = styled.div<{ theme: any; isToday: boolean }>`
  font-weight: ${props => props.isToday 
    ? props.theme.typography.fontWeight.bold 
    : props.theme.typography.fontWeight.medium
  };
  color: ${props => props.isToday 
    ? props.theme.colors.primary[600] 
    : props.theme.colors.text.primary
  };
  margin-bottom: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const JobsList = styled.div<{ theme: any }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  max-height: 80px;
  overflow-y: auto;
`;

const JobItem = styled.div<{ theme: any; jobType: string }>`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ jobType, theme }) => {
    switch (jobType) {
      case 'cleaning':
        return `
          background: ${theme.colors.accent[100]};
          color: ${theme.colors.accent[700]};
          &:hover { background: ${theme.colors.accent[200]}; }
        `;
      case 'repair':
        return `
          background: ${theme.colors.error[100]};
          color: ${theme.colors.error[700]};
          &:hover { background: ${theme.colors.error[200]}; }
        `;
      case 'maintenance':
        return `
          background: ${theme.colors.warning[100]};
          color: ${theme.colors.warning[700]};
          &:hover { background: ${theme.colors.warning[200]}; }
        `;
      default:
        return `
          background: ${theme.colors.primary[100]};
          color: ${theme.colors.primary[700]};
          &:hover { background: ${theme.colors.primary[200]}; }
        `;
    }
  }}
`;

const JobTooltip = styled.div<{ theme: any }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.95)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.md};
  box-shadow: ${props => props.theme.shadows.lg};
  backdrop-filter: blur(10px);
  z-index: 10;
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const LegendContainer = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.xl};
  border-top: 1px solid ${props => props.theme.colors.border.primary};
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  flex-wrap: wrap;
  align-items: center;
`;

const LegendItem = styled.div<{ theme: any }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const LegendColor = styled.div<{ theme: any; color: string }>`
  width: 16px;
  height: 16px;
  border-radius: ${props => props.theme.borderRadius.sm};
  background: ${props => props.color};
`;

const LoadingState = styled.div<{ theme: any }>`
  text-align: center;
  padding: ${props => props.theme.spacing['4xl']};
  color: ${props => props.theme.colors.text.secondary};
`;

export const JobCalendar: React.FC<JobCalendarProps> = ({ onJobClick }) => {
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [jobs, setJobs] = useState<Job[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredJob, setHoveredJob] = useState<Job | null>(null);

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      
      // Get start and end of current month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      // Load scheduled jobs for the month
      const jobsQuery = query(
        collection(db, 'jobs'),
        where('status', 'in', ['Scheduled', 'In Progress']),
        orderBy('scheduledDate', 'asc')
      );
      
      const jobsSnapshot = await getDocs(jobsQuery);
      const jobsData = jobsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledDate: doc.data().scheduledDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate()
      })) as Job[];
      
      // Filter jobs for current month view
      const monthJobs = jobsData.filter(job => {
        if (!job.scheduledDate) return false;
        return job.scheduledDate >= startOfMonth && job.scheduledDate <= endOfMonth;
      });
      
      // Load technicians
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
      
      setJobs(monthJobs);
      setTechnicians(techniciansData);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const getJobsForDate = (date: Date) => {
    return jobs.filter(job => {
      if (!job.scheduledDate) return false;
      return (
        job.scheduledDate.getDate() === date.getDate() &&
        job.scheduledDate.getMonth() === date.getMonth() &&
        job.scheduledDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getTechnicianName = (technicianId: string) => {
    const technician = technicians.find(t => t.id === technicianId);
    return technician ? technician.name : 'Unassigned';
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isOtherMonth = (date: Date) => {
    return date.getMonth() !== currentDate.getMonth();
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-ZA', {
      month: 'long',
      year: 'numeric'
    });
  };

  const days = getDaysInMonth();
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <CalendarContainer theme={theme}>
        <LoadingState theme={theme}>Loading calendar...</LoadingState>
      </CalendarContainer>
    );
  }

  return (
    <CalendarContainer theme={theme}>
      <CalendarHeader theme={theme}>
        <CalendarTitle theme={theme}>Job Schedule Calendar</CalendarTitle>
        <CalendarNavigation theme={theme}>
          <NavButton theme={theme} onClick={() => navigateMonth('prev')}>
            ← Previous
          </NavButton>
          <MonthYear theme={theme}>
            {formatMonthYear(currentDate)}
          </MonthYear>
          <NavButton theme={theme} onClick={() => navigateMonth('next')}>
            Next →
          </NavButton>
          <NavButton theme={theme} onClick={goToToday}>
            Today
          </NavButton>
        </CalendarNavigation>
      </CalendarHeader>

      <CalendarGrid theme={theme}>
        {dayHeaders.map(day => (
          <DayHeader key={day} theme={theme}>
            {day}
          </DayHeader>
        ))}
        
        {days.map((day, index) => {
          const dayJobs = getJobsForDate(day);
          const todayFlag = isToday(day);
          const otherMonthFlag = isOtherMonth(day);
          
          return (
            <DayCell
              key={index}
              theme={theme}
              isToday={todayFlag}
              isOtherMonth={otherMonthFlag}
            >
              <DayNumber theme={theme} isToday={todayFlag}>
                {day.getDate()}
              </DayNumber>
              
              <JobsList theme={theme}>
                {dayJobs.slice(0, 3).map((job) => (
                  <JobItem
                    key={job.id}
                    theme={theme}
                    jobType={job.jobType}
                    onClick={() => onJobClick?.(job)}
                    onMouseEnter={() => setHoveredJob(job)}
                    onMouseLeave={() => setHoveredJob(null)}
                  >
                    {job.jobId} - {getTechnicianName(job.assignedTechnicianId || '')}
                  </JobItem>
                ))}
                
                {dayJobs.length > 3 && (
                  <div style={{ 
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.text.secondary,
                    textAlign: 'center',
                    marginTop: theme.spacing.xs
                  }}>
                    +{dayJobs.length - 3} more
                  </div>
                )}
              </JobsList>
              
              {hoveredJob && (
                <JobTooltip theme={theme}>
                  <div><strong>Job #{hoveredJob.jobId}</strong></div>
                  <div>Client: {hoveredJob.clientName}</div>
                  <div>Type: {hoveredJob.jobType}</div>
                  <div>Technician: {getTechnicianName(hoveredJob.assignedTechnicianId || '')}</div>
                  <div>Chairs: {hoveredJob.chairs?.length || 0}</div>
                </JobTooltip>
              )}
            </DayCell>
          );
        })}
      </CalendarGrid>

      <LegendContainer theme={theme}>
        <LegendItem theme={theme}>
          <LegendColor theme={theme} color={theme.colors.accent[200]} />
          <span>Cleaning</span>
        </LegendItem>
        <LegendItem theme={theme}>
          <LegendColor theme={theme} color={theme.colors.error[200]} />
          <span>Repair</span>
        </LegendItem>
        <LegendItem theme={theme}>
          <LegendColor theme={theme} color={theme.colors.warning[200]} />
          <span>Maintenance</span>
        </LegendItem>
        <LegendItem theme={theme}>
          <LegendColor theme={theme} color={theme.colors.primary[200]} />
          <span>Other</span>
        </LegendItem>
      </LegendContainer>
    </CalendarContainer>
  );
};