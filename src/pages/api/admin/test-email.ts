import { NextApiRequest, NextApiResponse } from 'next';
import { emailService } from 'lib/email-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { testEmail } = req.body;
    
    if (!testEmail) {
      return res.status(400).json({ success: false, error: 'Test email address is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    // Send a test welcome email
    await emailService.sendWelcomeEmail(
      testEmail,
      'Test User',
      'TestPassword123!',
      'Test Company'
    );

    return res.status(200).json({ 
      success: true, 
      message: 'Test email sent successfully! Check the console for details if in test mode.' 
    });

  } catch (error: any) {
    console.error('Error sending test email:', error);
    return res.status(500).json({ 
      success: false, 
      error: `Failed to send test email: ${error.message}` 
    });
  }
}