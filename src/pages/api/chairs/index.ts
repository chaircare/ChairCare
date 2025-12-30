import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from 'lib/auth';
import { getChairs, createChair } from 'lib/database';
import { ApiResponse, Chair, CreateChairForm } from 'types/chair-care';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Chair[] | Chair>>
) {
  const user = (req as any).user;

  try {
    if (req.method === 'GET') {
      // Clients can only see their own chairs, admins can see all
      const userId = user.role === 'client' ? user.id : undefined;
      const chairs = await getChairs(userId);
      
      res.status(200).json({
        success: true,
        data: chairs
      });
    } else if (req.method === 'POST') {
      const chairData: CreateChairForm = req.body;
      
      if (!chairData.chairNumber || !chairData.location) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: chairNumber and location'
        });
      }
      
      // Only admins can create chairs for other users
      const targetUserId = user.role === 'admin' && req.body.userId ? req.body.userId : user.id;
      
      const chair = await createChair(chairData, targetUserId);
      
      res.status(201).json({
        success: true,
        data: chair
      });
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Chairs API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

export default requireAuth()(handler);