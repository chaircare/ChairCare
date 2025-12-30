import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { theme } from 'styles/theme';
import { QRScanner } from 'components/QRScanner';
import { PhotoUpload, UploadedPhoto } from 'components/PhotoUpload';
import { Chair, ChairServiceEntry, Service, Part } from 'types/chair-care';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from 'lib/firebase';
import { useRouter } from 'next/router';

const ScanContainer = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background.secondary};
  padding: ${theme.spacing.lg};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
`;

const Title = styled.h1`
  margin: 0 0 ${theme.spacing.sm} 0;
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${theme.colors.text.secondary};
`;

const ScanCard = styled(Card)`
  max-width: 600px;
  margin: 0 auto;
  padding: ${theme.spacing.xl};
`;

const ChairInfo = styled.div`
  background: ${theme.colors.primary[50]};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.lg};
`;

const ChairId = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary[700]};
  margin-bottom: ${theme.spacing.sm};
`;

const ChairDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const DetailLabel = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const DetailValue = styled.span`
  color: ${theme.colors.text.primary};
`;

const ServiceHistory = styled.div`
  margin-top: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: ${theme.colors.background.primary};
  border-radius: ${theme.borderRadius.md};
`;

const HistoryTitle = styled.h4`
  margin: 0 0 ${theme.spacing.sm} 0;
  color: ${theme.colors.text.primary};
`;

const HistoryItem = styled.div`
  padding: ${theme.spacing.sm};
  border-left: 3px solid ${theme.colors.primary[200]};
  margin-bottom: ${theme.spacing.sm};
  background: white;
  border-radius: 0 ${theme.borderRadius.sm} ${theme.borderRadius.sm} 0;
`;

const ServiceForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const Label = styled.label`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`;

const Input = styled.input`
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const Select = styled.select`
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const TextArea = styled.textarea`
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  
  &:hover {
    background: ${theme.colors.gray[50]};
  }
`;

const Checkbox = styled.input`
  margin: 0;
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const RadioItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  
  &:hover {
    background: ${theme.colors.gray[50]};
  }
`;

const PartsSection = styled.div`
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
`;

const PartItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.sm};
  border-bottom: 1px solid ${theme.colors.border.secondary};
  
  &:last-child {
    border-bottom: none;
  }
`;

const PartName = styled.div`
  flex: 1;
`;

const QuantityInput = styled.input`
  width: 80px;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.sm};
  text-align: center;
`;

const FormActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${theme.spacing.lg};
`;

const SERVICES = [
  'Gas lift replacement',
  'Mechanism repair',
  'Upholstery repair',
  'Chair cleaning',
  'Battery replacement',
  'Armrest repair',
  'Wheel/caster replacement',
  'Full refurbishment',
  'Inspection only',
  'Preventive maintenance'
];

const PARTS = [
  { id: 'gas-lift-std', name: 'Gas Lift - Standard', price: 150 },
  { id: 'gas-lift-hd', name: 'Gas Lift - Heavy Duty', price: 200 },
  { id: 'mechanism-synchro', name: 'Synchro Mechanism', price: 300 },
  { id: 'mechanism-tilt', name: 'Tilt Mechanism', price: 250 },
  { id: 'armrest-pair', name: 'Armrest Set (Pair)', price: 180 },
  { id: 'wheels-set', name: 'Wheel Set (5 wheels)', price: 120 },
  { id: 'battery-12v', name: '12V Battery', price: 80 },
  { id: 'fabric-repair', name: 'Fabric Patch Kit', price: 45 },
  { id: 'foam-cushion', name: 'Foam Cushion', price: 90 }
];

interface PhotoFile {
  id: string;
  file: File;
  url: string;
  uploaded?: boolean;
}

const ScanChair: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [chair, setChair] = useState<Chair | null>(null);
  const [loading, setLoading] = useState(false);
  const [beforePhotos, setBeforePhotos] = useState<UploadedPhoto[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<UploadedPhoto[]>([]);
  const [formData, setFormData] = useState({
    issueReported: '',
    issueFound: '',
    servicesPerformed: [] as string[],
    partsUsed: {} as Record<string, number>,
    outcome: 'Repaired Successfully' as 'Repaired Successfully' | 'Requires Workshop' | 'Unrepairable',
    workNotes: ''
  });

  const handleScan = async (chairId: string) => {
    setLoading(true);
    try {
      // Search for chair by chairId field, not document ID
      const chairsQuery = collection(db, 'chairs');
      const snapshot = await getDocs(chairsQuery);
      
      let foundChair = null;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.chairId === chairId || data.qrCode === chairId) {
          foundChair = { id: doc.id, ...data } as Chair;
        }
      });

      if (foundChair) {
        setChair(foundChair);
        // Load service history if available
        // In a real implementation, you'd query the chairServiceEntries collection
      } else {
        alert('Chair not found. Please check the Chair ID.');
      }
    } catch (error) {
      console.error('Error loading chair:', error);
      alert('Error loading chair data.');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceChange = (service: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      servicesPerformed: checked
        ? [...prev.servicesPerformed, service]
        : prev.servicesPerformed.filter(s => s !== service)
    }));
  };

  const handlePartQuantityChange = (partId: string, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      partsUsed: {
        ...prev.partsUsed,
        [partId]: quantity
      }
    }));
  };

  const uploadPhotos = async (photos: UploadedPhoto[]): Promise<string[]> => {
    // Photos are already uploaded, just return their URLs
    return photos.map(photo => photo.url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chair || !user) return;

    setLoading(true);
    try {
      // Upload photos
      const beforePhotoUrls = await uploadPhotos(beforePhotos);
      const afterPhotoUrls = await uploadPhotos(afterPhotos);

      // Prepare parts used array
      const partsUsedArray = Object.entries(formData.partsUsed)
        .filter(([_, quantity]) => quantity > 0)
        .map(([partId, quantity]) => {
          const part = PARTS.find(p => p.id === partId);
          return {
            partId,
            partName: part?.name || partId,
            quantity,
            unitPrice: part?.price || 0
          };
        });

      // Create service entry
      const serviceEntry = {
        chairId: chair.id,
        chairIdCode: chair.chairId, // Store the CC-XXXXXX code
        jobId: 'MANUAL-' + Date.now(), // In real app, this would come from active job
        serviceDate: serverTimestamp(),
        technicianId: user.id,
        technicianName: user.name,
        issueReported: formData.issueReported,
        issueFound: formData.issueFound,
        servicesPerformed: formData.servicesPerformed,
        partsUsed: partsUsedArray,
        outcome: formData.outcome,
        workNotes: formData.workNotes,
        beforePhotos: beforePhotoUrls,
        afterPhotos: afterPhotoUrls,
        totalCost: partsUsedArray.reduce((sum, part) => sum + (part.unitPrice * part.quantity), 0)
      };

      // Add service entry to collection
      await addDoc(collection(db, 'chairServiceEntries'), serviceEntry);

      // Update chair status and statistics
      let newStatus: Chair['status'] = 'Active';
      if (formData.outcome === 'Requires Workshop') {
        newStatus = 'In Workshop';
      } else if (formData.outcome === 'Unrepairable') {
        newStatus = 'Unrepairable';
      }

      const totalCost = serviceEntry.totalCost;
      await updateDoc(doc(db, 'chairs', chair.id), {
        status: newStatus,
        lastServiceDate: serverTimestamp(),
        totalServices: (chair.totalServices || 0) + 1,
        totalSpent: (chair.totalSpent || 0) + totalCost,
        updatedAt: serverTimestamp()
      });

      alert('Service entry saved successfully!');
      
      // Reset form
      setChair(null);
      setBeforePhotos([]);
      setAfterPhotos([]);
      setFormData({
        issueReported: '',
        issueFound: '',
        servicesPerformed: [],
        partsUsed: {},
        outcome: 'Repaired Successfully',
        workNotes: ''
      });
    } catch (error) {
      console.error('Error saving service entry:', error);
      alert('Error saving service entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Please log in to access this page.</div>;
  }

  return (
    <ScanContainer>
      <Header>
        <Title>Chair Service Entry</Title>
        <Subtitle>Scan QR code or enter Chair ID to begin service entry</Subtitle>
      </Header>

      <ScanCard>
        {!chair ? (
          <QRScanner onScan={handleScan} />
        ) : (
          <>
            <ChairInfo>
              <ChairId>{chair.chairId}</ChairId>
              <ChairDetails>
                <DetailItem>
                  <DetailLabel>Type</DetailLabel>
                  <DetailValue>{chair.category?.name || 'Not specified'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Model</DetailLabel>
                  <DetailValue>{chair.model || 'Not specified'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Location</DetailLabel>
                  <DetailValue>{chair.location || 'Not specified'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Status</DetailLabel>
                  <DetailValue>{chair.status}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Total Services</DetailLabel>
                  <DetailValue>{chair.totalServices || 0}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Total Spent</DetailLabel>
                  <DetailValue>R{(chair.totalSpent || 0).toFixed(2)}</DetailValue>
                </DetailItem>
              </ChairDetails>

              {chair.serviceHistory && chair.serviceHistory.length > 0 && (
                <ServiceHistory>
                  <HistoryTitle>Recent Service History</HistoryTitle>
                  {chair.serviceHistory.slice(0, 3).map((entry, index) => (
                    <HistoryItem key={index}>
                      <div><strong>{entry.serviceDate.toLocaleDateString()}</strong> - {entry.technicianName}</div>
                      <div>{entry.servicesPerformed.join(', ')}</div>
                      <div>{entry.outcome}</div>
                    </HistoryItem>
                  ))}
                </ServiceHistory>
              )}

              <div style={{ marginTop: theme.spacing.md }}>
                <Button variant="outline" size="sm" onClick={() => setChair(null)}>
                  Scan Different Chair
                </Button>
              </div>
            </ChairInfo>

            <ServiceForm onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Issue Reported</Label>
                <Input
                  type="text"
                  value={formData.issueReported}
                  onChange={(e) => setFormData(prev => ({ ...prev, issueReported: e.target.value }))}
                  placeholder="What issue was reported by the client?"
                />
              </FormGroup>

              <FormGroup>
                <Label>Issue Found</Label>
                <TextArea
                  value={formData.issueFound}
                  onChange={(e) => setFormData(prev => ({ ...prev, issueFound: e.target.value }))}
                  placeholder="Describe the actual issue found during inspection..."
                />
              </FormGroup>

              <FormGroup>
                <Label>Before Photos</Label>
                <PhotoUpload
                  existingPhotos={beforePhotos}
                  onPhotosChange={setBeforePhotos}
                  maxPhotos={5}
                  category="before"
                />
              </FormGroup>

              <FormGroup>
                <Label>Services Performed</Label>
                <CheckboxGroup>
                  {SERVICES.map(service => (
                    <CheckboxItem key={service}>
                      <Checkbox
                        type="checkbox"
                        checked={formData.servicesPerformed.includes(service)}
                        onChange={(e) => handleServiceChange(service, e.target.checked)}
                      />
                      {service}
                    </CheckboxItem>
                  ))}
                </CheckboxGroup>
              </FormGroup>

              <FormGroup>
                <Label>Parts Used</Label>
                <PartsSection>
                  {PARTS.map(part => (
                    <PartItem key={part.id}>
                      <PartName>
                        <div>{part.name}</div>
                        <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
                          R{part.price.toFixed(2)} each
                        </div>
                      </PartName>
                      <QuantityInput
                        type="number"
                        min="0"
                        max="10"
                        value={formData.partsUsed[part.id] || 0}
                        onChange={(e) => handlePartQuantityChange(part.id, parseInt(e.target.value) || 0)}
                      />
                    </PartItem>
                  ))}
                </PartsSection>
              </FormGroup>

              <FormGroup>
                <Label>After Photos</Label>
                <PhotoUpload
                  existingPhotos={afterPhotos}
                  onPhotosChange={setAfterPhotos}
                  maxPhotos={5}
                  category="after"
                />
              </FormGroup>

              <FormGroup>
                <Label>Outcome</Label>
                <RadioGroup>
                  <RadioItem>
                    <input
                      type="radio"
                      name="outcome"
                      value="Repaired Successfully"
                      checked={formData.outcome === 'Repaired Successfully'}
                      onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value as any }))}
                    />
                    Repaired Successfully
                  </RadioItem>
                  <RadioItem>
                    <input
                      type="radio"
                      name="outcome"
                      value="Requires Workshop"
                      checked={formData.outcome === 'Requires Workshop'}
                      onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value as any }))}
                    />
                    Requires Workshop
                  </RadioItem>
                  <RadioItem>
                    <input
                      type="radio"
                      name="outcome"
                      value="Unrepairable"
                      checked={formData.outcome === 'Unrepairable'}
                      onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value as any }))}
                    />
                    Unrepairable
                  </RadioItem>
                </RadioGroup>
              </FormGroup>

              <FormGroup>
                <Label>Work Notes</Label>
                <TextArea
                  value={formData.workNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, workNotes: e.target.value }))}
                  placeholder="Detailed notes about the work performed, recommendations, future maintenance needs..."
                />
              </FormGroup>

              <FormActions>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setChair(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || formData.servicesPerformed.length === 0}
                >
                  {loading ? 'Saving...' : 'Save Service Entry'}
                </Button>
              </FormActions>
            </ServiceForm>
          </>
        )}
      </ScanCard>
    </ScanContainer>
  );
};

export default ScanChair;
