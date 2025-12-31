import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { Chair } from 'types/chair-care';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { ConfirmationModal } from 'components/ui/ConfirmationModal';
import { theme } from 'styles/theme';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from 'lib/firebase';
import apiClient from 'lib/api-client';

const ChairsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${theme.spacing.md};
  
  @media (max-width: 768px) {
    padding: 0 ${theme.spacing.sm};
  }
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing['2xl']};
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing.md};
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.sm};
  }
`;

const StatCard = styled(Card)`
  text-align: center;
  padding: ${theme.spacing.lg};
`;

const StatValue = styled.div`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary[600]};
  margin-bottom: ${theme.spacing.sm};
`;

const StatLabel = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`;

const FiltersSection = styled(Card)`
  margin-bottom: ${theme.spacing.xl};
  padding: ${theme.spacing.lg};
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.md};
  align-items: end;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.sm};
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const Label = styled.label`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
`;

const Select = styled.select`
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.base};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const Input = styled.input`
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.base};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const ChairsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${theme.spacing.lg};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.md};
  }
`;

const ChairCard = styled(Card)`
  padding: ${theme.spacing.lg};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }
`;

const ChairHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.md};
`;

const ChairId = styled.h3`
  margin: 0;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
`;

const StatusBadge = styled.span<{ status: Chair['status'] }>`
  padding: 4px 8px;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  
  ${props => {
    switch (props.status) {
      case 'Active':
        return `
          background: ${theme.colors.success[100]};
          color: ${theme.colors.success[700]};
        `;
      case 'In Progress':
        return `
          background: ${theme.colors.primary[100]};
          color: ${theme.colors.primary[700]};
        `;
      case 'In Workshop':
        return `
          background: ${theme.colors.warning[100]};
          color: ${theme.colors.warning[700]};
        `;
      case 'Pending Service':
        return `
          background: ${theme.colors.warning[100]};
          color: ${theme.colors.warning[700]};
        `;
      case 'Unrepairable':
        return `
          background: ${theme.colors.error[100]};
          color: ${theme.colors.error[700]};
        `;
      case 'Retired':
        return `
          background: ${theme.colors.gray[100]};
          color: ${theme.colors.gray[700]};
        `;
      case 'Inactive':
        return `
          background: ${theme.colors.gray[100]};
          color: ${theme.colors.gray[700]};
        `;
      default:
        return `
          background: ${theme.colors.gray[100]};
          color: ${theme.colors.gray[700]};
        `;
    }
  }}
`;

const ChairInfo = styled.div`
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

const ChairActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${theme.spacing.xs};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing['3xl']};
  color: ${theme.colors.text.secondary};
`;

const ChairsPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inProgress: 0,
    pendingService: 0,
    retired: 0,
    inactive: 0
  });

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedChair, setSelectedChair] = useState<Chair | null>(null);
  const [deleteAction, setDeleteAction] = useState<'delete' | 'deactivate' | 'retire'>('retire');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Load chairs
  useEffect(() => {
    loadChairs();
  }, [statusFilter]);

  const loadChairs = async () => {
    try {
      setLoading(true);
      
      let chairsQuery = query(
        collection(db, 'chairs'),
        orderBy('createdAt', 'desc')
      );
      
      if (statusFilter !== 'all') {
        chairsQuery = query(
          collection(db, 'chairs'),
          where('status', '==', statusFilter),
          orderBy('createdAt', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(chairsQuery);
      const chairsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        lastServiceDate: doc.data().lastServiceDate?.toDate(),
        nextServiceDue: doc.data().nextServiceDue?.toDate(),
        retiredAt: doc.data().retiredAt?.toDate()
      })) as Chair[];
      
      setChairs(chairsData);
      
      // Calculate stats
      const newStats = {
        total: chairsData.length,
        active: chairsData.filter(chair => chair.status === 'Active').length,
        inProgress: chairsData.filter(chair => chair.status === 'In Progress').length,
        pendingService: chairsData.filter(chair => chair.status === 'Pending Service').length,
        retired: chairsData.filter(chair => chair.status === 'Retired').length,
        inactive: chairsData.filter(chair => chair.status === 'Inactive').length
      };
      
      setStats(newStats);
    } catch (error) {
      console.error('Error loading chairs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChairs = chairs.filter(chair => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        chair.chairId.toLowerCase().includes(searchLower) ||
        chair.model?.toLowerCase().includes(searchLower) ||
        chair.location.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const formatDate = (date?: Date) => {
    return date ? date.toLocaleDateString('en-ZA') : 'Never';
  };

  const handleChairAction = (chair: Chair, action: 'delete' | 'deactivate' | 'retire') => {
    setSelectedChair(chair);
    setDeleteAction(action);
    setShowDeleteModal(true);
  };

  const confirmChairAction = async () => {
    if (!selectedChair) return;

    setDeleteLoading(true);
    try {
      const response = await apiClient.post('/api/admin/delete-chair', {
        chairId: selectedChair.id,
        action: deleteAction
      });

      if (response.data.success) {
        // Refresh the chairs list
        await loadChairs();
        setShowDeleteModal(false);
        setSelectedChair(null);
      } else {
        alert(response.data.error || 'Failed to perform action');
      }
    } catch (error: any) {
      console.error('Error performing chair action:', error);
      alert(error.response?.data?.error || 'Failed to perform action');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getActionModalContent = () => {
    if (!selectedChair) return { title: '', message: '', confirmText: '', variant: 'info' as const };

    switch (deleteAction) {
      case 'delete':
        return {
          title: 'Delete Chair',
          message: `Are you sure you want to permanently delete chair "${selectedChair.chairId}"? This action cannot be undone and will only work if the chair has no service history.`,
          confirmText: 'Delete Permanently',
          variant: 'danger' as const
        };
      case 'deactivate':
        return {
          title: 'Deactivate Chair',
          message: `Are you sure you want to deactivate chair "${selectedChair.chairId}"? The chair will be marked as inactive but can be reactivated later.`,
          confirmText: 'Deactivate',
          variant: 'warning' as const
        };
      case 'retire':
        return {
          title: 'Retire Chair',
          message: `Are you sure you want to retire chair "${selectedChair.chairId}"? The chair will be marked as retired and removed from active service.`,
          confirmText: 'Retire Chair',
          variant: 'warning' as const
        };
      default:
        return { title: '', message: '', confirmText: '', variant: 'info' as const };
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Layout>
      <ChairsContainer>
        <HeaderSection>
          <HeaderTitle>Chair Registry</HeaderTitle>
          <p>Manage all chairs in the system with QR codes and service history</p>
        </HeaderSection>

        <StatsGrid>
          <StatCard>
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total Chairs</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.active}</StatValue>
            <StatLabel>Active</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.inProgress}</StatValue>
            <StatLabel>In Progress</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.pendingService}</StatValue>
            <StatLabel>Pending Service</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.retired}</StatValue>
            <StatLabel>Retired</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.inactive}</StatValue>
            <StatLabel>Inactive</StatLabel>
          </StatCard>
        </StatsGrid>

        <FiltersSection>
          <FiltersGrid>
            <FilterGroup>
              <Label>Filter by Status</Label>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Chairs</option>
                <option value="Active">Active</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending Service">Pending Service</option>
                <option value="In Workshop">In Workshop</option>
                <option value="Unrepairable">Unrepairable</option>
                <option value="Retired">Retired</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </FilterGroup>
            <FilterGroup>
              <Label>Search Chairs</Label>
              <Input
                type="text"
                placeholder="Search by Chair ID, model, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </FilterGroup>
            <div>
              <Button onClick={loadChairs} variant="outline">
                Refresh
              </Button>
            </div>
          </FiltersGrid>
        </FiltersSection>

        {loading ? (
          <EmptyState>Loading chairs...</EmptyState>
        ) : filteredChairs.length === 0 ? (
          <EmptyState>
            {searchTerm ? 'No chairs found matching your search' : 'No chairs found'}
          </EmptyState>
        ) : (
          <ChairsGrid>
            {filteredChairs.map((chair) => (
              <ChairCard key={chair.id}>
                <ChairHeader>
                  <ChairId>{chair.chairId}</ChairId>
                  <StatusBadge status={chair.status}>
                    {chair.status}
                  </StatusBadge>
                </ChairHeader>
                
                <ChairInfo>
                  <InfoRow>
                    <InfoLabel>Model:</InfoLabel>
                    <InfoValue>{chair.model || 'Not specified'}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Location:</InfoLabel>
                    <InfoValue>{chair.location}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Services:</InfoLabel>
                    <InfoValue>{chair.totalServices || 0}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Last Service:</InfoLabel>
                    <InfoValue>{formatDate(chair.lastServiceDate)}</InfoValue>
                  </InfoRow>
                  {chair.assetTag && (
                    <InfoRow>
                      <InfoLabel>Asset Tag:</InfoLabel>
                      <InfoValue>{chair.assetTag}</InfoValue>
                    </InfoRow>
                  )}
                </ChairInfo>

                <ChairActions>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/admin/chairs/${chair.id}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => router.push(`/chairs/qr-generator?chairId=${chair.id}`)}
                  >
                    Print QR
                  </Button>
                  {chair.status !== 'Retired' && (
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() => handleChairAction(chair, 'retire')}
                    >
                      Retire
                    </Button>
                  )}
                  {chair.status !== 'Inactive' && chair.status !== 'Retired' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleChairAction(chair, 'deactivate')}
                    >
                      Deactivate
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleChairAction(chair, 'delete')}
                  >
                    Delete
                  </Button>
                </ChairActions>
              </ChairCard>
            ))}
          </ChairsGrid>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedChair(null);
          }}
          onConfirm={confirmChairAction}
          loading={deleteLoading}
          {...getActionModalContent()}
        />
      </ChairsContainer>
    </Layout>
  );
};

export default ChairsPage;