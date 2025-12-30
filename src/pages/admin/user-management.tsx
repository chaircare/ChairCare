import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { useTheme } from 'contexts/ThemeContext';
import { User } from 'types/chair-care';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { Input } from 'components/ui/Input';
import { UserProfileModal } from 'components/user/UserProfileModal';
import { collection, query, getDocs, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { db } from 'lib/firebase';

const UserManagementContainer = styled.div<{ theme: any }>`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl};
`;

const HeaderSection = styled(Card)<{ theme: any }>`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.mode === 'dark' 
    ? props.theme.gradients.darkSubtle
    : `linear-gradient(135deg, ${props.theme.colors.primary[50]} 0%, ${props.theme.colors.accent[50]} 100%)`
  };
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius['2xl']};
`;

const HeaderTitle = styled.h1<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const HeaderSubtitle = styled.p<{ theme: any }>`
  margin: 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const ActionsSection = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.xl};
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterSection = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterSelect = styled.select<{ theme: any }>`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
  }
`;

const UsersGrid = styled.div<{ theme: any }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const UserCard = styled(Card)<{ theme: any }>`
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.8)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius['2xl']};
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows['2xl']};
  }
`;

const UserHeader = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
`;

const UserAvatar = styled.div<{ theme: any; role: string }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => {
    switch (props.role) {
      case 'admin': return props.theme.gradients.primary;
      case 'technician': return props.theme.gradients.accent;
      case 'client': return props.theme.gradients.purple;
      default: return props.theme.colors.gray[500];
    }
  }};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  font-size: ${props => props.theme.typography.fontSize.xl};
`;

const UserInfo = styled.div<{ theme: any }>`
  flex: 1;
`;

const UserName = styled.h3<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const UserEmail = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const UserRole = styled.span<{ theme: any; role: string }>`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  ${({ role, theme }) => {
    switch (role) {
      case 'admin':
        return `background: ${theme.colors.primary[100]}; color: ${theme.colors.primary[700]};`;
      case 'technician':
        return `background: ${theme.colors.accent[100]}; color: ${theme.colors.accent[700]};`;
      case 'client':
        return `background: ${theme.colors.purple[100]}; color: ${theme.colors.purple[700]};`;
      default:
        return `background: ${theme.colors.gray[100]}; color: ${theme.colors.gray[700]};`;
    }
  }}
`;

const UserDetails = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const UserActions = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.xl};
  border-top: 1px solid ${props => props.theme.colors.border.primary};
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const CreateUserModal = styled.div<{ theme: any; isOpen: boolean }>`
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
  padding: ${props => props.theme.spacing.xl};
`;

const CreateUserCard = styled(Card)<{ theme: any }>`
  width: 100%;
  max-width: 500px;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.95)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius['2xl']};
  box-shadow: ${props => props.theme.shadows['2xl']};
  backdrop-filter: blur(20px);
`;

const CreateUserHeader = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  background: ${props => props.theme.gradients.primary};
  color: white;
  border-radius: ${props => props.theme.borderRadius['2xl']} ${props => props.theme.borderRadius['2xl']} 0 0;
`;

const CreateUserTitle = styled.h2<{ theme: any }>`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const CreateUserForm = styled.form<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const FormActions = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
  padding-top: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border.primary};
`;

const EmptyState = styled.div<{ theme: any }>`
  text-align: center;
  padding: ${props => props.theme.spacing['4xl']};
  color: ${props => props.theme.colors.text.secondary};
  grid-column: 1 / -1;
  
  h3 {
    margin: 0 0 ${props => props.theme.spacing.lg} 0;
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.typography.fontSize['2xl']};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
  }
  
  p {
    margin: 0;
    font-size: ${props => props.theme.typography.fontSize.lg};
    line-height: ${props => props.theme.typography.lineHeight.relaxed};
  }
`;

const LoadingState = styled.div<{ theme: any }>`
  text-align: center;
  padding: ${props => props.theme.spacing['4xl']};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const UserManagementPage: NextPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client' as 'admin' | 'technician' | 'client',
    specialization: ''
  });

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    if (user) {
      loadUsers();
    }
  }, [user, router]);

  useEffect(() => {
    filterUsers();
  }, [users, selectedRole]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as User[];
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;
    
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }
    
    setFilteredUsers(filtered);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      // Create user in Firebase Auth
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      // Create user document in Firestore
      await addDoc(collection(db, 'users'), {
        uid: userCredential.user.uid,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        specialization: formData.specialization || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      });
      
      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'client',
        specialization: ''
      });
      setShowCreateModal(false);
      
      // Reload users
      await loadUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleEditUser = (userToEdit: User) => {
    setSelectedUser(userToEdit);
    setShowProfileModal(true);
  };

  const handleUserUpdated = () => {
    loadUsers(); // Refresh the users list
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Unknown';
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleStats = () => {
    const admins = users.filter(u => u.role === 'admin').length;
    const technicians = users.filter(u => u.role === 'technician').length;
    const clients = users.filter(u => u.role === 'client').length;
    
    return { admins, technicians, clients, total: users.length };
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <Layout>
        <UserManagementContainer theme={theme}>
          <LoadingState theme={theme}>Loading user management...</LoadingState>
        </UserManagementContainer>
      </Layout>
    );
  }

  const stats = getRoleStats();

  return (
    <Layout>
      <UserManagementContainer theme={theme}>
        <HeaderSection theme={theme}>
          <HeaderTitle theme={theme}>User Management</HeaderTitle>
          <HeaderSubtitle theme={theme}>
            Manage system users, roles, and permissions
          </HeaderSubtitle>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: theme.spacing.xl, 
            marginTop: theme.spacing.lg,
            flexWrap: 'wrap'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: theme.typography.fontSize['2xl'], 
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.primary[600]
              }}>
                {stats.total}
              </div>
              <div style={{ 
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary
              }}>
                Total Users
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: theme.typography.fontSize['2xl'], 
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.primary[600]
              }}>
                {stats.admins}
              </div>
              <div style={{ 
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary
              }}>
                Admins
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: theme.typography.fontSize['2xl'], 
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.accent[600]
              }}>
                {stats.technicians}
              </div>
              <div style={{ 
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary
              }}>
                Technicians
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: theme.typography.fontSize['2xl'], 
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.purple[600]
              }}>
                {stats.clients}
              </div>
              <div style={{ 
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary
              }}>
                Clients
              </div>
            </div>
          </div>
        </HeaderSection>

        <ActionsSection theme={theme}>
          <FilterSection theme={theme}>
            <FilterSelect
              theme={theme}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="technician">Technicians</option>
              <option value="client">Clients</option>
            </FilterSelect>
          </FilterSection>
          
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            Create New User
          </Button>
        </ActionsSection>

        {filteredUsers.length === 0 ? (
          <UsersGrid theme={theme}>
            <EmptyState theme={theme}>
              <h3>No Users Found</h3>
              <p>No users match the selected filters.</p>
            </EmptyState>
          </UsersGrid>
        ) : (
          <UsersGrid theme={theme}>
            {filteredUsers.map((userData) => (
              <UserCard key={userData.id} theme={theme}>
                <UserHeader theme={theme}>
                  <UserAvatar theme={theme} role={userData.role}>
                    {getUserInitials(userData.name)}
                  </UserAvatar>
                  <UserInfo theme={theme}>
                    <UserName theme={theme}>{userData.name}</UserName>
                    <UserEmail theme={theme}>{userData.email}</UserEmail>
                    <UserRole theme={theme} role={userData.role}>
                      {userData.role}
                    </UserRole>
                  </UserInfo>
                </UserHeader>
                
                <UserDetails theme={theme}>
                  <div><strong>Created:</strong> {formatDate(userData.createdAt)}</div>
                  <div><strong>Status:</strong> {userData.status || 'Unknown'}</div>
                  {userData.specialization && (
                    <div><strong>Specialization:</strong> {userData.specialization}</div>
                  )}
                  {userData.role === 'technician' && (
                    <div><strong>Jobs Completed:</strong> 0</div>
                  )}
                </UserDetails>
                
                <UserActions theme={theme}>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleEditUser(user)}
                  >
                    Edit Profile
                  </Button>
                </UserActions>
              </UserCard>
            ))}
          </UsersGrid>
        )}

        <CreateUserModal theme={theme} isOpen={showCreateModal}>
          <CreateUserCard theme={theme}>
            <CreateUserHeader theme={theme}>
              <CreateUserTitle theme={theme}>Create New User</CreateUserTitle>
            </CreateUserHeader>
            
            <CreateUserForm theme={theme} onSubmit={handleCreateUser}>
              <Input
                label="Full Name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
                required
                fullWidth
              />
              
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
                required
                fullWidth
              />
              
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
                required
                fullWidth
              />
              
              <div>
                <label style={{ 
                  display: 'block',
                  marginBottom: theme.spacing.sm,
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text.primary
                }}>
                  Role
                </label>
                <FilterSelect
                  theme={theme}
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  style={{ width: '100%' }}
                >
                  <option value="client">Client</option>
                  <option value="technician">Technician</option>
                  <option value="admin">Admin</option>
                </FilterSelect>
              </div>
              
              {formData.role === 'technician' && (
                <Input
                  label="Specialization (Optional)"
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="e.g., Chair Repair, Cleaning Specialist"
                  fullWidth
                />
              )}
              
              <FormActions theme={theme}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={creating}
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create User'}
                </Button>
              </FormActions>
            </CreateUserForm>
          </CreateUserCard>
        </CreateUserModal>

        {showProfileModal && selectedUser && (
          <UserProfileModal
            user={selectedUser}
            onClose={() => {
              setShowProfileModal(false);
              setSelectedUser(null);
            }}
            onUserUpdated={handleUserUpdated}
          />
        )}
      </UserManagementContainer>
    </Layout>
  );
};

export default UserManagementPage;