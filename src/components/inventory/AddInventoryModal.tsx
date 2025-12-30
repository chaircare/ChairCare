import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { useTheme } from 'contexts/ThemeContext';
import { InventoryItem, InventoryCategory, Supplier } from 'types/inventory';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { collection, addDoc } from 'firebase/firestore';
import { db } from 'lib/firebase';

interface AddInventoryModalProps {
  onClose: () => void;
  onItemAdded: () => void;
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
`;

const TextArea = styled.textarea<{ theme: any }>`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.base};
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
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

export const AddInventoryModal: React.FC<AddInventoryModalProps> = ({ onClose, onItemAdded }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const [formData, setFormData] = useState({
    partNumber: '',
    name: '',
    description: '',
    category: 'parts',
    currentStock: '',
    minimumStock: '',
    reorderPoint: '',
    reorderQuantity: '',
    unitCost: '',
    unitPrice: '',
    location: '',
    supplier: 'default'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Default categories and suppliers for demo
  const categories: InventoryCategory[] = [
    { id: 'parts', name: 'Chair Parts', description: 'Replacement parts for chairs', isActive: true },
    { id: 'cleaning', name: 'Cleaning Supplies', description: 'Cleaning materials and chemicals', isActive: true },
    { id: 'tools', name: 'Tools & Equipment', description: 'Maintenance tools and equipment', isActive: true },
    { id: 'consumables', name: 'Consumables', description: 'Disposable items and consumables', isActive: true }
  ];

  const suppliers: Supplier[] = [
    {
      id: 'default',
      name: 'Default Supplier',
      contactPerson: 'Supply Manager',
      email: 'supplies@chaircare.com',
      phone: '+27 21 123 4567',
      address: 'Cape Town, South Africa',
      paymentTerms: 30,
      leadTime: 7,
      isActive: true,
      rating: 4,
      notes: 'Default supplier for general items'
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.partNumber || !formData.currentStock) {
      setError('Please fill in all required fields');
      return;
    }

    if (!user) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const selectedCategory = categories.find(c => c.id === formData.category) || categories[0];
      const selectedSupplier = suppliers.find(s => s.id === formData.supplier) || suppliers[0];

      const inventoryData: Omit<InventoryItem, 'id'> = {
        partNumber: formData.partNumber,
        name: formData.name,
        description: formData.description,
        category: selectedCategory,
        supplier: selectedSupplier,
        currentStock: parseInt(formData.currentStock) || 0,
        minimumStock: parseInt(formData.minimumStock) || 0,
        reorderPoint: parseInt(formData.reorderPoint) || parseInt(formData.minimumStock) || 0,
        reorderQuantity: parseInt(formData.reorderQuantity) || 10,
        unitCost: parseFloat(formData.unitCost) || 0,
        unitPrice: parseFloat(formData.unitPrice) || parseFloat(formData.unitCost) || 0,
        location: formData.location || 'Main Warehouse',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastStockCheck: new Date()
      };

      await addDoc(collection(db, 'inventory'), inventoryData);
      onItemAdded();
    } catch (error) {
      console.error('Error adding inventory item:', error);
      setError('Failed to add inventory item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay theme={theme}>
      <ModalCard theme={theme}>
        <ModalHeader theme={theme}>
          <ModalTitle theme={theme}>Add Inventory Item</ModalTitle>
          <CloseButton theme={theme} onClick={onClose}>
            ×
          </CloseButton>
        </ModalHeader>

        <ModalContent theme={theme}>
          <form onSubmit={handleSubmit}>
            <FormGrid theme={theme}>
              <FormGroup theme={theme}>
                <Label theme={theme}>Part Number *</Label>
                <Input
                  theme={theme}
                  type="text"
                  value={formData.partNumber}
                  onChange={(e) => handleInputChange('partNumber', e.target.value)}
                  placeholder="e.g., GL-001"
                  required
                />
              </FormGroup>

              <FormGroup theme={theme}>
                <Label theme={theme}>Item Name *</Label>
                <Input
                  theme={theme}
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Gas Lift Cylinder"
                  required
                />
              </FormGroup>

              <FormGroup theme={theme} className="full-width">
                <Label theme={theme}>Description</Label>
                <TextArea
                  theme={theme}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed description of the item..."
                />
              </FormGroup>

              <FormGroup theme={theme}>
                <Label theme={theme}>Category</Label>
                <Select
                  theme={theme}
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup theme={theme}>
                <Label theme={theme}>Supplier</Label>
                <Select
                  theme={theme}
                  value={formData.supplier}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                >
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup theme={theme}>
                <Label theme={theme}>Current Stock *</Label>
                <Input
                  theme={theme}
                  type="number"
                  min="0"
                  value={formData.currentStock}
                  onChange={(e) => handleInputChange('currentStock', e.target.value)}
                  placeholder="0"
                  required
                />
              </FormGroup>

              <FormGroup theme={theme}>
                <Label theme={theme}>Minimum Stock</Label>
                <Input
                  theme={theme}
                  type="number"
                  min="0"
                  value={formData.minimumStock}
                  onChange={(e) => handleInputChange('minimumStock', e.target.value)}
                  placeholder="0"
                />
              </FormGroup>

              <FormGroup theme={theme}>
                <Label theme={theme}>Reorder Point</Label>
                <Input
                  theme={theme}
                  type="number"
                  min="0"
                  value={formData.reorderPoint}
                  onChange={(e) => handleInputChange('reorderPoint', e.target.value)}
                  placeholder="Auto-calculated from minimum stock"
                />
              </FormGroup>

              <FormGroup theme={theme}>
                <Label theme={theme}>Reorder Quantity</Label>
                <Input
                  theme={theme}
                  type="number"
                  min="1"
                  value={formData.reorderQuantity}
                  onChange={(e) => handleInputChange('reorderQuantity', e.target.value)}
                  placeholder="10"
                />
              </FormGroup>

              <FormGroup theme={theme}>
                <Label theme={theme}>Unit Cost (R)</Label>
                <Input
                  theme={theme}
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unitCost}
                  onChange={(e) => handleInputChange('unitCost', e.target.value)}
                  placeholder="0.00"
                />
              </FormGroup>

              <FormGroup theme={theme}>
                <Label theme={theme}>Unit Price (R)</Label>
                <Input
                  theme={theme}
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => handleInputChange('unitPrice', e.target.value)}
                  placeholder="Auto-calculated from cost"
                />
              </FormGroup>

              <FormGroup theme={theme} className="full-width">
                <Label theme={theme}>Storage Location</Label>
                <Input
                  theme={theme}
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Warehouse A, Shelf 1"
                />
              </FormGroup>
            </FormGrid>

            {error && <ErrorMessage theme={theme}>{error}</ErrorMessage>}

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
                disabled={!formData.name || !formData.partNumber || !formData.currentStock}
              >
                {loading ? 'Adding...' : 'Add Item'}
              </Button>
            </ModalActions>
          </form>
        </ModalContent>
      </ModalCard>
    </ModalOverlay>
  );
};