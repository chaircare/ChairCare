import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { theme } from 'styles/theme';
import { Chair, ServiceLog } from 'types/chair-care';
import { ChairServiceHistory } from 'components/ChairServiceHistory';
import { PhotoUpload, UploadedPhoto } from 'components/PhotoUpload';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from 'lib/firebase';

const Container = styled.div`
  padding: ${theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.xl};
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
    gap: ${theme.spacing.lg};
  }
`;

const ChairInfo = styled.div`
  flex: 1;
`;

const ChairTitle = styled.h1`
  margin: 0 0 ${theme.spacing.md} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
`;

const ChairDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

const DetailCard = styled(Card)`
  padding: ${theme.spacing.lg};
  text-align: center;
`;

const DetailValue = styled.div`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary[600]};
  margin-bottom: ${theme.spacing.sm};
`;

const DetailLabel = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: ${theme.typography.fontWeight.medium};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.md}) {
    width: 100%;
    flex-direction: column;
  }
`;

const RequestModal = styled.div<{ isOpen: boolean }>`
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
  padding: ${theme.spacing.lg};
`;

const RequestForm = styled(Card)`
  padding: ${theme.spacing.xl};
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const FormTitle = styled.h2`
  margin: 0 0 ${theme.spacing.lg} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const FormGroup = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${theme.spacing.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`;

const Select = styled.select`
  width: 100%;
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  background: ${theme.colors.background.primary};
  color: ${theme.colors.text.primary};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  font-family: ${theme.typography.fontFamily.sans.join(', ')};
  background: ${theme.colors.background.primary};
  color: ${theme.colors.text.primary};
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const UrgencySelect = styled(Select)<{ urgency: string }>`
  border-color: ${props => {
    switch (props.urgency) {
      case 'high': return theme.colors.error[400];
      case 'medium': return theme.colors.warning[400];
      case 'low': return theme.colors.success[400];
      default: return theme.colors.gray[300];
    }
  }};
`;

const FormActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${theme.spacing.xl};
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
`;

const ErrorState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.error[600]};
`;

const SuccessMessage = styled.div`
  padding: ${theme.spacing.md};
  background: ${theme.colors.success[50]};
  border: 1px solid ${theme.colors.success[200]};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.success[700]};
  margin-bottom: ${theme.spacing.lg};
`;

const ChairHistoryPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  
  const [chair, setChair] = useState<Chair | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form state
  const [serviceType, setServiceType] = useState('repair');
  const [urgency, setUrgency] = useState('medium');
  const [description, setDescription] = useState('');
  const [issueDetails, setIssueDetails] = useState('');
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);

  useEffect(() => {
    if (id && user?.role === 'client') {
      loadChairData();
    }
  }, [id, user]);

  useEffect(() => {
    // Check if we should auto-open the request modal
    if (router.query.request === 'true' && chair) {
      setShowRequestModal(true);
    }
  }, [router.query.request, chair]);

  const loadChairData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const chairDoc = await getDoc(doc(db, 'chairs', id as string));
      
      if (!chairDoc.exists()) {
        setError('Chair not found');
        return;
      }
      
      const chairData = { id: chairDoc.id, ...chairDoc.data() } as Chair;
      
      // Verify the chair belongs to the client's company
      if (chairData.clientId !== user?.id) {
        setError('Access denied. This chair does not belong to your organization.');
        return;
      }
      
      setChair(chairData);
      
    } catch (error) {
      console.error('Error loading chair data:', error);
      setError('Failed to load chair information');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chair || !user) return;
    
    try {
      setSubmitting(true);
      
      const serviceRequest: Omit<ServiceLog, 'id'> = {
        chairId: chair.id,
        chairNumber: chair.chairNumber,
        clientId: user.id,
        clientName: user.name,
        companyName: user.companyName || '',
        location: chair.location,
        serviceType: serviceType as 'cleaning' | 'repair' | 'maintenance',
        urgency: urgency as 'low' | 'medium' | 'high',
        description,
        issueDetails,
        status: 'pending',
        createdAt: new Date(), // Use current date instead of serverTimestamp for type compatibility
        requestedBy: user.name,
        contactEmail: user.email,
        contactPhone: user.phone || '',
        beforePhotos: photos.map(photo => photo.url),
        afterPhotos: [],
        cost: 0 // Will be calculated later
      };
      
      await addDoc(collection(db, 'serviceLogs'), serviceRequest);
      
      setSuccessMessage('Service request submitted successfully! Our team will contact you soon.');
      setShowRequestModal(false);
      
      // Reset form
      setServiceType('repair');
      setUrgency('medium');
      setDescription('');
      setIssueDetails('');
      setPhotos([]);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
      
    } catch (error) {
      console.error('Error submitting service request:', error);
      alert('Failed to submit service request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(d);
  };

  const getConditionColor = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'excellent': return theme.colors.success[600];
      case 'good': return theme.colors.primary[600];
      case 'fair': return theme.colors.warning[600];
      case 'poor': return theme.colors.error[600];
      default: return theme.colors.gray[600];
    }
  };

  if (user?.role !== 'client') {
    return (
      <Layout>
        <Container>
          <ErrorState>Access denied. Client access required.</ErrorState>
        </Container>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <Container>
          <LoadingState>Loading chair information...</LoadingState>
        </Container>
      </Layout>
    );
  }

  if (error || !chair) {
    return (
      <Layout>
        <Container>
          <ErrorState>{error || 'Chair not found'}</ErrorState>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        {successMessage && (
          <SuccessMessage>{successMessage}</SuccessMessage>
        )}
        
        <Header>
          <ChairInfo>
            <ChairTitle>Chair {chair.chairNumber}</ChairTitle>
            <p style={{ 
              color: theme.colors.text.secondary, 
              fontSize: theme.typography.fontSize.lg,
              margin: 0 
            }}>
              {chair.location} • {chair.model || 'Office Chair'}
            </p>
          </ChairInfo>
          
          <ActionButtons>
            <Button 
              variant="primary" 
              onClick={() => setShowRequestModal(true)}
            >
              Request Service
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.back()}
            >
              Back
            </Button>
          </ActionButtons>
        </Header>

        <ChairDetails>
          <DetailCard>
            <DetailValue style={{ color: getConditionColor(chair.condition || 'good') }}>
              {chair.condition || 'Unknown'}
            </DetailValue>
            <DetailLabel>Condition</DetailLabel>
          </DetailCard>
          
          <DetailCard>
            <DetailValue>{chair.location}</DetailValue>
            <DetailLabel>Location</DetailLabel>
          </DetailCard>
          
          <DetailCard>
            <DetailValue>{chair.model || 'Standard'}</DetailValue>
            <DetailLabel>Model</DetailLabel>
          </DetailCard>
          
          {chair.purchaseDate && (
            <DetailCard>
              <DetailValue>{formatDate(chair.purchaseDate)}</DetailValue>
              <DetailLabel>Purchase Date</DetailLabel>
            </DetailCard>
          )}
        </ChairDetails>

        <ChairServiceHistory chair={chair} />

        <RequestModal isOpen={showRequestModal}>
          <RequestForm>
            <FormTitle>Request Service</FormTitle>
            
            <form onSubmit={handleSubmitRequest}>
              <FormGroup>
                <Label htmlFor="serviceType">Service Type</Label>
                <Select
                  id="serviceType"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  required
                >
                  <option value="repair">Repair</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="maintenance">Maintenance</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="urgency">Urgency Level</Label>
                <UrgencySelect
                  id="urgency"
                  value={urgency}
                  urgency={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  required
                >
                  <option value="low">Low - Can wait a few days</option>
                  <option value="medium">Medium - Within 1-2 days</option>
                  <option value="high">High - Urgent, same day if possible</option>
                </UrgencySelect>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="description">Brief Description</Label>
                <TextArea
                  id="description"
                  placeholder="Briefly describe the issue or service needed..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="issueDetails">Detailed Issue Description</Label>
                <TextArea
                  id="issueDetails"
                  placeholder="Provide detailed information about the problem, when it started, how it affects usage, etc..."
                  value={issueDetails}
                  onChange={(e) => setIssueDetails(e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label>📸 Current Chair Condition (Before Service)</Label>
                <div style={{ 
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary,
                  marginBottom: theme.spacing.md,
                  lineHeight: 1.6,
                  padding: theme.spacing.md,
                  background: '#eff6ff',
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.primary[200]}`
                }}>
                  <strong>📋 Document Current Condition:</strong><br />
                  • Take clear photos showing the chair's current state<br />
                  • Capture any damage, stains, wear, or issues<br />
                  • Include multiple angles (front, back, seat, arms)<br />
                  • These "before" photos help technicians assess the work needed<br />
                  <br />
                  <em>💡 Tip: Good lighting makes photos more helpful!</em>
                </div>
                <PhotoUpload
                  onPhotosChange={setPhotos}
                  maxPhotos={8}
                  category="before"
                  chairId={chair?.id}
                  existingPhotos={photos}
                />
              </FormGroup>

              <FormActions>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRequestModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </FormActions>
            </form>
          </RequestForm>
        </RequestModal>
      </Container>
    </Layout>
  );
};

export default ChairHistoryPage;