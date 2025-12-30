import React, { useState, useRef, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import apiClient from 'lib/api-client';
import { useAuth } from 'contexts/AuthContext';
import { useTheme } from 'contexts/ThemeContext';
import { Chair, ServiceLog, ChairServiceEntry } from 'types/chair-care';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { Input } from 'components/ui/Input';
import { ChairServiceHistory } from 'components/ChairServiceHistory';
import { PhotoUpload, UploadedPhoto } from 'components/PhotoUpload';
import { QRScannerIcon } from 'components/icons/IconSystem';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from 'lib/firebase';

const ScanContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const ScanCard = styled(Card)<{ theme: any }>`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.primary};
`;

const ScanIcon = styled.div<{ theme: any; mode: string }>`
  width: 4rem;
  height: 4rem;
  background: ${props => props.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(3, 105, 161, 0.3) 100%)'
    : 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
  };
  border-radius: ${props => props.theme.borderRadius['2xl']};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${props => props.theme.spacing.lg};
  color: ${props => props.mode === 'dark' ? '#60a5fa' : '#ffffff'};
  box-shadow: ${props => props.theme.shadows.lg};
`;

const ScanTitle = styled.h2<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const ScanSubtitle = styled.p<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.xl} 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const QRInputSection = styled.div<{ theme: any }>`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const ChairInfoCard = styled(Card)<{ theme: any; mode: string }>`
  background: ${props => props.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(3, 105, 161, 0.1) 100%)'
    : 'linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(3, 105, 161, 0.05) 100%)'
  };
  border: 1px solid ${props => props.theme.colors.primary[200]};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const InfoGrid = styled.div<{ theme: any }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const InfoItem = styled.div`
  text-align: center;
`;

const InfoLabel = styled.div<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  margin-bottom: ${props => props.theme.spacing.sm};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const InfoValue = styled.div<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.colors.text.primary};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const ServiceForm = styled.form<{ theme: any }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const Select = styled.select<{ theme: any }>`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-family: ${props => props.theme.typography.fontFamily.sans.join(', ')};
  transition: all 0.2s ease-in-out;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary[100]};
  }
`;

const TextArea = styled.textarea<{ theme: any }>`
  width: 100%;
  min-height: 120px;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-family: ${props => props.theme.typography.fontFamily.sans.join(', ')};
  resize: vertical;
  transition: all 0.2s ease-in-out;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary[100]};
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.text.tertiary};
  }
`;

const AlertMessage = styled.div<{ type: 'error' | 'success'; theme: any }>`
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  
  ${({ type, theme }) => type === 'error' ? `
    background: ${theme.colors.error[50]};
    color: ${theme.colors.error[700]};
    border: 1px solid ${theme.colors.error[200]};
  ` : `
    background: ${theme.colors.success[50]};
    color: ${theme.colors.success[700]};
    border: 1px solid ${theme.colors.success[200]};
  `}
`;

const ScanPage: NextPage = () => {
  const { user } = useAuth();
  const { theme, mode } = useTheme();
  const router = useRouter();
  const [qrCode, setQrCode] = useState('');
  const [chair, setChair] = useState<Chair | null>(null);
  const [serviceHistory, setServiceHistory] = useState<ServiceLog[]>([]);
  const [serviceType, setServiceType] = useState<'cleaning' | 'repair'>('cleaning');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleScan = async () => {
    if (!qrCode.trim()) {
      setError('Please enter a QR code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiClient.post('/api/chairs/scan', { qrCode: qrCode.trim() });
      
      if (response.data.success) {
        setChair(response.data.data);
        // Load service history for this chair
        const historyResponse = await apiClient.get(`/api/service-logs?chairId=${response.data.data.id}`);
        if (historyResponse.data.success) {
          setServiceHistory(historyResponse.data.data);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Chair not found');
      setChair(null);
      setServiceHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chair || !description.trim() || !user) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/service-requests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chairId: chair.id,
          serviceType,
          description: description.trim(),
          userId: user.id,
          photos: photos.map(photo => ({
            url: photo.url,
            filename: photo.filename,
            category: photo.category
          }))
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`${serviceType} request submitted successfully! Request ID: ${data.data.id.slice(-6)}`);
        setDescription('');
        setPhotos([]);
        
        // Refresh chair data to show updated status
        const chairResponse = await apiClient.post('/api/chairs/scan', { qrCode: qrCode.trim() });
        if (chairResponse.data.success) {
          setChair(chairResponse.data.data);
        }
      } else {
        setError(data.error || 'Failed to submit service request');
      }
    } catch (err: any) {
      setError('Failed to submit service request. Please try again.');
      console.error('Service request error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Layout showBackButton={true} backButtonText="Back to Dashboard" onBackClick={() => router.push('/dashboard')}>
      <ScanContainer>
        <ScanCard theme={theme}>
          <Card.Content>
            <ScanIcon theme={theme} mode={mode}>
              <QRScannerIcon size={32} />
            </ScanIcon>
            <ScanTitle theme={theme}>Scan Chair QR Code</ScanTitle>
            <ScanSubtitle theme={theme}>
              Point your camera at the QR code on the chair or enter the code manually
            </ScanSubtitle>
            
            <QRInputSection theme={theme}>
              <Input
                placeholder="Enter QR code or scan with camera"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                fullWidth
              />
              <div style={{ marginTop: theme.spacing.lg }}>
                <Button 
                  onClick={handleScan} 
                  loading={loading}
                  fullWidth
                  size="lg"
                >
                  {loading ? 'Finding Chair...' : 'Find Chair'}
                </Button>
              </div>
            </QRInputSection>
          </Card.Content>
        </ScanCard>

        {error && <AlertMessage type="error" theme={theme}>{error}</AlertMessage>}
        {success && <AlertMessage type="success" theme={theme}>{success}</AlertMessage>}

        {chair && (
          <>
            <ChairInfoCard theme={theme} mode={mode}>
              <Card.Header>
                <Card.Title>Chair Information</Card.Title>
              </Card.Header>
              <Card.Content>
                <InfoGrid theme={theme}>
                  <InfoItem>
                    <InfoLabel theme={theme}>Chair Number</InfoLabel>
                    <InfoValue theme={theme}>{chair.chairNumber}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel theme={theme}>Location</InfoLabel>
                    <InfoValue theme={theme}>{chair.location}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel theme={theme}>Model</InfoLabel>
                    <InfoValue theme={theme}>{chair.model || 'Not specified'}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel theme={theme}>QR Code</InfoLabel>
                    <InfoValue theme={theme}>{chair.qrCode}</InfoValue>
                  </InfoItem>
                </InfoGrid>
              </Card.Content>
            </ChairInfoCard>

            <Card>
              <Card.Header>
                <Card.Title>Request Service</Card.Title>
              </Card.Header>
              <Card.Content>
                <ServiceForm theme={theme} onSubmit={handleServiceSubmit}>
                  <div>
                    <InfoLabel theme={theme} style={{ marginBottom: theme.spacing.sm }}>Service Type</InfoLabel>
                    <Select
                      theme={theme}
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value as 'cleaning' | 'repair')}
                    >
                      <option value="cleaning">🧽 Cleaning Service</option>
                      <option value="repair">🔧 Repair Service</option>
                    </Select>
                  </div>

                  <div>
                    <InfoLabel theme={theme} style={{ marginBottom: theme.spacing.sm }}>Description</InfoLabel>
                    <TextArea
                      theme={theme}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the service needed in detail..."
                      required
                    />
                  </div>

                  <div>
                    <InfoLabel theme={theme} style={{ marginBottom: theme.spacing.sm }}>
                      📸 Current Chair Condition (Before Service)
                    </InfoLabel>
                    <div style={{ 
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.secondary,
                      marginBottom: theme.spacing.md,
                      lineHeight: 1.6,
                      padding: theme.spacing.md,
                      background: mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff',
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
                      chairId={chair.id}
                      existingPhotos={photos}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    loading={submitting}
                    fullWidth
                    size="lg"
                    variant="success"
                  >
                    {submitting ? 'Submitting...' : `Request ${serviceType}`}
                  </Button>
                </ServiceForm>
              </Card.Content>
            </Card>

            {/* Service History */}
            <ChairServiceHistory chair={chair} />
          </>
        )}
      </ScanContainer>
    </Layout>
  );
};

export default ScanPage;