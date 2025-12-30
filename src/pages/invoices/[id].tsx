import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useTheme } from 'contexts/ThemeContext';
import { Invoice } from 'types/invoice';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { doc, getDoc } from 'firebase/firestore';
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

const StatusBadge = styled.span<{ theme: any; status: string }>`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  ${({ status, theme }) => {
    switch (status) {
      case 'Paid':
        return `background: ${theme.colors.success[100]}; color: ${theme.colors.success[700]};`;
      case 'Sent':
        return `background: ${theme.colors.primary[100]}; color: ${theme.colors.primary[700]};`;
      case 'Overdue':
        return `background: ${theme.colors.error[100]}; color: ${theme.colors.error[700]};`;
      default:
        return `background: ${theme.colors.gray[100]}; color: ${theme.colors.gray[700]};`;
    }
  }}
`;

const PaymentInfo = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.primary[25]};
  border-radius: ${props => props.theme.borderRadius.md};
  margin: ${props => props.theme.spacing.xl};
  
  h3 {
    margin: 0 0 ${props => props.theme.spacing.md} 0;
    color: ${props => props.theme.colors.primary[700]};
    font-size: ${props => props.theme.typography.fontSize.lg};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
  }
  
  p {
    margin: 0 0 ${props => props.theme.spacing.sm} 0;
    color: ${props => props.theme.colors.text.secondary};
    font-size: ${props => props.theme.typography.fontSize.sm};
  }
`;

const ActionButtons = styled.div<{ theme: any }>`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: center;
  margin-top: ${props => props.theme.spacing.xl};
  padding-top: ${props => props.theme.spacing.xl};
  border-top: 1px solid ${props => props.theme.colors.border.primary};
`;

const ClientInvoicePage: NextPage = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = router.query;
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadInvoice();
    }
  }, [id]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const invoiceDoc = await getDoc(doc(db, 'invoices', id as string));
      
      if (!invoiceDoc.exists()) {
        setError('Invoice not found');
        return;
      }
      
      const invoiceData = { id: invoiceDoc.id, ...invoiceDoc.data() } as Invoice;
      setInvoice(invoiceData);
    } catch (error) {
      console.error('Error loading invoice:', error);
      setError('Failed to load invoice');
    } finally {
      setLoading(false);
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

  if (loading) {
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

  if (error || !invoice) {
    return (
      <Layout>
        <InvoiceContainer theme={theme}>
          <div style={{ textAlign: 'center', padding: theme.spacing['4xl'] }}>
            <h2>Invoice Not Found</h2>
            <p>{error || 'The requested invoice could not be found.'}</p>
            <Button onClick={() => router.push('/')}>
              Return Home
            </Button>
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
                Phone: +27 21 123 4567<br />
                VAT: 4123456789
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
            <p>{invoice.clientAddress}</p>
            {invoice.clientVatNumber && (
              <p>VAT Number: {invoice.clientVatNumber}</p>
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
                {invoice.lineItems.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.unitPrice)}</td>
                    <td>{formatCurrency(item.totalPrice)}</td>
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
              {invoice.discountAmount && invoice.discountAmount > 0 && (
                <SummaryRow theme={theme}>
                  <span>Discount:</span>
                  <span>-{formatCurrency(invoice.discountAmount)}</span>
                </SummaryRow>
              )}
              <SummaryRow theme={theme}>
                <span>VAT ({(invoice.vatRate * 100).toFixed(0)}%):</span>
                <span>{formatCurrency(invoice.vatAmount)}</span>
              </SummaryRow>
              <SummaryRow theme={theme} isTotal>
                <span>Total:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </SummaryRow>
            </SummaryTable>
          </InvoiceSummary>

          {invoice.status !== 'Paid' && (
            <PaymentInfo theme={theme}>
              <h3>Payment Information</h3>
              <p><strong>Bank Details:</strong></p>
              <p>Bank: Standard Bank</p>
              <p>Account Name: Chair Care Solutions (Pty) Ltd</p>
              <p>Account Number: 123456789</p>
              <p>Branch Code: 051001</p>
              <p>Reference: {invoice.invoiceNumber}</p>
              <p style={{ marginTop: theme.spacing.md }}>
                <strong>Payment Terms:</strong> Payment due within {invoice.paymentTerms} days
              </p>
            </PaymentInfo>
          )}

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

          {invoice.terms && (
            <div style={{ padding: theme.spacing.xl, paddingTop: 0 }}>
              <p style={{ 
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.xs,
                lineHeight: theme.typography.lineHeight.relaxed
              }}>
                <strong>Terms & Conditions:</strong> {invoice.terms}
              </p>
            </div>
          )}

          <ActionButtons theme={theme}>
            <Button
              variant="outline"
              onClick={() => window.print()}
            >
              Print Invoice
            </Button>
            
            <Button
              variant="primary"
              onClick={() => router.push('/client/dashboard')}
            >
              Back to Dashboard
            </Button>
          </ActionButtons>
        </InvoiceCard>
      </InvoiceContainer>
    </Layout>
  );
};

export default ClientInvoicePage;