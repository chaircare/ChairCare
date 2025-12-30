import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useTheme } from 'contexts/ThemeContext';
import { InventoryItem } from 'types/inventory';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { StockAdjustmentModal } from './StockAdjustmentModal';

interface InventoryListProps {
  items: InventoryItem[];
  onItemUpdate: () => void;
}

const ListContainer = styled.div<{ theme: any }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const ItemCard = styled(Card)<{ theme: any; lowStock: boolean }>`
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.8)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  border: 1px solid ${props => props.lowStock 
    ? props.theme.colors.warning[300]
    : props.theme.colors.border.primary
  };
  border-radius: ${props => props.theme.borderRadius.xl};
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const ItemHeader = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ItemInfo = styled.div<{ theme: any }>`
  flex: 1;
`;

const ItemName = styled.h3<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const ItemPartNumber = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ItemDescription = styled.p<{ theme: any }>`
  margin: 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
`;

const StockInfo = styled.div<{ theme: any }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin: ${props => props.theme.spacing.lg} 0;
`;

const StockItem = styled.div<{ theme: any }>`
  text-align: center;
`;

const StockLabel = styled.div<{ theme: any }>`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StockValue = styled.div<{ theme: any; warning?: boolean }>`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.warning 
    ? props.theme.colors.warning[600]
    : props.theme.colors.text.primary
  };
`;

const StatusBadge = styled.span<{ theme: any; status: string }>`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  ${({ status, theme }) => {
    switch (status) {
      case 'low':
        return `background: ${theme.colors.warning[100]}; color: ${theme.colors.warning[700]};`;
      case 'out':
        return `background: ${theme.colors.error[100]}; color: ${theme.colors.error[700]};`;
      case 'good':
        return `background: ${theme.colors.success[100]}; color: ${theme.colors.success[700]};`;
      default:
        return `background: ${theme.colors.gray[100]}; color: ${theme.colors.gray[700]};`;
    }
  }}
`;

const ItemActions = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.lg};
  padding-top: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border.primary};
`;

const FilterSection = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
  align-items: center;
  flex-wrap: wrap;
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

const SearchInput = styled.input<{ theme: any }>`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  min-width: 250px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
  }
`;

const EmptyState = styled.div<{ theme: any }>`
  text-align: center;
  padding: ${props => props.theme.spacing['4xl']};
  color: ${props => props.theme.colors.text.secondary};
  
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

export const InventoryList: React.FC<InventoryListProps> = ({ items, onItemUpdate }) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) return 'out';
    if (item.currentStock <= item.reorderPoint) return 'low';
    return 'good';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || item.category.name === categoryFilter;
    
    const stockStatus = getStockStatus(item);
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'low' && stockStatus === 'low') ||
                        (stockFilter === 'out' && stockStatus === 'out') ||
                        (stockFilter === 'good' && stockStatus === 'good');
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const categories = Array.from(new Set(items.map(item => item.category.name)));

  const handleStockAdjustment = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowAdjustmentModal(true);
  };

  const handleAdjustmentComplete = () => {
    setShowAdjustmentModal(false);
    setSelectedItem(null);
    onItemUpdate();
  };

  return (
    <>
      <FilterSection theme={theme}>
        <SearchInput
          theme={theme}
          type="text"
          placeholder="Search items by name, part number, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div>
          <label style={{ 
            marginRight: theme.spacing.sm, 
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text.primary
          }}>
            Category:
          </label>
          <FilterSelect
            theme={theme}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </FilterSelect>
        </div>
        
        <div>
          <label style={{ 
            marginRight: theme.spacing.sm, 
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text.primary
          }}>
            Stock Status:
          </label>
          <FilterSelect
            theme={theme}
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="all">All Items</option>
            <option value="good">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </FilterSelect>
        </div>
      </FilterSection>

      {filteredItems.length === 0 ? (
        <EmptyState theme={theme}>
          <h3>No Items Found</h3>
          <p>No inventory items match your current filters.</p>
        </EmptyState>
      ) : (
        <ListContainer theme={theme}>
          {filteredItems.map((item) => {
            const stockStatus = getStockStatus(item);
            const isLowStock = stockStatus === 'low' || stockStatus === 'out';
            
            return (
              <ItemCard key={item.id} theme={theme} lowStock={isLowStock}>
                <ItemHeader theme={theme}>
                  <ItemInfo theme={theme}>
                    <ItemName theme={theme}>{item.name}</ItemName>
                    <ItemPartNumber theme={theme}>
                      Part #: {item.partNumber}
                    </ItemPartNumber>
                    <ItemDescription theme={theme}>
                      {item.description}
                    </ItemDescription>
                  </ItemInfo>
                  <StatusBadge theme={theme} status={stockStatus}>
                    {stockStatus === 'out' ? 'Out of Stock' : 
                     stockStatus === 'low' ? 'Low Stock' : 'In Stock'}
                  </StatusBadge>
                </ItemHeader>

                <StockInfo theme={theme}>
                  <StockItem theme={theme}>
                    <StockLabel theme={theme}>Current Stock</StockLabel>
                    <StockValue theme={theme} warning={isLowStock}>
                      {item.currentStock}
                    </StockValue>
                  </StockItem>
                  
                  <StockItem theme={theme}>
                    <StockLabel theme={theme}>Reorder Point</StockLabel>
                    <StockValue theme={theme}>
                      {item.reorderPoint}
                    </StockValue>
                  </StockItem>
                  
                  <StockItem theme={theme}>
                    <StockLabel theme={theme}>Unit Cost</StockLabel>
                    <StockValue theme={theme}>
                      {formatCurrency(item.unitCost)}
                    </StockValue>
                  </StockItem>
                  
                  <StockItem theme={theme}>
                    <StockLabel theme={theme}>Total Value</StockLabel>
                    <StockValue theme={theme}>
                      {formatCurrency(item.currentStock * item.unitCost)}
                    </StockValue>
                  </StockItem>
                  
                  <StockItem theme={theme}>
                    <StockLabel theme={theme}>Location</StockLabel>
                    <StockValue theme={theme}>
                      {item.location}
                    </StockValue>
                  </StockItem>
                  
                  <StockItem theme={theme}>
                    <StockLabel theme={theme}>Supplier</StockLabel>
                    <StockValue theme={theme}>
                      {item.supplier.name}
                    </StockValue>
                  </StockItem>
                </StockInfo>

                <ItemActions theme={theme}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => alert('Item history functionality coming soon!')}
                  >
                    View History
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleStockAdjustment(item)}
                  >
                    Adjust Stock
                  </Button>
                  {isLowStock && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => alert('Reorder functionality coming soon!')}
                    >
                      Reorder
                    </Button>
                  )}
                </ItemActions>
              </ItemCard>
            );
          })}
        </ListContainer>
      )}

      {showAdjustmentModal && selectedItem && (
        <StockAdjustmentModal
          item={selectedItem}
          onClose={() => setShowAdjustmentModal(false)}
          onAdjustmentComplete={handleAdjustmentComplete}
        />
      )}
    </>
  );
};