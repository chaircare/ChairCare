import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from 'lib/auth';
import { getJobById, updateJobStatus } from 'lib/database';
import { ApiResponse, Job } from 'types/chair-care';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Job>>
) {
  const { id } = req.query;
  
  if (typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid job ID' });
  }

  try {
    if (req.method === 'GET') {
      const job = await getJobById(id);
      
      if (!job) {
        return res.status(404).json({ success: false, error: 'Job not found' });
      }
      
      const user = (req as any).user;
      
      // Technicians can only see their assigned jobs
      if (user.role === 'technician' && job.assignedTechnicianId !== user.id) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
      
      res.status(200).json({
        success: true,
        data: job
      });
    } else if (req.method === 'PATCH') {
      const { status, completedAt } = req.body;
      
      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status is required'
        });
      }
      
      const job = await updateJobStatus(id, status, completedAt ? new Date(completedAt) : undefined);
      
      if (!job) {
        return res.status(404).json({ success: false, error: 'Job not found' });
      }
      
      res.status(200).json({
        success: true,
        data: job
      });
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Job API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

export default requireAuth()(handler);