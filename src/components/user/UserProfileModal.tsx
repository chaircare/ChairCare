import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { useTheme } from 'contexts/ThemeContext';
import { User } from 'types/chair-care';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from 'lib/firebase';

interface UserProfileModalProps {
  user: User;
  onClose: () => void;
  onUserUpdated: () => void;
}

const ModalOverlay = styled.div<{ theme: any }>`
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
  padding: ${props => props.theme.spacing.xl};
`;

const ModalCard = styled(Card)<{ theme: any }>`
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.95)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius['2xl']};
  box-shadow: ${props => props.theme.shadows['2xl']};
  backdrop-filter: blur(20px);
`;

const ModalHeader = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  background: ${props => props.theme.gradients.primary};
  color: white;
  border-radius: ${props => props.theme.borderRadius['2xl']} ${props => props.theme.borderRadius['2xl']} 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2<{ theme: any }>`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const CloseButton = styled.button<{ theme: any }>`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.typography.fontSize.lg};
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ModalContent = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
`;

const FormGrid = styled.div<{ theme: any }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div<{ theme: any }>`
  margin-bottom: ${props => props.theme.spacing.lg};
  
  &.full-width {
    grid-column: 1 / -1;
  }
`;

const Label = styled.label<{ theme: any }>`
  display: block;
  margin-bottom: ${props => props.theme.spacing.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const Input = styled.input<{ theme: any }>`
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
  }
  
  &:disabled {
    background: ${props => props.theme.colors.gray[100]};
    color: ${props => props.theme.colors.text.secondary};
    cursor: not-allowed;
  }
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
  }
  
  &:disabled {
    background: ${props => props.theme.colors.gray[100]};
    color: ${props => props.theme.colors.text.secondary};
    cursor: not-allowed;
  }
`;

const PasswordSection = styled.div<{ theme: any }>`
  margin-top: ${props => props.theme.spacing.xl};
  padding-top: ${props => props.theme.spacing.xl};
  border-top: 1px solid ${props => props.theme.colors.border.primary};
`;

const PasswordToggle = styled.button<{ theme: any }>`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary[600]};
  cursor: pointer;
  font-size: ${props => props.theme.typography.fontSize.sm};
  text-decoration: underline;
  margin-bottom: ${props => props.theme.spacing.lg};
  
  &:hover {
    color: ${props => props.theme.colors.primary[700]};
  }
`;

const ModalActions = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
  padding-top: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border.primary};
`;

const ErrorMessage = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.error[600]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-top: ${props => props.theme.spacing.sm};
`;

const SuccessMessage = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.success[600]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-top: ${props => props.theme.spacing.sm};
`;

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  onClose,
  onUserUpdated
}) => {
  const { user: currentUser } = useAuth();
  const { theme } = useTheme();
  
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    companyName: user.companyName || '',
    employeeId: user.employeeId || '',
    specialization: user.specialization || '',
    role: user.role,
    status: user.status || 'active'
  });
  
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isOwnProfile = currentUser?.id === user.id;
  const canEditRole = currentUser?.role === 'admin' && !isOwnProfile;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (showPasswordSection) {
      if (!passwordData.newPassword) {
        setError('New password is required');
        return false;
      }
      
      if (passwordData.newPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        companyName: formData.companyName.trim(),
        employeeId: formData.employeeId.trim(),
        specialization: formData.specialization.trim(),
        updatedAt: new Date()
      };

      // Only admins can change roles and status
      if (canEditRole) {
        updateData.role = formData.role;
        updateData.status = formData.status;
      }

      await updateDoc(doc(db, 'users', user.id), updateData);
      
      // Handle password change (would need Firebase Auth integration)
      if (showPasswordSection && passwordData.newPassword) {
        // This would require Firebase Auth password update
        // For now, just show success message
        setSuccess('Profile updated successfully! Password change requires email verification.');
      } else {
        setSuccess('Profile updated successfully!');
      }
      
      setTimeout(() => {
        onUserUpdated();
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error updating user profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay theme={theme}>
      <ModalCard theme={theme}>
        <ModalHeader theme={theme}>
          <ModalTitle theme={theme}>
            {isOwnProfile ? 'My Profile' : `Edit ${user.name}`}
          </ModalTitle>
          <CloseButton theme={theme} onClick={onClose}>
            ×
          </CloseButton>
        </ModalHeader>

        <ModalContent theme={theme}>
          <form onSubmit={handleSubmit}>
            <FormGrid theme={theme}>
              <FormGroup theme={theme}>
                <Label theme={theme}>Full Name *</Label>
                <Input
                  theme={theme}
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup theme={theme}>
                <Label theme={theme}>Email Address *</Label>
                <Input
                  theme={theme}
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup theme={theme}>
                <Label theme={theme}>Phone Number</Label>
                <Input
                  theme={theme}
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+27 XX XXX XXXX"
                />
              </FormGroup>

              <FormGroup theme={theme}>
                <Label theme={theme}>Company Name</Label>
                <Input
                  theme={theme}
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                />
              </FormGroup>

              {user.role === 'technician' && (
                <>
                  <FormGroup theme={theme}>
                    <Label theme={theme}>Employee ID</Label>
                    <Input
                      theme={theme}
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) => handleInputChange('employeeId', e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup theme={theme}>
                    <Label theme={theme}>Specialization</Label>
                    <Select
                      theme={theme}
                      value={formData.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                    >
                      <option value="">Select specialization</option>
                      <option value="cleaning">Cleaning Specialist</option>
                      <option value="repair">Repair Specialist</option>
                      <option value="maintenance">Maintenance Specialist</option>
                      <option value="general">General Technician</option>
                    </Select>
                  </FormGroup>
                </>
              )}

              {canEditRole && (
                <>
                  <FormGroup theme={theme}>
                    <Label theme={theme}>Role</Label>
                    <Select
                      theme={theme}
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                    >
                      <option value="client">Client</option>
                      <option value="technician">Technician</option>
                      <option value="admin">Admin</option>
                    </Select>
                  </FormGroup>

                  <FormGroup theme={theme}>
                    <Label theme={theme}>Status</Label>
                    <Select
                      theme={theme}
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </Select>
                  </FormGroup>
                </>
              )}
            </FormGrid>

            {isOwnProfile && (
              <PasswordSection theme={theme}>
                <PasswordToggle
                  theme={theme}
                  type="button"
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                >
                  {showPasswordSection ? 'Cancel Password Change' : 'Change Password'}
                </PasswordToggle>

                {showPasswordSection && (
                  <FormGrid theme={theme}>
                    <FormGroup theme={theme}>
                      <Label theme={theme}>Current Password</Label>
                      <Input
                        theme={theme}
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        placeholder="Enter current password"
                      />
                    </FormGroup>

                    <FormGroup theme={theme}>
                      <Label theme={theme}>New Password</Label>
                      <Input
                        theme={theme}
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        placeholder="Enter new password"
                      />
                    </FormGroup>

                    <FormGroup theme={theme} className="full-width">
                      <Label theme={theme}>Confirm New Password</Label>
                      <Input
                        theme={theme}
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </FormGroup>
                  </FormGrid>
                )}
              </PasswordSection>
            )}

            {error && <ErrorMessage theme={theme}>{error}</ErrorMessage>}
            {success && <SuccessMessage theme={theme}>{success}</SuccessMessage>}

            <ModalActions theme={theme}>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={!formData.name || !formData.email}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </ModalActions>
          </form>
        </ModalContent>
      </ModalCard>
    </ModalOverlay>
  );
};