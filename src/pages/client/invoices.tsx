import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { theme } from 'styles/theme';
import { Invoice } from 'types/invoice';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from 'lib/firebase';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing.xl};
`;

const Header = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const Title = styled.h1`
  margin: 0 0 ${theme.spacing.md} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.lg};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

const StatCard = styled(Card)`
  padding: ${theme.spacing.lg};
  text-align: center;
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
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: ${theme.typography.fontWeight.medium};
`;

const InvoicesTable = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${theme.shadows.sm};
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr 120px 120px 120px 150px;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  background: ${theme.colors.gray[50]};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  border-bottom: 1px solid ${theme.colors.border.primary};
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr 120px 120px 120px 150px;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border.primary};
  align-items: center;
  
  &:hover {
    background: ${theme.colors.gray[25]};
  }
`;

const StatusBadge = styled.span<{ status: Invoice['status'] }>`
  padding: 4px 8px;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  
  ${props => {
    switch (props.status) {
      case 'Draft':
        return `
          background: ${theme.colors.gray[100]};
          color: ${theme.colors.gray[700]};
        `;
      case 'Sent':
        return `
          background: ${theme.colors.primary[100]};
          color: ${theme.colors.primary[700]};
        `;
      case 'Paid':
        return `
          background: ${theme.colors.success[100]};
          color: ${theme.colors.success[700]};
        `;
      case 'Overdue':
        return `
          background: ${theme.colors.error[100]};
          color: ${theme.colors.error[700]};
        `;
      case 'Cancelled':
        return `
          background: ${theme.colors.gray[100]};
          color: ${theme.colors.gray[500]};
        `;
      default:
        return `
          background: ${theme.colors.gray[100]};
          color: ${theme.colors.gray[700]};
        `;
    }
  }}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing['4xl']};
  color: ${theme.colors.text.secondary};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${theme.spacing['4xl']};
  color: ${theme.colors.text.secondary};
`;

const ClientInvoicesPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    totalAmount: 0,
    paidAmount: 0,
    outstandingAmount: 0
  });

  useEffect(() => {
    if (user && user.role !== 'client') {
      router.push('/dashboard');
    } else if (user) {
      loadInvoices();
    }
  }, [user, router]);

  const loadInvoices = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const invoicesQuery = query(
        collection(db, 'invoices'),
        where('clientId', '==', user.id),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(invoicesQuery);
      const invoicesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        return {
          id: doc.id,
          ...data,
          // Ensure numeric fields have default values
          total: typeof data.total === 'number' ? data.total : (data.totalAmount || 0),
          subtotal: typeof data.subtotal === 'number' ? data.subtotal : (data.amount || 0),
          vatAmount: typeof data.vatAmount === 'number' ? data.vatAmount : 0,
          // Handle date fields
          issueDate: data.issueDate?.toDate ? data.issueDate.toDate() : (data.issueDate ? new Date(data.issueDate) : new Date()),
          dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : (data.dueDate ? new Date(data.dueDate) : new Date()),
          sentDate: data.sentDate?.toDate ? data.sentDate.toDate() : (data.sentDate ? new Date(data.sentDate) : null),
          paidDate: data.paidDate?.toDate ? data.paidDate.toDate() : (data.paidDate ? new Date(data.paidDate) : null),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date()),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : new Date()),
          // Ensure required fields exist
          invoiceNumber: data.invoiceNumber || `INV-${Date.now()}`,
          clientName: data.clientName || user.name,
          status: data.status || 'Draft'
        };
      }) as Invoice[];
      
      setInvoices(invoicesData);
      
      // Calculate stats
      const newStats = {
        total: invoicesData.length,
        totalAmount: invoicesData.reduce((sum, inv) => sum + (inv.total || 0), 0),
        paidAmount: invoicesData.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + (inv.total || 0), 0),
        outstandingAmount: invoicesData.filter(inv => ['Sent', 'Overdue'].includes(inv.status)).reduce((sum, inv) => sum + (inv.total || 0), 0)
      };
      
      setStats(newStats);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    const validAmount = isNaN(amount) || amount === null || amount === undefined ? 0 : amount;
    
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(validAmount);
  };

  const formatDate = (date: Date | any) => {
    if (!date) return 'N/A';
    
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      
      if (isNaN(dateObj.getTime())) {
        return 'N/A';
      }
      
      return dateObj.toLocaleDateString('en-ZA');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  if (!user || user.role !== 'client') {
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
          <LoadingState>Loading your invoices...</LoadingState>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <Header>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Title>Your Invoices</Title>
              <Subtitle>
                View and manage your service invoices
              </Subtitle>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/client/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </Header>

        <StatsGrid>
          <StatCard>
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total Invoices</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatValue>{formatCurrency(stats.totalAmount)}</StatValue>
            <StatLabel>Total Amount</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatValue>{formatCurrency(stats.paidAmount)}</StatValue>
            <StatLabel>Paid Amount</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatValue>{formatCurrency(stats.outstandingAmount)}</StatValue>
            <StatLabel>Outstanding</StatLabel>
          </StatCard>
        </StatsGrid>

        <InvoicesTable>
          <TableHeader>
            <div>Invoice #</div>
            <div>Service</div>
            <div>Amount</div>
            <div>Status</div>
            <div>Due Date</div>
            <div>Actions</div>
          </TableHeader>
          
          {invoices.length === 0 ? (
            <EmptyState>
              <h3>No invoices found</h3>
              <p>Your service invoices will appear here once generated.</p>
            </EmptyState>
          ) : (
            invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <div>{invoice.invoiceNumber}</div>
                <div>Chair Service</div>
                <div>{formatCurrency(invoice.total)}</div>
                <div>
                  <StatusBadge status={invoice.status}>
                    {invoice.status}
                  </StatusBadge>
                </div>
                <div>{formatDate(invoice.dueDate)}</div>
                <div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/invoices/${invoice.id}`)}
                  >
                    View Invoice
                  </Button>
                </div>
              </TableRow>
            ))
          )}
        </InvoicesTable>
      </Container>
    </Layout>
  );
};

export default ClientInvoicesPage;