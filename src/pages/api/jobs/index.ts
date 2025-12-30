import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from 'lib/auth';
import { getJobs, createJob, getJobsByTechnician } from 'lib/database';
import { ApiResponse, Job, CreateJobForm } from 'types/chair-care';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Job[] | Job>>
) {
  try {
    if (req.method === 'GET') {
      const user = (req as any).user;
      let jobs: Job[];
      
      if (user.role === 'technician') {
        jobs = await getJobsByTechnician(user.id);
      } else {
        jobs = await getJobs();
      }
      
      res.status(200).json({
        success: true,
        data: jobs
      });
    } else if (req.method === 'POST') {
      const jobData: CreateJobForm = req.body;
      
      if (!jobData.clientId || !jobData.jobType || !jobData.chairs?.length) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: clientId, jobType, and chairs'
        });
      }
      
      const job = await createJob(jobData);
      
      res.status(201).json({
        success: true,
        data: job
      });
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Jobs API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

export default requireAuth()(handler);