import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'lib/auth';
import { ApiResponse } from 'types/chair-care';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const token = req.cookies?.authToken;
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No authentication token' 
      });
    }

    const session = getSession(token);
    if (!session) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid or expired session' 
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role
        }
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}