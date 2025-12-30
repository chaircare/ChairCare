import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from 'lib/auth';
import { getServiceLogs, createServiceLog } from 'lib/database';
import { ApiResponse, ServiceLog } from 'types/chair-care';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ServiceLog[] | ServiceLog>>
) {
  const user = (req as any).user;

  try {
    if (req.method === 'GET') {
      const { chairId } = req.query;
      
      // Clients can only see their own service logs
      const userId = user.role === 'client' ? user.id : undefined;
      const serviceLogs = await getServiceLogs(userId, chairId as string);
      
      res.status(200).json({
        success: true,
        data: serviceLogs
      });
    } else if (req.method === 'POST') {
      const { chairId, serviceType, description } = req.body;
      
      if (!chairId || !serviceType || !description) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: chairId, serviceType, and description'
        });
      }
      
      if (!['cleaning', 'repair'].includes(serviceType)) {
        return res.status(400).json({
          success: false,
          error: 'Service type must be either "cleaning" or "repair"'
        });
      }
      
      const serviceLog = await createServiceLog(chairId, user.id, serviceType, description);
      
      res.status(201).json({
        success: true,
        data: serviceLog
      });
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Service logs API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

export default requireAuth()(handler);