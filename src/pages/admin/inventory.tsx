import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { useTheme } from 'contexts/ThemeContext';
import { InventoryItem, InventoryMetrics, StockAlert } from 'types/inventory';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { InventoryList } from 'components/inventory/InventoryList';
import { StockAlerts } from 'components/inventory/StockAlerts';
import { InventoryStats } from 'components/inventory/InventoryStats';
import { AddInventoryModal } from 'components/inventory/AddInventoryModal';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from 'lib/firebase';

const InventoryContainer = styled.div<{ theme: any }>`
  max-width: 1600px;
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
  font-size: ${props => props.theme.typography.fontSize['4xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const HeaderSubtitle = styled.p<{ theme: any }>`
  margin: 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xl};
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

const ActionButtons = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const TabsContainer = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.xl};
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
`;

const Tab = styled.button<{ theme: any; active: boolean }>`
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.xl};
  border: none;
  background: ${props => props.active 
    ? props.theme.gradients.primary 
    : 'transparent'
  };
  color: ${props => props.active 
    ? 'white' 
    : props.theme.colors.text.secondary
  };
  border-radius: ${props => props.theme.borderRadius.lg} ${props => props.theme.borderRadius.lg} 0 0;
  cursor: pointer;
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.base};
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active 
      ? props.theme.gradients.primary 
      : props.theme.mode === 'dark' 
        ? 'rgba(51, 65, 85, 0.5)' 
        : props.theme.colors.gray[100]
    };
  }
`;

const ContentSection = styled.div<{ theme: any }>`
  min-height: 600px;
`;

const LoadingState = styled.div<{ theme: any }>`
  text-align: center;
  padding: ${props => props.theme.spacing['4xl']};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const InventoryPage: NextPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'inventory' | 'alerts' | 'reports'>('inventory');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [metrics, setMetrics] = useState<InventoryMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    if (user) {
      loadInventoryData();
    }
  }, [user, router]);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      
      // Load inventory items
      const itemsQuery = query(
        collection(db, 'inventory'),
        orderBy('name', 'asc')
      );
      
      const itemsSnapshot = await getDocs(itemsQuery);
      const itemsData = itemsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        lastStockCheck: doc.data().lastStockCheck?.toDate()
      })) as InventoryItem[];
      
      // Load stock alerts
      const alertsQuery = query(
        collection(db, 'stockAlerts'),
        where('isActive', '==', true),
        orderBy('severity', 'desc')
      );
      
      const alertsSnapshot = await getDocs(alertsQuery);
      const alertsData = alertsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        acknowledgedAt: doc.data().acknowledgedAt?.toDate()
      })) as StockAlert[];
      
      // Calculate metrics
      const totalItems = itemsData.length;
      const totalValue = itemsData.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0);
      const lowStockItems = itemsData.filter(item => item.currentStock <= item.reorderPoint).length;
      const outOfStockItems = itemsData.filter(item => item.currentStock === 0).length;
      const activeAlerts = alertsData.length;
      
      const calculatedMetrics: InventoryMetrics = {
        totalItems,
        totalValue,
        lowStockItems,
        outOfStockItems,
        overstockItems: 0, // Calculate based on business logic
        activeAlerts,
        monthlyUsageValue: 0, // Calculate from stock movements
        averageStockTurnover: 0, // Calculate from historical data
        topUsedItems: [],
        supplierPerformance: []
      };
      
      setInventoryItems(itemsData);
      setStockAlerts(alertsData);
      setMetrics(calculatedMetrics);
    } catch (error) {
      console.error('Error loading inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setShowAddModal(true);
  };

  const handleItemAdded = () => {
    setShowAddModal(false);
    loadInventoryData(); // Refresh data
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <Layout>
        <InventoryContainer theme={theme}>
          <LoadingState theme={theme}>Loading inventory data...</LoadingState>
        </InventoryContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <InventoryContainer theme={theme}>
        <HeaderSection theme={theme}>
          <HeaderTitle theme={theme}>Inventory Management</HeaderTitle>
          <HeaderSubtitle theme={theme}>
            Track supplies, parts, and materials for chair services
          </HeaderSubtitle>
        </HeaderSection>

        <ActionsSection theme={theme}>
          {metrics && <InventoryStats metrics={metrics} />}
          
          <ActionButtons theme={theme}>
            <Button
              variant="outline"
              onClick={() => router.push('/admin/inventory/reports')}
            >
              View Reports
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push('/admin/inventory/purchase-orders')}
            >
              Purchase Orders
            </Button>
            <Button
              variant="primary"
              onClick={handleAddItem}
            >
              Add Item
            </Button>
          </ActionButtons>
        </ActionsSection>

        <TabsContainer theme={theme}>
          <Tab
            theme={theme}
            active={activeTab === 'inventory'}
            onClick={() => setActiveTab('inventory')}
          >
            Inventory Items ({inventoryItems.length})
          </Tab>
          <Tab
            theme={theme}
            active={activeTab === 'alerts'}
            onClick={() => setActiveTab('alerts')}
          >
            Stock Alerts ({stockAlerts.length})
          </Tab>
          <Tab
            theme={theme}
            active={activeTab === 'reports'}
            onClick={() => setActiveTab('reports')}
          >
            Usage Reports
          </Tab>
        </TabsContainer>

        <ContentSection theme={theme}>
          {activeTab === 'inventory' && (
            <InventoryList 
              items={inventoryItems} 
              onItemUpdate={loadInventoryData}
            />
          )}
          
          {activeTab === 'alerts' && (
            <StockAlerts 
              alerts={stockAlerts} 
              onAlertUpdate={loadInventoryData}
            />
          )}
          
          {activeTab === 'reports' && (
            <div style={{ 
              textAlign: 'center', 
              padding: theme.spacing['4xl'],
              color: theme.colors.text.secondary 
            }}>
              <h3 style={{ 
                margin: `0 0 ${theme.spacing.lg} 0`,
                color: theme.colors.text.primary,
                fontSize: theme.typography.fontSize['2xl'],
                fontWeight: theme.typography.fontWeight.bold
              }}>
                Usage Reports
              </h3>
              <p style={{ 
                margin: 0,
                fontSize: theme.typography.fontSize.lg,
                lineHeight: theme.typography.lineHeight.relaxed
              }}>
                Detailed usage analytics and reports coming soon.
              </p>
            </div>
          )}
        </ContentSection>

        {showAddModal && (
          <AddInventoryModal
            onClose={() => setShowAddModal(false)}
            onItemAdded={handleItemAdded}
          />
        )}
      </InventoryContainer>
    </Layout>
  );
};

export default InventoryPage;