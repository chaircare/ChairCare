import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { theme } from 'styles/theme';
import { Service, Part } from 'types/chair-care';
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from 'lib/firebase';

const ServicesContainer = styled.div`
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

const TabsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
`;

const Tab = styled.button<{ active: boolean }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  background: ${props => props.active ? theme.colors.primary[500] : 'white'};
  color: ${props => props.active ? 'white' : theme.colors.text.primary};
  cursor: pointer;
  font-weight: ${theme.typography.fontWeight.medium};
  
  &:hover {
    background: ${props => props.active ? theme.colors.primary[600] : theme.colors.gray[50]};
  }
`;

const ContentCard = styled(Card)`
  padding: ${theme.spacing.xl};
`;

const AddButton = styled(Button)`
  margin-bottom: ${theme.spacing.lg};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: ${theme.spacing.md};
  border-bottom: 2px solid ${theme.colors.gray[300]};
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const TableRow = styled.tr`
  &:nth-of-type(even) {
    background: ${theme.colors.gray[25]};
  }
  
  &:hover {
    background: ${theme.colors.gray[50]};
  }
`;

const TableCell = styled.td`
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border.secondary};
  color: ${theme.colors.text.primary};
`;

const StatusBadge = styled.span<{ active: boolean }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  background: ${props => props.active ? theme.colors.success[100] : theme.colors.gray[100]};
  color: ${props => props.active ? theme.colors.success[800] : theme.colors.gray[800]};
`;

const Modal = styled.div`
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
`;

const ModalContent = styled(Card)`
  width: 100%;
  max-width: 500px;
  padding: ${theme.spacing.xl};
  margin: ${theme.spacing.lg};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
`;

const ModalTitle = styled.h2`
  margin: 0;
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
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const Checkbox = styled.input`
  margin-right: ${theme.spacing.sm};
`;

const FormActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing['2xl']};
  color: ${theme.colors.text.secondary};
`;

type ActiveTab = 'services' | 'parts';

const ServicesManagement: NextPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('services');
  const [services, setServices] = useState<Service[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Service | Part | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    defaultPrice: 0,
    sellPrice: 0,
    costPrice: 0,
    stockLevel: 0,
    active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load services
      const servicesSnapshot = await getDocs(collection(db, 'services'));
      const servicesData = servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Service[];
      setServices(servicesData);

      // Load parts
      const partsSnapshot = await getDocs(collection(db, 'parts'));
      const partsData = partsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Part[];
      setParts(partsData);

      // If no data exists, create default data
      if (servicesData.length === 0) {
        await createDefaultServices();
      }
      if (partsData.length === 0) {
        await createDefaultParts();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultServices = async () => {
    const defaultServices = [
      { name: 'Gas lift replacement', defaultPrice: 200, active: true },
      { name: 'Mechanism repair', defaultPrice: 150, active: true },
      { name: 'Upholstery repair', defaultPrice: 300, active: true },
      { name: 'Chair cleaning', defaultPrice: 80, active: true },
      { name: 'Battery replacement', defaultPrice: 120, active: true },
      { name: 'Armrest repair', defaultPrice: 100, active: true },
      { name: 'Wheel/caster replacement', defaultPrice: 90, active: true },
      { name: 'Full refurbishment', defaultPrice: 500, active: true },
      { name: 'Inspection only', defaultPrice: 50, active: true },
      { name: 'Preventive maintenance', defaultPrice: 60, active: true }
    ];

    for (const service of defaultServices) {
      await addDoc(collection(db, 'services'), {
        ...service,
        createdAt: serverTimestamp()
      });
    }
    
    loadData(); // Reload data
  };

  const createDefaultParts = async () => {
    const defaultParts = [
      { name: 'Gas Lift - Standard', sellPrice: 150, costPrice: 100, stockLevel: 20, active: true },
      { name: 'Gas Lift - Heavy Duty', sellPrice: 200, costPrice: 140, stockLevel: 15, active: true },
      { name: 'Synchro Mechanism', sellPrice: 300, costPrice: 200, stockLevel: 10, active: true },
      { name: 'Tilt Mechanism', sellPrice: 250, costPrice: 170, stockLevel: 12, active: true },
      { name: 'Armrest Set (Pair)', sellPrice: 180, costPrice: 120, stockLevel: 8, active: true },
      { name: 'Wheel Set (5 wheels)', sellPrice: 120, costPrice: 80, stockLevel: 25, active: true },
      { name: '12V Battery', sellPrice: 80, costPrice: 50, stockLevel: 30, active: true },
      { name: 'Fabric Patch Kit', sellPrice: 45, costPrice: 25, stockLevel: 50, active: true },
      { name: 'Foam Cushion', sellPrice: 90, costPrice: 60, stockLevel: 15, active: true }
    ];

    for (const part of defaultParts) {
      await addDoc(collection(db, 'parts'), {
        ...part,
        createdAt: serverTimestamp()
      });
    }
    
    loadData(); // Reload data
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      defaultPrice: 0,
      sellPrice: 0,
      costPrice: 0,
      stockLevel: 0,
      active: true
    });
    setShowModal(true);
  };

  const handleEdit = (item: Service | Part) => {
    setEditingItem(item);
    if ('defaultPrice' in item) {
      // Service
      setFormData({
        name: item.name,
        defaultPrice: item.defaultPrice,
        sellPrice: 0,
        costPrice: 0,
        stockLevel: 0,
        active: item.active
      });
    } else {
      // Part
      setFormData({
        name: item.name,
        defaultPrice: 0,
        sellPrice: item.sellPrice,
        costPrice: item.costPrice || 0,
        stockLevel: item.stockLevel || 0,
        active: item.active
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        // Update existing item
        const collectionName = activeTab === 'services' ? 'services' : 'parts';
        const updateData = activeTab === 'services' 
          ? {
              name: formData.name,
              defaultPrice: formData.defaultPrice,
              active: formData.active,
              updatedAt: serverTimestamp()
            }
          : {
              name: formData.name,
              sellPrice: formData.sellPrice,
              costPrice: formData.costPrice,
              stockLevel: formData.stockLevel,
              active: formData.active,
              updatedAt: serverTimestamp()
            };
        
        await updateDoc(doc(db, collectionName, editingItem.id), updateData);
      } else {
        // Add new item
        const collectionName = activeTab === 'services' ? 'services' : 'parts';
        const newData = activeTab === 'services'
          ? {
              name: formData.name,
              defaultPrice: formData.defaultPrice,
              active: formData.active,
              createdAt: serverTimestamp()
            }
          : {
              name: formData.name,
              sellPrice: formData.sellPrice,
              costPrice: formData.costPrice,
              stockLevel: formData.stockLevel,
              active: formData.active,
              createdAt: serverTimestamp()
            };
        
        await addDoc(collection(db, collectionName), newData);
      }
      
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error saving item. Please try again.');
    }
  };

  if (!user || user.role !== 'admin') {
    return <div>Access denied</div>;
  }

  if (loading) {
    return (
      <ServicesContainer>
        <div>Loading...</div>
      </ServicesContainer>
    );
  }

  return (
    <ServicesContainer>
      <Header>
        <Title>Services & Parts Management</Title>
      </Header>

      <TabsContainer>
        <Tab active={activeTab === 'services'} onClick={() => setActiveTab('services')}>
          Services
        </Tab>
        <Tab active={activeTab === 'parts'} onClick={() => setActiveTab('parts')}>
          Parts
        </Tab>
      </TabsContainer>

      <ContentCard>
        <AddButton variant="primary" onClick={handleAdd}>
          Add {activeTab === 'services' ? 'Service' : 'Part'}
        </AddButton>

        {activeTab === 'services' ? (
          services.length === 0 ? (
            <EmptyState>
              <h3>No services found</h3>
              <p>Add your first service to get started</p>
            </EmptyState>
          ) : (
            <Table>
              <thead>
                <tr>
                  <TableHeader>Service Name</TableHeader>
                  <TableHeader>Default Price</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>R{service.defaultPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <StatusBadge active={service.active}>
                        {service.active ? 'Active' : 'Inactive'}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(service)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          )
        ) : (
          parts.length === 0 ? (
            <EmptyState>
              <h3>No parts found</h3>
              <p>Add your first part to get started</p>
            </EmptyState>
          ) : (
            <Table>
              <thead>
                <tr>
                  <TableHeader>Part Name</TableHeader>
                  <TableHeader>Sell Price</TableHeader>
                  <TableHeader>Cost Price</TableHeader>
                  <TableHeader>Stock Level</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </thead>
              <tbody>
                {parts.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell>{part.name}</TableCell>
                    <TableCell>R{part.sellPrice.toFixed(2)}</TableCell>
                    <TableCell>R{(part.costPrice || 0).toFixed(2)}</TableCell>
                    <TableCell>{part.stockLevel || 0}</TableCell>
                    <TableCell>
                      <StatusBadge active={part.active}>
                        {part.active ? 'Active' : 'Inactive'}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(part)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          )
        )}
      </ContentCard>

      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {editingItem ? 'Edit' : 'Add'} {activeTab === 'services' ? 'Service' : 'Part'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>Ã—</CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Name</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </FormGroup>

              {activeTab === 'services' ? (
                <FormGroup>
                  <Label>Default Price (ZAR)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.defaultPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, defaultPrice: parseFloat(e.target.value) || 0 }))}
                    required
                  />
                </FormGroup>
              ) : (
                <>
                  <FormGroup>
                    <Label>Sell Price (ZAR)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.sellPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, sellPrice: parseFloat(e.target.value) || 0 }))}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Cost Price (ZAR)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.costPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, costPrice: parseFloat(e.target.value) || 0 }))}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Stock Level</Label>
                    <Input
                      type="number"
                      value={formData.stockLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, stockLevel: parseInt(e.target.value) || 0 }))}
                    />
                  </FormGroup>
                </>
              )}

              <FormGroup>
                <Label>
                  <Checkbox
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  />
                  Active
                </Label>
              </FormGroup>

              <FormActions>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingItem ? 'Update' : 'Add'}
                </Button>
              </FormActions>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </ServicesContainer>
  );
};

export default ServicesManagement;
