import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from 'lib/auth';
import { getQuotes, createQuote } from 'lib/database';
import { ApiResponse, Quote } from 'types/chair-care';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Quote[] | Quote>>
) {
  const user = (req as any).user;

  try {
    if (req.method === 'GET') {
      // Clients can only see their own quotes
      const userId = user.role === 'client' ? user.id : undefined;
      const quotes = await getQuotes(userId);
      
      res.status(200).json({
        success: true,
        data: quotes
      });
    } else if (req.method === 'POST') {
      const { chairIds, serviceType } = req.body;
      
      if (!chairIds || !Array.isArray(chairIds) || chairIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'chairIds must be a non-empty array'
        });
      }
      
      if (!serviceType || !['cleaning', 'repair'].includes(serviceType)) {
        return res.status(400).json({
          success: false,
          error: 'Service type must be either "cleaning" or "repair"'
        });
      }
      
      const quote = await createQuote(user.id, chairIds, serviceType);
      
      res.status(201).json({
        success: true,
        data: quote
      });
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Quotes API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

export default requireAuth()(handler);