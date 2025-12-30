import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { theme } from 'styles/theme';
import { Job, Invoice, Chair, ChairServiceEntry } from 'types/chair-care';
import { doc, getDoc, addDoc, collection, serverTimestamp, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from 'lib/firebase';

const InvoiceContainer = styled.div`
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

const InvoiceCard = styled(Card)`
  max-width: 800px;
  margin: 0 auto;
  padding: ${theme.spacing.xl};
`;

const InvoiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.xl};
  padding-bottom: ${theme.spacing.lg};
  border-bottom: 2px solid ${theme.colors.border.primary};
`;

const CompanyInfo = styled.div`
  flex: 1;
`;

const CompanyName = styled.h2`
  margin: 0 0 ${theme.spacing.sm} 0;
  color: ${theme.colors.primary[600]};
  font-size: ${theme.typography.fontSize.xl};
`;

const CompanyDetails = styled.div`
  color: ${theme.colors.text.secondary};
  line-height: 1.6;
`;

const InvoiceInfo = styled.div`
  text-align: right;
`;

const InvoiceNumber = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
`;

const InvoiceDate = styled.div`
  color: ${theme.colors.text.secondary};
`;

const ClientSection = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const SectionTitle = styled.h3`
  margin: 0 0 ${theme.spacing.md} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.lg};
`;

const ClientInfo = styled.div`
  background: ${theme.colors.gray[50]};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
`;

const PricingOptions = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const PricingToggle = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const ToggleButton = styled.button<{ active: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  background: ${props => props.active ? theme.colors.primary[500] : 'white'};
  color: ${props => props.active ? 'white' : theme.colors.text.primary};
  cursor: pointer;
  font-weight: ${theme.typography.fontWeight.medium};
  
  &:hover {
    background: ${props => props.active ? theme.colors.primary[600] : theme.colors.gray[50]};
  }
`;

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${theme.spacing.lg};
`;

const TableHeader = styled.th`
  text-align: left;
  padding: ${theme.spacing.md};
  border-bottom: 2px solid ${theme.colors.border.primary};
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const TableRow = styled.tr`
  &:nth-of-type(even) {
    background: ${theme.colors.gray[25]};
  }
`;

const TableCell = styled.td`
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border.secondary};
  color: ${theme.colors.text.primary};
`;

const TotalsSection = styled.div`
  margin-left: auto;
  width: 300px;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.border.secondary};
`;

const TotalLabel = styled.span`
  color: ${theme.colors.text.secondary};
`;

const TotalValue = styled.span`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`;

const GrandTotal = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${theme.spacing.md} 0;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  border-top: 2px solid ${theme.colors.border.primary};
  margin-top: ${theme.spacing.sm};
`;

const CustomAmountInput = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  width: 150px;
  text-align: right;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const NotesSection = styled.div`
  margin-top: ${theme.spacing.xl};
  padding-top: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border.primary};
`;

const NotesTextArea = styled.textarea`
  width: 100%;
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const Actions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${theme.spacing.xl};
  padding-top: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border.primary};
`;

type PricingMethod = 'itemized' | 'bundled';

const GenerateInvoice: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState<Job | null>(null);
  const [serviceEntries, setServiceEntries] = useState<ChairServiceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [pricingMethod, setPricingMethod] = useState<PricingMethod>('itemized');
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (id) {
      loadJobData();
    }
  }, [id]);

  const loadJobData = async () => {
    try {
      // Load job
      const jobDoc = await getDoc(doc(db, 'jobs', id as string));
      if (jobDoc.exists()) {
        const jobData = { id: jobDoc.id, ...jobDoc.data() } as Job;
        setJob(jobData);

        // Load service entries for this job
        const entriesQuery = query(
          collection(db, 'chairServiceEntries'),
          where('jobId', '==', jobData.jobId)
        );
        const entriesSnapshot = await getDocs(entriesQuery);
        const entries = entriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ChairServiceEntry[];
        
        setServiceEntries(entries);
        
        // Calculate suggested total
        const suggestedTotal = calculateSuggestedTotal(entries);
        setCustomAmount(suggestedTotal);
      }
    } catch (error) {
      console.error('Error loading job data:', error);
    } finally {
      setLoading(false);
    }
  };
        );
        const entriesSnapshot = await getDocs(entriesQuery);
        const entries = entriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ChairServiceEntry[];
        
        setServiceEntries(entries);
        
        // Calculate suggested total
        const suggestedTotal = calculateSuggestedTotal(entries);
        setCustomAmount(suggestedTotal);
      }
    } catch (error) {
      console.error('Error loading job data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSuggestedTotal = (entries: ChairServiceEntry[]): number => {
    // Service pricing (would come from database in real app)
    const servicePrices: Record<string, number> = {
      'Gas lift replacement': 200,
      'Mechanism repair': 150,
      'Upholstery repair': 300,
      'Chair cleaning': 80,
      'Battery replacement': 120,
      'Armrest repair': 100,
      'Wheel/caster replacement': 90,
      'Full refurbishment': 500,
      'Inspection only': 50,
      'Preventive maintenance': 60
    };

    let total = 0;

    entries.forEach(entry => {
      // Add service costs
      entry.servicesPerformed.forEach(service => {
        total += servicePrices[service] || 0;
      });

      // Add parts costs
      entry.partsUsed.forEach(part => {
        total += (part.unitPrice || 0) * part.quantity;
      });
    });

    return total;
  };

  const generateInvoiceNumber = (): string => {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `INV-${year}-${timestamp}`;
  };

  const calculateVAT = (amount: number): number => {
    return amount * 0.15; // 15% VAT
  };

  const handleGenerateInvoice = async () => {
    if (!job || !user) return;

    setGenerating(true);
    try {
      // Get client data
      let clientData = null;
      try {
        const clientDoc = await getDoc(doc(db, 'users', job.clientId));
        if (clientDoc.exists()) {
          clientData = clientDoc.data();
        }
      } catch (error) {
        console.warn('Could not load client data:', error);
      }

      const invoiceNumber = generateInvoiceNumber();
      const subtotal = pricingMethod === 'itemized' 
        ? calculateSuggestedTotal(serviceEntries)
        : customAmount;
      
      const vatAmount = calculateVAT(subtotal);
      const totalAmount = subtotal + vatAmount;

      const invoiceData: Omit<Invoice, 'id'> = {
        invoiceNumber: invoiceNumber,
        jobId: job.id,
        clientId: job.clientId,
        clientName: job.clientName,
        clientEmail: clientData?.email || job.clientEmail || '',
        clientAddress: clientData?.address || job.clientAddress || '',
        clientVatNumber: clientData?.vatNumber || job.clientVatNumber || '',
        
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        paymentTerms: 30,
        
        lineItems: [], // Would need to be populated from service entries
        
        subtotal: subtotal,
        vatRate: 0.15,
        vatAmount: vatAmount,
        total: totalAmount,
        
        discountPercentage: 0,
        discountAmount: 0,
        discountReason: '',
        
        status: 'Draft',
        
        notes: notes || '',
        terms: 'Payment due within 30 days. Late payments may incur interest charges.',
        
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user?.id || 'admin'
      };

      // Save invoice to database
      const docRef = await addDoc(collection(db, 'invoices'), {
        ...invoiceData,
        createdAt: serverTimestamp()
      });

      // Update job status
      await updateDoc(doc(db, 'jobs', job.id), {
        status: 'Invoiced',
        invoiceId: docRef.id,
        updatedAt: serverTimestamp()
      });

      alert('Invoice generated successfully!');
      router.push(`/admin/invoices/${docRef.id}`);
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Error generating invoice. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return <div>Access denied</div>;
  }

  if (loading) {
    return (
      <InvoiceContainer>
        <div>Loading job data...</div>
      </InvoiceContainer>
    );
  }

  if (!job) {
    return (
      <InvoiceContainer>
        <div>Job not found</div>
      </InvoiceContainer>
    );
  }

  const subtotal = pricingMethod === 'itemized' 
    ? calculateSuggestedTotal(serviceEntries)
    : customAmount;
  const vatAmount = calculateVAT(subtotal);
  const totalAmount = subtotal + vatAmount;

  return (
    <InvoiceContainer>
      <Header>
        <Title>Generate Invoice - {job.jobId}</Title>
      </Header>

      <InvoiceCard>
        <InvoiceHeader>
          <CompanyInfo>
            <CompanyName>🪑 Chair Care</CompanyName>
            <CompanyDetails>
              Professional Chair Services<br />
              123 Business Street<br />
              Cape Town, 8001<br />
              VAT: 4123456789<br />
              Tel: +27 21 123 4567
            </CompanyDetails>
          </CompanyInfo>
          <InvoiceInfo>
            <InvoiceNumber>INVOICE</InvoiceNumber>
            <InvoiceDate>Date: {new Date().toLocaleDateString()}</InvoiceDate>
          </InvoiceInfo>
        </InvoiceHeader>

        <ClientSection>
          <SectionTitle>Bill To:</SectionTitle>
          <ClientInfo>
            <strong>{job.clientName}</strong><br />
            Job: {job.jobId}<br />
            Date: {job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString() : 'Not scheduled'}
          </ClientInfo>
        </ClientSection>

        <PricingOptions>
          <SectionTitle>Pricing Method:</SectionTitle>
          <PricingToggle>
            <ToggleButton
              active={pricingMethod === 'itemized'}
              onClick={() => setPricingMethod('itemized')}
            >
              Per-Chair Itemized
            </ToggleButton>
            <ToggleButton
              active={pricingMethod === 'bundled'}
              onClick={() => setPricingMethod('bundled')}
            >
              Bundled Amount
            </ToggleButton>
          </PricingToggle>
        </PricingOptions>

        {pricingMethod === 'itemized' ? (
          <ItemsTable>
            <thead>
              <tr>
                <TableHeader>Chair ID</TableHeader>
                <TableHeader>Services</TableHeader>
                <TableHeader>Parts</TableHeader>
                <TableHeader>Amount</TableHeader>
              </tr>
            </thead>
            <tbody>
              {serviceEntries.map((entry) => {
                const serviceTotal = entry.servicesPerformed.reduce((sum, service) => {
                  const servicePrices: Record<string, number> = {
                    'Gas lift replacement': 200,
                    'Mechanism repair': 150,
                    'Upholstery repair': 300,
                    'Chair cleaning': 80,
                    'Battery replacement': 120,
                    'Armrest repair': 100,
                    'Wheel/caster replacement': 90,
                    'Full refurbishment': 500,
                    'Inspection only': 50,
                    'Preventive maintenance': 60
                  };
                  return sum + (servicePrices[service] || 0);
                }, 0);

                const partsTotal = entry.partsUsed.reduce((sum, part) => {
                  return sum + ((part.unitPrice || 0) * part.quantity);
                }, 0);

                return (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.chairIdCode || entry.chairId}</TableCell>
                    <TableCell>{entry.servicesPerformed.join(', ')}</TableCell>
                    <TableCell>
                      {entry.partsUsed.map(part => 
                        `${part.partName} (${part.quantity})`
                      ).join(', ') || 'None'}
                    </TableCell>
                    <TableCell>R{(serviceTotal + partsTotal).toFixed(2)}</TableCell>
                  </TableRow>
                );
              })}
            </tbody>
          </ItemsTable>
        ) : (
          <div>
            <SectionTitle>Custom Amount:</SectionTitle>
            <div style={{ marginBottom: theme.spacing.lg }}>
              <CustomAmountInput
                type="number"
                step="0.01"
                value={customAmount}
                onChange={(e) => setCustomAmount(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        )}

        <TotalsSection>
          <TotalRow>
            <TotalLabel>Subtotal:</TotalLabel>
            <TotalValue>R{subtotal.toFixed(2)}</TotalValue>
          </TotalRow>
          <TotalRow>
            <TotalLabel>VAT (15%):</TotalLabel>
            <TotalValue>R{vatAmount.toFixed(2)}</TotalValue>
          </TotalRow>
          <GrandTotal>
            <span>Total:</span>
            <span>R{totalAmount.toFixed(2)}</span>
          </GrandTotal>
        </TotalsSection>

        <NotesSection>
          <SectionTitle>Notes:</SectionTitle>
          <NotesTextArea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment terms, additional notes, etc..."
          />
        </NotesSection>

        <Actions>
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleGenerateInvoice}
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Generate Invoice'}
          </Button>
        </Actions>
      </InvoiceCard>
    </InvoiceContainer>
  );
};

export default GenerateInvoice;