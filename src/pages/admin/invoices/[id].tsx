import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { useTheme } from 'contexts/ThemeContext';
import { Job, Chair } from 'types/chair-care';
import { JobPartsUsage } from 'types/inventory';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc } from 'firebase/firestore';
import { db } from 'lib/firebase';

const InvoiceContainer = styled.div<{ theme: any }>`
  max-width: 800px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl};
`;

const InvoiceCard = styled(Card)<{ theme: any }>`
  background: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.lg};
`;

const InvoiceHeader = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const CompanyInfo = styled.div<{ theme: any }>`
  h1 {
    margin: 0 0 ${props => props.theme.spacing.sm} 0;
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.typography.fontSize['2xl']};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
  }
  
  p {
    margin: 0;
    color: ${props => props.theme.colors.text.secondary};
    font-size: ${props => props.theme.typography.fontSize.sm};
    line-height: ${props => props.theme.typography.lineHeight.relaxed};
  }
`;

const InvoiceInfo = styled.div<{ theme: any }>`
  text-align: right;
  
  h2 {
    margin: 0 0 ${props => props.theme.spacing.md} 0;
    color: ${props => props.theme.colors.primary[600]};
    font-size: ${props => props.theme.typography.fontSize.xl};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
  }
  
  p {
    margin: 0 0 ${props => props.theme.spacing.xs} 0;
    color: ${props => props.theme.colors.text.secondary};
    font-size: ${props => props.theme.typography.fontSize.sm};
  }
`;

const ClientInfo = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  
  h3 {
    margin: 0 0 ${props => props.theme.spacing.md} 0;
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.typography.fontSize.lg};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
  }
  
  p {
    margin: 0 0 ${props => props.theme.spacing.xs} 0;
    color: ${props => props.theme.colors.text.secondary};
    font-size: ${props => props.theme.typography.fontSize.sm};
  }
`;

const InvoiceTable = styled.table<{ theme: any }>`
  width: 100%;
  border-collapse: collapse;
  margin: ${props => props.theme.spacing.xl} 0;
  
  th, td {
    padding: ${props => props.theme.spacing.md};
    text-align: left;
    border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  }
  
  th {
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(51, 65, 85, 0.5)' 
      : props.theme.colors.gray[50]
    };
    color: ${props => props.theme.colors.text.primary};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    font-size: ${props => props.theme.typography.fontSize.sm};
  }
  
  td {
    color: ${props => props.theme.colors.text.secondary};
    font-size: ${props => props.theme.typography.fontSize.sm};
  }
`;

const InvoiceSummary = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
  border-top: 1px solid ${props => props.theme.colors.border.primary};
  display: flex;
  justify-content: flex-end;
`;

const SummaryTable = styled.div<{ theme: any }>`
  min-width: 300px;
`;

const SummaryRow = styled.div<{ theme: any; isTotal?: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.sm} 0;
  border-bottom: ${props => props.isTotal ? `2px solid ${props.theme.colors.primary[500]}` : 'none'};
  
  span:first-of-type {
    color: ${props => props.theme.colors.text.secondary};
    font-weight: ${props => props.isTotal 
      ? props.theme.typography.fontWeight.bold 
      : props.theme.typography.fontWeight.medium
    };
  }
  
  span:last-of-type {
    color: ${props => props.theme.colors.text.primary};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
    font-size: ${props => props.isTotal 
      ? props.theme.typography.fontSize.lg 
      : props.theme.typography.fontSize.base
    };
  }
`;

const ActionButtons = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.xl};
  padding-top: ${props => props.theme.spacing.xl};
  border-top: 1px solid ${props => props.theme.colors.border.primary};
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
      case 'paid':
        return `background: ${theme.colors.success[100]}; color: ${theme.colors.success[700]};`;
      case 'pending':
        return `background: ${theme.colors.warning[100]}; color: ${theme.colors.warning[700]};`;
      case 'overdue':
        return `background: ${theme.colors.error[100]}; color: ${theme.colors.error[700]};`;
      default:
        return `background: ${theme.colors.gray[100]}; color: ${theme.colors.gray[700]};`;
    }
  }}
`;

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  jobId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const InvoicePage: NextPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = router.query;
  
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    if (id) {
      loadInvoiceData();
    }
  }, [id, user, router]);

  const loadInvoiceData = async () => {
    try {
      setLoading(true);
      
      // Check if this is a job ID (generate invoice) or invoice ID (view existing)
      if (typeof id === 'string' && id.startsWith('job-')) {
        const jobId = id.replace('job-', '');
        await generateInvoiceFromJob(jobId);
      } else {
        await loadExistingInvoice(id as string);
      }
    } catch (error) {
      console.error('Error loading invoice data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceFromJob = async (jobId: string) => {
    try {
      // Load job details
      const jobDoc = await getDoc(doc(db, 'jobs', jobId));
      if (!jobDoc.exists()) {
        router.push('/admin/jobs');
        return;
      }
      
      const jobData = {
        id: jobDoc.id,
        ...jobDoc.data(),
        scheduledDate: jobDoc.data().scheduledDate?.toDate(),
        createdAt: jobDoc.data().createdAt?.toDate(),
        completedAt: jobDoc.data().completedAt?.toDate()
      } as Job;
      
      // Load parts used in job
      const partsQuery = query(
        collection(db, 'jobPartsUsage'),
        where('jobId', '==', jobId)
      );
      
      const partsSnapshot = await getDocs(partsQuery);
      const partsUsed = partsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JobPartsUsage[];
      
      // Generate invoice items
      const items: InvoiceItem[] = [];
      
      // Add service charge
      const serviceRate = getServiceRate(jobData.jobType);
      items.push({
        description: `${jobData.jobType} Service - ${jobData.chairs?.length || 1} chair(s)`,
        quantity: jobData.chairs?.length || 1,
        unitPrice: serviceRate,
        total: serviceRate * (jobData.chairs?.length || 1)
      });
      
      // Add parts used
      partsUsed.forEach(part => {
        items.push({
          description: `Parts: ${part.itemId}`, // Would need to lookup item name
          quantity: part.quantityUsed,
          unitPrice: part.unitCost,
          total: part.totalCost
        });
      });
      
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const tax = subtotal * 0.15; // 15% VAT
      const total = subtotal + tax;
      
      const invoiceData: InvoiceData = {
        id: `INV-${Date.now()}`,
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        jobId: jobData.id,
        clientId: jobData.clientId || '',
        clientName: jobData.clientName,
        clientEmail: jobData.clientEmail || '',
        status: 'draft',
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        items,
        subtotal,
        tax,
        total,
        notes: `Service completed on ${jobData.completedAt?.toLocaleDateString('en-ZA') || 'N/A'}`
      };
      
      setInvoice(invoiceData);
      setJob(jobData);
    } catch (error) {
      console.error('Error generating invoice:', error);
    }
  };

  const loadExistingInvoice = async (invoiceId: string) => {
    try {
      const invoiceDoc = await getDoc(doc(db, 'invoices', invoiceId));
      if (!invoiceDoc.exists()) {
        router.push('/admin/invoices');
        return;
      }
      
      const invoiceData = {
        id: invoiceDoc.id,
        ...invoiceDoc.data(),
        issueDate: invoiceDoc.data().issueDate?.toDate(),
        dueDate: invoiceDoc.data().dueDate?.toDate()
      } as InvoiceData;
      
      setInvoice(invoiceData);
    } catch (error) {
      console.error('Error loading invoice:', error);
    }
  };

  const getServiceRate = (serviceType: string): number => {
    const rates = {
      'cleaning': 150,
      'repair': 300,
      'maintenance': 200,
      'inspection': 100
    };
    return rates[serviceType as keyof typeof rates] || 200;
  };

  const saveInvoice = async () => {
    if (!invoice) return;
    
    setGenerating(true);
    try {
      await addDoc(collection(db, 'invoices'), {
        ...invoice,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user?.id
      });
      
      // Update job with invoice reference
      if (job) {
        await updateDoc(doc(db, 'jobs', job.id), {
          invoiceGenerated: true,
          invoiceId: invoice.id,
          updatedAt: new Date()
        });
      }
      
      router.push('/admin/invoices');
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Failed to save invoice. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const sendInvoice = async () => {
    if (!invoice) return;
    
    try {
      // Send invoice via API endpoint (which will send email and update status)
      const response = await fetch(`/api/invoices/${invoice.id}/send`, {
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
      setInvoice(prev => prev ? { ...prev, status: 'sent' } : null);
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert(`Failed to send invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const formatDate = (date: Date | any) => {
    if (!date) return 'N/A';
    
    // Handle Firestore Timestamp objects
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    
    return dateObj.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (loading || !invoice) {
    return (
      <Layout>
        <InvoiceContainer theme={theme}>
          <div style={{ textAlign: 'center', padding: theme.spacing['4xl'] }}>
            Loading invoice...
          </div>
        </InvoiceContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <InvoiceContainer theme={theme}>
        <InvoiceCard theme={theme}>
          <InvoiceHeader theme={theme}>
            <CompanyInfo theme={theme}>
              <h1>Chair Care Solutions</h1>
              <p>
                Professional Chair Maintenance Services<br />
                Cape Town, South Africa<br />
                Email: billing@chaircare.co.za<br />
                Phone: +27 21 123 4567
              </p>
            </CompanyInfo>
            
            <InvoiceInfo theme={theme}>
              <h2>INVOICE</h2>
              <p><strong>Invoice #:</strong> {invoice.invoiceNumber}</p>
              <p><strong>Issue Date:</strong> {formatDate(invoice.issueDate)}</p>
              <p><strong>Due Date:</strong> {formatDate(invoice.dueDate)}</p>
              <StatusBadge theme={theme} status={invoice.status}>
                {invoice.status}
              </StatusBadge>
            </InvoiceInfo>
          </InvoiceHeader>

          <ClientInfo theme={theme}>
            <h3>Bill To:</h3>
            <p><strong>{invoice.clientName}</strong></p>
            <p>{invoice.clientEmail}</p>
            {job && (
              <p>Service Location: {job.location || 'Client site'}</p>
            )}
          </ClientInfo>

          <div style={{ padding: theme.spacing.xl }}>
            <InvoiceTable theme={theme}>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.unitPrice)}</td>
                    <td>{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </InvoiceTable>
          </div>

          <InvoiceSummary theme={theme}>
            <SummaryTable theme={theme}>
              <SummaryRow theme={theme}>
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </SummaryRow>
              <SummaryRow theme={theme}>
                <span>VAT (15%):</span>
                <span>{formatCurrency(invoice.tax)}</span>
              </SummaryRow>
              <SummaryRow theme={theme} isTotal>
                <span>Total:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </SummaryRow>
            </SummaryTable>
          </InvoiceSummary>

          {invoice.notes && (
            <div style={{ padding: theme.spacing.xl, paddingTop: 0 }}>
              <p style={{ 
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm,
                fontStyle: 'italic'
              }}>
                <strong>Notes:</strong> {invoice.notes}
              </p>
            </div>
          )}

          <ActionButtons theme={theme}>
            <Button
              variant="outline"
              onClick={() => router.push('/admin/invoices')}
            >
              Back to Invoices
            </Button>
            
            {invoice.status === 'draft' && (
              <>
                <Button
                  variant="secondary"
                  onClick={saveInvoice}
                  loading={generating}
                >
                  Save Invoice
                </Button>
                <Button
                  variant="primary"
                  onClick={sendInvoice}
                >
                  Send to Client
                </Button>
              </>
            )}
            
            <Button
              variant="primary"
              onClick={() => window.print()}
            >
              Print Invoice
            </Button>
          </ActionButtons>
        </InvoiceCard>
      </InvoiceContainer>
    </Layout>
  );
};

export default InvoicePage;