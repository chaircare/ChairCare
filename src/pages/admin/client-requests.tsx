import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { 
  getPendingClientRequests, 
  approveClientRequest, 
  rejectClientRequest,
  ClientRequest 
} from 'lib/firebase-auth';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { Input } from 'components/ui/Input';
import { theme } from 'styles/theme';

const AdminContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const RequestsGrid = styled.div`
  display: grid;
  gap: ${theme.spacing.xl};
`;

const RequestCard = styled(Card)`
  border-left: 4px solid ${theme.colors.warning[400]};
`;

const RequestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
    gap: ${theme.spacing.md};
  }
`;

const RequestInfo = styled.div`
  flex: 1;
`;

const RequestTitle = styled.h3`
  margin: 0 0 ${theme.spacing.sm} 0;
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`;

const RequestMeta = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  margin-bottom: ${theme.spacing.md};
`;

const RequestDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
`;

const DetailItem = styled.div``;

const DetailLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
  margin-bottom: ${theme.spacing.sm};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const DetailValue = styled.div`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const MessageSection = styled.div`
  background: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
`;

const MessageLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
  margin-bottom: ${theme.spacing.sm};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const MessageText = styled.p`
  margin: 0;
  color: ${theme.colors.text.primary};
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const ActionSection = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  align-items: flex-end;
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const PasswordSection = styled.div`
  flex: 1;
  max-width: 300px;
  
  @media (max-width: ${theme.breakpoints.md}) {
    max-width: none;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
  }
`;

const RejectModal = styled.div`
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
  padding: ${theme.spacing.xl};
`;

const ModalCard = styled(Card)`
  width: 100%;
  max-width: 500px;
`;

const ModalHeader = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const ModalTitle = styled.h3`
  margin: 0 0 ${theme.spacing.sm} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.xl};
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${theme.spacing.lg};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.background.primary};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.base};
  font-family: ${theme.typography.fontFamily.sans.join(', ')};
  resize: vertical;
  transition: all 0.2s ease-in-out;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const AlertMessage = styled.div<{ type: 'error' | 'success' }>`
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  margin-bottom: ${theme.spacing.lg};
  font-weight: ${theme.typography.fontWeight.medium};
  
  ${({ type }) => type === 'error' ? `
    background: ${theme.colors.error[50]};
    color: ${theme.colors.error[700]};
    border: 1px solid ${theme.colors.error[200]};
  ` : `
    background: ${theme.colors.success[50]};
    color: ${theme.colors.success[700]};
    border: 1px solid ${theme.colors.success[200]};
  `}
`;

const EmptyState = styled.div`
  text-align: center;
  color: ${theme.colors.text.secondary};
  padding: ${theme.spacing['3xl']};
  
  h3 {
    margin: 0 0 ${theme.spacing.md} 0;
    color: ${theme.colors.text.primary};
    font-size: ${theme.typography.fontSize.xl};
  }
  
  p {
    margin: 0;
    font-size: ${theme.typography.fontSize.lg};
  }
`;

const ClientRequestsPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [rejectModal, setRejectModal] = useState<{ requestId: string; email: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    loadRequests();
  }, [user, router]);

  const loadRequests = async () => {
    try {
      const pendingRequests = await getPendingClientRequests();
      setRequests(pendingRequests);
      
      // Generate default passwords
      const defaultPasswords: Record<string, string> = {};
      pendingRequests.forEach(request => {
        if (request.id) {
          defaultPasswords[request.id] = generatePassword();
        }
      });
      setPasswords(defaultPasswords);
    } catch (error) {
      console.error('Failed to load requests:', error);
      setMessage({ type: 'error', text: 'Failed to load client requests' });
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleApprove = async (requestId: string) => {
    if (!user || !requestId) return;
    
    const password = passwords[requestId];
    if (!password) {
      setMessage({ type: 'error', text: 'Please set a password for the user' });
      return;
    }

    setProcessing(requestId);
    try {
      const credentials = await approveClientRequest(requestId, user.id, password);
      
      // Here you would typically send an email to the client with their credentials
      // For now, we'll show a success message with the credentials
      setMessage({ 
        type: 'success', 
        text: `Client approved! Credentials: ${credentials.email} / ${credentials.password}` 
      });
      
      // Remove the request from the list
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to approve client' });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!user || !rejectModal || !rejectReason.trim()) return;

    setProcessing(rejectModal.requestId);
    try {
      await rejectClientRequest(rejectModal.requestId, user.id, rejectReason);
      
      setMessage({ type: 'success', text: 'Client request rejected' });
      
      // Remove the request from the list
      setRequests(prev => prev.filter(req => req.id !== rejectModal.requestId));
      setRejectModal(null);
      setRejectReason('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to reject client' });
    } finally {
      setProcessing(null);
    }
  };

  const updatePassword = (requestId: string, password: string) => {
    setPasswords(prev => ({
      ...prev,
      [requestId]: password
    }));
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Layout>
      <AdminContainer>
        <Card.Header>
          <Card.Title>Client Access Requests</Card.Title>
        </Card.Header>

        {message && (
          <AlertMessage type={message.type}>
            {message.text}
          </AlertMessage>
        )}

        {loading ? (
          <Card>
            <Card.Content>
              <div style={{ textAlign: 'center', padding: theme.spacing.xl }}>
                Loading requests...
              </div>
            </Card.Content>
          </Card>
        ) : requests.length === 0 ? (
          <EmptyState>
            <h3>No Pending Requests</h3>
            <p>All client access requests have been processed.</p>
          </EmptyState>
        ) : (
          <RequestsGrid>
            {requests.map((request) => (
              <RequestCard key={request.id}>
                <RequestHeader>
                  <RequestInfo>
                    <RequestTitle>
                      {request.companyName || request.contactPerson}
                    </RequestTitle>
                    <RequestMeta>
                      Submitted: {formatDate(request.createdAt)}
                    </RequestMeta>
                  </RequestInfo>
                </RequestHeader>

                <RequestDetails>
                  <DetailItem>
                    <DetailLabel>Contact Person</DetailLabel>
                    <DetailValue>{request.contactPerson}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Email</DetailLabel>
                    <DetailValue>{request.email}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Phone</DetailLabel>
                    <DetailValue>{request.phone}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Business Type</DetailLabel>
                    <DetailValue>{request.businessType}</DetailValue>
                  </DetailItem>
                </RequestDetails>

                <MessageSection>
                  <MessageLabel>Message</MessageLabel>
                  <MessageText>{request.message}</MessageText>
                </MessageSection>

                <ActionSection>
                  <PasswordSection>
                    <Input
                      label="Temporary Password"
                      value={passwords[request.id!] || ''}
                      onChange={(e) => updatePassword(request.id!, e.target.value)}
                      placeholder="Enter temporary password"
                      fullWidth
                    />
                  </PasswordSection>
                  
                  <ActionButtons>
                    <Button
                      variant="success"
                      onClick={() => handleApprove(request.id!)}
                      loading={processing === request.id}
                      disabled={!passwords[request.id!] || processing !== null}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="error"
                      onClick={() => setRejectModal({ requestId: request.id!, email: request.email })}
                      disabled={processing !== null}
                    >
                      Reject
                    </Button>
                  </ActionButtons>
                </ActionSection>
              </RequestCard>
            ))}
          </RequestsGrid>
        )}

        {rejectModal && (
          <RejectModal>
            <ModalCard>
              <ModalHeader>
                <ModalTitle>Reject Client Request</ModalTitle>
                <p style={{ margin: 0, color: theme.colors.text.secondary }}>
                  Rejecting request from: <strong>{rejectModal.email}</strong>
                </p>
              </ModalHeader>

              <div>
                <label style={{ 
                  display: 'block',
                  marginBottom: theme.spacing.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text.primary,
                  fontSize: theme.typography.fontSize.sm
                }}>
                  Reason for Rejection *
                </label>
                <TextArea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this request..."
                  required
                />
              </div>

              <ModalActions>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setRejectModal(null);
                    setRejectReason('');
                  }}
                  disabled={processing !== null}
                >
                  Cancel
                </Button>
                <Button
                  variant="error"
                  onClick={handleReject}
                  loading={processing === rejectModal.requestId}
                  disabled={!rejectReason.trim()}
                >
                  Reject Request
                </Button>
              </ModalActions>
            </ModalCard>
          </RejectModal>
        )}
      </AdminContainer>
    </Layout>
  );
};

export default ClientRequestsPage;