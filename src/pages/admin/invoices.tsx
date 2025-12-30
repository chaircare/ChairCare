import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { Invoice } from 'types/invoice';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { theme } from 'styles/theme';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from 'lib/firebase';
import { updateInvoiceStatus } from 'lib/invoice-generator';

const InvoicesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
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

const InvoicesTable = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${theme.shadows.sm};
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr 120px 100px 120px 120px 150px;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  background: ${theme.colors.gray[50]};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  border-bottom: 1px solid ${theme.colors.border.primary};
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr 120px 100px 120px 120px 150px;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border.primary};
  align-items: center;
  
  &:hover {
    background: ${theme.colors.gray[50]};
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

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const InvoicesPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    sent: 0,
    paid: 0,
    overdue: 0,
    totalAmount: 0,
    paidAmount: 0,
    outstandingAmount: 0
  });

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Load invoices
  useEffect(() => {
    loadInvoices();
  }, [statusFilter]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      
      let invoicesQuery = query(
        collection(db, 'invoices'),
        orderBy('createdAt', 'desc')
      );
      
      if (statusFilter !== 'all') {
        invoicesQuery = query(
          collection(db, 'invoices'),
          where('status', '==', statusFilter),
          orderBy('createdAt', 'desc')
        );
      }
      
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
          clientName: data.clientName || 'Unknown Client',
          status: data.status || 'Draft'
        };
      }) as Invoice[];
      
      setInvoices(invoicesData);
      
      // Calculate stats
      const newStats = {
        total: invoicesData.length,
        draft: invoicesData.filter(inv => inv.status === 'Draft').length,
        sent: invoicesData.filter(inv => inv.status === 'Sent').length,
        paid: invoicesData.filter(inv => inv.status === 'Paid').length,
        overdue: invoicesData.filter(inv => inv.status === 'Overdue').length,
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

  const handleStatusChange = async (invoiceId: string, newStatus: Invoice['status']) => {
    try {
      if (newStatus === 'Sent') {
        // Send invoice email when marking as sent
        const response = await fetch(`/api/invoices/${invoiceId}/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to send invoice');
        }

        alert('Invoice sent successfully to client!');
      } else {
        // For other status changes, just update the status
        await updateInvoiceStatus(invoiceId, newStatus);
      }
      
      loadInvoices(); // Reload data
    } catch (error) {
      console.error('Error updating invoice status:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to update invoice'}`);
    }
  };

  const formatCurrency = (amount: number) => {
    // Handle NaN, null, undefined, or invalid numbers
    const validAmount = isNaN(amount) || amount === null || amount === undefined ? 0 : amount;
    
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(validAmount);
  };

  const formatDate = (date: Date | any) => {
    if (!date) return 'N/A';
    
    try {
      // Handle Firestore Timestamp objects
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return 'N/A';
      }
      
      return dateObj.toLocaleDateString('en-ZA');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Layout>
      <InvoicesContainer>
        <HeaderSection>
          <HeaderTitle>Invoice Management</HeaderTitle>
          <p>Manage invoices, track payments, and monitor outstanding amounts</p>
        </HeaderSection>

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

        <FiltersSection>
          <FiltersGrid>
            <FilterGroup>
              <Label>Filter by Status</Label>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Invoices</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
              </Select>
            </FilterGroup>
            <div>
              <Button onClick={loadInvoices} variant="outline">
                Refresh
              </Button>
            </div>
          </FiltersGrid>
        </FiltersSection>

        <InvoicesTable>
          <TableHeader>
            <div>Invoice #</div>
            <div>Client</div>
            <div>Amount</div>
            <div>Status</div>
            <div>Issue Date</div>
            <div>Due Date</div>
            <div>Actions</div>
          </TableHeader>
          
          {loading ? (
            <TableRow>
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                Loading invoices...
              </div>
            </TableRow>
          ) : invoices.length === 0 ? (
            <TableRow>
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                No invoices found
              </div>
            </TableRow>
          ) : (
            invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <div>{invoice.invoiceNumber}</div>
                <div>{invoice.clientName}</div>
                <div>{formatCurrency(invoice.total)}</div>
                <div>
                  <StatusBadge status={invoice.status}>
                    {invoice.status}
                  </StatusBadge>
                </div>
                <div>{formatDate(invoice.issueDate)}</div>
                <div>{formatDate(invoice.dueDate)}</div>
                <ActionButtons>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/admin/invoices/${invoice.id}`)}
                  >
                    View
                  </Button>
                  {invoice.status === 'Draft' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleStatusChange(invoice.id, 'Sent')}
                    >
                      Send
                    </Button>
                  )}
                  {invoice.status === 'Sent' && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleStatusChange(invoice.id, 'Paid')}
                    >
                      Mark Paid
                    </Button>
                  )}
                </ActionButtons>
              </TableRow>
            ))
          )}
        </InvoicesTable>
      </InvoicesContainer>
    </Layout>
  );
};

export default InvoicesPage;