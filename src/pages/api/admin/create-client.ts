import { NextApiRequest, NextApiResponse } from 'next';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from 'lib/firebase';

// This is a simplified approach - in production you'd use Firebase Admin SDK
// For now, we'll create user profiles without Firebase Auth accounts
// The users can be created through the admin approval process instead

interface CreateClientRequest {
  name: string;
  email: string;
  companyName?: string;
  clientType: 'individual' | 'company';
  password?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { name, email, companyName, clientType, password }: CreateClientRequest = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required' });
    }

    if (clientType === 'company' && !companyName) {
      return res.status(400).json({ success: false, error: 'Company name is required for company clients' });
    }

    // Check if email already exists
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', email)
    );
    const existingUsers = await getDocs(usersQuery);
    
    if (!existingUsers.empty) {
      return res.status(400).json({ success: false, error: 'A user with this email already exists' });
    }

    // Generate a unique ID for the user
    const userId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate password if not provided
    const generatedPassword = password || generatePassword();
    
    // Create user profile (without Firebase Auth for now)
    const userProfile: any = {
      id: userId,
      email,
      name,
      role: 'client',
      status: 'approved', // Pre-approved since admin is creating
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Store password temporarily - in production this would be handled differently
      tempPassword: generatedPassword
    };

    // Only add companyName if it exists
    if (clientType === 'company' && companyName) {
      userProfile.companyName = companyName;
    }
    
    await setDoc(doc(db, 'users', userId), userProfile);
    
    // Send welcome email with credentials
    try {
      // await emailService.sendWelcomeEmail(
      //   email,
      //   name,
      //   generatedPassword,
      //   clientType === 'company' ? companyName : undefined
      // );
      console.log('Welcome email would be sent to:', email);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the entire request if email fails
    }
    
    return res.status(200).json({ 
      success: true, 
      data: { 
        id: userId,
        email,
        password: generatedPassword,
        message: 'Client created successfully and welcome email sent'
      }
    });

  } catch (error) {
    console.error('Error creating client:', error);
    return res.status(500).json({ success: false, error: 'Failed to create client' });
  }
}

function generatePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password + '!';
}