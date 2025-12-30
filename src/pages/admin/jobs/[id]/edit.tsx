import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { useTheme } from 'contexts/ThemeContext';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { Input } from 'components/ui/Input';
import { Job } from 'types/chair-care';
import { formatCurrency, SERVICE_PRICING, getEstimatedPrice } from 'utils/pricing';
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from 'lib/firebase';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const FormCard = styled(Card)<{ theme: any }>`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const FormGrid = styled.div<{ theme: any }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div<{ theme: any }>`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Label = styled.label<{ theme: any }>`
  display: block;
  margin-bottom: ${props => props.theme.spacing.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
`;

const Select = styled.select<{ theme: any }>`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.base};
  
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
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary[100]};
  }
`;

const ActionButtons = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.xl};
`;

const LoadingContainer = styled.div<{ theme: any }>`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: ${props => props.theme.colors.text.secondary};
`;

const ErrorMessage = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.error[50]};
  color: ${props => props.theme.colors.error[700]};
  border: 1px solid ${props => props.theme.colors.error[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SuccessMessage = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.success[50]};
  color: ${props => props.theme.colors.success[700]};
  border: 1px solid ${props => props.theme.colors.success[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const EditJobPage: NextPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = router.query;

  const [job, setJob] = useState<Job | null>(null);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    clientName: '',
    jobType: '',
    serviceType: '',
    status: '',
    scheduledDate: '',
    scheduledTime: '',
    assignedTechnicianId: '',
    assignedTechnicianName: '',
    adminNotes: '',
    location: '',
    estimatedPrice: 0,
    finalPrice: 0
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (id) {
      loadJobData();
      loadTechnicians();
    }
  }, [user, router, id]);

  const loadJobData = async () => {
    try {
      setLoading(true);
      const jobDoc = await getDoc(doc(db, 'jobs', id as string));
      
      if (!jobDoc.exists()) {
        setError('Job not found');
        return;
      }

      const jobData = { id: jobDoc.id, ...jobDoc.data() } as Job;
      setJob(jobData);

      // Populate form data
      setFormData({
        clientName: jobData.clientName || '',
        jobType: jobData.jobType || '',
        serviceType: jobData.serviceType || '',
        status: jobData.status || '',
        scheduledDate: jobData.scheduledDate ? 
          new Date(jobData.scheduledDate).toISOString().split('T')[0] : '',
        scheduledTime: jobData.scheduledTime || '',
        assignedTechnicianId: jobData.assignedTechnicianId || '',
        assignedTechnicianName: jobData.assignedTechnicianName || '',
        adminNotes: jobData.adminNotes || '',
        location: jobData.location || '',
        estimatedPrice: jobData.estimatedPrice || 0,
        finalPrice: jobData.finalPrice || 0
      });

    } catch (error) {
      console.error('Error loading job:', error);
      setError('Failed to load job data');
    } finally {
      setLoading(false);
    }
  };

  const loadTechnicians = async () => {
    try {
      const techQuery = query(
        collection(db, 'users'),
        where('role', '==', 'technician')
      );
      const techSnapshot = await getDocs(techQuery);
      const techData = techSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTechnicians(techData);
    } catch (error) {
      console.error('Error loading technicians:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // If technician is selected, update the name as well
    if (field === 'assignedTechnicianId') {
      const selectedTech = technicians.find(tech => tech.id === value);
      setFormData(prev => ({ 
        ...prev, 
        assignedTechnicianId: value,
        assignedTechnicianName: selectedTech ? selectedTech.name : ''
      }));
    }
    
    // If service type changes, recalculate estimated price
    if (field === 'serviceType' && value && job) {
      const chairCount = job.chairs?.length || 1;
      const estimatedPrice = getEstimatedPrice(value as keyof typeof SERVICE_PRICING, chairCount);
      setFormData(prev => ({ 
        ...prev, 
        serviceType: value,
        estimatedPrice: estimatedPrice
      }));
    }
  };

  const calculateEstimatedPrice = () => {
    if (!formData.serviceType || !job) return 0;
    const chairCount = job.chairs?.length || 1;
    return getEstimatedPrice(formData.serviceType as keyof typeof SERVICE_PRICING, chairCount);
  };

  const handleSave = async () => {
    if (!job) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updateData: any = {
        ...formData,
        updatedAt: new Date()
      };

      // Convert date string back to Date object if provided
      if (formData.scheduledDate) {
        updateData.scheduledDate = new Date(formData.scheduledDate);
      }

      await updateDoc(doc(db, 'jobs', job.id), updateData);
      
      setSuccess('Job updated successfully!');
      
      // Redirect back to jobs list after a short delay
      setTimeout(() => {
        router.push('/admin/jobs');
      }, 2000);

    } catch (error) {
      console.error('Error updating job:', error);
      setError('Failed to update job. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <Layout showBackButton={true} backButtonText="Back to Jobs" onBackClick={() => router.push('/admin/jobs')}>
        <Container theme={theme}>
          <LoadingContainer theme={theme}>Loading job data...</LoadingContainer>
        </Container>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout showBackButton={true} backButtonText="Back to Jobs" onBackClick={() => router.push('/admin/jobs')}>
        <Container theme={theme}>
          <ErrorMessage theme={theme}>Job not found</ErrorMessage>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout showBackButton={true} backButtonText="Back to Jobs" onBackClick={() => router.push('/admin/jobs')}>
      <Container theme={theme}>
        <FormCard theme={theme}>
          <Card.Header>
            <Card.Title>Edit Job: {job.jobId}</Card.Title>
          </Card.Header>
          <Card.Content>
            {error && <ErrorMessage theme={theme}>{error}</ErrorMessage>}
            {success && <SuccessMessage theme={theme}>{success}</SuccessMessage>}

            <FormGrid theme={theme}>
              <FormGroup theme={theme}>
                <Label theme={theme}>Client Name</Label>
                <Input
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="Enter client name"
                />
              </FormGroup>

              <FormGroup theme={theme}>
                <Label theme={theme}>Job Type</Label>
                <Select
                  theme={theme}
                  value={formData.jobType}
                  onChange={(e) => handleInputChange('jobType', e.target.value)}
                >
                  <option value="">Select job type</option>
                  <option value="On-site">On-site</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Assessment">Assessment</option>
                </Select>
              </FormGroup>

              <FormGroup theme={theme}>
                <Label theme={theme}>Service Type</Label>
                <Select
                  theme={theme}
                  value={formData.serviceType}
                  onChange={(e) => handleInputChange('serviceType', e.target.value)}
                >
                  <option value="">Select service type</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="repair">Repair</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inspection">Inspection</option>
                  <option value="assessment">Assessment</option>
                </Select>
              </FormGroup>

              <FormGroup theme={theme}>
                <Label theme={theme}>Status</Label>
                <Select
                  theme={theme}
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="">Select status</option>
                  <option value="New">New</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Invoiced">Invoiced</option>
                  <option value="Paid">Paid</option>
                  <option value="Cancelled">Cancelled</option>
                </Select>
              </FormGroup>

              <FormGroup theme={theme}>
                <Label theme={theme}>Assigned Technician</Label>
                <Select
                  theme={theme}
                  value={formData.assignedTechnicianId}
                  onChange={(e) => handleInputChange('assignedTechnicianId', e.target.value)}
                >
                  <option value="">Select technician</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup theme={theme}>
                <Label theme={theme}>Scheduled Date</Label>
                <Input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                />
              </FormGroup>

              <FormGroup theme={theme}>
                <Label theme={theme}>Scheduled Time</Label>
                <Input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                />
              </FormGroup>

              <FormGroup theme={theme}>
                <Label theme={theme}>Estimated Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.estimatedPrice}
                  onChange={(e) => handleInputChange('estimatedPrice', e.target.value)}
                  placeholder="0.00"
                />
                {formData.serviceType && job && (
                  <div style={{ 
                    fontSize: theme.typography.fontSize.sm, 
                    color: theme.colors.text.secondary,
                    marginTop: theme.spacing.xs 
                  }}>
                    Auto-calculated: {formatCurrency(calculateEstimatedPrice())} 
                    ({job.chairs?.length || 1} chairs)
                  </div>
                )}
              </FormGroup>

              <FormGroup theme={theme}>
                <Label theme={theme}>Final Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.finalPrice}
                  onChange={(e) => handleInputChange('finalPrice', e.target.value)}
                  placeholder="0.00"
                />
                <div style={{ 
                  fontSize: theme.typography.fontSize.sm, 
                  color: theme.colors.text.secondary,
                  marginTop: theme.spacing.xs 
                }}>
                  Final price after job completion
                </div>
              </FormGroup>
            </FormGrid>

            <FormGroup theme={theme}>
              <Label theme={theme}>Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter job location"
              />
            </FormGroup>

            <FormGroup theme={theme}>
              <Label theme={theme}>Admin Notes</Label>
              <TextArea
                theme={theme}
                value={formData.adminNotes}
                onChange={(e) => handleInputChange('adminNotes', e.target.value)}
                placeholder="Enter any additional notes or instructions..."
              />
            </FormGroup>

            <ActionButtons theme={theme}>
              <Button
                variant="outline"
                onClick={() => router.push('/admin/jobs')}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                loading={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </ActionButtons>
          </Card.Content>
        </FormCard>
      </Container>
    </Layout>
  );
};

export default EditJobPage;