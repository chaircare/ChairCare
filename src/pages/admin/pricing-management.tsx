import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { theme } from 'styles/theme';
import { 
  ServicePricing, 
  PartPricing, 
  BulkDiscountRule, 
  SeasonalPricing,
  PricingTier,
  ClientPricingTier 
} from 'types/pricing';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
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

const TabsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

const Tab = styled.button<{ active?: boolean }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: none;
  background: ${props => props.active ? theme.colors.primary[50] : 'transparent'};
  color: ${props => props.active ? theme.colors.primary[700] : theme.colors.text.secondary};
  border-bottom: 2px solid ${props => props.active ? theme.colors.primary[500] : 'transparent'};
  cursor: pointer;
  font-weight: ${props => props.active ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${theme.colors.primary[50]};
    color: ${theme.colors.primary[700]};
  }
`;

const ContentGrid = styled.div`
  display: grid;
  gap: ${theme.spacing.lg};
`;

const PricingCard = styled(Card)`
  padding: ${theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  margin: 0 0 ${theme.spacing.lg} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const PricingTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: ${theme.spacing.md};
    text-align: left;
    border-bottom: 1px solid ${theme.colors.gray[200]};
  }
  
  th {
    background: ${theme.colors.gray[50]};
    font-weight: ${theme.typography.fontWeight.semibold};
    color: ${theme.colors.text.primary};
  }
  
  tr:hover {
    background: ${theme.colors.gray[50]};
  }
`;

const PriceInput = styled.input`
  width: 100px;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  text-align: right;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: uppercase;
  
  ${props => props.status === 'active' ? `
    background: ${theme.colors.success[100]};
    color: ${theme.colors.success[700]};
  ` : `
    background: ${theme.colors.gray[100]};
    color: ${theme.colors.gray[700]};
  `}
`;

const ProfitMargin = styled.span<{ margin: number }>`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${props => {
    if (props.margin >= 30) return theme.colors.success[600];
    if (props.margin >= 20) return theme.colors.warning[600];
    return theme.colors.error[600];
  }};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
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
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
  }
`;

const Select = styled.select`
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
  }
`;

const TextArea = styled.textarea`
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
  }
`;

type TabType = 'services' | 'parts' | 'bulk-discounts' | 'seasonal' | 'client-tiers';

const PricingManagement: NextPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('services');
  const [services, setServices] = useState<ServicePricing[]>([]);
  const [parts, setParts] = useState<PartPricing[]>([]);
  const [bulkRules, setBulkRules] = useState<BulkDiscountRule[]>([]);
  const [seasonalPricing, setSeasonalPricing] = useState<SeasonalPricing[]>([]);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadPricingData();
    }
  }, [user]);

  const loadPricingData = async () => {
    try {
      setLoading(true);
      
      // Load all pricing data
      const [servicesSnap, partsSnap, bulkSnap, seasonalSnap, tiersSnap] = await Promise.all([
        getDocs(collection(db, 'servicePricing')),
        getDocs(collection(db, 'partPricing')),
        getDocs(collection(db, 'bulkDiscountRules')),
        getDocs(collection(db, 'seasonalPricing')),
        getDocs(collection(db, 'pricingTiers'))
      ]);
      
      setServices(servicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServicePricing)));
      setParts(partsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PartPricing)));
      setBulkRules(bulkSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BulkDiscountRule)));
      setSeasonalPricing(seasonalSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SeasonalPricing)));
      setPricingTiers(tiersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PricingTier)));
      
    } catch (error) {
      console.error('Error loading pricing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateServicePrice = async (serviceId: string, field: string, value: any) => {
    try {
      await updateDoc(doc(db, 'servicePricing', serviceId), {
        [field]: value,
        lastUpdated: new Date(),
        updatedBy: user?.id
      });
      
      // Update local state
      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, [field]: value, lastUpdated: new Date() }
          : service
      ));
    } catch (error) {
      console.error('Error updating service price:', error);
    }
  };

  const calculateProfitMargin = (sellPrice: number, costPrice: number): number => {
    if (sellPrice === 0) return 0;
    return ((sellPrice - costPrice) / sellPrice) * 100;
  };

  const addBulkDiscountRule = async (rule: Omit<BulkDiscountRule, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'bulkDiscountRules'), rule);
      setBulkRules(prev => [...prev, { id: docRef.id, ...rule }]);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding bulk discount rule:', error);
    }
  };

  const toggleRuleStatus = async (ruleId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'bulkDiscountRules', ruleId), {
        isActive: !currentStatus
      });
      
      setBulkRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, isActive: !currentStatus } : rule
      ));
    } catch (error) {
      console.error('Error toggling rule status:', error);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <Layout>
        <Container>
          <div>Access denied. Admin only.</div>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <Header>
          <Title>Pricing Management</Title>
          <Button
            variant="primary"
            onClick={() => setShowAddForm(true)}
          >
            Add New Rule
          </Button>
        </Header>

        <TabsContainer>
          <Tab 
            active={activeTab === 'services'} 
            onClick={() => setActiveTab('services')}
          >
            Services Pricing
          </Tab>
          <Tab 
            active={activeTab === 'parts'} 
            onClick={() => setActiveTab('parts')}
          >
            Parts Pricing
          </Tab>
          <Tab 
            active={activeTab === 'bulk-discounts'} 
            onClick={() => setActiveTab('bulk-discounts')}
          >
            Bulk Discounts
          </Tab>
          <Tab 
            active={activeTab === 'seasonal'} 
            onClick={() => setActiveTab('seasonal')}
          >
            Seasonal Pricing
          </Tab>
          <Tab 
            active={activeTab === 'client-tiers'} 
            onClick={() => setActiveTab('client-tiers')}
          >
            Client Tiers
          </Tab>
        </TabsContainer>

        <ContentGrid>
          {activeTab === 'services' && (
            <PricingCard>
              <SectionTitle>Service Pricing</SectionTitle>
              <PricingTable>
                <thead>
                  <tr>
                    <th>Service Name</th>
                    <th>Category</th>
                    <th>Base Price (R)</th>
                    <th>Cost Price (R)</th>
                    <th>Profit Margin</th>
                    <th>Duration (min)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map(service => (
                    <tr key={service.id}>
                      <td>{service.name}</td>
                      <td>{service.category}</td>
                      <td>
                        <PriceInput
                          type="number"
                          value={service.basePrice}
                          onChange={(e) => updateServicePrice(service.id, 'basePrice', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td>
                        <PriceInput
                          type="number"
                          value={service.costPrice}
                          onChange={(e) => updateServicePrice(service.id, 'costPrice', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td>
                        <ProfitMargin margin={calculateProfitMargin(service.basePrice, service.costPrice)}>
                          {calculateProfitMargin(service.basePrice, service.costPrice).toFixed(1)}%
                        </ProfitMargin>
                      </td>
                      <td>{service.estimatedDuration}</td>
                      <td>
                        <StatusBadge status={service.isActive ? 'active' : 'inactive'}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </StatusBadge>
                      </td>
                      <td>
                        <ActionButtons>
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button 
                            size="sm" 
                            variant={service.isActive ? 'secondary' : 'primary'}
                            onClick={() => updateServicePrice(service.id, 'isActive', !service.isActive)}
                          >
                            {service.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </ActionButtons>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </PricingTable>
            </PricingCard>
          )}

          {activeTab === 'bulk-discounts' && (
            <PricingCard>
              <SectionTitle>Bulk Discount Rules</SectionTitle>
              
              {showAddForm && (
                <Card style={{ marginBottom: theme.spacing.lg, padding: theme.spacing.lg }}>
                  <h3>Add New Bulk Discount Rule</h3>
                  <BulkDiscountForm 
                    onSubmit={addBulkDiscountRule}
                    onCancel={() => setShowAddForm(false)}
                  />
                </Card>
              )}
              
              <PricingTable>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Service Type</th>
                    <th>Min Quantity</th>
                    <th>Discount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkRules.map(rule => (
                    <tr key={rule.id}>
                      <td>{rule.description}</td>
                      <td>{rule.serviceType}</td>
                      <td>{rule.minimumQuantity}</td>
                      <td>
                        {rule.discountType === 'percentage' 
                          ? `${rule.discountPercentage}%`
                          : `R${rule.discountValue}`
                        }
                      </td>
                      <td>
                        <StatusBadge status={rule.isActive ? 'active' : 'inactive'}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </StatusBadge>
                      </td>
                      <td>
                        <ActionButtons>
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button 
                            size="sm" 
                            variant={rule.isActive ? 'secondary' : 'primary'}
                            onClick={() => toggleRuleStatus(rule.id, rule.isActive)}
                          >
                            {rule.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </ActionButtons>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </PricingTable>
            </PricingCard>
          )}
        </ContentGrid>
      </Container>
    </Layout>
  );
};

// Bulk Discount Form Component
const BulkDiscountForm: React.FC<{
  onSubmit: (rule: Omit<BulkDiscountRule, 'id'>) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    description: '',
    serviceType: 'all' as 'cleaning' | 'repair' | 'all',
    minimumQuantity: 5,
    discountType: 'percentage' as 'percentage' | 'fixed_amount',
    discountPercentage: 10,
    discountValue: 0,
    isActive: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormGrid>
        <FormGroup>
          <Label>Description</Label>
          <Input
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="e.g., 10% off 5+ chairs"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Service Type</Label>
          <Select
            value={formData.serviceType}
            onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value as any }))}
          >
            <option value="all">All Services</option>
            <option value="cleaning">Cleaning Only</option>
            <option value="repair">Repair Only</option>
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label>Minimum Quantity</Label>
          <Input
            type="number"
            value={formData.minimumQuantity}
            onChange={(e) => setFormData(prev => ({ ...prev, minimumQuantity: parseInt(e.target.value) || 0 }))}
            min="1"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Discount Type</Label>
          <Select
            value={formData.discountType}
            onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value as any }))}
          >
            <option value="percentage">Percentage</option>
            <option value="fixed_amount">Fixed Amount</option>
          </Select>
        </FormGroup>
        
        {formData.discountType === 'percentage' ? (
          <FormGroup>
            <Label>Discount Percentage (%)</Label>
            <Input
              type="number"
              value={formData.discountPercentage}
              onChange={(e) => setFormData(prev => ({ ...prev, discountPercentage: parseFloat(e.target.value) || 0 }))}
              min="0"
              max="100"
              step="0.1"
              required
            />
          </FormGroup>
        ) : (
          <FormGroup>
            <Label>Discount Amount (R)</Label>
            <Input
              type="number"
              value={formData.discountValue}
              onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
              min="0"
              step="0.01"
              required
            />
          </FormGroup>
        )}
      </FormGrid>
      
      <ActionButtons>
        <Button type="submit" variant="primary">Add Rule</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </ActionButtons>
    </form>
  );
};

export default PricingManagement;