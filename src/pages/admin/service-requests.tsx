import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { theme } from 'styles/theme';
import { ServiceLog, Chair, User } from 'types/chair-care';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, getDoc, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from 'lib/firebase';

const Container = styled.div`
  padding: ${theme.spacing.xl};
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: ${theme.spacing.xl};
`;

const Title = styled.h1`
  margin: 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
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
`;

const StatNumber = styled.div`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary[600]};
  margin-bottom: ${theme.spacing.sm};
`;

const StatLabel = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const RequestsGrid = styled.div`
  display: grid;
  gap: ${theme.spacing.lg};
`;

const RequestCard = styled(Card)<{ priority?: 'high' | 'medium' | 'low' }>`
  padding: ${theme.spacing.lg};
  border-left: 4px solid ${props => {
    switch (props.priority) {
      case 'high': return theme.colors.error[500];
      case 'medium': return theme.colors.warning[500];
      default: return theme.colors.success[500];
    }
  }};
`;

const RequestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.md};
`;

const RequestInfo = styled.div`
  flex: 1;
`;

const ChairId = styled.h3`
  margin: 0 0 ${theme.spacing.sm} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const ClientName = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  margin-bottom: ${theme.spacing.xs};
`;

const ServiceType = styled.span<{ type: string }>`
  display: inline-block;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background-color: ${props => props.type === 'repair' ? theme.colors.error[100] : theme.colors.success[100]};
  color: ${props => props.type === 'repair' ? theme.colors.error[700] : theme.colors.success[700]};
`;

const RequestDate = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.xs};
  margin-top: ${theme.spacing.sm};
`;

const Description = styled.div`
  margin: ${theme.spacing.md} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
  line-height: 1.5;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
`;

const PriorityBadge = styled.span<{ priority: string }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: uppercase;
  background-color: ${props => {
    switch (props.priority) {
      case 'high': return theme.colors.error[100];
      case 'medium': return theme.colors.warning[100];
      default: return theme.colors.success[100];
    }
  }};
  color: ${props => {
    switch (props.priority) {
      case 'high': return theme.colors.error[700];
      case 'medium': return theme.colors.warning[700];
      default: return theme.colors.success[700];
    }
  }};
`;

interface ServiceRequestWithDetails extends ServiceLog {
  chair?: Chair;
  client?: User;
  priority: 'high' | 'medium' | 'low';
  daysSinceRequest: number;
}

const ServiceRequests: NextPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    high: 0,
    overdue: 0
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      loadServiceRequests();
    }
  }, [user]);

  const loadServiceRequests = async () => {
    try {
      setLoading(true);
      
      // Get all pending service requests
      const requestsQuery = query(
        collection(db, 'serviceLogs'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      
      const requestsSnapshot = await getDocs(requestsQuery);
      const requestsWithDetails: ServiceRequestWithDetails[] = [];
      
      for (const requestDoc of requestsSnapshot.docs) {
        const requestData = requestDoc.data() as ServiceLog;
        
        // Convert Firestore timestamp to Date
        const createdAt = requestData.createdAt?.toDate ? requestData.createdAt.toDate() : new Date(requestData.createdAt);
        
        // Get chair details
        let chair: Chair | undefined;
        if (requestData.chairId) {
          const chairDoc = await getDoc(doc(db, 'chairs', requestData.chairId));
          if (chairDoc.exists()) {
            chair = { id: chairDoc.id, ...chairDoc.data() } as Chair;
          }
        }
        
        // Get client details
        let client: User | undefined;
        if (requestData.clientId) {
          const clientDoc = await getDoc(doc(db, 'users', requestData.clientId));
          if (clientDoc.exists()) {
            client = { id: clientDoc.id, ...clientDoc.data() } as User;
          }
        }
        
        // Calculate priority based on urgency and service type
        const daysSinceRequest = Math.floor(
          (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        let priority: 'high' | 'medium' | 'low' = 'low';
        
        // Use urgency from request if available, otherwise calculate based on type and age
        if (requestData.urgency) {
          priority = requestData.urgency as 'high' | 'medium' | 'low';
        } else if (requestData.serviceType === 'repair' || daysSinceRequest > 7) {
          priority = 'high';
        } else if (daysSinceRequest > 3) {
          priority = 'medium';
        }
        
        requestsWithDetails.push({
          id: requestDoc.id,
          ...requestData,
          createdAt, // Use the converted Date object
          chair,
          client,
          priority,
          daysSinceRequest
        });
      }
      
      // Sort by priority and date
      requestsWithDetails.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
      
      setRequests(requestsWithDetails);
      
      // Calculate stats
      const total = requestsWithDetails.length;
      const pending = requestsWithDetails.filter(r => r.status === 'pending').length;
      const high = requestsWithDetails.filter(r => r.priority === 'high').length;
      const overdue = requestsWithDetails.filter(r => r.daysSinceRequest > 7).length;
      
      setStats({ total, pending, high, overdue });
      
    } catch (error) {
      console.error('Error loading service requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const createJobFromRequest = async (request: ServiceRequestWithDetails) => {
    try {
      if (!request.chair || !request.client) {
        alert('Missing chair or client information');
        return;
      }
      
      // Create job
      const jobData = {
        jobId: `JOB-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        clientId: request.client.id,
        clientName: request.client.name,
        jobType: 'On-site' as const,
        status: 'New' as const,
        location: request.chair.location,
        adminNotes: `Created from service request: ${request.description}`,
        chairs: [request.chair.id],
        createdAt: serverTimestamp(),
        createdBy: user?.id || 'admin'
      };
      
      const jobRef = await addDoc(collection(db, 'jobs'), jobData);
      
      // Update service request status
      await updateDoc(doc(db, 'serviceLogs', request.id), {
        status: 'assigned',
        jobId: jobRef.id,
        updatedAt: serverTimestamp()
      });
      
      // Refresh the list
      loadServiceRequests();
      
      alert('Job created successfully!');
      
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Error creating job. Please try again.');
    }
  };

  const markAsReviewed = async (requestId: string) => {
    try {
      await updateDoc(doc(db, 'serviceLogs', requestId), {
        status: 'reviewed',
        reviewedAt: serverTimestamp(),
        reviewedBy: user?.id
      });
      
      loadServiceRequests();
    } catch (error) {
      console.error('Error marking as reviewed:', error);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <Layout>
        <Container>
          <div>Access denied. Admin only.</div>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <Header>
          <Title>Service Requests</Title>
        </Header>

        <StatsGrid>
          <StatCard>
            <StatNumber>{stats.total}</StatNumber>
            <StatLabel>Total Requests</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.pending}</StatNumber>
            <StatLabel>Pending</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.high}</StatNumber>
            <StatLabel>High Priority</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.overdue}</StatNumber>
            <StatLabel>Overdue (7+ days)</StatLabel>
          </StatCard>
        </StatsGrid>

        {loading ? (
          <Card>
            <div style={{ padding: theme.spacing.xl, textAlign: 'center' }}>
              Loading service requests...
            </div>
          </Card>
        ) : requests.length === 0 ? (
          <Card>
            <div style={{ padding: theme.spacing.xl, textAlign: 'center' }}>
              No pending service requests
            </div>
          </Card>
        ) : (
          <RequestsGrid>
            {requests.map((request) => (
              <RequestCard key={request.id} priority={request.priority}>
                <RequestHeader>
                  <RequestInfo>
                    <ChairId>
                      {request.chair?.chairId || 'Unknown Chair'}
                      <PriorityBadge priority={request.priority}>
                        {request.priority} priority
                      </PriorityBadge>
                    </ChairId>
                    <ClientName>
                      Client: {request.client?.name || 'Unknown Client'}
                    </ClientName>
                    <div>
                      <ServiceType type={request.serviceType}>
                        {request.serviceType}
                      </ServiceType>
                    </div>
                    <RequestDate>
                      Requested {request.daysSinceRequest} days ago
                    </RequestDate>
                  </RequestInfo>
                </RequestHeader>

                <Description>
                  <strong>Issue:</strong> {request.description}
                  {request.issueDetails && (
                    <>
                      <br />
                      <strong>Details:</strong> {request.issueDetails}
                    </>
                  )}
                </Description>

                {request.chair && (
                  <Description>
                    <strong>Location:</strong> {request.chair.location}
                  </Description>
                )}

                <ActionButtons>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => createJobFromRequest(request)}
                  >
                    Create Job
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => markAsReviewed(request.id)}
                  >
                    Mark Reviewed
                  </Button>
                </ActionButtons>
              </RequestCard>
            ))}
          </RequestsGrid>
        )}
      </Container>
    </Layout>
  );
};

export default ServiceRequests;