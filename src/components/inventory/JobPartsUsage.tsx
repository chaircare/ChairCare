import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { useTheme } from 'contexts/ThemeContext';
import { InventoryItem, JobPartsUsage as JobPartsUsageType, StockMovement } from 'types/inventory';
import { Job } from 'types/chair-care';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from 'lib/firebase';

interface JobPartsUsageProps {
  job: Job;
  chairId: string;
  onPartsUsed: (parts: JobPartsUsageType[]) => void;
}

const UsageContainer = styled(Card)<{ theme: any }>`
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.8)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.xl};
  backdrop-filter: blur(10px);
`;

const UsageHeader = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  background: ${props => props.theme.gradients.primary};
  color: white;
  border-radius: ${props => props.theme.borderRadius.xl} ${props => props.theme.borderRadius.xl} 0 0;
`;

const UsageTitle = styled.h3<{ theme: any }>`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const UsageContent = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
`;

const PartsGrid = styled.div<{ theme: any }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const PartCard = styled.div<{ theme: any; selected: boolean }>`
  padding: ${props => props.theme.spacing.lg};
  border: 2px solid ${props => props.selected 
    ? props.theme.colors.primary[500]
    : props.theme.colors.border.primary
  };
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.selected
    ? props.theme.mode === 'dark' 
      ? 'rgba(20, 184, 166, 0.1)' 
      : props.theme.colors.primary[50]
    : props.theme.mode === 'dark' 
      ? 'rgba(51, 65, 85, 0.5)' 
      : props.theme.colors.background.primary
  };
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary[400]};
    transform: translateY(-2px);
  }
`;

const PartName = styled.div<{ theme: any }>`
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.base};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const PartDetails = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const StockInfo = styled.div<{ theme: any; lowStock: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.lowStock
    ? props.theme.colors.warning[100]
    : props.theme.colors.success[100]
  };
  border-radius: ${props => props.theme.borderRadius.sm};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const StockLabel = styled.span<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-transform: uppercase;
`;

const StockValue = styled.span<{ theme: any; lowStock: boolean }>`
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.lowStock
    ? props.theme.colors.warning[700]
    : props.theme.colors.success[700]
  };
`;

const QuantityInput = styled.input<{ theme: any }>`
  width: 100%;
  padding: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
  }
`;

const SelectedPartsSection = styled.div<{ theme: any }>`
  margin-top: ${props => props.theme.spacing.xl};
  padding-top: ${props => props.theme.spacing.xl};
  border-top: 1px solid ${props => props.theme.colors.border.primary};
`;

const SelectedPartsList = styled.div<{ theme: any }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const SelectedPartItem = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(51, 65, 85, 0.5)' 
    : props.theme.colors.gray[50]
  };
  border-radius: ${props => props.theme.borderRadius.lg};
`;

const PartInfo = styled.div<{ theme: any }>`
  flex: 1;
`;

const PartNameSmall = styled.div<{ theme: any }>`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const PartCost = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xs};
`;

const RemoveButton = styled.button<{ theme: any }>`
  background: ${props => props.theme.colors.error[100]};
  border: 1px solid ${props => props.theme.colors.error[300]};
  color: ${props => props.theme.colors.error[700]};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  
  &:hover {
    background: ${props => props.theme.colors.error[200]};
  }
`;

const TotalCost = styled.div<{ theme: any }>`
  text-align: right;
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(51, 65, 85, 0.5)' 
    : props.theme.colors.gray[50]
  };
  border-radius: ${props => props.theme.borderRadius.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const TotalLabel = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const TotalValue = styled.div<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const ActionButtons = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
`;

const LoadingState = styled.div<{ theme: any }>`
  text-align: center;
  padding: ${props => props.theme.spacing['4xl']};
  color: ${props => props.theme.colors.text.secondary};
`;

interface SelectedPart {
  item: InventoryItem;
  quantity: number;
}

export const JobPartsUsage: React.FC<JobPartsUsageProps> = ({ job, chairId, onPartsUsed }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const [availableParts, setAvailableParts] = useState<InventoryItem[]>([]);
  const [selectedParts, setSelectedParts] = useState<SelectedPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAvailableParts();
  }, []);

  const loadAvailableParts = async () => {
    try {
      setLoading(true);
      
      // Load all active inventory items
      const partsQuery = query(
        collection(db, 'inventory'),
        where('isActive', '==', true)
      );
      
      const partsSnapshot = await getDocs(partsQuery);
      const partsData = partsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        lastStockCheck: doc.data().lastStockCheck?.toDate()
      })) as InventoryItem[];
      
      // Filter parts that are in stock
      const inStockParts = partsData.filter(part => part.currentStock > 0);
      
      setAvailableParts(inStockParts);
    } catch (error) {
      console.error('Error loading available parts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePartSelect = (part: InventoryItem) => {
    const existingIndex = selectedParts.findIndex(p => p.item.id === part.id);
    
    if (existingIndex >= 0) {
      // Remove if already selected
      setSelectedParts(prev => prev.filter((_, index) => index !== existingIndex));
    } else {
      // Add with quantity 1
      setSelectedParts(prev => [...prev, { item: part, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (partId: string, quantity: number) => {
    setSelectedParts(prev => 
      prev.map(p => 
        p.item.id === partId 
          ? { ...p, quantity: Math.max(1, Math.min(quantity, p.item.currentStock)) }
          : p
      )
    );
  };

  const handleRemovePart = (partId: string) => {
    setSelectedParts(prev => prev.filter(p => p.item.id !== partId));
  };

  const calculateTotalCost = () => {
    return selectedParts.reduce((total, part) => 
      total + (part.item.unitCost * part.quantity), 0
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const handleSubmitUsage = async () => {
    if (!user || selectedParts.length === 0) return;

    setSubmitting(true);
    try {
      const usageRecords: JobPartsUsageType[] = [];

      for (const selectedPart of selectedParts) {
        // Create job parts usage record
        const usageData: Omit<JobPartsUsageType, 'id'> = {
          jobId: job.id,
          chairId,
          itemId: selectedPart.item.id,
          quantityUsed: selectedPart.quantity,
          unitCost: selectedPart.item.unitCost,
          totalCost: selectedPart.item.unitCost * selectedPart.quantity,
          installedBy: user.id,
          installedAt: new Date(),
          warrantyPeriod: 365, // Default 1 year warranty
          notes: `Used for ${job.jobType} service`
        };

        const usageDoc = await addDoc(collection(db, 'jobPartsUsage'), usageData);
        usageRecords.push({ id: usageDoc.id, ...usageData } as JobPartsUsageType & { id: string });

        // Create stock movement record
        const movementData: Omit<StockMovement, 'id'> = {
          itemId: selectedPart.item.id,
          movementType: 'out',
          quantity: selectedPart.quantity,
          reason: 'Used in job',
          reference: job.jobId,
          unitCost: selectedPart.item.unitCost,
          totalCost: selectedPart.item.unitCost * selectedPart.quantity,
          performedBy: user.id,
          performedAt: new Date(),
          notes: `Used for chair ${chairId} - ${job.jobType} service`
        };

        await addDoc(collection(db, 'stockMovements'), movementData);

        // Update inventory stock
        const newStock = selectedPart.item.currentStock - selectedPart.quantity;
        await updateDoc(doc(db, 'inventory', selectedPart.item.id), {
          currentStock: newStock,
          updatedAt: new Date()
        });

        // Check if stock is low and create alert if needed
        if (newStock <= selectedPart.item.reorderPoint) {
          const alertData = {
            itemId: selectedPart.item.id,
            alertType: newStock === 0 ? 'out_of_stock' : 'low_stock',
            severity: newStock === 0 ? 'critical' : 'high',
            message: newStock === 0 
              ? `${selectedPart.item.name} is out of stock`
              : `${selectedPart.item.name} is running low (${newStock} remaining)`,
            isActive: true,
            createdAt: new Date()
          };

          await addDoc(collection(db, 'stockAlerts'), alertData);
        }
      }

      onPartsUsed(usageRecords);
      setSelectedParts([]);
    } catch (error) {
      console.error('Error recording parts usage:', error);
      alert('Failed to record parts usage. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <UsageContainer theme={theme}>
        <LoadingState theme={theme}>Loading available parts...</LoadingState>
      </UsageContainer>
    );
  }

  return (
    <UsageContainer theme={theme}>
      <UsageHeader theme={theme}>
        <UsageTitle theme={theme}>Parts & Materials Used</UsageTitle>
      </UsageHeader>

      <UsageContent theme={theme}>
        <PartsGrid theme={theme}>
          {availableParts.map((part) => {
            const isSelected = selectedParts.some(p => p.item.id === part.id);
            const isLowStock = part.currentStock <= part.reorderPoint;
            const selectedPart = selectedParts.find(p => p.item.id === part.id);
            
            return (
              <PartCard
                key={part.id}
                theme={theme}
                selected={isSelected}
                onClick={() => handlePartSelect(part)}
              >
                <PartName theme={theme}>{part.name}</PartName>
                <PartDetails theme={theme}>
                  Part #: {part.partNumber}<br />
                  {formatCurrency(part.unitCost)} each
                </PartDetails>
                
                <StockInfo theme={theme} lowStock={isLowStock}>
                  <StockLabel theme={theme}>In Stock</StockLabel>
                  <StockValue theme={theme} lowStock={isLowStock}>
                    {part.currentStock}
                  </StockValue>
                </StockInfo>

                {isSelected && selectedPart && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <label style={{ 
                      display: 'block',
                      marginBottom: theme.spacing.xs,
                      fontSize: theme.typography.fontSize.xs,
                      fontWeight: theme.typography.fontWeight.medium,
                      color: theme.colors.text.secondary
                    }}>
                      Quantity Used:
                    </label>
                    <QuantityInput
                      theme={theme}
                      type="number"
                      min="1"
                      max={part.currentStock}
                      value={selectedPart.quantity}
                      onChange={(e) => handleQuantityChange(part.id, parseInt(e.target.value) || 1)}
                    />
                  </div>
                )}
              </PartCard>
            );
          })}
        </PartsGrid>

        {selectedParts.length > 0 && (
          <SelectedPartsSection theme={theme}>
            <h4 style={{ 
              margin: `0 0 ${theme.spacing.lg} 0`,
              color: theme.colors.text.primary,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.bold
            }}>
              Selected Parts ({selectedParts.length})
            </h4>

            <SelectedPartsList theme={theme}>
              {selectedParts.map((selectedPart) => (
                <SelectedPartItem key={selectedPart.item.id} theme={theme}>
                  <PartInfo theme={theme}>
                    <PartNameSmall theme={theme}>
                      {selectedPart.item.name} × {selectedPart.quantity}
                    </PartNameSmall>
                    <PartCost theme={theme}>
                      {formatCurrency(selectedPart.item.unitCost)} each = {formatCurrency(selectedPart.item.unitCost * selectedPart.quantity)}
                    </PartCost>
                  </PartInfo>
                  <RemoveButton
                    theme={theme}
                    onClick={() => handleRemovePart(selectedPart.item.id)}
                  >
                    Remove
                  </RemoveButton>
                </SelectedPartItem>
              ))}
            </SelectedPartsList>

            <TotalCost theme={theme}>
              <TotalLabel theme={theme}>Total Parts Cost</TotalLabel>
              <TotalValue theme={theme}>{formatCurrency(calculateTotalCost())}</TotalValue>
            </TotalCost>

            <ActionButtons theme={theme}>
              <Button
                variant="outline"
                onClick={() => setSelectedParts([])}
                disabled={submitting}
              >
                Clear All
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitUsage}
                loading={submitting}
                disabled={selectedParts.length === 0}
              >
                {submitting ? 'Recording Usage...' : 'Record Parts Usage'}
              </Button>
            </ActionButtons>
          </SelectedPartsSection>
        )}
      </UsageContent>
    </UsageContainer>
  );
};