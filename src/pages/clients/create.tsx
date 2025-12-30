import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import axios from 'axios';
import { useAuth } from 'contexts/AuthContext';
import { CreateClientForm } from 'types/chair-care';

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
  max-width: 600px;
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

const CreateClientPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<CreateClientForm>({
    type: 'business',
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    physicalAddress: '',
    billingAddress: '',
    vatNumber: '',
    paymentTerms: 30,
    notes: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  const handleInputChange = (field: keyof CreateClientForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/clients', formData);
      if (response.data.success) {
        router.push('/dashboard');
      } else {
        setError(response.data.error || 'Failed to create client');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create client');
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
          <Title>Create New Client</Title>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="type">Client Type *</Label>
              <Select
                id="type"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value as any)}
                required
              >
                <option value="business">Business</option>
                <option value="individual">Individual</option>
              </Select>
            </FormGroup>

            {formData.type === 'business' && (
              <FormGroup>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="ABC Corporation"
                />
              </FormGroup>
            )}

            <FormGroup>
              <Label htmlFor="contactPerson">Contact Person *</Label>
              <Input
                id="contactPerson"
                type="text"
                value={formData.contactPerson}
                onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                placeholder="John Smith"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="john@company.co.za"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="011-123-4567"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="physicalAddress">Physical Address *</Label>
              <TextArea
                id="physicalAddress"
                value={formData.physicalAddress}
                onChange={(e) => handleInputChange('physicalAddress', e.target.value)}
                placeholder="123 Business Street, Johannesburg, 2000"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="billingAddress">Billing Address</Label>
              <TextArea
                id="billingAddress"
                value={formData.billingAddress}
                onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                placeholder="Leave blank if same as physical address"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="vatNumber">VAT Number</Label>
              <Input
                id="vatNumber"
                type="text"
                value={formData.vatNumber}
                onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                placeholder="4123456789"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="paymentTerms">Payment Terms (days)</Label>
              <Input
                id="paymentTerms"
                type="number"
                value={formData.paymentTerms}
                onChange={(e) => handleInputChange('paymentTerms', parseInt(e.target.value) || 30)}
                min="1"
                max="90"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="notes">Internal Notes</Label>
              <TextArea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any special instructions or notes about this client"
              />
            </FormGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Creating Client...' : 'Create Client'}
            </SubmitButton>
          </Form>
        </Card>
      </MainContent>
    </Container>
  );
};

export default CreateClientPage;