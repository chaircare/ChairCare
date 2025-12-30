import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { User } from 'types/chair-care';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { theme } from 'styles/theme';
import { sendWelcomeEmail } from 'utils/emailUtils';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from 'lib/firebase';

const TechniciansContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const HeaderSection = styled(Card)`
  text-align: center;
  margin-bottom: ${theme.spacing['2xl']};
  background: linear-gradient(135deg, ${theme.colors.primary[50]} 0%, ${theme.colors.accent[50]} 100%);
  border: 1px solid ${theme.colors.primary[200]};
`;

const HeaderTitle = styled.h1`
  margin: 0 0 ${theme.spacing.md} 0;
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
`;

const ActionsSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xl};
`;

const TechniciansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

const TechnicianCard = styled(Card)`
  padding: ${theme.spacing.lg};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }
`;

const TechnicianHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.md};
`;

const TechnicianName = styled.h3`
  margin: 0;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
`;

const StatusBadge = styled.span<{ status: 'active' | 'inactive' }>`
  padding: 4px 8px;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  
  ${props => props.status === 'active' 
    ? `
      background: ${theme.colors.success[100]};
      color: ${theme.colors.success[700]};
    `
    : `
      background: ${theme.colors.gray[100]};
      color: ${theme.colors.gray[700]};
    `
  }
`;

const TechnicianInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${theme.typography.fontSize.sm};
`;

const InfoLabel = styled.span`
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const InfoValue = styled.span`
  color: ${theme.colors.text.primary};
`;

const TechnicianActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
`;

const Modal = styled.div<{ isOpen: boolean }>`
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
`;

const ModalContent = styled(Card)`
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  padding: ${theme.spacing.xl};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: ${theme.typography.fontSize.xl};
  cursor: pointer;
  color: ${theme.colors.text.secondary};
  
  &:hover {
    color: ${theme.colors.text.primary};
  }
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

const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.base};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.base};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.error[600]};
  font-size: ${theme.typography.fontSize.sm};
  margin-top: ${theme.spacing.sm};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing['3xl']};
  color: ${theme.colors.text.secondary};
`;

interface TechnicianFormData {
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  specialization: string;
  status: 'active' | 'inactive';
}

interface TechnicianStats {
  activeJobs: number;
  completedJobs: number;
  totalJobs: number;
  lastActive?: Date;
}

const TechniciansPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [technicianStats, setTechnicianStats] = useState<{ [key: string]: TechnicianStats }>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<TechnicianFormData>({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    specialization: 'General Repair',
    status: 'active'
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Load technicians
  useEffect(() => {
    loadTechnicians();
  }, []);

  const loadTechnicians = async () => {
    try {
      setLoading(true);
      
      // Get all technicians
      const techniciansQuery = query(
        collection(db, 'users'),
        where('role', '==', 'technician')
      );
      
      const querySnapshot = await getDocs(techniciansQuery);
      const techniciansData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as User[];
      
      setTechnicians(techniciansData);
      
      // Load stats for each technician
      const statsPromises = techniciansData.map(loadTechnicianStats);
      const stats = await Promise.all(statsPromises);
      
      const statsMap: { [key: string]: TechnicianStats } = {};
      techniciansData.forEach((tech, index) => {
        statsMap[tech.id] = stats[index];
      });
      
      setTechnicianStats(statsMap);
    } catch (error) {
      console.error('Error loading technicians:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTechnicianStats = async (technician: User): Promise<TechnicianStats> => {
    try {
      // Get jobs assigned to this technician
      const jobsQuery = query(
        collection(db, 'jobs'),
        where('assignedTechnicianId', '==', technician.id)
      );
      
      const jobsSnapshot = await getDocs(jobsQuery);
      const jobs = jobsSnapshot.docs.map(doc => doc.data());
      
      const activeJobs = jobs.filter(job => ['Scheduled', 'In Progress'].includes(job.status)).length;
      const completedJobs = jobs.filter(job => job.status === 'Completed').length;
      
      return {
        activeJobs,
        completedJobs,
        totalJobs: jobs.length,
        lastActive: jobs.length > 0 ? new Date() : undefined // Simplified - could track actual last activity
      };
    } catch (error) {
      console.error('Error loading technician stats:', error);
      return {
        activeJobs: 0,
        completedJobs: 0,
        totalJobs: 0
      };
    }
  };

  const handleInputChange = (field: keyof TechnicianFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormError('');
  };

  const generateTempPassword = (): string => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password + '!';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      setFormError('Please fill in all required fields');
      return;
    }
    
    setSubmitting(true);
    setFormError('');
    
    try {
      // Check if email already exists
      const existingUserQuery = query(
        collection(db, 'users'),
        where('email', '==', formData.email)
      );
      const existingUserSnapshot = await getDocs(existingUserQuery);
      
      if (!existingUserSnapshot.empty) {
        setFormError('A user with this email already exists');
        return;
      }
      
      // Generate temporary password
      const tempPassword = generateTempPassword();
      
      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, tempPassword);
      
      // Create user profile in Firestore
      const userProfile = {
        id: userCredential.user.uid,
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        role: 'technician',
        employeeId: formData.employeeId,
        specialization: formData.specialization,
        status: formData.status,
        tempPassword: tempPassword,
        passwordResetRequired: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user?.id
      };
      
      await addDoc(collection(db, 'users'), userProfile);
      
      // Send welcome email with credentials
      try {
        const emailSent = await sendWelcomeEmail(
          formData.email,
          formData.name,
          tempPassword,
          'Chair Care Technician'
        );
        
        if (!emailSent) {
          console.error('Failed to send welcome email');
          // Don't fail the whole process if email fails
        }
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the whole process if email fails
      }
      
      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        phone: '',
        employeeId: '',
        specialization: 'General Repair',
        status: 'active'
      });
      setShowModal(false);
      
      // Reload technicians
      loadTechnicians();
      
      alert(`Technician added successfully! Login credentials sent to ${formData.email}`);
      
    } catch (error: any) {
      console.error('Error adding technician:', error);
      setFormError(error.message || 'Failed to add technician');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusToggle = async (technicianId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      await updateDoc(doc(db, 'users', technicianId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      loadTechnicians();
    } catch (error) {
      console.error('Error updating technician status:', error);
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Layout>
      <TechniciansContainer>
        <HeaderSection>
          <HeaderTitle>Technician Management</HeaderTitle>
          <p>Manage your field technicians and track their job assignments</p>
        </HeaderSection>

        <ActionsSection>
          <div>
            <h2 style={{ margin: 0, color: theme.colors.text.primary }}>
              Technicians ({technicians.length})
            </h2>
          </div>
          <Button onClick={() => setShowModal(true)} variant="primary">
            Add Technician
          </Button>
        </ActionsSection>

        {loading ? (
          <EmptyState>Loading technicians...</EmptyState>
        ) : technicians.length === 0 ? (
          <EmptyState>
            No technicians found. Add your first technician to get started.
          </EmptyState>
        ) : (
          <TechniciansGrid>
            {technicians.map((technician) => {
              const stats = technicianStats[technician.id] || {
                activeJobs: 0,
                completedJobs: 0,
                totalJobs: 0
              };
              
              return (
                <TechnicianCard key={technician.id}>
                  <TechnicianHeader>
                    <TechnicianName>{technician.name}</TechnicianName>
                    <StatusBadge status={technician.status as 'active' | 'inactive'}>
                      {technician.status || 'active'}
                    </StatusBadge>
                  </TechnicianHeader>
                  
                  <TechnicianInfo>
                    <InfoRow>
                      <InfoLabel>Email:</InfoLabel>
                      <InfoValue>{technician.email}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Phone:</InfoLabel>
                      <InfoValue>{technician.phone || 'Not provided'}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Employee ID:</InfoLabel>
                      <InfoValue>{technician.employeeId || 'Not set'}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Specialization:</InfoLabel>
                      <InfoValue>{technician.specialization || 'General'}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Active Jobs:</InfoLabel>
                      <InfoValue>{stats.activeJobs}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Completed Jobs:</InfoLabel>
                      <InfoValue>{stats.completedJobs}</InfoValue>
                    </InfoRow>
                  </TechnicianInfo>

                  <TechnicianActions>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/technicians/${technician.id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant={technician.status === 'active' ? 'warning' : 'success'}
                      onClick={() => handleStatusToggle(technician.id, technician.status || 'active')}
                    >
                      {technician.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </TechnicianActions>
                </TechnicianCard>
              );
            })}
          </TechniciansGrid>
        )}

        {/* Add Technician Modal */}
        <Modal isOpen={showModal}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Add New Technician</ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            </ModalHeader>
            
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Full Name *</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter technician's full name"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Phone Number *</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Employee ID</Label>
                <Input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => handleInputChange('employeeId', e.target.value)}
                  placeholder="Enter employee ID (optional)"
                />
              </FormGroup>

              <FormGroup>
                <Label>Specialization</Label>
                <Select
                  value={formData.specialization}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                >
                  <option value="General Repair">General Repair</option>
                  <option value="Gas Lift Specialist">Gas Lift Specialist</option>
                  <option value="Upholstery Specialist">Upholstery Specialist</option>
                  <option value="Mechanism Repair">Mechanism Repair</option>
                  <option value="Electronics">Electronics</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive')}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </FormGroup>

              {formError && <ErrorMessage>{formError}</ErrorMessage>}

              <div style={{ display: 'flex', gap: theme.spacing.md, marginTop: theme.spacing.xl }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                  style={{ flex: 1 }}
                >
                  {submitting ? 'Adding...' : 'Add Technician'}
                </Button>
              </div>
            </form>
          </ModalContent>
        </Modal>
      </TechniciansContainer>
    </Layout>
  );
};

export default TechniciansPage;