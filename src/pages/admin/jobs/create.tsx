import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { theme } from 'styles/theme';
import { User } from 'types/chair-care';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from 'lib/firebase';
import { useRouter } from 'next/router';

const CreateJobContainer = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background.secondary};
  padding: ${theme.spacing.lg};
`;

const Header = styled.div`
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

const FormCard = styled(Card)`
  max-width: 600px;
  padding: ${theme.spacing.xl};
`;

const Form = styled.form`
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
  border: 1px solid ${theme.colors.border.primary};
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
  border: 1px solid ${theme.colors.border.primary};
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
  border: 1px solid ${theme.colors.border.primary};
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

const FormActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${theme.spacing.lg};
`;

const CreateJob: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<User[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    jobType: 'On-site' as 'On-site' | 'Workshop' | 'Assessment',
    scheduledDate: '',
    scheduledTime: '',
    assignedTechnicianId: '',
    location: '',
    adminNotes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load clients
      const clientsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'client')
      );
      const clientsSnapshot = await getDocs(clientsQuery);
      const clientsData = clientsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as User[];
      
      // Load active technicians
      const techniciansQuery = query(
        collection(db, 'users'),
        where('role', '==', 'technician'),
        where('status', '==', 'active')
      );
      const techniciansSnapshot = await getDocs(techniciansQuery);
      const techniciansData = techniciansSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as User[];
      
      setClients(clientsData);
      setTechnicians(techniciansData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const generateJobId = () => {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `JOB-${year}-${timestamp}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) return;

    setLoading(true);
    try {
      const selectedClient = clients.find(c => c.id === formData.clientId);
      const selectedTechnician = technicians.find(t => t.id === formData.assignedTechnicianId);
      if (!selectedClient) return;

      const jobData = {
        jobId: generateJobId(),
        clientId: formData.clientId,
        clientName: selectedClient.companyName || selectedClient.name,
        jobType: formData.jobType,
        status: 'New' as const,
        scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate) : null,
        scheduledTime: formData.scheduledTime || null,
        assignedTechnicianId: formData.assignedTechnicianId || null,
        assignedTechnicianName: selectedTechnician?.name || null,
        location: formData.location || null,
        adminNotes: formData.adminNotes || null,
        chairs: [],
        createdAt: serverTimestamp(),
        createdBy: user?.id || 'admin'
      };

      const docRef = await addDoc(collection(db, 'jobs'), jobData);
      router.push(`/admin/jobs/${docRef.id}`);
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!user || user.role !== 'admin') {
    return <div>Access denied</div>;
  }

  return (
    <CreateJobContainer>
      <Header>
        <Title>Create New Job</Title>
        <Subtitle>Set up a new service job for a client</Subtitle>
      </Header>

      <FormCard>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="clientId">Client *</Label>
            <Select
              id="clientId"
              name="clientId"
              value={formData.clientId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.companyName || client.name} ({client.email})
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="jobType">Job Type *</Label>
            <Select
              id="jobType"
              name="jobType"
              value={formData.jobType}
              onChange={handleInputChange}
              required
            >
              <option value="On-site">On-site Service</option>
              <option value="Workshop">Workshop Service</option>
              <option value="Assessment">Assessment Only</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="scheduledDate">Scheduled Date</Label>
            <Input
              type="date"
              id="scheduledDate"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleInputChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="scheduledTime">Scheduled Time</Label>
            <Input
              type="time"
              id="scheduledTime"
              name="scheduledTime"
              value={formData.scheduledTime}
              onChange={handleInputChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="assignedTechnicianId">Assign Technician</Label>
            <Select
              id="assignedTechnicianId"
              name="assignedTechnicianId"
              value={formData.assignedTechnicianId}
              onChange={handleInputChange}
            >
              <option value="">Select a technician (optional)</option>
              {technicians.map(technician => (
                <option key={technician.id} value={technician.id}>
                  {technician.name} - {technician.specialization || 'General'}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="location">Location</Label>
            <Input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Service location (if different from client address)"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="adminNotes">Admin Notes</Label>
            <TextArea
              id="adminNotes"
              name="adminNotes"
              value={formData.adminNotes}
              onChange={handleInputChange}
              placeholder="Internal notes about this job..."
            />
          </FormGroup>

          <FormActions>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !formData.clientId}
            >
              {loading ? 'Creating...' : 'Create Job'}
            </Button>
          </FormActions>
        </Form>
      </FormCard>
    </CreateJobContainer>
  );
};

export default CreateJob;