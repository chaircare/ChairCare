import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { CreateChairForm, User, CHAIR_CATEGORIES } from 'types/chair-care';
import apiClient from 'lib/api-client';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Input } from 'components/ui/Input';
import { Card } from 'components/ui/Card';
import { theme } from 'styles/theme';

const FormContainer = styled(Card)`
  max-width: 600px;
  margin: 0 auto;
`;

const Title = styled.h2`
  margin: 0 0 ${theme.spacing['2xl']} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: ${theme.spacing.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`;

const Select = styled.select`
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.base};
  background: ${theme.colors.background.primary};
  color: ${theme.colors.text.primary};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const CategoryDescription = styled.div`
  margin-top: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-style: italic;
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.error[600]};
  background: ${theme.colors.error[50]};
  border: 1px solid ${theme.colors.error[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
`;

const SuccessMessage = styled.div`
  color: ${theme.colors.success[600]};
  background: ${theme.colors.success[50]};
  border: 1px solid ${theme.colors.success[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
`;

const CreateChairPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<CreateChairForm & { userId?: string }>({
    chairNumber: '',
    location: '',
    category: '',
    model: '',
    userId: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    loadUsers();
  }, [user, router]);

  const loadUsers = async () => {
    try {
      const response = await apiClient.get('/api/admin/get-clients');
      
      if (response.data.success) {
        const clientUsers: User[] = response.data.data.map((userData: any) => ({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          companyName: userData.companyName,
          createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date(),
          updatedAt: userData.updatedAt?.toDate ? userData.updatedAt.toDate() : new Date()
        }));
        
        setUsers(clientUsers);
      } else {
        setError('Failed to load client users');
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      setError('Failed to load client users');
    }
  };

  const handleInputChange = (field: keyof (CreateChairForm & { userId?: string }), value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!formData.userId) {
        setError('Please select a client to assign the chair to');
        return;
      }

      if (!formData.category) {
        setError('Please select a chair category');
        return;
      }

      const response = await apiClient.post('/api/admin/create-chair', {
        chairNumber: formData.chairNumber,
        location: formData.location,
        category: formData.category,
        model: formData.model,
        userId: formData.userId
      });

      if (response.data.success) {
        const { qrCode, category } = response.data.data;
        setSuccess(`Chair created successfully! Category: ${category.name}, QR Code: ${qrCode}`);
        
        // Reset form
        setFormData({
          chairNumber: '',
          location: '',
          category: '',
          model: '',
          userId: ''
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError(response.data.error || 'Failed to create chair');
      }
    } catch (err: any) {
      console.error('Error creating chair:', err);
      setError(err.response?.data?.error || 'Failed to create chair');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Layout>
      <FormContainer>
        <Title>Add New Chair</Title>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="chairNumber">Chair Number *</Label>
            <Input
              id="chairNumber"
              type="text"
              value={formData.chairNumber}
              onChange={(e) => handleInputChange('chairNumber', e.target.value)}
              placeholder="CH-001"
              required
              fullWidth
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="category">Chair Category *</Label>
            <Select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {CHAIR_CATEGORIES.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            {formData.category && (
              <CategoryDescription>
                {CHAIR_CATEGORIES.find(cat => cat.id === formData.category)?.description}
              </CategoryDescription>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Office Floor 1 - Call Center Area"
              required
              fullWidth
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="model">Chair Model</Label>
            <Input
              id="model"
              type="text"
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              placeholder="Executive Chair Model X"
              fullWidth
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="userId">Assign to Client *</Label>
            <Select
              id="userId"
              value={formData.userId}
              onChange={(e) => handleInputChange('userId', e.target.value)}
              required
            >
              <option value="">Select a client</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} {user.companyName ? `(${user.companyName})` : ''}
                </option>
              ))}
            </Select>
          </FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          <Button 
            type="submit" 
            loading={loading}
            disabled={loading}
            size="lg"
          >
            {loading ? 'Creating Chair...' : 'Create Chair'}
          </Button>
        </Form>
      </FormContainer>
    </Layout>
  );
};

export default CreateChairPage;