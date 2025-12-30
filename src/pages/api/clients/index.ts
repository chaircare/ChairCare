import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return empty clients list for now
    return res.status(200).json({ success: true, data: [] });
  }
  
  if (req.method === 'POST') {
    // Create client functionality would go here
    return res.status(501).json({ success: false, error: 'Not implemented' });
  }
  
  return res.status(405).json({ success: false, error: 'Method not allowed' });
}