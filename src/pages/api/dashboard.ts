import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from 'lib/auth';
import { getDashboardStats } from 'lib/database';
import { ApiResponse, DashboardStats } from 'types/chair-care';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<DashboardStats>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const user = (req as any).user;
    // Clients see only their own stats, admins see all
    const userId = user.role === 'client' ? user.id : undefined;
    const stats = await getDashboardStats(userId);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

export default requireAuth()(handler);