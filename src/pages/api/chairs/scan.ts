import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from 'lib/auth';
import { getChairByQRCode } from 'lib/database';
import { ApiResponse, Chair } from 'types/chair-care';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Chair>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { qrCode } = req.body;
    
    if (!qrCode) {
      return res.status(400).json({
        success: false,
        error: 'QR code is required'
      });
    }
    
    const chair = await getChairByQRCode(qrCode);
    
    if (!chair) {
      return res.status(404).json({
        success: false,
        error: 'Chair not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: chair
    });
  } catch (error) {
    console.error('Chair scan API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

export default requireAuth()(handler);