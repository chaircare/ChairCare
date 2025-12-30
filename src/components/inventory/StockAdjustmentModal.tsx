import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { useTheme } from 'contexts/ThemeContext';
import { InventoryItem, StockAdjustment, StockMovement } from 'types/inventory';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from 'lib/firebase';

interface StockAdjustmentModalProps {
  item: InventoryItem;
  onClose: () => void;
  onAdjustmentComplete: () => void;
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

const ItemInfo = styled.div<{ theme: any }>`
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(51, 65, 85, 0.5)' 
    : props.theme.colors.gray[50]
  };
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.xl};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const ItemName = styled.div<{ theme: any }>`
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.lg};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ItemDetails = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const FormGroup = styled.div<{ theme: any }>`
  margin-bottom: ${props => props.theme.spacing.lg};
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

const StockPreview = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(51, 65, 85, 0.5)' 
    : props.theme.colors.gray[50]
  };
  border-radius: ${props => props.theme.borderRadius.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const StockItem = styled.div<{ theme: any }>`
  text-align: center;
`;

const StockLabel = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-transform: uppercase;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StockValue = styled.div<{ theme: any; highlight?: boolean }>`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.highlight 
    ? props.theme.colors.primary[600]
    : props.theme.colors.text.primary
  };
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

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  item,
  onClose,
  onAdjustmentComplete
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const [adjustmentType, setAdjustmentType] = useState<'set' | 'add' | 'subtract'>('set');
  const [quantity, setQuantity] = useState<string>('');
  const [reason, setReason] = useState<'damaged' | 'lost' | 'found' | 'expired' | 'correction' | 'other'>('correction');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateNewStock = () => {
    const qty = parseInt(quantity) || 0;
    switch (adjustmentType) {
      case 'set':
        return qty;
      case 'add':
        return item.currentStock + qty;
      case 'subtract':
        return Math.max(0, item.currentStock - qty);
      default:
        return item.currentStock;
    }
  };

  const newStock = calculateNewStock();
  const adjustmentQuantity = newStock - item.currentStock;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quantity || parseInt(quantity) < 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (adjustmentType === 'set' && parseInt(quantity) < 0) {
      setError('Stock quantity cannot be negative');
      return;
    }

    if (!user) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create stock adjustment record
      const adjustmentData: Omit<StockAdjustment, 'id'> = {
        itemId: item.id,
        previousQuantity: item.currentStock,
        newQuantity: newStock,
        adjustmentQuantity,
        reason,
        notes,
        performedBy: user.id,
        performedAt: new Date(),
        approved: true, // Auto-approve for now
        approvedBy: user.id,
        approvedAt: new Date()
      };

      await addDoc(collection(db, 'stockAdjustments'), adjustmentData);

      // Create stock movement record
      const movementData: Omit<StockMovement, 'id'> = {
        itemId: item.id,
        movementType: 'adjustment',
        quantity: Math.abs(adjustmentQuantity),
        reason: `Stock adjustment: ${reason}`,
        reference: `ADJ-${Date.now()}`,
        performedBy: user.id,
        performedAt: new Date(),
        notes
      };

      await addDoc(collection(db, 'stockMovements'), movementData);

      // Update inventory item
      await updateDoc(doc(db, 'inventory', item.id), {
        currentStock: newStock,
        updatedAt: new Date(),
        lastStockCheck: new Date()
      });

      onAdjustmentComplete();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      setError('Failed to adjust stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay theme={theme}>
      <ModalCard theme={theme}>
        <ModalHeader theme={theme}>
          <ModalTitle theme={theme}>Adjust Stock</ModalTitle>
          <CloseButton theme={theme} onClick={onClose}>
            ×
          </CloseButton>
        </ModalHeader>

        <ModalContent theme={theme}>
          <ItemInfo theme={theme}>
            <ItemName theme={theme}>{item.name}</ItemName>
            <ItemDetails theme={theme}>
              Part #: {item.partNumber} • Current Stock: {item.currentStock}
            </ItemDetails>
          </ItemInfo>

          <form onSubmit={handleSubmit}>
            <FormGroup theme={theme}>
              <Label theme={theme}>Adjustment Type</Label>
              <Select
                theme={theme}
                value={adjustmentType}
                onChange={(e) => setAdjustmentType(e.target.value as 'set' | 'add' | 'subtract')}
              >
                <option value="set">Set to specific quantity</option>
                <option value="add">Add to current stock</option>
                <option value="subtract">Subtract from current stock</option>
              </Select>
            </FormGroup>

            <FormGroup theme={theme}>
              <Label theme={theme}>
                {adjustmentType === 'set' ? 'New Quantity' : 
                 adjustmentType === 'add' ? 'Quantity to Add' : 'Quantity to Subtract'}
              </Label>
              <Input
                theme={theme}
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                required
              />
            </FormGroup>

            <StockPreview theme={theme}>
              <StockItem theme={theme}>
                <StockLabel theme={theme}>Current Stock</StockLabel>
                <StockValue theme={theme}>{item.currentStock}</StockValue>
              </StockItem>
              <div style={{ fontSize: theme.typography.fontSize['2xl'], color: theme.colors.text.secondary }}>
                →
              </div>
              <StockItem theme={theme}>
                <StockLabel theme={theme}>New Stock</StockLabel>
                <StockValue theme={theme} highlight>{newStock}</StockValue>
              </StockItem>
              <StockItem theme={theme}>
                <StockLabel theme={theme}>Adjustment</StockLabel>
                <StockValue theme={theme} highlight>
                  {adjustmentQuantity > 0 ? '+' : ''}{adjustmentQuantity}
                </StockValue>
              </StockItem>
            </StockPreview>

            <FormGroup theme={theme}>
              <Label theme={theme}>Reason</Label>
              <Select
                theme={theme}
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
              >
                <option value="correction">Stock count correction</option>
                <option value="damaged">Damaged items</option>
                <option value="lost">Lost items</option>
                <option value="found">Found items</option>
                <option value="expired">Expired items</option>
                <option value="other">Other</option>
              </Select>
            </FormGroup>

            <FormGroup theme={theme}>
              <Label theme={theme}>Notes (Optional)</Label>
              <TextArea
                theme={theme}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about this adjustment..."
              />
            </FormGroup>

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
                disabled={!quantity}
              >
                {loading ? 'Adjusting...' : 'Adjust Stock'}
              </Button>
            </ModalActions>
          </form>
        </ModalContent>
      </ModalCard>
    </ModalOverlay>
  );
};