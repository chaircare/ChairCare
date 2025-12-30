import { NextApiRequest, NextApiResponse } from 'next';
import { emailService } from '../../../lib/email-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, email, name, password, role } = req.body;

    if (!type || !email || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    switch (type) {
      case 'welcome':
        if (!password) {
          return res.status(400).json({ error: 'Password required for welcome email' });
        }
        await emailService.sendWelcomeEmail(email, name, password, role || 'Client');
        break;
      
      case 'password-reset':
        if (!password) {
          return res.status(400).json({ error: 'Password required for reset email' });
        }
        await emailService.sendPasswordResetEmail(email, name, password);
        break;
      
      default:
        return res.status(400).json({ error: 'Invalid email type' });
    }

    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('Email sending error:', error);
    res.status(500).json({ 
      error: 'Failed to send email', 
      details: error.message 
    });
  }
}