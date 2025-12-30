import { NextApiRequest, NextApiResponse } from 'next';
import { deleteSession } from 'lib/auth';
import { ApiResponse } from 'types/chair-care';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const token = req.cookies?.authToken;
    
    if (token) {
      deleteSession(token);
    }

    // Clear cookie
    res.setHeader('Set-Cookie', [
      'authToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax'
    ]);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}