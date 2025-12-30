import { NextApiRequest, NextApiResponse } from 'next';
import { createInvoiceFromJob } from 'lib/invoice-generator';
import { CreateInvoiceRequest } from 'types/invoice';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'POST') {
    try {
      const jobId = id as string;
      const request: CreateInvoiceRequest = req.body;

      // Validate required fields
      if (!request.pricingMethod) {
        return res.status(400).json({
          success: false,
          error: 'Pricing method is required'
        });
      }

      if (request.pricingMethod === 'bundled' && !request.bundledAmount) {
        return res.status(400).json({
          success: false,
          error: 'Bundled amount is required for bundled pricing'
        });
      }

      // Create invoice
      const invoice = await createInvoiceFromJob(jobId, request);

      return res.status(201).json({
        success: true,
        data: invoice
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create invoice'
      });
    }
  }

  return res.status(405).json({
    success: false,
    error: 'Method not allowed'
  });
}