import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { theme } from 'styles/theme';
import { Chair } from 'types/chair-care';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from 'lib/firebase';

const Container = styled.div`
  padding: ${theme.spacing.xl};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xl};
`;

const Title = styled.h1`
  margin: 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
`;

const FilterBar = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 250px;
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

const FilterSelect = styled.select`
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.background.primary};
  color: ${theme.colors.text.primary};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
  }
`;

const ChairsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${theme.spacing.lg};
`;

const ChairCard = styled(Card)`
  padding: ${theme.spacing.lg};
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${theme.colors.gray[200]};
  
  &:hover {
    border-color: ${theme.colors.primary[300]};
    box-shadow: ${theme.shadows.lg};
    transform: translateY(-2px);
  }
`;

const ChairHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.md};
`;

const ChairInfo = styled.div`
  flex: 1;
`;

const ChairNumber = styled.h3`
  margin: 0 0 ${theme.spacing.xs} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const ChairLocation = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  margin-bottom: ${theme.spacing.xs};
`;

const ChairModel = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`;

const ConditionBadge = styled.span<{ condition: string }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: uppercase;
  
  ${props => {
    switch (props.condition?.toLowerCase()) {
      case 'excellent':
        return `background: ${theme.colors.success[100]}; color: ${theme.colors.success[700]};`;
      case 'good':
        return `background: ${theme.colors.primary[100]}; color: ${theme.colors.primary[700]};`;
      case 'fair':
        return `background: ${theme.colors.warning[100]}; color: ${theme.colors.warning[700]};`;
      case 'poor':
        return `background: ${theme.colors.error[100]}; color: ${theme.colors.error[700]};`;
      default:
        return `background: ${theme.colors.gray[100]}; color: ${theme.colors.gray[700]};`;
    }
  }}
`;

const ChairDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
  margin: ${theme.spacing.md} 0;
  padding: ${theme.spacing.md};
  background: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.md};
`;

const DetailItem = styled.div`
  font-size: ${theme.typography.fontSize.sm};
`;

const DetailLabel = styled.span`
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const DetailValue = styled.span`
  color: ${theme.colors.text.primary};
  margin-left: ${theme.spacing.xs};
`;

const ChairActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
`;

const QRCodeIndicator = styled.div<{ hasQR: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.xs};
  color: ${props => props.hasQR ? theme.colors.success[600] : theme.colors.gray[500]};
  margin-top: ${theme.spacing.xs};
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
`;

const ResultsCount = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  margin-bottom: ${theme.spacing.lg};
`;

const ClientChairs: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [filteredChairs, setFilteredChairs] = useState<Chair[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  useEffect(() => {
    if (user?.role === 'client') {
      loadChairs();
    }
  }, [user]);

  useEffect(() => {
    filterChairs();
  }, [chairs, searchTerm, conditionFilter, locationFilter]);

  const loadChairs = async () => {
    try {
      setLoading(true);
      
      const chairsQuery = query(
        collection(db, 'chairs'),
        where('clientId', '==', user?.id),
        orderBy('chairNumber')
      );
      
      const chairsSnapshot = await getDocs(chairsQuery);
      const chairsData = chairsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Chair[];
      
      setChairs(chairsData);
      
    } catch (error) {
      console.error('Error loading chairs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterChairs = () => {
    let filtered = chairs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(chair =>
        chair.chairNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chair.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (chair.model && chair.model.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Condition filter
    if (conditionFilter !== 'all') {
      filtered = filtered.filter(chair => chair.condition === conditionFilter);
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(chair => chair.location === locationFilter);
    }

    setFilteredChairs(filtered);
  };

  const getUniqueLocations = () => {
    const locations = chairs.map(chair => chair.location);
    return [...new Set(locations)].sort();
  };

  const handleChairClick = (chairId: string) => {
    router.push(`/client/chair-history/${chairId}`);
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'Not set';
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(d);
  };

  if (user?.role !== 'client') {
    return (
      <Layout>
        <Container>
          <div>Access denied. Client access required.</div>
        </Container>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <Container>
          <LoadingState>Loading your chairs...</LoadingState>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <Header>
          <Title>My Chairs</Title>
          <Button 
            variant="outline" 
            onClick={() => router.push('/client/dashboard')}
          >
            Back to Dashboard
          </Button>
        </Header>

        <FilterBar>
          <SearchInput
            type="text"
            placeholder="Search chairs by number, location, or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <FilterSelect
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
          >
            <option value="all">All Conditions</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </FilterSelect>
          
          <FilterSelect
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="all">All Locations</option>
            {getUniqueLocations().map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </FilterSelect>
        </FilterBar>

        <ResultsCount>
          Showing {filteredChairs.length} of {chairs.length} chairs
        </ResultsCount>

        {filteredChairs.length === 0 ? (
          <EmptyState>
            {chairs.length === 0 
              ? 'No chairs found. Contact your administrator to add chairs to your account.'
              : 'No chairs match your current filters.'
            }
          </EmptyState>
        ) : (
          <ChairsGrid>
            {filteredChairs.map(chair => (
              <ChairCard key={chair.id} onClick={() => handleChairClick(chair.id)}>
                <ChairHeader>
                  <ChairInfo>
                    <ChairNumber>Chair {chair.chairNumber}</ChairNumber>
                    <ChairLocation>{chair.location}</ChairLocation>
                    <ChairModel>{chair.model || 'Standard Office Chair'}</ChairModel>
                    <QRCodeIndicator hasQR={!!chair.chairId}>
                      {chair.chairId ? '✓ QR Code Available' : '○ No QR Code'}
                    </QRCodeIndicator>
                  </ChairInfo>
                  <ConditionBadge condition={chair.condition || 'unknown'}>
                    {chair.condition || 'Unknown'}
                  </ConditionBadge>
                </ChairHeader>
                
                <ChairDetails>
                  <DetailItem>
                    <DetailLabel>Purchase Date:</DetailLabel>
                    <DetailValue>{formatDate(chair.purchaseDate)}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Warranty:</DetailLabel>
                    <DetailValue>
                      {chair.warrantyExpiry 
                        ? new Date(chair.warrantyExpiry) > new Date() ? 'Active' : 'Expired'
                        : 'Not set'
                      }
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Serial Number:</DetailLabel>
                    <DetailValue>{chair.serialNumber || 'Not set'}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Manufacturer:</DetailLabel>
                    <DetailValue>{chair.manufacturer || 'Not specified'}</DetailValue>
                  </DetailItem>
                </ChairDetails>
                
                <ChairActions>
                  <Button 
                    size="sm" 
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChairClick(chair.id);
                    }}
                  >
                    View History
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/client/chair-history/${chair.id}?request=true`);
                    }}
                  >
                    Request Service
                  </Button>
                </ChairActions>
              </ChairCard>
            ))}
          </ChairsGrid>
        )}
      </Container>
    </Layout>
  );
};

export default ClientChairs;