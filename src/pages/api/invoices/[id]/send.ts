import { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from 'lib/firebase';
import { emailService } from 'lib/email-service';
import { Invoice } from 'types/invoice';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  const { id } = req.query;

  try {
    // Get invoice data
    const invoiceDoc = await getDoc(doc(db, 'invoices', id as string));
    if (!invoiceDoc.exists()) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    const invoice = { id: invoiceDoc.id, ...invoiceDoc.data() } as Invoice;

    // Get client data
    const clientDoc = await getDoc(doc(db, 'users', invoice.clientId));
    if (!clientDoc.exists()) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    const client = clientDoc.data();

    // Send invoice email
    const emailSent = await emailService.sendInvoiceNotification(
      invoice.invoiceNumber,
      invoice.id,
      {
        id: client.id,
        email: client.email,
        name: client.name || client.companyName || client.contactPerson,
        role: 'client'
      },
      invoice.total,
      // Handle Firestore Timestamp for dueDate
      invoice.dueDate.toDate ? invoice.dueDate.toDate() : new Date(invoice.dueDate)
    );

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        error: 'Failed to send invoice email'
      });
    }

    // Update invoice status to 'Sent'
    await updateDoc(doc(db, 'invoices', id as string), {
      status: 'Sent',
      sentDate: new Date(),
      updatedAt: new Date()
    });

    return res.status(200).json({
      success: true,
      message: 'Invoice sent successfully'
    });
  } catch (error) {
    console.error('Error sending invoice:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send invoice'
    });
  }
}