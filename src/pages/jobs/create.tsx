import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import axios from 'axios';
import { useAuth } from 'contexts/AuthContext';
import { Client, User, CreateJobForm, CreateChairForm } from 'types/chair-care';

const Container = styled.div`
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const Header = styled.header`
  background: white;
  padding: 1rem 2rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h1`
  color: #333;
  margin: 0;
  font-size: 1.5rem;
`;

const BackButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #5a6268;
  }
`;

const MainContent = styled.main`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

const Title = styled.h2`
  margin: 0 0 2rem 0;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ChairsSection = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
`;

const ChairItem = styled.div`
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ChairHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const RemoveButton = styled.button`
  padding: 0.25rem 0.5rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  
  &:hover {
    background-color: #c82333;
  }
`;

const AddButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #218838;
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem 2rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  align-self: flex-start;
  
  &:hover {
    background-color: #0056b3;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  margin-top: 0.5rem;
`;

const CreateJobPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<CreateJobForm>({
    clientId: '',
    jobType: 'on-site',
    scheduledDate: '',
    assignedTechnicianId: '',
    location: '',
    adminNotes: '',
    chairs: [
      {
        chairType: '',
        chairId: '',
        issueReported: '',
        servicesNeeded: [],
        partsNeeded: []
      }
    ]
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    loadData();
  }, [user, router]);

  const loadData = async () => {
    try {
      const [clientsResponse, usersResponse] = await Promise.all([
        axios.get('/api/clients'),
        axios.get('/api/users') // We'll need to create this endpoint
      ]);

      if (clientsResponse.data.success) {
        setClients(clientsResponse.data.data);
      }

      // For now, use mock technicians
      setTechnicians([
        { id: '2', email: 'john@chaircare.co.za', name: 'John Technician', role: 'technician', createdAt: new Date(), updatedAt: new Date() }
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleInputChange = (field: keyof CreateJobForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChairChange = (index: number, field: keyof CreateChairForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      chairs: prev.chairs.map((chair, i) => 
        i === index ? { ...chair, [field]: value } : chair
      )
    }));
  };

  const addChair = () => {
    setFormData(prev => ({
      ...prev,
      chairs: [
        ...prev.chairs,
        {
          chairType: '',
          chairId: '',
          issueReported: '',
          servicesNeeded: [],
          partsNeeded: []
        }
      ]
    }));
  };

  const removeChair = (index: number) => {
    if (formData.chairs.length > 1) {
      setFormData(prev => ({
        ...prev,
        chairs: prev.chairs.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/jobs', formData);
      if (response.data.success) {
        router.push('/dashboard');
      } else {
        setError(response.data.error || 'Failed to create job');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Container>
      <Header>
        <Logo>Chair Care</Logo>
        <BackButton onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </BackButton>
      </Header>

      <MainContent>
        <Card>
          <Title>Create New Job</Title>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="clientId">Client *</Label>
              <Select
                id="clientId"
                value={formData.clientId}
                onChange={(e) => handleInputChange('clientId', e.target.value)}
                required
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.companyName || client.contactPerson}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="jobType">Job Type *</Label>
              <Select
                id="jobType"
                value={formData.jobType}
                onChange={(e) => handleInputChange('jobType', e.target.value as any)}
                required
              >
                <option value="on-site">On-site</option>
                <option value="workshop">Workshop</option>
                <option value="assessment">Assessment</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="scheduledDate">Scheduled Date</Label>
              <Input
                id="scheduledDate"
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="assignedTechnicianId">Assigned Technician</Label>
              <Select
                id="assignedTechnicianId"
                value={formData.assignedTechnicianId}
                onChange={(e) => handleInputChange('assignedTechnicianId', e.target.value)}
              >
                <option value="">Select a technician</option>
                {technicians.map(tech => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="If different from client address"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="adminNotes">Admin Notes</Label>
              <TextArea
                id="adminNotes"
                value={formData.adminNotes}
                onChange={(e) => handleInputChange('adminNotes', e.target.value)}
                placeholder="Internal notes not visible to technician"
              />
            </FormGroup>

            <FormGroup>
              <Label>Chairs *</Label>
              <ChairsSection>
                {formData.chairs.map((chair, index) => (
                  <ChairItem key={index}>
                    <ChairHeader>
                      <strong>Chair {index + 1}</strong>
                      {formData.chairs.length > 1 && (
                        <RemoveButton 
                          type="button" 
                          onClick={() => removeChair(index)}
                        >
                          Remove
                        </RemoveButton>
                      )}
                    </ChairHeader>
                    
                    <FormGroup>
                      <Label>Chair Type *</Label>
                      <Input
                        type="text"
                        value={chair.chairType}
                        onChange={(e) => handleChairChange(index, 'chairType', e.target.value)}
                        placeholder="e.g., Executive chair, Task chair"
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Chair ID/Tag</Label>
                      <Input
                        type="text"
                        value={chair.chairId}
                        onChange={(e) => handleChairChange(index, 'chairId', e.target.value)}
                        placeholder="Asset tag or identifier"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Issue Reported *</Label>
                      <TextArea
                        value={chair.issueReported}
                        onChange={(e) => handleChairChange(index, 'issueReported', e.target.value)}
                        placeholder="Describe the reported issue"
                        required
                      />
                    </FormGroup>
                  </ChairItem>
                ))}
                
                <AddButton type="button" onClick={addChair}>
                  Add Another Chair
                </AddButton>
              </ChairsSection>
            </FormGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Creating Job...' : 'Create Job'}
            </SubmitButton>
          </Form>
        </Card>
      </MainContent>
    </Container>
  );
};

export default CreateJobPage;